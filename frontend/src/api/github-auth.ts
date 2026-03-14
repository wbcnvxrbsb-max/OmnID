/**
 * GitHub OAuth integration — demo / simulation mode.
 * Set VITE_GITHUB_CLIENT_ID in .env to indicate GitHub OAuth is configured.
 *
 * Since GitHub OAuth requires a backend for the code-exchange step,
 * this module provides a simulation mode that returns a realistic mock
 * GitHub profile and persists it in localStorage.
 */

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

/**
 * Simulates linking a GitHub account by generating a realistic mock profile
 * and saving it to localStorage. Use this for demo purposes since real
 * GitHub OAuth requires a backend token exchange.
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
