export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg' | 'hero';

interface Tier {
  name: string;
  numeral: string;
  edge: string; // background of the padded outer shape (solid or gradient)
  edgeWidth: number;
  inner: string; // background of the inner shape
  glow: string | null; // drop-shadow filter value
  flat: boolean; // true = no edge padding, single flat fill
}

function getTier(ovr: number): Tier {
  if (ovr >= 95) {
    return {
      name: 'Immortal',
      numeral: '#FFE9C2',
      edge: 'linear-gradient(150deg,#FFF3DC,#FFD48F 55%,#C98A2E)',
      edgeWidth: 2.5,
      inner: 'linear-gradient(160deg,#2E2318,#16110D)',
      glow: 'rgba(255,222,168,.42)',
      flat: false,
    };
  }
  if (ovr >= 90) {
    return {
      name: 'Legend',
      numeral: '#FFC559',
      edge: '#FFC559',
      edgeWidth: 2,
      inner: '#1A1410',
      glow: 'rgba(255,197,89,.22)',
      flat: false,
    };
  }
  if (ovr >= 85) {
    return {
      name: 'Superstar',
      numeral: '#F0873A',
      edge: '#F0873A',
      edgeWidth: 2,
      inner: '#191311',
      glow: null,
      flat: false,
    };
  }
  if (ovr >= 80) {
    return {
      name: 'All-Star',
      numeral: '#9CC0F0',
      edge: '#5A82CE',
      edgeWidth: 1.5,
      inner: '#12161C',
      glow: null,
      flat: false,
    };
  }
  if (ovr >= 75) {
    return {
      name: 'Starter',
      numeral: '#7FA3DE',
      edge: '#5A82CE',
      edgeWidth: 1,
      inner: '#111419',
      glow: null,
      flat: false,
    };
  }
  if (ovr >= 70) {
    return {
      name: 'Rotation',
      numeral: '#B8B1A9',
      edge: '#3A3531',
      edgeWidth: 1,
      inner: '#151312',
      glow: null,
      flat: false,
    };
  }
  if (ovr >= 60) {
    return {
      name: 'Bench',
      numeral: '#8A837B',
      edge: '#181514',
      edgeWidth: 0,
      inner: '#181514',
      glow: null,
      flat: true,
    };
  }
  return {
    name: 'Deep Bench',
    numeral: '#6B655F',
    edge: '#141212',
    edgeWidth: 0,
    inner: '#141212',
    glow: null,
    flat: true,
  };
}

const SIZE_CONFIG: Record<
  BadgeSize,
  { box: number; numeral: number; clip: string; rule: boolean; label: boolean }
> = {
  xs: { box: 20, numeral: 12, clip: 'polygon(0 0,100% 0,100% 72%,76% 100%,0 100%)', rule: false, label: false },
  sm: { box: 28, numeral: 17, clip: 'polygon(0 0,100% 0,100% 73%,77% 100%,0 100%)', rule: false, label: false },
  md: { box: 44, numeral: 26, clip: 'polygon(0 0,100% 0,100% 74%,78% 100%,0 100%)', rule: false, label: false },
  lg: { box: 72, numeral: 42, clip: 'polygon(0 0,100% 0,100% 74%,78% 100%,0 100%)', rule: true, label: false },
  hero: { box: 132, numeral: 90, clip: 'polygon(0 0,100% 0,100% 74%,78% 100%,0 100%)', rule: false, label: true },
};

export default function OvrBadge({
  ovr,
  size = 'md',
}: {
  ovr: number;
  size?: BadgeSize;
}) {
  const tier = getTier(ovr);
  const cfg = SIZE_CONFIG[size];
  // Mockup: xs/sm never glow (edge thickens instead below 24px). md=5px, lg=8px, hero=20/26px per tier.
  const glowPx = size === 'hero' ? (ovr >= 95 ? 20 : 26) : size === 'lg' ? 8 : size === 'md' ? 5 : 0;
  const showGlow = tier.glow && (size === 'md' || size === 'lg' || size === 'hero');

  // Root wrapper carries no filter of its own, so the text subtree is never forced
  // through a blurred/rasterized compositing layer. The glow is painted by a separate
  // absolutely-positioned layer sitting BEHIND the real content, filtered on its own —
  // the numeral's ancestor chain (outer -> inner -> span) stays filter/transform-free.
  const root: React.CSSProperties = {
    position: 'relative',
    width: cfg.box,
    height: cfg.box,
    flexShrink: 0,
  };

  const glowLayer: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: tier.edge,
    clipPath: cfg.clip,
    filter: showGlow ? `drop-shadow(0 0 ${glowPx}px ${tier.glow})` : undefined,
  };

  const outer: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    padding: tier.flat ? 0 : tier.edgeWidth,
    background: tier.edge,
    clipPath: cfg.clip,
  };

  const inner: React.CSSProperties = {
    width: '100%',
    height: '100%',
    background: tier.inner,
    clipPath: cfg.clip,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: cfg.label ? 6 : 3,
  };

  const numeralStyle: React.CSSProperties = {
    fontFamily: 'Archivo, sans-serif',
    fontVariationSettings: "'wdth' 62,'wght' 900",
    letterSpacing: '-0.02em',
    fontSize: cfg.numeral,
    lineHeight: 0.9,
    color: tier.numeral,
    fontFeatureSettings: "'tnum' 1",
    textRendering: 'optimizeLegibility',
    WebkitFontSmoothing: 'antialiased',
  };

  return (
    <div style={root} title={`${tier.name} · ${ovr} OVR`}>
      {showGlow && <div style={glowLayer} aria-hidden="true" />}
      <div style={outer}>
        <div style={inner}>
          <span style={numeralStyle}>{ovr}</span>
          {cfg.rule && <span style={{ width: cfg.numeral * 0.5, height: 3, background: tier.numeral }} />}
          {cfg.label && (
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                letterSpacing: '.22em',
                color: tier.numeral,
                textTransform: 'uppercase',
              }}
            >
              {tier.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export { getTier };
