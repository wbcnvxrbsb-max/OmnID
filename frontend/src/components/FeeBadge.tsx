export default function FeeBadge({
  amount,
  label,
  payer,
}: {
  amount: string;
  label: string;
  payer: string;
}) {
  return (
    <div className="bg-omn-accent/10 border border-omn-accent/30 rounded-lg px-3 py-2 inline-flex items-center gap-2">
      <span className="text-sm font-bold text-omn-accent">{amount}</span>
      <span className="text-xs text-omn-text">
        {label} &middot; paid by {payer}
      </span>
    </div>
  );
}
