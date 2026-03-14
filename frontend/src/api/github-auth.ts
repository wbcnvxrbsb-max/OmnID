const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID as string | undefined;

const STORAGE_KEY = "omnid-github-user";

export interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  html_url: string;
}

/** Returns true if VITE_GITHUB_CLIENT_ID is set in the environment. */
export function isGitHubConfigured(): boolean {
  return !!CLIENT_ID;
}

/** Redirects the browser to GitHub's OAuth authorize URL. */
export function startGitHubOAuth(): void {
  const redirectUri = `${window.location.origin}/accounts`;
  const params = new URLSearchParams({
    client_id: CLIENT_ID!,
    redirect_uri: redirectUri,
    scope: "read:user repo",
    state: "github",
  });
  window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`;
}

/** Sends the OAuth code to the Netlify function, stores the result in localStorage. */
export async function handleGitHubCallback(code: string): Promise<GitHubUser> {
  const res = await fetch("/.netlify/functions/github-auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "GitHub auth failed");
  }

  const data = await res.json();
  const user: GitHubUser = {
    login: data.user.login,
    name: data.user.name ?? data.user.login,
    avatar_url: data.user.avatar_url,
    bio: data.user.bio ?? "",
    public_repos: data.user.public_repos ?? 0,
    followers: data.user.followers ?? 0,
    following: data.user.following ?? 0,
    created_at: data.user.created_at,
    html_url: data.user.html_url,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

/**
 * Simulates linking a GitHub account by generating a realistic mock profile
 * and saving it to localStorage. Use this as a fallback when OAuth is not configured.
 */
export function simulateGitHubLink(): GitHubUser {
  const user: GitHubUser = {
    login: "henry-dev42",
    name: "Henry Thompson",
    avatar_url: "https://avatars.githubusercontent.com/u/583231?v=4",
    bio: "Full-stack developer exploring Web3 and decentralized identity. Building the future of portable reputation.",
    public_repos: 37,
    followers: 128,
    following: 64,
    created_at: "2021-06-15T00:00:00Z",
    html_url: "https://github.com/henry-dev42",
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

/** Returns the stored GitHub user from localStorage, or null if not linked. */
export function getGitHubUser(): GitHubUser | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GitHubUser;
  } catch {
    return null;
  }
}

/** Removes the stored GitHub user from localStorage. */
export function clearGitHubUser(): void {
  localStorage.removeItem(STORAGE_KEY);
}
