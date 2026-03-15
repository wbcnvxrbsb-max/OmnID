import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

// POST /api/auth/github
router.post("/api/auth/github", async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code || typeof code !== "string") {
      res.status(400).json({ error: "Missing code" });
      return;
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
      res.status(400).json({ error: "Token exchange failed", details: err });
      return;
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token as string;

    if (!accessToken) {
      res.status(400).json({ error: "No access token returned", details: tokenData });
      return;
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
      res.status(400).json({ error: "Failed to fetch GitHub user" });
      return;
    }

    const user = await userRes.json();
    const repos = reposRes.ok ? await reposRes.json() : [];

    res.json({ user, repos });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

// POST /api/auth/discord
router.post("/api/auth/discord", async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code || typeof code !== "string") {
      res.status(400).json({ error: "Missing code" });
      return;
    }

    const origin = req.headers.origin || "https://omnid.netlify.app";
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
      res.status(400).json({ error: "Token exchange failed", details: err });
      return;
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
      res.status(400).json({ error: "Failed to fetch Discord user" });
      return;
    }

    const user = await userRes.json();
    const guilds = guildsRes.ok ? await guildsRes.json() : [];

    res.json({ user, guilds });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

// POST /api/auth/spotify
router.post("/api/auth/spotify", async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code || typeof code !== "string") {
      res.status(400).json({ error: "Missing code" });
      return;
    }

    const origin = req.headers.origin || "https://omnid.netlify.app";
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
      res.status(400).json({ error: "Token exchange failed", details: err });
      return;
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
      res.status(400).json({ error: "Failed to fetch Spotify user" });
      return;
    }

    const user = await userRes.json();
    const playlistsData = playlistsRes.ok ? await playlistsRes.json() : { items: [] };
    const playlists = playlistsData.items ?? [];

    res.json({ user, playlists });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

export default router;
