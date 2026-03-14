export default function ScoreGauge({
  score,
  size = "lg",
}: {
  score: number;
  size?: "sm" | "lg";
}) {
  const isSmall = size === "sm";
  const r = isSmall ? 45 : 70;
  const dim = isSmall ? 100 : 160;
  const sw = isSmall ? 8 : 12;
  const wrapClass = isSmall ? "w-28 h-28" : "w-48 h-48";
  const scoreClass = isSmall ? "text-xl" : "text-4xl";
  const labelClass = isSmall ? "text-[10px]" : "text-sm";
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={`relative ${wrapClass} mx-auto`}>
      <svg
        className={`${wrapClass} -rotate-90`}
        viewBox={`0 0 ${dim} ${dim}`}
      >
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={r}
          fill="none"
          stroke="#2a2d3a"
          strokeWidth={sw}
        />
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={r}
          fill="none"
          stroke="#06b6d4"
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`${scoreClass} font-bold text-omn-heading`}>
          {score.toFixed(1)}
        </span>
        <span className={`${labelClass} text-omn-text`}>/ 100</span>
      </div>
    </div>
  );
}
