import { useState } from "react";
import { Link } from "react-router-dom";
import { getGoogleUser } from "../google-auth";
import { pushActivity } from "../activity";
import {
  getParentData,
  getChildAge,
  canChildUsePlatform,
  getPlatformAgeRule,
  updateChildPermission,
  type ChildAccount,
  type PlatformPermission,
  type ContentLevel,
} from "../data/parental-controls";
import ApprovalSimulator from "../components/ApprovalSimulator";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type DemoState = "select" | "signup" | "consent" | "done";

interface SignupProps {
  onOmnid: () => void;
  onBack: () => void;
  hasOmnid: boolean;
}

interface SharedData {
  label: string;
  value: string;
  verified?: boolean;
}

interface DataCategory {
  title: string;
  description: string;
  items: SharedData[];
}

/* ------------------------------------------------------------------ */
/*  Platform registry                                                  */
/* ------------------------------------------------------------------ */

const PLATFORMS = [
  { id: "facebook", name: "Facebook", icon: "f", brandColor: "#1877F2", category: "Social", tagline: "Connect with friends and the world around you on Facebook." },
  { id: "uber", name: "Uber", icon: "U", brandColor: "#000000", category: "Rideshare", tagline: "Get there. Your day belongs to you." },
  { id: "doordash", name: "DoorDash", icon: "DD", brandColor: "#FF3008", category: "Delivery", tagline: "Your favorite restaurants, delivered." },
  { id: "airbnb", name: "Airbnb", icon: "A", brandColor: "#FF385C", category: "Travel", tagline: "Belong anywhere." },
  { id: "linkedin", name: "LinkedIn", icon: "in", brandColor: "#0A66C2", category: "Professional", tagline: "Manage your professional identity." },
  { id: "instacart", name: "Instacart", icon: "IC", brandColor: "#003D29", category: "Grocery", tagline: "Groceries delivered in as little as 1 hour." },
  { id: "spotify", name: "Spotify", icon: "S", brandColor: "#1DB954", category: "Music", tagline: "Music for everyone." },
  { id: "coinbase", name: "Coinbase", icon: "CB", brandColor: "#0052FF", category: "Crypto", tagline: "The most trusted crypto platform." },
] as const;

type PlatformId = (typeof PLATFORMS)[number]["id"];

/* ------------------------------------------------------------------ */
/*  Data OmnID shares with each platform                               */
/* ------------------------------------------------------------------ */

function getSharedData(platformId: PlatformId, name: string, email: string): DataCategory[] {
  const identity: DataCategory = {
    title: "Profile & Identity",
    description: "Verified personal information",
    items: [
      { label: "Full name", value: name, verified: true },
      { label: "Email", value: email, verified: true },
      { label: "Phone", value: "+1 (555) 867-5309", verified: true },
      { label: "Date of birth", value: "June 15, 1995", verified: true },
      { label: "Profile photo", value: "Verified selfie on file", verified: true },
    ],
  };

  const trust: DataCategory = {
    title: "Trust & Verification",
    description: "Identity verification and safety signals",
    items: [
      { label: "OmnID reputation score", value: "92 / 100", verified: true },
      { label: "Government ID", value: "Verified via SSN", verified: true },
      { label: "Background check", value: "Clear", verified: true },
      { label: "Account age", value: "3 years", verified: true },
      { label: "Platforms linked", value: "12 accounts" },
    ],
  };

  const map: Record<PlatformId, DataCategory[]> = {
    facebook: [
      identity,
      {
        title: "Social & Engagement",
        description: "Cross-platform social activity — the same data Facebook normally collects over months",
        items: [
          { label: "Total connections", value: "847 across 12 platforms" },
          { label: "Content posts", value: "1,243 across platforms" },
          { label: "Avg. engagement rate", value: "4.2%" },
          { label: "Active communities", value: "12 groups / forums" },
          { label: "Content types", value: "Photos 45%, Text 30%, Video 25%" },
        ],
      },
      {
        title: "Interests & Preferences",
        description: "Behavioral data for ad targeting and content ranking",
        items: [
          { label: "Top interests", value: "Technology, Travel, Photography, Cooking" },
          { label: "Peak activity hours", value: "7 PM - 10 PM" },
          { label: "Preferred language", value: "English (US)" },
          { label: "Location signals", value: "San Francisco Bay Area" },
        ],
      },
      {
        title: "Marketplace & Commerce",
        description: "Transaction history from other platforms",
        items: [
          { label: "Marketplace transactions", value: "34 completed" },
          { label: "Seller rating", value: "4.8 / 5.0" },
          { label: "Avg. response time", value: "< 1 hour" },
          { label: "Dispute rate", value: "0%" },
          { label: "Payment reliability", value: "100% — no failed payments" },
        ],
      },
      trust,
    ],

    uber: [
      identity,
      {
        title: "Rider & Driver History",
        description: "Performance data from all transportation platforms",
        items: [
          { label: "Total rides (all platforms)", value: "1,526" },
          { label: "Rider rating", value: "4.9 / 5.0" },
          { label: "Cancellation rate", value: "2%" },
          { label: "Preferred ride type", value: "UberX / Economy" },
          { label: "Common routes", value: "3 saved locations" },
        ],
      },
      {
        title: "Delivery & Gig Performance",
        description: "Work metrics from delivery and gig platforms",
        items: [
          { label: "Deliveries completed", value: "2,340" },
          { label: "On-time rate", value: "96%" },
          { label: "Completion rate", value: "98%" },
          { label: "Active months", value: "34" },
        ],
      },
      {
        title: "Payment & Spending",
        description: "Financial reliability signals",
        items: [
          { label: "Payment methods", value: "3 verified" },
          { label: "Monthly ride spend", value: "~$180 average" },
          { label: "Payment reliability", value: "100% — no failed payments" },
        ],
      },
      trust,
    ],

    doordash: [
      identity,
      {
        title: "Delivery Performance",
        description: "Dasher metrics from all delivery platforms",
        items: [
          { label: "Deliveries completed", value: "2,340 across platforms" },
          { label: "Average rating", value: "4.7 / 5.0" },
          { label: "On-time rate", value: "96%" },
          { label: "Completion rate", value: "98%" },
          { label: "Active months", value: "34" },
          { label: "Total earnings", value: "$47,200 across platforms" },
        ],
      },
      {
        title: "Customer Behavior",
        description: "Ordering patterns and preferences",
        items: [
          { label: "Order frequency", value: "~8 orders / month" },
          { label: "Average tip", value: "22%" },
          { label: "Cuisine preferences", value: "Asian, Italian, Mexican" },
          { label: "Delivery addresses", value: "2 verified addresses" },
        ],
      },
      trust,
    ],

    airbnb: [
      identity,
      {
        title: "Travel History",
        description: "Booking and travel data from all platforms",
        items: [
          { label: "Trips completed", value: "18 across platforms" },
          { label: "Guest rating", value: "4.9 / 5.0" },
          { label: "Reviews written", value: "15" },
          { label: "Preferred stay type", value: "Entire home, 2-4 guests" },
          { label: "House rules compliance", value: "100%" },
        ],
      },
      {
        title: "Financial & Payment",
        description: "Spending history and payment verification",
        items: [
          { label: "Average booking value", value: "$340" },
          { label: "Payment methods", value: "3 verified" },
          { label: "Cancellation rate", value: "3%" },
          { label: "Response rate", value: "98%" },
        ],
      },
      trust,
    ],

    linkedin: [
      identity,
      {
        title: "Professional Profile",
        description: "Career data — what LinkedIn normally builds over years",
        items: [
          { label: "Current role", value: "Software Engineer" },
          { label: "Years of experience", value: "5 years in tech" },
          { label: "Verified skills", value: "12 skills" },
          { label: "Education", value: "B.S. Computer Science" },
          { label: "Certifications", value: "3 professional certs" },
        ],
      },
      {
        title: "Network & Engagement",
        description: "Professional network signals",
        items: [
          { label: "Connections", value: "847 across platforms" },
          { label: "Posts in last year", value: "45" },
          { label: "Endorsements received", value: "128" },
          { label: "Recommendations", value: "8 written, 6 received" },
          { label: "Industry", value: "Technology / Software" },
        ],
      },
      trust,
    ],

    instacart: [
      identity,
      {
        title: "Shopping Activity",
        description: "Grocery and delivery behavior",
        items: [
          { label: "Orders completed", value: "156" },
          { label: "Favorite stores", value: "Costco, Trader Joe's, Whole Foods" },
          { label: "Monthly spend", value: "~$420 average" },
          { label: "Substitution preference", value: "Best match" },
        ],
      },
      {
        title: "Shopper / Gig Performance",
        description: "Delivery metrics from all gig platforms",
        items: [
          { label: "Deliveries (all platforms)", value: "2,340" },
          { label: "Shopper rating", value: "4.7 / 5.0" },
          { label: "Items per hour", value: "67 average" },
          { label: "On-time rate", value: "96%" },
          { label: "Completion rate", value: "98%" },
        ],
      },
      trust,
    ],

    spotify: [
      identity,
      {
        title: "Listening & Preferences",
        description: "Music and audio consumption — jumpstarts recommendations",
        items: [
          { label: "Monthly listening", value: "~45 hours" },
          { label: "Top genres", value: "Indie, Electronic, Hip-Hop" },
          { label: "Playlists created", value: "23" },
          { label: "Podcast subscriptions", value: "8" },
          { label: "Concert attendance", value: "6 in last year" },
        ],
      },
      {
        title: "Social & Discovery",
        description: "Music social activity",
        items: [
          { label: "Followers", value: "34" },
          { label: "Public playlists", value: "7" },
          { label: "Artists followed", value: "142" },
          { label: "Collaborative playlists", value: "4" },
        ],
      },
      trust,
    ],

    coinbase: [
      identity,
      {
        title: "Financial & KYC",
        description: "Pre-verified financial identity — saves Coinbase KYC costs",
        items: [
          { label: "KYC level", value: "Enhanced — Level 3", verified: true },
          { label: "Payment methods", value: "3 verified", verified: true },
          { label: "Bank accounts", value: "2 linked", verified: true },
          { label: "Monthly transaction volume", value: "$2,450 avg" },
        ],
      },
      {
        title: "Crypto Activity",
        description: "Digital asset history from other platforms",
        items: [
          { label: "Portfolio value", value: "$8,200" },
          { label: "Trading history", value: "18 months" },
          { label: "Preferred assets", value: "ETH, USDC, BTC" },
          { label: "DeFi participation", value: "Active on 3 protocols" },
          { label: "Wallet addresses", value: "2 verified wallets" },
        ],
      },
      trust,
    ],
  };

  return map[platformId];
}

