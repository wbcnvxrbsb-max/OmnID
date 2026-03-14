export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { code } = await req.json();
    if (!code || typeof code !== "string") {
      return new Response(JSON.stringify({ error: "Missing code" }), { status: 400 });
    }

    // Exchange code for access token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID!,
        client_secret: process.env.GITHUB_CLIENT_SECRET!,
        code,
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      return new Response(JSON.stringify({ error: "Token exchange failed", details: err }), { status: 400 });
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token as string;

    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: "No access token returned", details: tokenData }),
        { status: 400 }
      );
    }

    // Fetch user profile and repos in parallel
    const [userRes, reposRes] = await Promise.all([
      fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
        },
      }),
      fetch("https://api.github.com/user/repos?sort=updated&per_page=10", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
        },
      }),
    ]);

    if (!userRes.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch GitHub user" }), { status: 400 });
    }

    const user = await userRes.json();
    const repos = reposRes.ok ? await reposRes.json() : [];

    return new Response(JSON.stringify({ user, repos }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}

export const config = {
  path: "/.netlify/functions/github-auth",
};
