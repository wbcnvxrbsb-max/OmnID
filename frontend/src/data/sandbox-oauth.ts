/**
 * Sandbox OAuth Account Database for OmnID Demo
 *
 * FAKE OAuth accounts for demo/testing purposes only.
 * Simulates Google, Apple, and Facebook account linking.
 */

export interface OAuthAccount {
  provider: "google" | "apple" | "facebook";
  email: string;
  displayName: string;
  avatarInitials: string;
  linked: boolean;
}

export const providerInfo: Record<string, { name: string; color: string; bgColor: string }> = {
  google: { name: "Google", color: "text-white", bgColor: "bg-blue-600" },
  apple: { name: "Apple", color: "text-white", bgColor: "bg-gray-900" },
  facebook: { name: "Facebook", color: "text-white", bgColor: "bg-blue-700" },
};

// OAuth accounts keyed by SSN
export const sandboxOAuthAccounts: Record<string, OAuthAccount[]> = {
  "123-45-6789": [
    { provider: "google", email: "alice.johnson@gmail.com", displayName: "Alice Johnson", avatarInitials: "AJ", linked: true },
    { provider: "apple", email: "alice.j@icloud.com", displayName: "Alice J.", avatarInitials: "AJ", linked: true },
    { provider: "facebook", email: "alice.johnson@gmail.com", displayName: "Alice Johnson", avatarInitials: "AJ", linked: false },
  ],
  "234-56-7890": [
    { provider: "google", email: "bob.chen@gmail.com", displayName: "Bob Chen", avatarInitials: "BC", linked: true },
    { provider: "apple", email: "bobchen@icloud.com", displayName: "Bob C.", avatarInitials: "BC", linked: true },
    { provider: "facebook", email: "bob.chen@outlook.com", displayName: "Bob Chen", avatarInitials: "BC", linked: true },
  ],
  "345-67-8901": [
    { provider: "google", email: "carol.martinez@gmail.com", displayName: "Carol Martinez", avatarInitials: "CM", linked: true },
    { provider: "facebook", email: "carol.martinez@gmail.com", displayName: "Carol Martinez", avatarInitials: "CM", linked: true },
  ],
  "456-78-9012": [
    { provider: "google", email: "david.kim@gmail.com", displayName: "David Kim", avatarInitials: "DK", linked: true },
    { provider: "apple", email: "davidkim@icloud.com", displayName: "David K.", avatarInitials: "DK", linked: true },
    { provider: "facebook", email: "david.kim@gmail.com", displayName: "David Kim", avatarInitials: "DK", linked: true },
  ],
  "567-89-0123": [
    { provider: "google", email: "emma.williams@gmail.com", displayName: "Emma Williams", avatarInitials: "EW", linked: true },
    { provider: "apple", email: "emmaw@icloud.com", displayName: "Emma W.", avatarInitials: "EW", linked: false },
  ],
  "678-90-1234": [
    { provider: "google", email: "frank.patel@gmail.com", displayName: "Frank Patel", avatarInitials: "FP", linked: true },
    { provider: "apple", email: "frankp@icloud.com", displayName: "Frank P.", avatarInitials: "FP", linked: true },
    { provider: "facebook", email: "frank.patel@gmail.com", displayName: "Frank Patel", avatarInitials: "FP", linked: true },
  ],
  "789-01-2345": [
    { provider: "google", email: "grace.lee@gmail.com", displayName: "Grace Lee", avatarInitials: "GL", linked: true },
    { provider: "facebook", email: "grace.lee@gmail.com", displayName: "Grace Lee", avatarInitials: "GL", linked: true },
  ],
  "890-12-3456": [
    { provider: "google", email: "henry.thompson@gmail.com", displayName: "Henry Thompson", avatarInitials: "HT", linked: true },
    { provider: "apple", email: "henryt@icloud.com", displayName: "Henry T.", avatarInitials: "HT", linked: true },
    { provider: "facebook", email: "henry.thompson@gmail.com", displayName: "Henry Thompson", avatarInitials: "HT", linked: true },
  ],
};

/**
 * Get OAuth accounts for a person by SSN
 */
export function getOAuthAccounts(ssn: string): OAuthAccount[] {
  return sandboxOAuthAccounts[ssn] ?? [];
}