/* ------------------------------------------------------------------ */
/*  Shared small components                                            */
/* ------------------------------------------------------------------ */

function DemoBanner({ name, onBack }: { name: string; onBack: () => void }) {
  return (
    <div className="bg-[#0a0a14] border-b border-[#1f1f30] px-4 py-2 flex items-center justify-between -mx-4 -mt-8 mb-0">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-gradient-to-br from-[#3b82f6] to-[#38bdf8] rounded flex items-center justify-center">
          <span className="text-[8px] font-bold text-white">O</span>
        </div>
        <span className="text-xs text-[#7c819a]">
          OmnID Partner Demo — Simulating <strong className="text-[#eeeef0]">{name}</strong> sign-up
        </span>
      </div>
      <button onClick={onBack} className="text-xs text-[#3b82f6] hover:text-[#60a5fa] transition-colors">
        {"\u2190"} Back to platforms
      </button>
    </div>
  );
}

function OmnIDButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <div>
      <button
        onClick={onClick}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-3 py-3 rounded-lg font-semibold text-sm transition-all bg-gradient-to-r from-[#3b82f6] to-[#38bdf8] text-white hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center text-[10px] font-bold">O</div>
        Continue with OmnID
      </button>
      {disabled && (
        <p className="text-xs text-gray-400 text-center mt-1.5">
          Create your OmnID first at <span className="text-[#3b82f6]">/register</span>
        </p>
      )}
    </div>
  );
}

