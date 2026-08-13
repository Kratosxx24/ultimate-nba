function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-hairline pt-5">
      <h2
        className="text-text-hi mb-2"
        style={{ fontFamily: 'Archivo, sans-serif', fontVariationSettings: "'wdth' 78,'wght' 700", fontSize: 18 }}
      >
        {title}
      </h2>
      <div className="text-sm text-text-mid space-y-2 max-w-[68ch]">{children}</div>
    </div>
  );
}

export default function HowToUsePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-text-hi"
          style={{ fontFamily: 'Archivo, sans-serif', fontVariationSettings: "'wdth' 78,'wght' 800", fontSize: 30 }}
        >
          How to Use This Site
        </h1>
        <p className="text-sm text-text-mid mt-1">A quick reference for each page and how ratings work.</p>
      </div>

      <Section title="Seasons / Players">
        <p>
          Every player-season in the database, sortable by any stat column. Search by player name or
          team/year. Click a row to open that season's detail page with its career arc.
        </p>
      </Section>

      <Section title="Dynasty Roulette">
        <p>
          Spin to fill all five slots with a random player-season pulled from any era. Not happy with
          one slot? Reroll it on its own instead of respinning the whole lineup.
        </p>
      </Section>

      <Section title="Compare Lineups">
        <p>
          Build two 5-man lineups — pick players manually from the picker, or hit Random Fill on
          either side to auto-populate it. Compare summaries sit below each lineup, with the overall
          edge called out underneath.
        </p>
      </Section>

      <Section title="Ratings & Tiers">
        <p>
          OVR is computed by the app's rating formula from real box-score and playoff data, with
          opponent-strength scaling. Badge color denotes tier — from Deep Bench up through Immortal —
          the higher the tier, the rarer the badge treatment.
        </p>
      </Section>
    </div>
  );
}
