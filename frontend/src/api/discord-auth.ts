import { API_BASE } from "./config";

const CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID as string | undefined;

const STORAGE_KEY = "omnid-discord-user";

export interface DiscordUser {
  id: string;
  username: string;
  avatar: string | null;
  discriminator: string;
  guilds: { id: string; name: string; icon: string | null }[];
}

/** Returns true if VITE_DISCORD_CLIENT_ID is set in the environment. */
export function isDiscordConfigured(): boolean {
  return !!CLIENT_ID;
}

/** Redirects the browser to Discord's OAuth2 authorize URL. */
export function startDiscordOAuth(): void {
  const redirectUri = `${window.location.origin}/auth/discord/callback`;
  const params = new URLSearchParams({
    client_id: CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify guilds",
  });
  window.location.href = `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}

/** Sends the OAuth code to the Netlify function, stores the result in localStorage. */
export async function handleDiscordCallback(code: string): Promise<DiscordUser> {
  const res = await fetch(`${API_BASE}/api/auth/discord`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Discord auth failed");
  }

  const data = await res.json();
  const user: DiscordUser = {
    id: data.user.id,
    username: data.user.username,
    avatar: data.user.avatar,
    discriminator: data.user.discriminator,
    guilds: (data.guilds ?? []).map((g: { id: string; name: string; icon: string | null }) => ({
      id: g.id,
      name: g.name,
      icon: g.icon,
    })),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

/** Returns the stored Discord user from localStorage, or null if not linked. */
export function getDiscordUser(): DiscordUser | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DiscordUser;
  } catch {
    return null;
  }
}

/** Removes the stored Discord user from localStorage. */
export function clearDiscordUser(): void {
  localStorage.removeItem(STORAGE_KEY);
}
