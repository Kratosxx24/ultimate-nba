export default function EmptySlot({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 text-left border border-dashed border-surface-4 bg-surface-1 hover:border-amber-500 hover:bg-surface-2 transition-colors"
    >
      <div
        className="flex-none flex items-center justify-center w-10 h-10 text-muted"
        style={{ background: 'var(--color-surface-3)', clipPath: 'polygon(0 0,100% 0,100% 74%,78% 100%,0 100%)' }}
      >
        <span
          style={{ fontFamily: 'Archivo, sans-serif', fontVariationSettings: "'wdth' 70,'wght' 800", fontSize: 18 }}
        >
          +
        </span>
      </div>
      <div className="text-sm font-mono uppercase tracking-[.12em] text-text-low">{label}</div>
    </button>
  );
}