function OrDivider({ color = "gray-300" }: { color?: string }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className={`flex-1 h-px bg-${color}`} style={{ backgroundColor: color.startsWith("#") ? color : undefined }} />
      <span className="text-xs text-gray-400 uppercase">or</span>
      <div className={`flex-1 h-px bg-${color}`} style={{ backgroundColor: color.startsWith("#") ? color : undefined }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Platform sign-up pages                                             */
/* ------------------------------------------------------------------ */

function FacebookSignup({ onOmnid, onBack, hasOmnid }: SignupProps) {
  return (
    <div>
      <DemoBanner name="Facebook" onBack={onBack} />
      <div className="min-h-[80vh] flex items-center justify-center p-6 -mx-4" style={{ backgroundColor: "#f0f2f5" }}>
        <div className="w-full max-w-[900px] flex flex-col lg:flex-row items-center gap-8">
          {/* Left: branding */}
          <div className="lg:flex-1 text-center lg:text-left">
            <h1 className="mb-2" style={{ color: "#1877F2", fontSize: "56px", fontWeight: 700, lineHeight: 1, fontFamily: "system-ui" }}>
              facebook
            </h1>
            <p className="text-xl text-gray-600 max-w-sm">
              Connect with friends and the world around you on Facebook.
            </p>
          </div>

          {/* Right: sign-up card */}
          <div className="w-full max-w-[396px]">
            <div className="bg-white rounded-lg shadow-xl p-4 pb-6">
              <div className="flex gap-2 mb-3">
                <input placeholder="First name" className="flex-1 px-3 py-3 border border-gray-300 rounded-md text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#1877F2]" />
                <input placeholder="Surname" className="flex-1 px-3 py-3 border border-gray-300 rounded-md text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#1877F2]" />
              </div>
              <input placeholder="Mobile number or email address" className="w-full px-3 py-3 border border-gray-300 rounded-md text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#1877F2] mb-3" />
              <input type="password" placeholder="New password" className="w-full px-3 py-3 border border-gray-300 rounded-md text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#1877F2] mb-3" />

              <p className="text-xs text-gray-500 mb-1">Date of birth</p>
              <div className="flex gap-2 mb-3">
                <select className="flex-1 px-2 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white">
                  {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map(m => <option key={m}>{m}</option>)}
                </select>
                <select className="flex-1 px-2 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white">
                  {Array.from({ length: 31 }, (_, i) => <option key={i}>{i + 1}</option>)}
                </select>
                <select className="flex-1 px-2 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white">
                  {Array.from({ length: 50 }, (_, i) => <option key={i}>{2025 - i}</option>)}
                </select>
              </div>

              <p className="text-xs text-gray-500 mb-1">Gender</p>
              <div className="flex gap-2 mb-4">
                {["Female", "Male", "Custom"].map(g => (
                  <label key={g} className="flex-1 flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 cursor-pointer hover:bg-gray-50">
                    {g} <input type="radio" name="gender" className="ml-2 accent-[#1877F2]" />
                  </label>
                ))}
              </div>

              <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
                People who use our service may have uploaded your contact information to Facebook.{" "}
                By clicking Sign Up, you agree to our Terms, Privacy Policy and Cookies Policy.
              </p>

              <button className="w-full py-2.5 rounded-md text-white font-bold text-lg" style={{ backgroundColor: "#42B72A" }}>
                Sign Up
              </button>

              <OrDivider color="#dadde1" />

              <OmnIDButton onClick={onOmnid} disabled={!hasOmnid} />
            </div>

            <p className="text-center text-sm mt-4" style={{ color: "#1877F2" }}>
              <span className="cursor-pointer hover:underline">Already have an account?</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function UberSignup({ onOmnid, onBack, hasOmnid }: SignupProps) {
  return (
    <div>
      <DemoBanner name="Uber" onBack={onBack} />
      <div className="min-h-[80vh] bg-white flex items-center justify-center p-6 -mx-4">
        <div className="w-full max-w-[400px]">
          <h1 className="text-[32px] font-bold text-black mb-1" style={{ fontFamily: "system-ui" }}>Uber</h1>
          <h2 className="text-xl font-bold text-black mb-1">Create your account</h2>
          <p className="text-gray-500 text-sm mb-6">Then start riding with Uber.</p>

          <div className="space-y-3 mb-4">
            <input placeholder="First name" className="w-full px-4 py-3.5 bg-[#f6f6f6] rounded-lg text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black" />
            <input placeholder="Last name" className="w-full px-4 py-3.5 bg-[#f6f6f6] rounded-lg text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black" />
            <div className="flex">
              <div className="px-3 py-3.5 bg-[#f6f6f6] rounded-l-lg border-r border-gray-200 text-sm text-black flex items-center gap-1">
                <span>+1</span>
                <span className="text-gray-400 text-xs">{"\u25BC"}</span>
              </div>
              <input placeholder="Phone number" className="flex-1 px-4 py-3.5 bg-[#f6f6f6] rounded-r-lg text-sm text-black placeholder:text-gray-400 focus:outline-none" />
            </div>
            <input placeholder="Email" type="email" className="w-full px-4 py-3.5 bg-[#f6f6f6] rounded-lg text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black" />
            <input type="password" placeholder="Create a password" className="w-full px-4 py-3.5 bg-[#f6f6f6] rounded-lg text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black" />
          </div>

          <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">
            By proceeding, you consent to get calls, WhatsApp or SMS/RCS messages, including by automated means, from Uber and its affiliates to the number provided.
          </p>

          <button className="w-full py-3.5 bg-black text-white rounded-lg font-medium text-sm mb-1">
            Create Account
          </button>

          <OrDivider color="#e0e0e0" />

          <div className="space-y-2.5 mb-3">
            <button className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg text-sm text-black hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg text-sm text-black hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="black"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
              Continue with Apple
            </button>
          </div>

          <OmnIDButton onClick={onOmnid} disabled={!hasOmnid} />

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account? <span className="text-black font-medium cursor-pointer hover:underline">Sign in</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function DoorDashSignup({ onOmnid, onBack, hasOmnid }: SignupProps) {
  return (
    <div>
      <DemoBanner name="DoorDash" onBack={onBack} />
      <div className="min-h-[80vh] bg-white flex items-center justify-center p-6 -mx-4">
        <div className="w-full max-w-[420px]">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#FF3008" }}>
              <span className="text-white font-bold text-sm">DD</span>
            </div>
            <span className="text-2xl font-bold text-[#191919]">DoorDash</span>
          </div>

          <h2 className="text-xl font-bold text-[#191919] mb-1">Sign up</h2>
          <p className="text-gray-500 text-sm mb-6">Get delivery and pickup from restaurants near you.</p>

          <div className="space-y-3 mb-4">
            <div className="flex gap-3">
              <input placeholder="First Name" className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm text-[#191919] placeholder:text-gray-400 focus:outline-none focus:border-[#FF3008]" />
              <input placeholder="Last Name" className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm text-[#191919] placeholder:text-gray-400 focus:outline-none focus:border-[#FF3008]" />
            </div>
            <input placeholder="Email" type="email" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-[#191919] placeholder:text-gray-400 focus:outline-none focus:border-[#FF3008]" />
            <input placeholder="Phone Number" type="tel" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-[#191919] placeholder:text-gray-400 focus:outline-none focus:border-[#FF3008]" />
            <input placeholder="Password" type="password" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-[#191919] placeholder:text-gray-400 focus:outline-none focus:border-[#FF3008]" />
          </div>

          <p className="text-[11px] text-gray-500 mb-4">
            By tapping "Sign Up" or "Continue with Google / Apple", you agree to DoorDash's Terms of Service and Privacy Policy.
          </p>

          <button className="w-full py-3 rounded-full text-white font-semibold text-sm" style={{ backgroundColor: "#FF3008" }}>
            Sign Up
          </button>

          <OrDivider color="#e5e5e5" />

          <div className="space-y-2.5 mb-3">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-full text-sm text-[#191919] hover:bg-gray-50">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-full text-sm text-[#191919] hover:bg-gray-50">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#191919"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
              Continue with Apple
            </button>
          </div>

          <OmnIDButton onClick={onOmnid} disabled={!hasOmnid} />

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account? <span className="cursor-pointer font-medium" style={{ color: "#FF3008" }}>Log in</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function AirbnbSignup({ onOmnid, onBack, hasOmnid }: SignupProps) {
  return (
    <div>
      <DemoBanner name="Airbnb" onBack={onBack} />
      <div className="min-h-[80vh] bg-white flex items-center justify-center p-6 -mx-4">
        <div className="w-full max-w-[568px]">
          <div className="border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-center relative">
              <h2 className="text-base font-semibold text-[#222]">Log in or sign up</h2>
            </div>

            <div className="p-6">
              <h3 className="text-[22px] font-semibold text-[#222] mb-6">Welcome to Airbnb</h3>

              <div className="mb-4">
                <div className="border border-gray-400 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-300">
                    <label className="text-[10px] text-gray-500 uppercase">Country/Region</label>
                    <p className="text-sm text-[#222]">United States (+1)</p>
                  </div>
                  <input placeholder="Phone number" className="w-full px-4 py-3 text-sm text-[#222] placeholder:text-gray-400 focus:outline-none" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  We'll call or text you to confirm your number. Standard message and data rates apply.
                </p>
              </div>

              <button className="w-full py-3 rounded-lg text-white font-semibold text-base mb-3" style={{ backgroundColor: "#FF385C", background: "linear-gradient(to right, #E61E4D, #E31C5F, #D70466)" }}>
                Continue
              </button>

              <OrDivider color="#dddddd" />

              <div className="space-y-3 mb-3">
                <button className="w-full flex items-center px-4 py-3 border border-gray-900 rounded-lg text-sm text-[#222] hover:bg-gray-50 relative">
                  <svg className="w-5 h-5 absolute left-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  <span className="w-full text-center font-medium">Continue with Google</span>
                </button>
                <button className="w-full flex items-center px-4 py-3 border border-gray-900 rounded-lg text-sm text-[#222] hover:bg-gray-50 relative">
                  <svg className="w-5 h-5 absolute left-4" viewBox="0 0 24 24" fill="#222"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                  <span className="w-full text-center font-medium">Continue with Apple</span>
                </button>
                <button className="w-full flex items-center px-4 py-3 border border-gray-900 rounded-lg text-sm text-[#222] hover:bg-gray-50 relative">
                  <span className="w-full text-center font-medium">Continue with email</span>
                </button>
              </div>

              <OmnIDButton onClick={onOmnid} disabled={!hasOmnid} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LinkedInSignup({ onOmnid, onBack, hasOmnid }: SignupProps) {
  return (
    <div>
      <DemoBanner name="LinkedIn" onBack={onBack} />
      <div className="min-h-[80vh] flex items-center justify-center p-6 -mx-4" style={{ backgroundColor: "#f3f2ef" }}>
        <div className="w-full max-w-[400px]">
          {/* Logo */}
          <div className="mb-4">
            <span className="text-[28px] font-bold" style={{ color: "#0A66C2" }}>Linked</span>
            <span className="text-[28px] font-bold text-[#0A66C2]">in</span>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-[32px] font-normal text-[#191919] mb-1">Sign up</h2>
            <p className="text-sm text-gray-600 mb-5">Make the most of your professional life</p>

            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Email or phone number</label>
                <input className="w-full px-3 py-2.5 border border-gray-900 rounded-md text-sm text-[#191919] focus:outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2]" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Password (6+ characters)</label>
                <input type="password" className="w-full px-3 py-2.5 border border-gray-900 rounded-md text-sm text-[#191919] focus:outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2]" />
              </div>
            </div>

            <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">
              By clicking Agree & Join or Continue, you agree to the LinkedIn User Agreement, Privacy Policy, and Cookie Policy.
            </p>

            <button className="w-full py-3 rounded-full text-white font-semibold text-base" style={{ backgroundColor: "#0A66C2" }}>
              Agree & Join
            </button>

            <OrDivider color="#ccc" />

            <div className="space-y-2.5 mb-3">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-400 rounded-full text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-600 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
              </button>
            </div>

            <OmnIDButton onClick={onOmnid} disabled={!hasOmnid} />

            <p className="text-center text-sm text-gray-600 mt-5">
              Already on LinkedIn?{" "}
              <span className="font-semibold cursor-pointer hover:underline" style={{ color: "#0A66C2" }}>Sign in</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InstacartSignup({ onOmnid, onBack, hasOmnid }: SignupProps) {
  return (
    <div>
      <DemoBanner name="Instacart" onBack={onBack} />
      <div className="min-h-[80vh] bg-white flex items-center justify-center p-6 -mx-4">
        <div className="w-full max-w-[420px]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#003D29" }}>
              <span className="text-white text-xs font-bold">IC</span>
            </div>
            <span className="text-2xl font-bold" style={{ color: "#003D29" }}>Instacart</span>
          </div>
          <p className="text-sm text-gray-500 mb-6">Groceries and more, delivered.</p>

          <div className="border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-[#343538] mb-5">Create your account</h2>

            <div className="space-y-3 mb-4">
              <input placeholder="Email address" className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-sm text-[#343538] placeholder:text-gray-400 focus:outline-none focus:border-[#003D29]" />
              <div className="flex gap-3">
                <input placeholder="First name" className="flex-1 px-4 py-3.5 border border-gray-300 rounded-xl text-sm text-[#343538] placeholder:text-gray-400 focus:outline-none focus:border-[#003D29]" />
                <input placeholder="Last name" className="flex-1 px-4 py-3.5 border border-gray-300 rounded-xl text-sm text-[#343538] placeholder:text-gray-400 focus:outline-none focus:border-[#003D29]" />
              </div>
              <input placeholder="Password" type="password" className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-sm text-[#343538] placeholder:text-gray-400 focus:outline-none focus:border-[#003D29]" />
              <input placeholder="ZIP code" className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-sm text-[#343538] placeholder:text-gray-400 focus:outline-none focus:border-[#003D29]" />
            </div>

            <button className="w-full py-3.5 rounded-xl text-white font-semibold text-base" style={{ backgroundColor: "#003D29" }}>
              Create Account
            </button>

            <OrDivider color="#e8e8e8" />

            <div className="space-y-2.5 mb-3">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl text-sm text-[#343538] hover:bg-gray-50">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl text-sm text-[#343538] hover:bg-gray-50">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#343538"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/></svg>
                Continue with Facebook
              </button>
            </div>

            <OmnIDButton onClick={onOmnid} disabled={!hasOmnid} />

            <p className="text-center text-sm text-gray-500 mt-4">
              Already have an account?{" "}
              <span className="font-semibold cursor-pointer" style={{ color: "#003D29" }}>Log in</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpotifySignup({ onOmnid, onBack, hasOmnid }: SignupProps) {
  return (
    <div>
      <DemoBanner name="Spotify" onBack={onBack} />
      <div className="min-h-[80vh] flex items-center justify-center p-8 -mx-4" style={{ backgroundColor: "#121212" }}>
        <div className="w-full max-w-[450px]">
          {/* Spotify logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#1DB954" }}>
                <span className="text-black font-bold text-lg">S</span>
              </div>
              <span className="text-white text-2xl font-bold">Spotify</span>
            </div>
          </div>

          <h1 className="text-[32px] font-bold text-white text-center mb-8">
            Sign up to start listening
          </h1>

          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-sm font-bold text-white mb-2">Email address</label>
              <input placeholder="name@domain.com" className="w-full px-4 py-3 bg-transparent border border-[#727272] rounded-md text-sm text-white placeholder:text-[#727272] focus:outline-none focus:border-white hover:border-white transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-bold text-white mb-2">Create a password</label>
              <input type="password" placeholder="Create a password" className="w-full px-4 py-3 bg-transparent border border-[#727272] rounded-md text-sm text-white placeholder:text-[#727272] focus:outline-none focus:border-white hover:border-white transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-bold text-white mb-2">What should we call you?</label>
              <input placeholder="Enter a profile name" className="w-full px-4 py-3 bg-transparent border border-[#727272] rounded-md text-sm text-white placeholder:text-[#727272] focus:outline-none focus:border-white hover:border-white transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-bold text-white mb-2">What's your date of birth?</label>
              <div className="flex gap-3">
                <input placeholder="DD" className="w-20 px-4 py-3 bg-transparent border border-[#727272] rounded-md text-sm text-white text-center placeholder:text-[#727272] focus:outline-none focus:border-white" />
                <select className="flex-1 px-4 py-3 bg-[#121212] border border-[#727272] rounded-md text-sm text-[#727272] focus:outline-none focus:border-white">
                  <option>Month</option>
                  {["January","February","March","April","May","June","July","August","September","October","November","December"].map(m => <option key={m}>{m}</option>)}
                </select>
                <input placeholder="YYYY" className="w-24 px-4 py-3 bg-transparent border border-[#727272] rounded-md text-sm text-white text-center placeholder:text-[#727272] focus:outline-none focus:border-white" />
              </div>
            </div>
          </div>

          <button className="w-full py-3.5 rounded-full text-black font-bold text-base mt-4" style={{ backgroundColor: "#1DB954" }}>
            Sign Up
          </button>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#292929]" />
            <span className="text-xs text-[#727272]">or</span>
            <div className="flex-1 h-px bg-[#292929]" />
          </div>

          <div className="space-y-2.5 mb-3">
            <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#727272] rounded-full text-sm text-white hover:border-white transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Sign up with Google
            </button>
            <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#727272] rounded-full text-sm text-white hover:border-white transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/></svg>
              Sign up with Facebook
            </button>
          </div>

          <OmnIDButton onClick={onOmnid} disabled={!hasOmnid} />

          <p className="text-center text-sm text-[#a7a7a7] mt-6">
            Already have an account?{" "}
            <span className="text-white underline cursor-pointer hover:text-[#1DB954]">Log in here</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function CoinbaseSignup({ onOmnid, onBack, hasOmnid }: SignupProps) {
  return (
    <div>
      <DemoBanner name="Coinbase" onBack={onBack} />
      <div className="min-h-[80vh] bg-white flex items-center justify-center p-6 -mx-4">
        <div className="w-full max-w-[420px]">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#0052FF" }}>
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-semibold text-[#0a0b0d]">coinbase</span>
          </div>

          <h2 className="text-2xl font-semibold text-[#0a0b0d] mb-1">Create your account</h2>
          <p className="text-sm text-gray-500 mb-6">The most trusted place to buy and sell crypto.</p>

          <div className="space-y-3 mb-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">First name</label>
                <input placeholder="First name" className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm text-[#0a0b0d] placeholder:text-gray-400 focus:outline-none focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Last name</label>
                <input placeholder="Last name" className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm text-[#0a0b0d] placeholder:text-gray-400 focus:outline-none focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input type="email" placeholder="Email address" className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm text-[#0a0b0d] placeholder:text-gray-400 focus:outline-none focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
              <input type="password" placeholder="Create a password" className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm text-[#0a0b0d] placeholder:text-gray-400 focus:outline-none focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]" />
            </div>
          </div>

          <div className="flex items-start gap-2 mb-4">
            <input type="checkbox" className="mt-1 accent-[#0052FF]" />
            <p className="text-xs text-gray-500 leading-relaxed">
              I certify that I am 18 years of age or older, and I agree to the Coinbase User Agreement and Privacy Policy.
            </p>
          </div>

          <button className="w-full py-3 rounded-lg text-white font-semibold text-base" style={{ backgroundColor: "#0052FF" }}>
            Create Account
          </button>

          <OrDivider color="#e5e5e5" />

          <div className="space-y-2.5 mb-3">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg text-sm text-[#0a0b0d] hover:bg-gray-50">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg text-sm text-[#0a0b0d] hover:bg-gray-50">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0a0b0d"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
              Continue with Apple
            </button>
          </div>

          <OmnIDButton onClick={onOmnid} disabled={!hasOmnid} />

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{" "}
            <span className="font-semibold cursor-pointer" style={{ color: "#0052FF" }}>Sign in</span>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  OmnID Consent Screen (like OAuth)                                  */
/* ------------------------------------------------------------------ */

function ConsentScreen({
  platformName,
  platformColor,
  platformIcon,
  data,
  onAllow,
  onDeny,
}: {
  platformName: string;
  platformColor: string;
  platformIcon: string;
  data: DataCategory[];
  onAllow: () => void;
  onDeny: () => void;
}) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0]));

  function toggle(i: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  const totalItems = data.reduce((n, c) => n + c.items.length, 0);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 -mx-4" style={{ backgroundColor: "#09090f" }}>
      <div className="w-full max-w-[480px]">
        {/* OmnID header */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#3b82f6] to-[#38bdf8] rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold text-white">O</span>
            </div>
            <span className="text-lg font-bold text-[#eeeef0]">
              Omn<span className="bg-gradient-to-r from-[#3b82f6] to-[#38bdf8] bg-clip-text text-transparent">ID</span>
            </span>
          </div>
        </div>

        <div className="bg-[#13131d] border border-[#1f1f30] rounded-2xl overflow-hidden">
          {/* Top: requesting platform */}
          <div className="p-6 border-b border-[#1f1f30]">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: platformColor }}>
                {platformIcon}
              </div>
              <div className="text-[#7c819a] text-2xl">{"\u2192"}</div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#3b82f6] to-[#38bdf8] rounded-xl flex items-center justify-center text-white font-bold">
                O
              </div>
            </div>
            <h2 className="text-xl font-bold text-[#eeeef0] text-center mb-1">
              {platformName} wants to access your OmnID
            </h2>
            <p className="text-sm text-[#7c819a] text-center">
              This will share {totalItems} verified data points with {platformName}
            </p>
          </div>

          {/* Data categories */}
          <div className="p-4 max-h-[400px] overflow-y-auto">
            {data.map((cat, i) => (
              <div key={i} className="mb-2">
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-[#1a1a28] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[#22c55e] text-sm">{"\u2713"}</span>
                    <div className="text-left">
                      <p className="text-sm font-medium text-[#eeeef0]">{cat.title}</p>
                      <p className="text-[11px] text-[#7c819a]">{cat.description}</p>
                    </div>
                  </div>
                  <span className="text-[#7c819a] text-xs">{expanded.has(i) ? "\u25B2" : "\u25BC"}</span>
                </button>
                {expanded.has(i) && (
                  <div className="ml-9 pl-3 border-l border-[#1f1f30] mb-2">
                    {cat.items.map((item, j) => (
                      <div key={j} className="flex items-center justify-between py-1.5">
                        <span className="text-xs text-[#7c819a]">{item.label}</span>
                        <span className={`text-xs font-mono ${item.verified ? "text-[#22c55e]" : "text-[#a0a4b8]"}`}>
                          {item.value}
                          {item.verified && <span className="ml-1">{"\u2713"}</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-[#1f1f30] flex gap-3">
            <button
              onClick={onDeny}
              className="flex-1 py-3 rounded-lg border border-[#1f1f30] text-sm font-medium text-[#7c819a] hover:text-[#eeeef0] hover:border-[#2a2a42] transition-colors"
            >
              Deny
            </button>
            <button
              onClick={onAllow}
              className="flex-1 py-3 rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#38bdf8] text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              Allow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Success Screen                                                     */
/* ------------------------------------------------------------------ */

function SuccessScreen({
  platformName,
  platformColor,
  platformIcon,
  data,
  onTryAnother,
  childBadge,
}: {
  platformName: string;
  platformColor: string;
  platformIcon: string;
  data: DataCategory[];
  onTryAnother: () => void;
  childBadge?: string;
}) {
  const totalItems = data.reduce((n, c) => n + c.items.length, 0);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-full max-w-[520px]">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-omn-success/20 rounded-full flex items-center justify-center text-omn-success text-3xl mx-auto mb-4">
            {"\u2713"}
          </div>
          <h2 className="text-2xl font-bold text-omn-heading mb-2">
            Signed up to {platformName} with OmnID
          </h2>
          {childBadge && (
            <span className="inline-block px-3 py-1 bg-omn-primary/20 text-omn-primary text-xs font-medium rounded-full mb-2">
              {childBadge}
            </span>
          )}
          <p className="text-sm text-omn-text">
            {totalItems} verified data points transferred instantly. No forms, no typing, no new password.
          </p>
        </div>

        {/* What was shared */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-5 mb-4">
          <h3 className="text-sm font-semibold text-omn-heading mb-3">Data shared with {platformName}</h3>
          <div className="space-y-3">
            {data.map((cat, i) => (
              <div key={i}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-omn-success text-xs">{"\u2713"}</span>
                  <span className="text-sm font-medium text-omn-heading">{cat.title}</span>
                  <span className="text-[10px] text-omn-text">({cat.items.length} items)</span>
                </div>
                <p className="text-[11px] text-omn-text ml-5">{cat.items.map(i => i.label).join(", ")}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What just happened steps */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-5 mb-6">
          <h4 className="text-sm font-semibold text-omn-heading mb-3">How it works</h4>
          <div className="space-y-3">
            {[
              { n: "1", title: "User clicks \"Continue with OmnID\"", desc: `On ${platformName}'s sign-up page, just like "Sign in with Google" — one click.` },
              { n: "2", title: "OmnID shows consent screen", desc: `User reviews exactly what data ${platformName} will receive. Full transparency.` },
              { n: "3", title: "Verified data transfers instantly", desc: `${platformName} gets ${totalItems} pre-verified data points: identity, behavior, reputation, trust signals.` },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex items-start gap-3">
                <div className={`w-6 h-6 ${n === "$" ? "bg-omn-accent/20" : "bg-omn-primary/20"} rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${n === "$" ? "text-omn-accent" : "text-omn-primary"}`}>
                  {n}
                </div>
                <div>
                  <p className="text-xs font-medium text-omn-heading">{title}</p>
                  <p className="text-[10px] text-omn-text">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onTryAnother}
          className="w-full py-3 bg-gradient-to-r from-omn-primary to-omn-accent text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-omn-primary/20 transition-all"
        >
          Try another platform
        </button>

        <p className="text-[10px] text-omn-text/50 text-center mt-3">
          This is a demo. No real account was created on {platformName}.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function PartnerDemo() {
  const [tab, setTab] = useState<"adult" | "child">("adult");

  return (
    <div>
      <h1 className="text-3xl font-bold text-omn-heading mb-2">Partner Demo</h1>
      <p className="text-omn-text mb-6">
        See what it looks like when platforms integrate "Sign in with OmnID"
      </p>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-omn-surface border border-omn-border rounded-xl p-1 mb-8 max-w-xs">
        <button
          onClick={() => setTab("adult")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "adult"
              ? "bg-omn-primary text-white"
              : "text-omn-text hover:text-omn-heading"
          }`}
        >
          Adult Demo
        </button>
        <button
          onClick={() => setTab("child")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "child"
              ? "bg-omn-primary text-white"
              : "text-omn-text hover:text-omn-heading"
          }`}
        >
          Child Demo
        </button>
      </div>

      {tab === "adult" ? <AdultDemo /> : <ChildDemo />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Adult Demo (existing flow)                                         */
/* ------------------------------------------------------------------ */

function AdultDemo() {
  const [platformId, setPlatformId] = useState<PlatformId | null>(null);
  const [state, setState] = useState<DemoState>("select");

  const googleUser = getGoogleUser();
  const hasOmnid = !!googleUser;

  const platform = PLATFORMS.find((p) => p.id === platformId) ?? null;
  const name = googleUser?.name ?? "Alex Johnson";
  const email = googleUser?.email ?? "alex@gmail.com";
  const sharedData = platformId ? getSharedData(platformId, name, email) : [];

  function selectPlatform(id: PlatformId) {
    setPlatformId(id);
    setState("signup");
  }

  function handleOmnidClick() {
    if (!hasOmnid) return;
    setState("consent");
  }

  function handleConsent() {
    setState("done");
    if (platform) {
      pushActivity(
        `Signed up to ${platform.name} via OmnID — shared ${sharedData.reduce((n, c) => n + c.items.length, 0)} data points`,
        platform.icon,
        "bg-omn-primary"
      );
    }
  }

  function handleBack() {
    setPlatformId(null);
    setState("select");
  }

  if (state === "select") {
    return (
      <div>
        <p className="text-sm text-omn-text mb-4">Choose a platform to see their real sign-up page with OmnID integration:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => selectPlatform(p.id)}
              className="bg-omn-surface border border-omn-border rounded-xl p-4 text-left hover:border-omn-primary/50 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: p.brandColor }}>
                  {p.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-omn-heading group-hover:text-white transition-colors">{p.name}</p>
                  <p className="text-[10px] text-omn-text">{p.category}</p>
                </div>
              </div>
              <p className="text-xs text-omn-text">{p.tagline}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (state === "consent" && platform) {
    return (
      <ConsentScreen
        platformName={platform.name}
        platformColor={platform.brandColor}
        platformIcon={platform.icon}
        data={sharedData}
        onAllow={handleConsent}
        onDeny={() => setState("signup")}
      />
    );
  }

  if (state === "done" && platform) {
    return (
      <SuccessScreen
        platformName={platform.name}
        platformColor={platform.brandColor}
        platformIcon={platform.icon}
        data={sharedData}
        onTryAnother={handleBack}
      />
    );
  }

  const signupProps: SignupProps = { onOmnid: handleOmnidClick, onBack: handleBack, hasOmnid };

  switch (platformId) {
    case "facebook": return <FacebookSignup {...signupProps} />;
    case "uber": return <UberSignup {...signupProps} />;
    case "doordash": return <DoorDashSignup {...signupProps} />;
    case "airbnb": return <AirbnbSignup {...signupProps} />;
    case "linkedin": return <LinkedInSignup {...signupProps} />;
    case "instacart": return <InstacartSignup {...signupProps} />;
    case "spotify": return <SpotifySignup {...signupProps} />;
    case "coinbase": return <CoinbaseSignup {...signupProps} />;
    default: return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Child Demo                                                         */
/* ------------------------------------------------------------------ */

type ChildDemoState = "select" | "signup" | "age-blocked" | "parent-blocked" | "approval" | "consent" | "done";

function ChildDemo() {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [platformId, setPlatformId] = useState<PlatformId | null>(null);
  const [state, setState] = useState<ChildDemoState>("select");

  const googleUser = getGoogleUser();
  const hasOmnid = !!googleUser;
  const parentData = getParentData();
  const children = parentData.children;

  const selectedChild = children.find((c) => c.id === selectedChildId) ?? null;
  const platform = PLATFORMS.find((p) => p.id === platformId) ?? null;
  const childName = selectedChild?.name ?? "Child";
  const sharedData = platformId ? getSharedData(platformId, childName, `${childName.toLowerCase().replace(" ", ".")}@omnid.io`) : [];

  // Auto-select first child if only one
  if (!selectedChildId && children.length === 1) {
    setSelectedChildId(children[0].id);
  }

  function selectPlatform(id: PlatformId) {
    if (!selectedChild) return;
    setPlatformId(id);
    const status = canChildUsePlatform(selectedChild, id);
    if (status === "blocked") {
      setState("age-blocked");
    } else if (status === "parent_blocked") {
      setState("parent-blocked");
    } else if (status === "needs_approval") {
      setState("approval");
    } else {
      setState("signup");
    }
  }

  function handleOmnidClick() {
    if (!selectedChild || !platformId) return;
    const status = canChildUsePlatform(selectedChild, platformId);
    if (status === "blocked") {
      setState("age-blocked");
    } else if (status === "needs_approval") {
      setState("approval");
    } else {
      setState("consent");
    }
  }

  function handleApproved(contentLevel: ContentLevel, permission: PlatformPermission) {
    if (selectedChild && platformId) {
      updateChildPermission(selectedChild.id, permission);
    }
    setState("signup");
  }

  function handleConsent() {
    setState("done");
    if (platform && selectedChild) {
      const age = getChildAge(selectedChild);
      const rule = getPlatformAgeRule(platform.id);
      const needed = rule && age < rule.minAge;
      pushActivity(
        `${selectedChild.name} (age ${age}) signed up to ${platform.name} via OmnID${needed ? " (parent approved)" : " (child account)"}`,
        platform.icon,
        "bg-omn-primary"
      );
    }
  }

  function handleBack() {
    setPlatformId(null);
    setState("select");
  }

  // No children registered
  if (children.length === 0) {
    return (
      <div className="bg-omn-surface border border-omn-border rounded-xl p-8 text-center max-w-md mx-auto">
        <div className="w-14 h-14 bg-omn-primary/20 rounded-full flex items-center justify-center text-omn-primary text-xl mx-auto mb-3">
          CH
        </div>
        <p className="text-sm text-omn-heading font-medium mb-1">No children registered</p>
        <p className="text-xs text-omn-text mb-4">
          Register a child account first to see the child sign-up experience.
        </p>
        <Link
          to="/children"
          className="inline-block px-5 py-2 bg-omn-primary text-white rounded-lg text-sm font-medium hover:bg-omn-primary-light transition-colors"
        >
          Go to Children's Panel
        </Link>
      </div>
    );
  }

  // Platform selection with child selector
  if (state === "select") {
    return (
      <div>
        {/* Child selector */}
        <div className="bg-omn-surface border border-omn-border rounded-xl p-4 mb-6">
          <p className="text-xs text-omn-text mb-2">Select a child to demo:</p>
          <div className="flex gap-2 flex-wrap">
            {children.map((child) => {
              const age = getChildAge(child);
              return (
                <button
                  key={child.id}
                  onClick={() => setSelectedChildId(child.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                    selectedChildId === child.id
                      ? "bg-omn-primary text-white"
                      : "bg-omn-bg border border-omn-border text-omn-text hover:text-omn-heading"
                  }`}
                >
                  <span className="font-medium">{child.name}</span>
                  <span className={`text-xs ${selectedChildId === child.id ? "text-white/70" : "text-omn-text"}`}>
                    (age {age})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {selectedChild && (
          <>
            <p className="text-sm text-omn-text mb-4">
              Showing platforms for <strong className="text-omn-heading">{selectedChild.name}</strong> (age {getChildAge(selectedChild)}):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {PLATFORMS.map((p) => {
                const status = canChildUsePlatform(selectedChild, p.id);
                const rule = getPlatformAgeRule(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => selectPlatform(p.id)}
                    className={`bg-omn-surface border rounded-xl p-4 text-left transition-all duration-200 group ${
                      status === "blocked" || status === "parent_blocked"
                        ? "border-omn-danger/30 opacity-60"
                        : status === "needs_approval"
                        ? "border-yellow-500/30 hover:border-yellow-500/50"
                        : "border-omn-border hover:border-omn-success/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: p.brandColor }}>
                        {p.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-omn-heading">{p.name}</p>
                        <p className="text-[10px] text-omn-text">{p.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-omn-text">{rule?.label ?? ""}</p>
                      {status === "allowed" && (
                        <span className="text-[10px] px-2 py-0.5 bg-omn-success/20 text-omn-success rounded-full">{"\u2713"} Meets age</span>
                      )}
                      {status === "needs_approval" && (
                        <span className="text-[10px] px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full">Needs approval</span>
                      )}
                      {status === "parent_blocked" && (
                        <span className="text-[10px] px-2 py-0.5 bg-omn-danger/20 text-omn-danger rounded-full">Parent blocked</span>
                      )}
                      {status === "blocked" && (
                        <span className="text-[10px] px-2 py-0.5 bg-omn-danger/20 text-omn-danger rounded-full">Blocked</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  // Age blocked screen
  if (state === "age-blocked" && platform && selectedChild) {
    const rule = getPlatformAgeRule(platform.id);
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="w-full max-w-[420px] text-center">
          <div className="w-16 h-16 bg-omn-danger/20 rounded-full flex items-center justify-center text-omn-danger text-3xl mx-auto mb-4">
            {"\u2717"}
          </div>
          <h2 className="text-xl font-bold text-omn-heading mb-2">Age Requirement Not Met</h2>
          <p className="text-sm text-omn-text mb-4">
            {selectedChild.name} is <strong className="text-omn-heading">{getChildAge(selectedChild)} years old</strong>.{" "}
            {platform.name} requires users to be <strong className="text-omn-heading">{rule?.minAge}+</strong>.
          </p>
          <div className="bg-omn-danger/10 border border-omn-danger/20 rounded-xl p-4 mb-6">
            <p className="text-xs text-omn-text">
              This age restriction cannot be overridden, even with parental approval.
              {platform.id === "uber" && " Uber requires riders to be 18+ for safety and legal reasons."}
              {platform.id === "airbnb" && " Airbnb requires guests to be 18+ to enter binding rental agreements."}
              {platform.id === "coinbase" && " Coinbase requires users to be 18+ for regulatory compliance."}
            </p>
          </div>
          <button
            onClick={handleBack}
            className="px-6 py-2.5 bg-omn-surface border border-omn-border rounded-lg text-sm text-omn-text hover:text-omn-heading transition-colors"
          >
            {"\u2190"} Back to platforms
          </button>
        </div>
      </div>
    );
  }

  // Parent-blocked screen
  if (state === "parent-blocked" && platform && selectedChild) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="w-full max-w-[420px] text-center">
          <div className="w-16 h-16 bg-omn-danger/20 rounded-full flex items-center justify-center text-omn-danger text-3xl mx-auto mb-4">
            {"\u2717"}
          </div>
          <h2 className="text-xl font-bold text-omn-heading mb-2">Blocked by Parent</h2>
          <p className="text-sm text-omn-text mb-4">
            Your parent has blocked access to <strong className="text-omn-heading">{platform.name}</strong>.
          </p>
          <div className="bg-omn-danger/10 border border-omn-danger/20 rounded-xl p-4 mb-6">
            <p className="text-xs text-omn-text">
              A parent or guardian has restricted {selectedChild.name}'s access to {platform.name}. To change this, ask your parent to update permissions in the Children's Panel.
            </p>
          </div>
          <button
            onClick={handleBack}
            className="px-6 py-2.5 bg-omn-surface border border-omn-border rounded-lg text-sm text-omn-text hover:text-omn-heading transition-colors"
          >
            {"\u2190"} Back to platforms
          </button>
        </div>
      </div>
    );
  }

  // Approval flow
  if (state === "approval" && platform && selectedChild) {
    return (
      <ApprovalSimulator
        child={selectedChild}
        platformId={platform.id}
        platformName={platform.name}
        platformColor={platform.brandColor}
        platformIcon={platform.icon}
        onApproved={handleApproved}
        onDenied={handleBack}
        onBack={handleBack}
      />
    );
  }

  // Consent screen (child version — adds child badge)
  if (state === "consent" && platform && selectedChild) {
    const age = getChildAge(selectedChild);
    const rule = getPlatformAgeRule(platform.id);
    const neededApproval = rule && age < rule.minAge;
    const perm = selectedChild.platformPermissions.find((p) => p.platformId === platform.id);

    // Add child-specific info to shared data
    const childData: DataCategory[] = [
      {
        title: "Child Account Info",
        description: neededApproval ? "Registered with parental approval" : "Child account registration",
        items: [
          { label: "Account type", value: "Child (under 18)", verified: true },
          { label: "Age", value: `${age} years old`, verified: true },
          { label: "Parent account", value: googleUser?.name ?? "Parent", verified: true },
          { label: "Content level", value: perm?.contentLevel ?? "restricted", verified: true },
          ...(neededApproval ? [{ label: "Parental approval", value: "Granted", verified: true }] : []),
          ...(platform.id === "spotify" ? [{ label: "Explicit content", value: perm?.spotifyExplicit ? "Allowed by parent" : "Blocked", verified: true }] : []),
        ],
      },
      ...sharedData,
    ];

    return (
      <ConsentScreen
        platformName={platform.name}
        platformColor={platform.brandColor}
        platformIcon={platform.icon}
        data={childData}
        onAllow={handleConsent}
        onDeny={() => setState("signup")}
      />
    );
  }

  // Success screen (child version)
  if (state === "done" && platform && selectedChild) {
    const age = getChildAge(selectedChild);
    const rule = getPlatformAgeRule(platform.id);
    const neededApproval = rule && age < rule.minAge;

    return (
      <SuccessScreen
        platformName={platform.name}
        platformColor={platform.brandColor}
        platformIcon={platform.icon}
        data={sharedData}
        onTryAnother={handleBack}
        childBadge={`Child Account (age ${age})${neededApproval ? " — Parent Approved" : ""}`}
      />
    );
  }

  // Sign-up page (reuses adult sign-up pages)
  if (state === "signup" && platformId) {
    const signupProps: SignupProps = {
      onOmnid: handleOmnidClick,
      onBack: handleBack,
      hasOmnid,
    };

    switch (platformId) {
      case "facebook": return <FacebookSignup {...signupProps} />;
      case "uber": return <UberSignup {...signupProps} />;
      case "doordash": return <DoorDashSignup {...signupProps} />;
      case "airbnb": return <AirbnbSignup {...signupProps} />;
      case "linkedin": return <LinkedInSignup {...signupProps} />;
      case "instacart": return <InstacartSignup {...signupProps} />;
      case "spotify": return <SpotifySignup {...signupProps} />;
      case "coinbase": return <CoinbaseSignup {...signupProps} />;
      default: return null;
    }
  }

  return null;
}
