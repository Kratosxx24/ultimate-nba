export default function EmptySlot({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-dashed border-white/15 p-3 flex items-center gap-3 w-full text-left hover:border-purple-400/40 hover:bg-white/5 transition-colors"
    >
      <div className="w-10 h-10 rounded-lg border border-dashed border-white/15 flex items-center justify-center text-gray-500 shrink-0">
        +
      </div>
      <div className="text-sm text-gray-500">{label}</div>
    </button>
  );
}
