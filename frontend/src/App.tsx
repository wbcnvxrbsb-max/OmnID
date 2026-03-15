import { useState, useEffect, useCallback } from "react";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Registration from "./pages/Registration";
import LinkedAccounts from "./pages/LinkedAccounts";
import Reputation from "./pages/Reputation";
import Payments from "./pages/Payments";
import Course from "./pages/Course";
import Lesson from "./pages/Lesson";
import Pro from "./pages/Pro";
import Trading from "./pages/Trading";
import Faucet from "./pages/Faucet";
import PartnerDemo from "./pages/PartnerDemo";
import Partners from "./pages/Partners";
import PartnerDocs from "./pages/PartnerDocs";
import Children from "./pages/Children";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import { hasWallet, getAddress, initSecureWallet } from "./wallet";
import { reverseENS } from "./api/ens";
import { getGoogleUser, clearGoogleUser } from "./google-auth";
import { hasPasskey, authenticateWithPasskey } from "./api/passkeys";
import { useSessionTimeout } from "./hooks/useSessionTimeout";
import CookieConsent from "./components/CookieConsent";

function UserButton() {
  const [user, setUser] = useState(getGoogleUser());

  useEffect(() => {
    const check = () => setUser(getGoogleUser());
    window.addEventListener("storage", check);
    const interval = setInterval(check, 1000);
    return () => {
      window.removeEventListener("storage", check);
      clearInterval(interval);
    };
  }, []);

  if (user) {
    return (
      <div className="flex items-center gap-2">
        {user.picture && (
          <img src={user.picture} alt="" className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
        )}
        <span className="text-xs text-omn-text hidden lg:inline">{user.name?.split(" ")[0]}</span>
        <button
          onClick={() => {
            // Clear all OmnID data from this device
            const keysToRemove = Object.keys(localStorage).filter((k) => k.startsWith("omnid-"));
            keysToRemove.forEach((k) => localStorage.removeItem(k));
            clearGoogleUser();
            setUser(null);
            window.location.href = "/register";
          }}
          className="text-xs text-omn-text hover:text-omn-danger transition-colors ml-1"
          title="Sign out"
        >
          Sign Out
        </button>
      </div>
    );
  }

  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={async () => {
          setSigningIn(true);
          setError("");
          try {
            await authenticateWithPasskey();
            window.location.reload();
          } catch {
            setError("No passkey found");
            setSigningIn(false);
          }
        }}
        disabled={signingIn}
        className="px-3 py-1.5 text-xs font-medium text-omn-primary hover:text-omn-primary-light transition-colors disabled:opacity-50"
      >
        {signingIn ? "Verifying..." : "Sign In"}
      </button>
      {error && (
        <a href="/register" className="text-[10px] text-omn-accent hover:text-omn-primary-light transition-colors">
          Create Account
        </a>
      )}
    </div>
  );
}

