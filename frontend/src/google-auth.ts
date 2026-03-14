// Google Identity Services (GIS) — popup-based OAuth, no backend needed
// Set VITE_GOOGLE_CLIENT_ID in .env to enable real Google sign-in
// Requires People API + Gmail API enabled in Google Cloud Console

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

export interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  givenName?: string;
  familyName?: string;
  birthday?: string;
  gender?: string;
  phone?: string;
  address?: string;
  organization?: string;
  jobTitle?: string;
}

export interface DetectedPlatform {
  name: string;
  domain: string;
  category: string;
  icon: string;
}

const STORAGE_KEY = "omnid-google-user";
const PLATFORMS_KEY = "omnid-detected-platforms";

// All scopes: profile + personal data + Gmail read-only
const SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/user.birthday.read",
  "https://www.googleapis.com/auth/user.phonenumbers.read",
  "https://www.googleapis.com/auth/user.addresses.read",
  "https://www.googleapis.com/auth/user.gender.read",
  "https://www.googleapis.com/auth/user.organization.read",
  "https://www.googleapis.com/auth/gmail.readonly",
].join(" ");

const PERSON_FIELDS = "names,emailAddresses,photos,birthdays,genders,phoneNumbers,addresses,organizations";

// Platforms to detect from Gmail
const KNOWN_PLATFORMS: DetectedPlatform[] = [
  // Gig / Rideshare / Delivery
  { name: "Uber", domain: "uber.com", category: "Rideshare", icon: "UB" },
  { name: "Lyft", domain: "lyft.com", category: "Rideshare", icon: "LY" },
  { name: "DoorDash", domain: "doordash.com", category: "Delivery", icon: "DD" },
  { name: "Instacart", domain: "instacart.com", category: "Delivery", icon: "IC" },
  { name: "Grubhub", domain: "grubhub.com", category: "Delivery", icon: "GH" },
  { name: "Postmates", domain: "postmates.com", category: "Delivery", icon: "PM" },
  { name: "TaskRabbit", domain: "taskrabbit.com", category: "Services", icon: "TR" },
  // Travel
  { name: "Airbnb", domain: "airbnb.com", category: "Travel", icon: "AB" },
  { name: "Booking.com", domain: "booking.com", category: "Travel", icon: "BK" },
  { name: "Expedia", domain: "expedia.com", category: "Travel", icon: "EX" },
  // Shopping
  { name: "Amazon", domain: "amazon.com", category: "Shopping", icon: "AZ" },
  { name: "eBay", domain: "ebay.com", category: "Shopping", icon: "EB" },
  { name: "Walmart", domain: "walmart.com", category: "Shopping", icon: "WM" },
  { name: "Target", domain: "target.com", category: "Shopping", icon: "TG" },
  { name: "Etsy", domain: "etsy.com", category: "Shopping", icon: "ET" },
  { name: "Shopify", domain: "shopify.com", category: "E-commerce", icon: "SH" },
  // Entertainment
  { name: "Netflix", domain: "netflix.com", category: "Entertainment", icon: "NF" },
  { name: "Spotify", domain: "spotify.com", category: "Entertainment", icon: "SP" },
  { name: "Disney+", domain: "disneyplus.com", category: "Entertainment", icon: "D+" },
  { name: "Hulu", domain: "hulu.com", category: "Entertainment", icon: "HU" },
  { name: "YouTube", domain: "youtube.com", category: "Entertainment", icon: "YT" },
  { name: "Twitch", domain: "twitch.tv", category: "Entertainment", icon: "TW" },
  // Social
  { name: "Twitter/X", domain: "x.com", category: "Social", icon: "X" },
  { name: "TikTok", domain: "tiktok.com", category: "Social", icon: "TK" },
  { name: "Reddit", domain: "reddit.com", category: "Social", icon: "RD" },
  { name: "Discord", domain: "discord.com", category: "Social", icon: "DC" },
  { name: "Snapchat", domain: "snapchat.com", category: "Social", icon: "SN" },
  { name: "LinkedIn", domain: "linkedin.com", category: "Professional", icon: "LI" },
  // Finance / Crypto
  { name: "PayPal", domain: "paypal.com", category: "Payments", icon: "PP" },
  { name: "Venmo", domain: "venmo.com", category: "Payments", icon: "VM" },
  { name: "Cash App", domain: "cash.app", category: "Payments", icon: "CA" },
  { name: "Coinbase", domain: "coinbase.com", category: "Crypto", icon: "CB" },
  { name: "Robinhood", domain: "robinhood.com", category: "Trading", icon: "RH" },
  { name: "Stripe", domain: "stripe.com", category: "Payments", icon: "ST" },
  // Freelance
  { name: "Fiverr", domain: "fiverr.com", category: "Freelance", icon: "FV" },
  { name: "Upwork", domain: "upwork.com", category: "Freelance", icon: "UW" },
  // Developer
  { name: "GitHub", domain: "github.com", category: "Developer", icon: "GH" },
  // Productivity
  { name: "Slack", domain: "slack.com", category: "Productivity", icon: "SL" },
  { name: "Notion", domain: "notion.so", category: "Productivity", icon: "NO" },
  { name: "Zoom", domain: "zoom.us", category: "Productivity", icon: "ZM" },
  // Food
  { name: "Starbucks", domain: "starbucks.com", category: "Food", icon: "SB" },
  { name: "Chipotle", domain: "chipotle.com", category: "Food", icon: "CH" },
  { name: "Domino's", domain: "dominos.com", category: "Food", icon: "DO" },
];

