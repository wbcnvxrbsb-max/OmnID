const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string | undefined;

const STORAGE_KEY = "omnid-spotify-user";

export interface SpotifyUser {
  id: string;
  display_name: string | null;
  email: string | null;
  images: { url: string }[];
  followers: { total: number };
  playlists: { id: string; name: string; images: { url: string }[] }[];
}

/** Returns true if VITE_SPOTIFY_CLIENT_ID is set in the environment. */
export function isSpotifyConfigured(): boolean {
  return !!CLIENT_ID;
}

/** Redirects the browser to Spotify's OAuth2 authorize URL. */
export function startSpotifyOAuth(): void {
  const redirectUri = `${window.location.origin}/auth/spotify/callback`;
  const params = new URLSearchParams({
    client_id: CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "user-read-private user-read-email playlist-read-private",
  });
  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

/** Sends the OAuth code to the Netlify function, stores the result in localStorage. */
export async function handleSpotifyCallback(code: string): Promise<SpotifyUser> {
  const res = await fetch("/.netlify/functions/spotify-auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Spotify auth failed");
  }

  const data = await res.json();
  const user: SpotifyUser = {
    id: data.user.id,
    display_name: data.user.display_name ?? null,
    email: data.user.email ?? null,
    images: data.user.images ?? [],
    followers: data.user.followers ?? { total: 0 },
    playlists: (data.playlists ?? []).map((p: { id: string; name: string; images: { url: string }[] }) => ({
      id: p.id,
      name: p.name,
      images: p.images ?? [],
    })),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

/** Returns the stored Spotify user from localStorage, or null if not linked. */
export function getSpotifyUser(): SpotifyUser | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SpotifyUser;
  } catch {
    return null;
  }
}

/** Removes the stored Spotify user from localStorage. */
export function clearSpotifyUser(): void {
  localStorage.removeItem(STORAGE_KEY);
}
