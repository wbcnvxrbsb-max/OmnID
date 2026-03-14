export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { code } = await req.json();
    if (!code || typeof code !== "string") {
      return new Response(JSON.stringify({ error: "Missing code" }), { status: 400 });
    }

    const origin = req.headers.get("origin") || "https://omnid.netlify.app";
    const redirectUri = `${origin}/auth/discord/callback`;

    // Exchange code for access token
    const tokenRes = await fetch("https://discord.com/api/v10/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      return new Response(JSON.stringify({ error: "Token exchange failed", details: err }), { status: 400 });
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token as string;

    // Fetch user profile and guilds in parallel
    const [userRes, guildsRes] = await Promise.all([
      fetch("https://discord.com/api/v10/users/@me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      fetch("https://discord.com/api/v10/users/@me/guilds", {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    ]);

    if (!userRes.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch Discord user" }), { status: 400 });
    }

    const user = await userRes.json();
    const guilds = guildsRes.ok ? await guildsRes.json() : [];

    return new Response(JSON.stringify({ user, guilds }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}

export const config = {
  path: "/.netlify/functions/discord-auth",
};
