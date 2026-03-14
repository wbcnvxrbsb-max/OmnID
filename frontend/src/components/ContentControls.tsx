import type { ContentLevel, PlatformPermission } from "../data/parental-controls";

interface ContentControlsProps {
  platformId: string;
  permission: PlatformPermission;
  onChange: (updated: PlatformPermission) => void;
}

export default function ContentControls({ platformId, permission, onChange }: ContentControlsProps) {
  function set(patch: Partial<PlatformPermission>) {
    onChange({ ...permission, ...patch });
  }

  return (
    <div className="space-y-4">
      {/* Content level — all platforms */}
      <div>
        <p className="text-xs font-medium text-omn-heading mb-2">Content Level</p>
        <div className="flex gap-2">
          {(["restricted", "moderate", "open"] as ContentLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => set({ contentLevel: level })}
              className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                permission.contentLevel === level
                  ? level === "restricted"
                    ? "bg-omn-success/20 text-omn-success border border-omn-success/30"
                    : level === "moderate"
                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    : "bg-omn-danger/20 text-omn-danger border border-omn-danger/30"
                  : "bg-omn-bg border border-omn-border text-omn-text hover:border-omn-border-light"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-omn-text mt-1">
          {permission.contentLevel === "restricted"
            ? "Only age-appropriate content visible"
            : permission.contentLevel === "moderate"
            ? "Some mature content allowed with warnings"
            : "Full access to all content (same as adult)"}
        </p>
      </div>

      {/* Spotify-specific */}
      {platformId === "spotify" && (
        <div className="flex items-center justify-between py-2 px-3 bg-omn-bg rounded-lg border border-omn-border">
          <div>
            <p className="text-xs font-medium text-omn-heading">Explicit Content</p>
            <p className="text-[10px] text-omn-text">Allow songs marked as explicit</p>
          </div>
          <button
            onClick={() => set({ spotifyExplicit: !permission.spotifyExplicit })}
            className={`w-10 h-5 rounded-full transition-colors relative ${
              permission.spotifyExplicit ? "bg-omn-success" : "bg-omn-border"
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                permission.spotifyExplicit ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      )}

      {/* Coinbase-specific */}
      {platformId === "coinbase" && (
        <>
          <div className="flex items-center justify-between py-2 px-3 bg-omn-bg rounded-lg border border-omn-border">
            <div>
              <p className="text-xs font-medium text-omn-heading">Crypto Trading</p>
              <p className="text-[10px] text-omn-text">Allow buying and selling crypto</p>
            </div>
            <button
              onClick={() => set({ cryptoEnabled: !permission.cryptoEnabled })}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                permission.cryptoEnabled ? "bg-omn-success" : "bg-omn-border"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                  permission.cryptoEnabled ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between py-2 px-3 bg-omn-bg rounded-lg border border-omn-border">
            <div>
              <p className="text-xs font-medium text-omn-heading">Virtual Card</p>
              <p className="text-[10px] text-omn-text">Allow use of OmnID virtual card</p>
            </div>
            <button
              onClick={() => set({ cardEnabled: !permission.cardEnabled })}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                permission.cardEnabled ? "bg-omn-success" : "bg-omn-border"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                  permission.cardEnabled ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
