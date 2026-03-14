import type { PlatformProfile } from "../data/sandbox-platforms";

export default function PlatformCard({
  profile,
  onClick,
  showArrow,
}: {
  profile: PlatformProfile;
  onClick?: () => void;
  showArrow?: boolean;
}) {
  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 bg-omn-bg rounded-lg border border-omn-border text-left ${
        onClick
          ? "hover:border-omn-primary transition-colors cursor-pointer"
          : ""
      }`}
    >
      <div
        className={`w-10 h-10 ${profile.color} rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0`}
      >
        {profile.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-omn-heading">
            {profile.platformName}
          </span>
          <span className="text-xs text-omn-text">{profile.category}</span>
        </div>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          {profile.metrics.slice(0, 3).map((m) => (
            <span key={m.label} className="text-xs text-omn-text">
              <span className="text-omn-accent">{m.value}</span>{" "}
              <span className="text-omn-text/60">{m.label}</span>
            </span>
          ))}
        </div>
      </div>
      {showArrow && (
        <span className="text-omn-primary text-sm">{"\u2192"}</span>
      )}
    </Tag>
  );
}