function WalletButton() {
  const navigate = useNavigate();
  const [address, setAddress] = useState<string | null>(null);
  const [ensName, setEnsName] = useState<string | null>(null);

  useEffect(() => {
    if (hasWallet()) {
      setAddress(getAddress());
    }
    const handleStorage = () => {
      setAddress(hasWallet() ? getAddress() : null);
    };
    window.addEventListener("storage", handleStorage);
    const interval = setInterval(() => {
      const current = hasWallet() ? getAddress() : null;
      if (current !== address) setAddress(current);
    }, 1000);
    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  });

  useEffect(() => {
    if (!address) {
      setEnsName(null);
      return;
    }
    let cancelled = false;
    reverseENS(address).then((name) => {
      if (!cancelled) setEnsName(name);
    });
    return () => {
      cancelled = true;
    };
  }, [address]);

  if (address) {
    return (
      <NavLink
        to="/trading"
        className="flex items-center gap-2 px-3 py-1.5 bg-omn-surface border border-omn-border rounded-lg hover:border-omn-primary/50 transition-all duration-200"
      >
        <span className="w-2 h-2 bg-omn-success rounded-full animate-pulse" />
        <span className="text-sm font-mono text-omn-accent">
          {ensName ?? `${address.slice(0, 6)}...${address.slice(-4)}`}
        </span>
      </NavLink>
    );
  }

  return (
    <button
      onClick={() => {
        navigate("/trading");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className="px-3 py-1.5 bg-gradient-to-r from-omn-primary to-omn-accent text-white rounded-lg text-xs font-medium transition-all duration-200 hover:shadow-lg hover:shadow-omn-primary/20"
    >
      Create Wallet
    </button>
  );
}

function useNavItems() {
  const items = [
    { to: "/", label: "Dashboard" },
    { to: "/accounts", label: "Accounts" },
    { to: "/reputation", label: "Reputation" },
    { to: "/payments", label: "Payments" },
    { to: "/trading", label: "Trading" },
    { to: "/faucet", label: "Faucet" },
    { to: "/course", label: "Academy" },
    { to: "/pro", label: "Pro" },
    { to: "/children", label: "Children" },
    { to: "/partners", label: "Partners" },
    { to: "/demo", label: "Demo" },
  ];
  return items;
}

function NavBar() {
  const navItems = useNavItems();
  return (
    <div className="hidden md:flex items-center gap-0.5">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          className={({ isActive }) =>
            `relative px-3 py-1.5 rounded-md text-[13px] font-medium transition-all duration-200 ${
              isActive
                ? "bg-omn-primary/15 text-omn-primary-light"
                : "text-omn-text hover:text-omn-heading hover:bg-white/[0.04]"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {item.label}
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-omn-primary-light" />
              )}
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}

function PasskeyLock({ onUnlock }: { onUnlock: () => void }) {
  const [authenticating, setAuthenticating] = useState(false);
  const [error, setError] = useState("");

  async function handleAuthenticate() {
    setAuthenticating(true);
    setError("");
    try {
      await authenticateWithPasskey();
      onUnlock();
    } catch (e: any) {
      setError(e?.message ?? "Authentication failed. Please try again.");
    } finally {
      setAuthenticating(false);
    }
  }

  // Auto-trigger on mount
  useEffect(() => {
    handleAuthenticate();
  }, []);

  const user = getGoogleUser();

  return (
    <div className="min-h-screen bg-omn-bg flex items-center justify-center">
      <div className="w-full max-w-sm text-center p-8">
        <div className="w-20 h-20 bg-gradient-to-br from-omn-primary to-omn-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl font-bold text-white">O</span>
        </div>
        <h1 className="text-2xl font-bold text-omn-heading mb-1">
          Omn<span className="bg-gradient-to-r from-omn-primary to-omn-accent bg-clip-text text-transparent">ID</span>
        </h1>
        {user && (
          <p className="text-sm text-omn-text mb-6">Welcome back, {user.name?.split(" ")[0]}</p>
        )}
        {!user && (
          <p className="text-sm text-omn-text mb-6">Verify your identity to continue</p>
        )}

        {authenticating ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-omn-primary/15 rounded-full flex items-center justify-center animate-pulse">
              <svg className="w-6 h-6 text-omn-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 10a2 2 0 1 0 0 4" />
                <path d="M8.5 8.5a5.5 5.5 0 0 1 9.1 2.3" />
                <path d="M12 14a5.5 5.5 0 0 1-3.5-5.5" />
                <path d="M6 6a9 9 0 0 1 14.3 5" />
              </svg>
            </div>
            <p className="text-sm text-omn-primary">Waiting for passkey...</p>
          </div>
        ) : (
          <button
            onClick={handleAuthenticate}
            className="w-full py-3 bg-gradient-to-r from-omn-primary to-omn-accent text-white rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-omn-primary/20"
          >
            Unlock with Passkey
          </button>
        )}

        {error && (
          <p className="text-xs text-omn-danger mt-4">{error}</p>
        )}
      </div>
    </div>
  );
}

function App() {
  const [unlocked, setUnlocked] = useState(() => !hasPasskey());

  // Migrate plaintext wallet mnemonic to encrypted storage on app load
  useEffect(() => {
    if (unlocked) {
      void initSecureWallet();
    }
  }, [unlocked]);

  // Auto-lock after 15 minutes of inactivity (only fires when unlocked)
  const handleSessionTimeout = useCallback(() => {
    if (unlocked) {
      setUnlocked(false);
    }
  }, [unlocked]);
  useSessionTimeout(handleSessionTimeout);

  if (!unlocked) {
    return <PasskeyLock onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <div className="min-h-screen bg-omn-bg">
      <nav className="bg-omn-bg/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
          <NavLink to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-gradient-to-br from-omn-primary to-omn-accent rounded-lg flex items-center justify-center transition-shadow duration-300 group-hover:shadow-[0_0_14px_rgba(59,130,246,0.45)]">
              <span className="text-xs font-bold text-white">O</span>
            </div>
            <span className="text-lg font-bold text-omn-heading group-hover:text-white transition-colors">
              Omn<span className="bg-gradient-to-r from-omn-primary to-omn-accent bg-clip-text text-transparent">ID</span>
            </span>
          </NavLink>
          <NavBar />
          <div className="flex items-center gap-3">
            <WalletButton />
            <div className="w-px h-5 bg-omn-border" />
            <UserButton />
          </div>
        </div>
        {/* Gradient bottom border */}
        <div className="h-px bg-gradient-to-r from-omn-primary/20 via-transparent to-omn-accent/20" />
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/accounts" element={<LinkedAccounts />} />
          <Route path="/reputation" element={<Reputation />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/trading" element={<Trading />} />
          <Route path="/faucet" element={<Faucet />} />
          <Route path="/course" element={<Course />} />
          <Route path="/course/:lessonId" element={<Lesson />} />
          <Route path="/pro" element={<Pro />} />
          <Route path="/children" element={<Children />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/partners/docs" element={<PartnerDocs />} />
          <Route path="/demo" element={<PartnerDemo />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>
      </main>

      <footer className="mt-12">
        {/* Gradient top border */}
        <div className="h-px bg-gradient-to-r from-omn-primary/20 via-transparent to-omn-accent/20" />
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-center gap-4 text-xs text-omn-text">
          <NavLink to="/privacy" className="hover:text-omn-primary transition-colors">Privacy Policy</NavLink>
          <span className="text-omn-border">|</span>
          <NavLink to="/terms" className="hover:text-omn-primary transition-colors">Terms of Service</NavLink>
          <span className="text-omn-border">|</span>
          <NavLink to="/privacy#ccpa" className="hover:text-omn-primary transition-colors">Do Not Sell My Info</NavLink>
        </div>
      </footer>

      <CookieConsent />
    </div>
  );
}

export default App;