let gisLoaded = false;
let _lastAccessToken: string | null = null;

function loadGIS(): Promise<void> {
  if (gisLoaded) return Promise.resolve();
  return new Promise((resolve, reject) => {
    if ((window as any).google?.accounts?.oauth2) {
      gisLoaded = true;
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => { gisLoaded = true; resolve(); };
    script.onerror = () => reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });
}

export function isGoogleConfigured(): boolean {
  return !!CLIENT_ID;
}

/** Opens Google sign-in popup, returns user profile. Call detectPlatforms() after. */
export async function googleSignIn(): Promise<GoogleUser> {
  if (!CLIENT_ID) throw new Error("VITE_GOOGLE_CLIENT_ID not set");
  await loadGIS();

  return new Promise((resolve, reject) => {
    const google = (window as any).google;
    const client = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: async (response: any) => {
        if (response.error) {
          reject(new Error(response.error_description || response.error));
          return;
        }
        try {
          const token = response.access_token;
          _lastAccessToken = token;
          const headers = { Authorization: `Bearer ${token}` };

          const peopleRes = await fetch(
            `https://people.googleapis.com/v1/people/me?personFields=${PERSON_FIELDS}`,
            { headers }
          );

          let user: GoogleUser;

          if (peopleRes.ok) {
            const p = await peopleRes.json();
            const primaryName = p.names?.find((n: any) => n.metadata?.primary) ?? p.names?.[0];
            const primaryEmail = p.emailAddresses?.find((e: any) => e.metadata?.primary) ?? p.emailAddresses?.[0];
            const primaryPhoto = p.photos?.find((ph: any) => ph.metadata?.primary) ?? p.photos?.[0];

            let birthday = "";
            const bday = p.birthdays?.find((b: any) => b.date) ?? p.birthdays?.[0];
            if (bday?.date) {
              const d = bday.date;
              birthday = d.year
                ? `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`
                : `${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
            }

            const primaryPhone = p.phoneNumbers?.find((ph: any) => ph.metadata?.primary) ?? p.phoneNumbers?.[0];
            const primaryAddr = p.addresses?.find((a: any) => a.metadata?.primary) ?? p.addresses?.[0];
            const primaryOrg = p.organizations?.find((o: any) => o.metadata?.primary) ?? p.organizations?.[0];

            user = {
              email: primaryEmail?.value ?? "",
              name: primaryName?.displayName ?? "",
              picture: primaryPhoto?.url ?? "",
              givenName: primaryName?.givenName ?? "",
              familyName: primaryName?.familyName ?? "",
              birthday,
              gender: p.genders?.[0]?.value ?? "",
              phone: primaryPhone?.value ?? "",
              address: primaryAddr?.formattedValue ?? "",
              organization: primaryOrg?.name ?? "",
              jobTitle: primaryOrg?.title ?? "",
            };
          } else {
            const infoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", { headers });
            if (!infoRes.ok) throw new Error(`Google API error: ${infoRes.status}`);
            const data = await infoRes.json();
            user = {
              email: data.email ?? "",
              name: data.name ?? "",
              picture: data.picture ?? "",
              givenName: data.given_name ?? "",
              familyName: data.family_name ?? "",
            };
          }

          localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
          resolve(user);
        } catch (e) {
          reject(e);
        }
      },
    });
    client.requestAccessToken();
  });
}

/**
 * Scan Gmail for emails from known platforms.
 * Call after googleSignIn(). Uses the access token from the last sign-in.
 * Calls are made in parallel batches to stay under rate limits.
 */
export async function detectPlatforms(
  onProgress?: (found: DetectedPlatform) => void
): Promise<DetectedPlatform[]> {
  if (!_lastAccessToken) return [];
  const token = _lastAccessToken;
  const headers = { Authorization: `Bearer ${token}` };
  const detected: DetectedPlatform[] = [];

  // Check platforms in parallel batches of 10
  const batchSize = 10;
  for (let i = 0; i < KNOWN_PLATFORMS.length; i += batchSize) {
    const batch = KNOWN_PLATFORMS.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(async (platform) => {
        const res = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=from:${encodeURIComponent(platform.domain)}&maxResults=1`,
          { headers }
        );
        if (!res.ok) return null;
        const data = await res.json();
        if (data.resultSizeEstimate > 0 || (data.messages && data.messages.length > 0)) {
          return platform;
        }
        return null;
      })
    );
    for (const r of results) {
      if (r.status === "fulfilled" && r.value) {
        detected.push(r.value);
        onProgress?.(r.value);
      }
    }
  }

  localStorage.setItem(PLATFORMS_KEY, JSON.stringify(detected));
  return detected;
}

/** Get stored detected platforms */
export function getDetectedPlatforms(): DetectedPlatform[] {
  const raw = localStorage.getItem(PLATFORMS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as DetectedPlatform[];
  } catch {
    return [];
  }
}

export function getGoogleUser(): GoogleUser | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GoogleUser;
  } catch {
    return null;
  }
}

export function clearGoogleUser(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(PLATFORMS_KEY);
  _lastAccessToken = null;
}
