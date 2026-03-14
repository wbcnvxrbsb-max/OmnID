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
    const redirectUri = `${origin}/auth/spotify/callback`;

    const clientId = process.env.SPOTIFY_CLIENT_ID!;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    // Exchange code for access token
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
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

    // Fetch user profile and playlists in parallel
    const [userRes, playlistsRes] = await Promise.all([
      fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      fetch("https://api.spotify.com/v1/me/playlists?limit=20", {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    ]);

    if (!userRes.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch Spotify user" }), { status: 400 });
    }

    const user = await userRes.json();
    const playlistsData = playlistsRes.ok ? await playlistsRes.json() : { items: [] };
    const playlists = playlistsData.items ?? [];

    return new Response(JSON.stringify({ user, playlists }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}

export const config = {
  path: "/.netlify/functions/spotify-auth",
};
