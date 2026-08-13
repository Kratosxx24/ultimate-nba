# ULTIMATE NBA — Visual Design Brief

*(Paste into Claude Design. This is a **visual** brief — I want a look, a system, and
screens. Don't design mechanics, logic, or data models. Design how it looks.)*

---

## THE THING

Ultimate NBA is a public basketball site where every great season in league history —
1962 to today — gets a rating out of 100, and you can browse them, compare them, and build
fantasy lineups out of them. Roughly a thousand of these cards, spanning sixty years.

The unit on screen is always **a season, not a career**: "1996 Michael Jordan · CHI," not
"Michael Jordan." Every card, row, and headline carries a year and a team. That's the one
content rule that shapes the layout everywhere.

Two halves to the site, and they need to feel like one product:

- **A reference half** — long lists, big tables, player pages, historical browsing. Sober,
  dense, readable, trustworthy.
- **A game half** — building five-man lineups, random roster spins, head-to-head lineup
  battles. Loud, animated, fun.

The connective tissue is the **rating badge** and the **player card**. They appear in both
halves, on every single screen. If those two things are beautiful, the product is beautiful.

---

## THE LOOK I WANT

**"Broadcast graphics for a league that spans sixty years."**

Dark, high-contrast, confident. Arena light and hardwood warmth against deep neutral
darks. It should feel like a national-TV broadcast package and a serious statistical
magazine had a kid — data-dense but breathable, editorial rather than app-like.

**Reference points that are right:** modern NBA broadcast lower-thirds and stat overlays,
FiveThirtyEight's chart discipline, a well-set sports magazine spread, Linear's restraint
in dark mode, the moment a stat graphic slides in during a game.

**Reference points that are wrong, please avoid:**
- Neon cyberpunk gamer UI — no glow-everything, no purple-on-black esports look
- Flat corporate SaaS — no generic blue, no rounded-everything dashboard blandness
- Skeuomorphic trading cards — no foil textures, no holographic sheen, no torn-paper edges
- Casino/slot-machine aesthetics — the spin mechanic must never look like a loot box
- Bootstrap-y gray tables

**Restraint with earned spectacle.** 95% of the interface is quiet, well-set, and lets the
numbers breathe. Then a few specific moments — pulling an all-time great, a lineup coming
together, a battle result — go big. The contrast is the whole point. If everything glows,
nothing does.

---

## COLOR

Give me a full token system with real ramps, not a handful of hexes.

**Base.** A deep, *slightly warm* near-black, plus a ladder of 4–5 elevated surfaces above
it. The warmth matters — pure blue-black reads cold and clinical, and this is a warm,
wooden, human game. Surfaces should separate by luminance alone so cards read as cards
without a border on everything.

**Primary accent.** A hardwood-derived amber/orange. Arena light, not safety cone. Used for
actions, active states, and brand moments.

**Secondary accent.** A cool counterpoint — deep court blue or violet — for the analytical
surfaces: charts, tables, reference pages. So the *game* screens read warm and the
*reference* screens read cool, while sharing one palette. Subtle, systematic, not two
themes.

**Semantic.** Positive and negative are everywhere in this product (a stat better than the
other guy's, a rating up from last season, a lineup bonus vs a penalty). Treat up/down as
first-class tokens with text, background, and border variants each — not just red and green
text.

**Rating tiers — the most important color decision in the brief.** Ratings bucket into
eight named tiers, and this coloring repeats on every card in the entire product:

| Range | Tier | Feel |
|---|---|---|
| 95+ | Immortal | rare, unmistakable, the one that gets a real treatment |
| 90–94 | Legend | |
| 85–89 | Superstar | |
| 80–84 | All-Star | |
| 75–79 | Starter | |
| 70–74 | Rotation | |
| 60–69 | Bench | |
| <60 | Deep Bench | quiet, never humiliating |

Each tier needs a color, a border/gradient/glow treatment, and a defined intensity. They
must be tellable apart **at 16px, at a glance, and by colorblind users** — so encode tier
in luminance and treatment too, not hue alone. The step from Superstar to Legend to
Immortal should feel like a real escalation.

**Team and era color.** Each team has a franchise color and each decade could carry a
subtle period tint — as a hairline accent, a chart series, a page-header wash. Seasoning
only. Never let it override the system palette, and never make the 1960s look like a
novelty or the 2020s look like the default.

**Both themes.** Dark is the default and the hero, but light is fully supported and
designed, not derived — the reference pages get read in daylight. AA contrast minimum, AAA
for body copy.

---

## TYPOGRAPHY

Three roles, and be opinionated about the split:

1. **Display / editorial** — tight, confident, real personality. Page titles, player names
   on big cards, huge numbers. Condensed or semi-condensed works well: it reads as *sports*,
   and long names fit.
2. **UI / body** — a clean neutral sans that performs at small sizes. Everything functional.
3. **Numeric** — this product is made of numbers. **Tabular lining figures are mandatory**
   so digits align in columns and don't jitter when a number animates. A mono for raw values
   is welcome.

Give me a named type scale with per-step line heights (tight up top, generous in body), and
a **dedicated treatment for the rating numeral itself** — it's the hero number and the
closest thing this product has to a logo. It should be instantly recognizable out of
context.

---

## SPACE, SHAPE, MOTION

- **Spacing:** 4px base scale. Dense regions may compress, but as a defined "dense" mode,
  not ad hoc.
- **Radius:** a small set of steps, one family across cards and badges — except the rating
  badge, which is allowed a distinct silhouette of its own.
- **Elevation:** in dark mode, elevate with luminance, not heavy shadow. Save real shadow
  for genuinely floating things — modals, drag ghosts, tooltips.
- **Motion:** 150–250ms ease-out for ordinary UI. Slow and theatrical *only* at the reveal
  moments. Numbers count up rather than snap. Any list that re-orders animates the re-order,
  because watching a name climb is half the fun. Full `prefers-reduced-motion` alternatives
  for every one of these — reveals become crossfades, counts become instant.

---

## COMPONENTS TO DESIGN

**The two that matter most — spend disproportionate time here:**

1. **Rating badge.** Sizes from tiny (inline in a table row) to hero (fills a card). Tier-
   colored. Optional small delta indicator. Legible at every size, unmistakable at all of
   them.
2. **Player card, in three densities:**
   - *Row* — for lists and tables: year, name, position, team, a few stats, rating.
   - *Card* — for grids and lineups: portrait-ish, year prominent, a tag, a few stats,
     rating badge, and a cost number.
   - *Hero* — for detail pages, reveals, and share images: full spectacle, tier treatment,
     team/era color, full stat line.
   **Assume most players have no photograph.** Design a monogram/initial fallback system
   that looks intentional and good — it will be the majority case, so it can't look broken.

**Everything else:**

3. Team-season chip — `'96 CHI · 72-10 · Champion` as a compact inline element
4. Position pill and role tag
5. Stat block — label, value, and an optional context bar underneath
6. Comparison table — two things side by side, per-row winner highlighting, deltas
7. Breakdown panel — a waterfall-style visual showing what added up to a rating
8. Percentile bar with markers
9. Playoff-path ladder — a team's postseason run as connected steps: round, opponent,
   result. Should look impressive when the run was brutal and visibly easy when it wasn't.
10. Career arc chart — a line of ratings across seasons with the peak marked
11. Leaderboard table — sortable, sticky header, thousands of rows, rank-change indicators
12. Sparklines and mini-charts for inline table use
13. Lineup builder — five slots, in states: empty, filled, locked, spinning, invalid
14. Empty slot — inviting and designed, not a dashed gray rectangle
15. Player picker — search + filters + a fast grid; a modal on desktop, a bottom sheet on
    mobile
16. Bonus/penalty badge — a named effect with a number and a one-line reason; positives
    glow, negatives read as a note, never as a failure
17. Budget meter — used vs remaining, with a clear over-budget state
18. Reveal component — the spin and its slowdown, where an Immortal pull feels genuinely
    different from a Bench pull
19. Battle result — a scoreline, the beats that got there, the key matchups
20. Weight sliders with live readout and preset chips
21. Filter bar with visible active-filter chips
22. Global search with grouped typeahead
23. **Share card generator — at least three variants at social aspect ratios.** People post
    these; it's a first-class design surface, not an export dialog.
24. System parts: nav (desktop rail or top bar, mobile bottom nav), tabs, tooltip, popover,
    modal, sheet, toast, skeletons that match final layout, empty states with a real
    illustration idea, error states.

Every component with all its states: default, hover, focus, active, disabled, loading,
empty, error, selected, locked.

---

## SCREENS

At **390 / 768 / 1440**. Mobile isn't a shrink — the game screens are thumb-driven and the
builder, picker, and reveal all want to be sheet-native.

1. **Home** — editorial landing that sells both halves. Featured season, entry points,
   a leaderboard slice. Should look like a publication's front page, not an app menu.
2. **Season detail** — the flagship. Hero card, full stat line, breakdown panel, playoff
   ladder, teammates, that player's other seasons.
3. **Career page** — the ratings arc across seasons, peak marked, every season as a card.
4. **Team page** — full roster with ratings, record, playoff path.
5. **Browse all** — the big filterable index, grid/table toggle, thousands of rows.
6. **Leaderboard** — category switcher, share card.
7. **Slider tool** — weights on one side, a live re-ranking list on the other; on mobile,
   sliders in a sheet over the live list.
8. **Lineup builder** — five slots, live summary panel, picker.
9. **Roulette** — the spin, the reveal, the final roster.
10. **Compare** — the sober analytical side-by-side.
11. **Battle** — pre-match screen, resolution, result.
12. **Era page** — do the 1990s as the exemplar.
13. **Long-form explainer** — a well-set editorial page with inline diagrams, to prove the
    type system works at essay length.
14. Search results, empty state, 404.

---

## HARD RULES

1. Year and team appear anywhere a name appears. No exceptions — it's the content rule that
   drives most of the layout decisions.
2. Density with air. Tables can be dense; the page around them must breathe. Never a
   wall-to-wall grid of numbers with no hierarchy.
3. No gambling aesthetics, no fake scarcity, no ad-shaped layouts. Free, public, open.
4. Accessible: AA minimum, visible focus rings that survive the dark theme, colorblind-safe
   tiers, full reduced-motion support, keyboard paths for drag interactions.
5. Design the loading and empty states, not just the full ones. Thousands of rows means
   skeletons that match the final layout and zero layout shift.
6. One product. Reference and game share the badge, the card, and the palette.

---

## DELIVER

1. **Design tokens** — color ramps for both themes, the eight-tier rating scale, type scale,
   spacing, radius, elevation, motion durations and easings. Named, ready to become CSS
   custom properties or a Tailwind theme.
2. **Type system** — specific typeface picks for all three roles with fallback stacks and a
   line of reasoning each.
3. **The component library** — everything above, all states, all sizes.
4. **The screens** at all three breakpoints.
5. **A chart style guide** — series colors that hold in both themes, axis and grid
   treatment, annotation and tooltip style, plus the custom types: rating waterfall, playoff
   ladder, career arc, percentile bar.
6. **Motion spec** — what moves, how long, what easing, and the reduced-motion equivalent,
   with the reveal moments detailed.
7. **Share-card system** — three compositions.
8. **A short voice guide** — headline style, stat-callout style, and a list of words the
   product does and doesn't use.
9. **Icon and illustration direction**, including that monogram fallback.

---

## CONTENT FOR THE MOCKUPS

**No lorem ipsum. No "Player Name." No placeholder numbers.** Use real basketball — it's
the only way the density and the name-length problems show up honestly. Some seasons to
populate with, spread across eras and rating tiers:

'96 Jordan · CHI — '87 Magic · LAL — '16 LeBron · CLE — '72 Kareem · MIL — '01 Shaq · LAL
'64 Wilt · SF — '86 Bird · BOS — '17 Durant · GSW — '25 SGA · OKC — '96 Rodman · CHI
'77 Walton · POR — '04 Garnett · MIN — '15 Curry · GSW — '89 Stockton · UTA
'93 Ewing · NYK — '19 Giannis · MIL — '82 Moses Malone · HOU — '22 Jokić · DEN

Include a few deliberately awkward ones so the layout gets stress-tested: a very long name,
a two-line team, a player with no photo, a rating in the 40s, and a season where one stat is
enormous and the rest are ordinary.

---

Be opinionated. Make real decisions and give me a sentence of reasoning for each. If
something here would look worse than the alternative, say so and design the better version.
