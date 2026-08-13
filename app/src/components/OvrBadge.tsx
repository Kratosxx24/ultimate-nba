function ovrColor(ovr: number): string {
  if (ovr >= 95) return 'bg-amber-400 text-amber-950';
  if (ovr >= 88) return 'bg-purple-400 text-purple-950';
  if (ovr >= 80) return 'bg-blue-400 text-blue-950';
  if (ovr >= 70) return 'bg-emerald-400 text-emerald-950';
  return 'bg-gray-400 text-gray-950';
}

export default function OvrBadge({ ovr, size = 'md' }: { ovr: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses =
    size === 'lg' ? 'w-14 h-14 text-xl' : size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  return (
    <div
      className={`${sizeClasses} ${ovrColor(ovr)} rounded-lg flex items-center justify-center font-bold shrink-0`}
    >
      {ovr}
    </div>
  );
}
