// GENERATED — do not hand-edit. Source: the prior NBA Lineup Builder's
// scouting-knowledge.js / players-meta.js / players-voice.js, extracted
// programmatically so nothing is mis-transcribed. Regenerate with
// scratchpad/gen_data.js if those upstream tables ever change.
//
// This is the data half of the 8-function player model that DR reads:
//   rimProtect · perimeterD · rebound · shotCreate · spacing · playmake · finish · ballDominance

export type FnKey =
  | 'rimProtect' | 'perimeterD' | 'rebound' | 'shotCreate'
  | 'spacing' | 'playmake' | 'finish' | 'ballDominance';

export type FnProfile = Record<FnKey, number>;
export type UsageZone = 'onball' | 'wing' | 'post' | 'offball';

export const TEAM_FUNCTIONS: FnKey[] = [
  "rimProtect",
  "perimeterD",
  "rebound",
  "shotCreate",
  "spacing",
  "playmake",
  "finish",
  "ballDominance"
] as FnKey[];

/** Archetype -> baseline 0-10 profile. Per-player stats then nudge these. */
export const ARCHETYPE_FUNCTIONS: Record<string, FnProfile> = {
  "Generational Playmaker": {
    "rimProtect": 1,
    "perimeterD": 5,
    "rebound": 4,
    "shotCreate": 9,
    "spacing": 6,
    "playmake": 10,
    "finish": 7,
    "ballDominance": 9
  },
  "Heliocentric Playmaker": {
    "rimProtect": 1,
    "perimeterD": 3,
    "rebound": 4,
    "shotCreate": 9,
    "spacing": 5,
    "playmake": 9,
    "finish": 6,
    "ballDominance": 10
  },
  "Elite Playmaker": {
    "rimProtect": 0,
    "perimeterD": 5,
    "rebound": 2,
    "shotCreate": 7,
    "spacing": 6,
    "playmake": 9,
    "finish": 5,
    "ballDominance": 8
  },
  "Floor General": {
    "rimProtect": 0,
    "perimeterD": 6,
    "rebound": 2,
    "shotCreate": 5,
    "spacing": 5,
    "playmake": 8,
    "finish": 4,
    "ballDominance": 6
  },
  "Secondary Playmaker": {
    "rimProtect": 0,
    "perimeterD": 4,
    "rebound": 2,
    "shotCreate": 5,
    "spacing": 6,
    "playmake": 6,
    "finish": 4,
    "ballDominance": 4
  },
  "Playmaker": {
    "rimProtect": 0,
    "perimeterD": 4,
    "rebound": 2,
    "shotCreate": 5,
    "spacing": 5,
    "playmake": 7,
    "finish": 4,
    "ballDominance": 5
  },
  "Elite Shot Creator": {
    "rimProtect": 1,
    "perimeterD": 4,
    "rebound": 3,
    "spacing": 6,
    "shotCreate": 10,
    "playmake": 5,
    "finish": 6,
    "ballDominance": 8
  },
  "Shot Creator": {
    "rimProtect": 1,
    "perimeterD": 4,
    "rebound": 3,
    "spacing": 5,
    "shotCreate": 8,
    "playmake": 4,
    "finish": 5,
    "ballDominance": 6
  },
  "Elite Transition Maestro": {
    "rimProtect": 1,
    "perimeterD": 5,
    "rebound": 4,
    "shotCreate": 7,
    "spacing": 4,
    "playmake": 8,
    "finish": 9,
    "ballDominance": 8
  },
  "Transition Maestro": {
    "rimProtect": 1,
    "perimeterD": 5,
    "rebound": 4,
    "shotCreate": 6,
    "spacing": 4,
    "playmake": 6,
    "finish": 8,
    "ballDominance": 6
  },
  "Elite Lockdown Defender": {
    "rimProtect": 3,
    "perimeterD": 10,
    "rebound": 4,
    "shotCreate": 3,
    "spacing": 3,
    "playmake": 3,
    "finish": 5,
    "ballDominance": 2
  },
  "Lockdown Defender": {
    "rimProtect": 2,
    "perimeterD": 9,
    "rebound": 4,
    "shotCreate": 3,
    "spacing": 3,
    "playmake": 2,
    "finish": 4,
    "ballDominance": 2
  },
  "Elite 3&D Wing": {
    "rimProtect": 2,
    "perimeterD": 8,
    "rebound": 4,
    "shotCreate": 4,
    "spacing": 8,
    "playmake": 4,
    "finish": 5,
    "ballDominance": 3
  },
  "3&D Wing": {
    "rimProtect": 1,
    "perimeterD": 7,
    "rebound": 3,
    "shotCreate": 3,
    "spacing": 6,
    "playmake": 3,
    "finish": 4,
    "ballDominance": 2
  },
  "Two-Way Anchor": {
    "rimProtect": 5,
    "perimeterD": 8,
    "rebound": 5,
    "shotCreate": 5,
    "spacing": 5,
    "playmake": 5,
    "finish": 6,
    "ballDominance": 4
  },
  "Elite Off-Ball Sniper": {
    "rimProtect": 0,
    "perimeterD": 3,
    "rebound": 2,
    "shotCreate": 4,
    "spacing": 8,
    "playmake": 2,
    "finish": 4,
    "ballDominance": 3
  },
  "Off-Ball Sniper": {
    "rimProtect": 0,
    "perimeterD": 3,
    "rebound": 2,
    "shotCreate": 3,
    "spacing": 7,
    "playmake": 2,
    "finish": 4,
    "ballDominance": 2
  },
  "Elite Post Scorer": {
    "rimProtect": 5,
    "perimeterD": 2,
    "rebound": 8,
    "shotCreate": 7,
    "spacing": 3,
    "playmake": 4,
    "finish": 8,
    "ballDominance": 7
  },
  "Post Scorer": {
    "rimProtect": 4,
    "perimeterD": 2,
    "rebound": 7,
    "shotCreate": 5,
    "spacing": 3,
    "playmake": 3,
    "finish": 7,
    "ballDominance": 5
  },
  "Stretch Big": {
    "rimProtect": 3,
    "perimeterD": 3,
    "rebound": 6,
    "shotCreate": 4,
    "spacing": 6,
    "playmake": 3,
    "finish": 6,
    "ballDominance": 4
  },
  "Elite Enforcer": {
    "rimProtect": 9,
    "perimeterD": 4,
    "rebound": 9,
    "shotCreate": 1,
    "spacing": 1,
    "playmake": 2,
    "finish": 6,
    "ballDominance": 2
  },
  "Enforcer": {
    "rimProtect": 7,
    "perimeterD": 3,
    "rebound": 7,
    "shotCreate": 1,
    "spacing": 1,
    "playmake": 1,
    "finish": 5,
    "ballDominance": 2
  },
  "Elite Rim Runner": {
    "rimProtect": 5,
    "perimeterD": 3,
    "rebound": 7,
    "shotCreate": 2,
    "spacing": 2,
    "playmake": 2,
    "finish": 10,
    "ballDominance": 3
  },
  "Rim Runner": {
    "rimProtect": 4,
    "perimeterD": 3,
    "rebound": 6,
    "shotCreate": 2,
    "spacing": 2,
    "playmake": 2,
    "finish": 9,
    "ballDominance": 2
  },
  "Defensive Unicorn": {
    "rimProtect": 10,
    "perimeterD": 7,
    "rebound": 9,
    "shotCreate": 5,
    "spacing": 4,
    "playmake": 4,
    "finish": 7,
    "ballDominance": 5
  },
  "Role Player": {
    "rimProtect": 2,
    "perimeterD": 5,
    "rebound": 4,
    "shotCreate": 2,
    "spacing": 5,
    "playmake": 3,
    "finish": 4,
    "ballDominance": 2
  },
  "Glue Guy": {
    "rimProtect": 2,
    "perimeterD": 6,
    "rebound": 4,
    "shotCreate": 2,
    "spacing": 5,
    "playmake": 4,
    "finish": 4,
    "ballDominance": 2
  }
};

export const ARCHETYPE_FALLBACK: FnProfile = {
  "rimProtect": 3,
  "perimeterD": 4,
  "rebound": 4,
  "shotCreate": 4,
  "spacing": 4,
  "playmake": 4,
  "finish": 4,
  "ballDominance": 4
};

/** TS% is dunk-rate, not shooting, for these — the spacing floor must skip them. */
export const RIM_TS_ARCHETYPES: string[] = [
  "Rim Runner",
  "Elite Rim Runner",
  "Enforcer",
  "Elite Enforcer",
  "Post Scorer",
  "Elite Post Scorer"
];

/** Real basketball knowledge the box score actively lies about (Ben Simmons at 62.5 TS). */
export const KNOWN_NON_SHOOTERS: string[] = [
  "Ben Simmons",
  "Giannis Antetokounmpo",
  "Zion Williamson",
  "Domantas Sabonis",
  "Alperen Sengun",
  "Josh Giddey",
  "Amen Thompson",
  "Ausar Thompson",
  "Aaron Gordon",
  "Bam Adebayo",
  "Tyson Chandler",
  "Andre Drummond",
  "Steven Adams",
  "DeAndre Jordan",
  "Dwight Howard",
  "Rudy Gobert",
  "Clint Capela",
  "Jarrett Allen",
  "Deandre Ayton",
  "Bismack Biyombo",
  "Ivica Zubac",
  "Daniel Gafford",
  "Dereck Lively II",
  "Jalen Duren",
  "Mitchell Robinson",
  "Luke Kornet",
  "Boban Marjanovic",
  "Timofey Mozgov",
  "Marcus Camby",
  "Joakim Noah",
  "Andrei Kirilenko"
];

export const GENERATIONAL_RIM_PROTECTORS: string[] = [
  "Dikembe Mutombo",
  "Hakeem Olajuwon",
  "David Robinson",
  "Bill Russell",
  "Wilt Chamberlain",
  "Shaquille O'Neal",
  "Victor Wembanyama",
  "Mark Eaton",
  "Alonzo Mourning",
  "Tim Duncan",
  "Kevin Garnett",
  "Rudy Gobert",
  "Patrick Ewing",
  "Ben Wallace"
];

export const PLAYER_FUNCTION_OVERRIDES: Record<string, Partial<FnProfile>> = {
  "Victor Wembanyama|'26 Spurs": {
    "rimProtect": 10,
    "perimeterD": 7,
    "spacing": 5
  },
  "Draymond Green|'17 Warriors": {
    "rimProtect": 6,
    "perimeterD": 9,
    "playmake": 8,
    "ballDominance": 3
  },
  "Draymond Green|'16 Warriors": {
    "rimProtect": 6,
    "perimeterD": 9,
    "playmake": 8,
    "ballDominance": 3
  },
  "Nikola Jokic|'23 Nuggets": {
    "playmake": 10,
    "shotCreate": 9,
    "ballDominance": 8,
    "rebound": 9
  },
  "Rudy Gobert|'25 Timberwolves": {
    "rimProtect": 10,
    "rebound": 9,
    "perimeterD": 3
  },
  "Stephen Curry|'16 Warriors": {
    "spacing": 10,
    "shotCreate": 9,
    "playmake": 7,
    "ballDominance": 7
  },
  "Stephen Curry|'17 Warriors": {
    "spacing": 10,
    "shotCreate": 8,
    "playmake": 7,
    "ballDominance": 6
  },
  "Joel Embiid|'22 76ers": {
    "spacing": 6
  },
  "Joel Embiid|'24 76ers": {
    "spacing": 6
  },
  "DeMarcus Cousins|'16 Kings": {
    "spacing": 6
  },
  "DeMarcus Cousins|'17 Pelicans": {
    "spacing": 6
  },
  "Bam Adebayo|'23 Heat": {
    "rimProtect": 8,
    "perimeterD": 7,
    "rebound": 8
  },
  "Bam Adebayo|'20 Heat": {
    "rimProtect": 7,
    "perimeterD": 7,
    "rebound": 8
  }
};

/** Archetype -> where a player's usage lives on the floor. */
export const ARCH_ZONE: Record<string, UsageZone> = {
  "Generational Playmaker": "onball",
  "Heliocentric Playmaker": "onball",
  "Elite Playmaker": "onball",
  "Floor General": "onball",
  "Playmaker": "onball",
  "Secondary Playmaker": "wing",
  "Elite Shot Creator": "wing",
  "Shot Creator": "wing",
  "Elite Transition Maestro": "onball",
  "Transition Maestro": "onball",
  "Elite Off-Ball Sniper": "offball",
  "Off-Ball Sniper": "offball",
  "Elite 3&D Wing": "offball",
  "3&D Wing": "offball",
  "Elite Lockdown Defender": "offball",
  "Lockdown Defender": "offball",
  "Two-Way Anchor": "wing",
  "Role Player": "offball",
  "Glue Guy": "wing",
  "Elite Post Scorer": "post",
  "Post Scorer": "post",
  "Elite Enforcer": "post",
  "Enforcer": "post",
  "Elite Rim Runner": "post",
  "Rim Runner": "post",
  "Stretch Big": "offball",
  "Defensive Unicorn": "post"
};

/** How much two usage zones collide (0 = independent, 1 = identical). */
export const ZONE_COLLISION: Record<string, number> = {
  "onball|onball": 1,
  "wing|wing": 1,
  "post|post": 0.7,
  "offball|offball": 0.3,
  "onball|wing": 0.6,
  "onball|post": 0.15,
  "onball|offball": 0.1,
  "wing|post": 0.25,
  "wing|offball": 0.15,
  "post|offball": 0.1
};

export const OFFBALL_STARS: string[] = [
  "Durant",
  "Curry",
  "Thompson",
  "Booker",
  "Mitchell",
  "Allen",
  "Miller",
  "Ray Allen",
  "Korver",
  "Hield",
  "McCollum",
  "Lillard",
  "Beal",
  "LaVine",
  "George",
  "Tatum",
  "Brown",
  "Edwards",
  "Maxey",
  "Murray"
];
export const ONBALL_MAESTROS: string[] = [
  "James",
  "Doncic",
  "Westbrook",
  "Harden",
  "Paul",
  "Young",
  "Morant",
  "Irving",
  "Rose",
  "Wall",
  "Robertson",
  "Magic Johnson",
  "Johnson",
  "Nash",
  "Parker",
  "Williams"
];

interface MetaEntry { perimeterDef?: number; shotBlocking?: number; elasticity?: number; usageZone?: UsageZone; transitionGear?: number; }
interface VoiceEntry { elasticity?: number; usageZone?: UsageZone; transitionGear?: number; overrides?: Partial<FnProfile>; flags?: Record<string, boolean>; }

/** Hand-tuned defensive truth the offense-first archetype labels can't see. */
export const PLAYERS_META: Record<string, MetaEntry> = {
  "Kevin Durant": {
    "perimeterDef": 6,
    "shotBlocking": 7,
    "elasticity": 0.85,
    "usageZone": "wing",
    "transitionGear": 0.6
  },
  "Kevin Durant|'17 Warriors": {
    "perimeterDef": 7,
    "shotBlocking": 8
  },
  "LeBron James": {
    "perimeterDef": 8,
    "shotBlocking": 6,
    "elasticity": 0.7,
    "usageZone": "onball",
    "transitionGear": 0.9
  },
  "LeBron James|'09 Cavs": {
    "perimeterDef": 9
  },
  "LeBron James|'18 Cavs": {
    "perimeterDef": 7
  },
  "LeBron James|'20 Lakers": {
    "perimeterDef": 7
  },
  "Luka Doncic": {
    "perimeterDef": 3,
    "shotBlocking": 2,
    "elasticity": 0.3,
    "usageZone": "onball",
    "transitionGear": 0.5
  },
  "Magic Johnson": {
    "perimeterDef": 5,
    "shotBlocking": 2,
    "elasticity": 0.55,
    "usageZone": "onball",
    "transitionGear": 1
  },
  "Kobe Bryant": {
    "perimeterDef": 8,
    "shotBlocking": 4,
    "elasticity": 0.55,
    "usageZone": "wing",
    "transitionGear": 0.6
  },
  "Kobe Bryant|'06 Lakers": {
    "perimeterDef": 7
  },
  "Kobe Bryant|'01 Lakers": {
    "perimeterDef": 9
  },
  "Kareem Abdul-Jabbar": {
    "perimeterDef": 4,
    "shotBlocking": 8,
    "elasticity": 0.45,
    "usageZone": "post",
    "transitionGear": 0.4
  },
  "Shaquille O'Neal": {
    "perimeterDef": 3,
    "shotBlocking": 8,
    "elasticity": 0.4,
    "usageZone": "post",
    "transitionGear": 0.4
  },
  "Pau Gasol|'09 Lakers": {
    "perimeterDef": 4,
    "shotBlocking": 6,
    "elasticity": 0.6,
    "usageZone": "post",
    "transitionGear": 0.4
  },
  "Anthony Davis|'20 Lakers": {
    "perimeterDef": 7,
    "shotBlocking": 9,
    "elasticity": 0.6,
    "usageZone": "post",
    "transitionGear": 0.6
  },
  "Derek Fisher|'01 Lakers": {
    "perimeterDef": 6,
    "shotBlocking": 2,
    "elasticity": 0.85,
    "usageZone": "offball",
    "transitionGear": 0.5
  },
  "Rick Fox|'01 Lakers": {
    "perimeterDef": 6,
    "shotBlocking": 3,
    "elasticity": 0.85,
    "usageZone": "offball",
    "transitionGear": 0.5
  },
  "Robert Horry|'01 Lakers": {
    "perimeterDef": 6,
    "shotBlocking": 4,
    "elasticity": 0.9,
    "usageZone": "offball",
    "transitionGear": 0.4
  },
  "Alex Caruso|'21 Lakers": {
    "perimeterDef": 9,
    "shotBlocking": 4,
    "elasticity": 0.85,
    "usageZone": "offball",
    "transitionGear": 0.7
  },
  "Kentavious Caldwell-Pope|'20 Lakers": {
    "perimeterDef": 7,
    "shotBlocking": 2,
    "elasticity": 0.9,
    "usageZone": "offball",
    "transitionGear": 0.6
  },
  "Danny Green|'20 Lakers": {
    "perimeterDef": 7,
    "shotBlocking": 3,
    "elasticity": 0.95,
    "usageZone": "offball",
    "transitionGear": 0.5
  },
  "Dwight Howard|'20 Lakers": {
    "perimeterDef": 4,
    "shotBlocking": 8,
    "elasticity": 0.55,
    "usageZone": "post",
    "transitionGear": 0.5
  },
  "Kristaps Porzingis|'24 Celtics": {
    "shotBlocking": 8
  },
  "James Worthy|'88 Lakers": {
    "perimeterDef": 5,
    "shotBlocking": 3,
    "elasticity": 0.6,
    "usageZone": "wing",
    "transitionGear": 0.8
  },
  "Stephen Curry": {
    "perimeterDef": 5,
    "shotBlocking": 2,
    "elasticity": 0.9,
    "usageZone": "onball",
    "transitionGear": 0.7
  },
  "Stephen Curry|'22 Warriors": {
    "elasticity": 0.94
  },
  "Klay Thompson": {
    "perimeterDef": 7,
    "shotBlocking": 2,
    "elasticity": 1,
    "usageZone": "offball",
    "transitionGear": 0.5
  },
  "Klay Thompson|'15 Warriors": {
    "perimeterDef": 8
  },
  "Klay Thompson|'16 Warriors": {
    "perimeterDef": 8
  },
  "Klay Thompson|'24 Mavericks": {
    "perimeterDef": 5
  },
  "Draymond Green": {
    "perimeterDef": 9,
    "shotBlocking": 6,
    "elasticity": 0.7,
    "usageZone": "post",
    "transitionGear": 0.8
  },
  "Andre Iguodala": {
    "perimeterDef": 9,
    "shotBlocking": 3,
    "elasticity": 0.85,
    "usageZone": "offball",
    "transitionGear": 0.6
  },
  "Zaza Pachulia|'17 Warriors": {
    "perimeterDef": 3,
    "shotBlocking": 3,
    "elasticity": 0.6,
    "usageZone": "post",
    "transitionGear": 0.3
  },
  "Michael Jordan": {
    "perimeterDef": 9,
    "shotBlocking": 5,
    "elasticity": 0.55,
    "usageZone": "wing",
    "transitionGear": 0.7
  },
  "Michael Jordan|'96 Bulls": {
    "perimeterDef": 9
  },
  "Michael Jordan|'91 Bulls": {
    "perimeterDef": 9
  },
  "Scottie Pippen": {
    "perimeterDef": 10,
    "shotBlocking": 5,
    "elasticity": 0.7,
    "usageZone": "wing",
    "transitionGear": 0.8
  },
  "Dennis Rodman|'96 Bulls": {
    "perimeterDef": 8,
    "shotBlocking": 5,
    "elasticity": 0.85,
    "usageZone": "offball",
    "transitionGear": 0.6
  },
  "Ron Harper|'96 Bulls": {
    "perimeterDef": 8,
    "shotBlocking": 3,
    "elasticity": 0.8,
    "usageZone": "offball",
    "transitionGear": 0.6
  },
  "Luc Longley|'96 Bulls": {
    "perimeterDef": 3,
    "shotBlocking": 5,
    "elasticity": 0.6,
    "usageZone": "post",
    "transitionGear": 0.3
  },
  "Toni Kukoc|'96 Bulls": {
    "perimeterDef": 4,
    "shotBlocking": 3,
    "elasticity": 0.75,
    "usageZone": "wing",
    "transitionGear": 0.6
  },
  "Derrick Rose|'11 Bulls": {
    "perimeterDef": 5,
    "shotBlocking": 2,
    "elasticity": 0.35,
    "usageZone": "onball",
    "transitionGear": 0.9
  },
  "Tim Duncan": {
    "perimeterDef": 5,
    "shotBlocking": 9,
    "elasticity": 0.55,
    "usageZone": "post",
    "transitionGear": 0.4
  },
  "David Robinson": {
    "perimeterDef": 5,
    "shotBlocking": 9,
    "elasticity": 0.5,
    "usageZone": "post",
    "transitionGear": 0.6
  },
  "Tony Parker|'05 Spurs": {
    "perimeterDef": 5,
    "shotBlocking": 2,
    "elasticity": 0.45,
    "usageZone": "onball",
    "transitionGear": 0.9
  },
  "Manu Ginobili|'05 Spurs": {
    "perimeterDef": 6,
    "shotBlocking": 3,
    "elasticity": 0.7,
    "usageZone": "wing",
    "transitionGear": 0.8
  },
  "Kawhi Leonard": {
    "perimeterDef": 10,
    "shotBlocking": 4,
    "elasticity": 0.6,
    "usageZone": "wing",
    "transitionGear": 0.5
  },
  "Kawhi Leonard|'17 Spurs": {
    "perimeterDef": 10
  },
  "Dwyane Wade": {
    "perimeterDef": 7,
    "shotBlocking": 5,
    "elasticity": 0.45,
    "usageZone": "onball",
    "transitionGear": 0.8
  },
  "Dwyane Wade|'13 Heat": {
    "elasticity": 0.55
  },
  "Chris Bosh|'13 Heat": {
    "perimeterDef": 5,
    "shotBlocking": 5,
    "elasticity": 0.8,
    "usageZone": "post",
    "transitionGear": 0.5
  },
  "Ray Allen|'13 Heat": {
    "perimeterDef": 4,
    "shotBlocking": 2,
    "elasticity": 1,
    "usageZone": "offball",
    "transitionGear": 0.4
  },
  "Shane Battier|'13 Heat": {
    "perimeterDef": 8,
    "shotBlocking": 3,
    "elasticity": 0.95,
    "usageZone": "offball",
    "transitionGear": 0.4
  },
  "Mario Chalmers|'13 Heat": {
    "perimeterDef": 6,
    "shotBlocking": 2,
    "elasticity": 0.8,
    "usageZone": "offball",
    "transitionGear": 0.6
  },
  "Jimmy Butler|'23 Heat": {
    "perimeterDef": 8,
    "shotBlocking": 3,
    "elasticity": 0.5,
    "usageZone": "wing",
    "transitionGear": 0.6
  },
  "Larry Bird": {
    "perimeterDef": 5,
    "shotBlocking": 3,
    "elasticity": 0.7,
    "usageZone": "wing",
    "transitionGear": 0.6
  },
  "Kevin McHale|'86 Celtics": {
    "perimeterDef": 4,
    "shotBlocking": 6,
    "elasticity": 0.55,
    "usageZone": "post",
    "transitionGear": 0.4
  },
  "Kevin McHale|'87 Celtics": {
    "perimeterDef": 4,
    "shotBlocking": 6,
    "elasticity": 0.55,
    "usageZone": "post",
    "transitionGear": 0.4
  },
  "Cedric Maxwell|'81 Celtics": {
    "perimeterDef": 5,
    "shotBlocking": 4,
    "elasticity": 0.5,
    "usageZone": "post",
    "transitionGear": 0.4
  },
  "Glen Davis|'10 Celtics": {
    "perimeterDef": 4,
    "shotBlocking": 3,
    "elasticity": 0.55,
    "usageZone": "post",
    "transitionGear": 0.3
  },
  "Grant Williams|'22 Celtics": {
    "perimeterDef": 7,
    "shotBlocking": 4,
    "elasticity": 0.75,
    "usageZone": "wing",
    "transitionGear": 0.5
  },
  "Robert Williams III|'22 Celtics": {
    "perimeterDef": 5,
    "shotBlocking": 9,
    "elasticity": 0.65,
    "usageZone": "post",
    "transitionGear": 0.6
  },
  "Kristaps Porzingis": {
    "perimeterDef": 5,
    "shotBlocking": 8,
    "elasticity": 0.6,
    "usageZone": "post",
    "transitionGear": 0.4
  },
  "Stephon Marbury": {
    "perimeterDef": 3,
    "shotBlocking": 1,
    "elasticity": 0.3,
    "usageZone": "onball",
    "transitionGear": 0.8
  },
  "Mark Jackson": {
    "perimeterDef": 5,
    "shotBlocking": 1,
    "elasticity": 0.5,
    "usageZone": "onball",
    "transitionGear": 0.5
  },
  "Steve Novak": {
    "perimeterDef": 2,
    "shotBlocking": 1,
    "elasticity": 1,
    "usageZone": "offball",
    "transitionGear": 0.3
  },
  "Immanuel Quickley": {
    "perimeterDef": 6,
    "shotBlocking": 1,
    "elasticity": 0.7,
    "usageZone": "wing",
    "transitionGear": 0.7
  },
  "Antawn Jamison": {
    "perimeterDef": 3,
    "shotBlocking": 2,
    "elasticity": 0.6,
    "usageZone": "post",
    "transitionGear": 0.5
  },
  "Kevon Looney": {
    "perimeterDef": 4,
    "shotBlocking": 4,
    "elasticity": 0.9,
    "usageZone": "post",
    "transitionGear": 0.4
  },
  "Wilt Chamberlain": {
    "perimeterDef": 6,
    "shotBlocking": 9,
    "elasticity": 0.3,
    "usageZone": "post",
    "transitionGear": 0.5
  },
  "Nate Thurmond": {
    "perimeterDef": 6,
    "shotBlocking": 9,
    "elasticity": 0.7,
    "usageZone": "post",
    "transitionGear": 0.4
  },
  "Tim Hardaway": {
    "perimeterDef": 4,
    "shotBlocking": 1,
    "elasticity": 0.4,
    "usageZone": "onball",
    "transitionGear": 0.8
  },
  "Sleepy Floyd": {
    "perimeterDef": 4,
    "shotBlocking": 1,
    "elasticity": 0.6,
    "usageZone": "onball",
    "transitionGear": 0.6
  },
  "Ray Allen": {
    "perimeterDef": 4,
    "shotBlocking": 1,
    "elasticity": 0.95,
    "usageZone": "offball",
    "transitionGear": 0.5
  },
  "Reggie Miller": {
    "perimeterDef": 4,
    "shotBlocking": 1,
    "elasticity": 0.95,
    "usageZone": "offball",
    "transitionGear": 0.4
  },
  "Manu Ginobili": {
    "perimeterDef": 5,
    "shotBlocking": 1,
    "elasticity": 0.8,
    "usageZone": "wing",
    "transitionGear": 0.7
  },
  "Devin Booker": {
    "perimeterDef": 4,
    "shotBlocking": 1,
    "elasticity": 0.65,
    "usageZone": "onball",
    "transitionGear": 0.6
  },
  "Clyde Drexler": {
    "perimeterDef": 6,
    "shotBlocking": 2,
    "elasticity": 0.55,
    "usageZone": "wing",
    "transitionGear": 0.8
  },
  "George Gervin": {
    "perimeterDef": 3,
    "shotBlocking": 1,
    "elasticity": 0.45,
    "usageZone": "onball",
    "transitionGear": 0.5
  },
  "Tracy McGrady": {
    "perimeterDef": 5,
    "shotBlocking": 2,
    "elasticity": 0.45,
    "usageZone": "onball",
    "transitionGear": 0.6
  },
  "Gilbert Arenas": {
    "perimeterDef": 4,
    "shotBlocking": 1,
    "elasticity": 0.4,
    "usageZone": "onball",
    "transitionGear": 0.6
  },
  "Kyrie Irving": {
    "perimeterDef": 4,
    "shotBlocking": 1,
    "elasticity": 0.5,
    "usageZone": "onball",
    "transitionGear": 0.5
  },
  "Jalen Brunson": {
    "perimeterDef": 3,
    "shotBlocking": 1,
    "elasticity": 0.4,
    "usageZone": "onball",
    "transitionGear": 0.5
  },
  "Chris Paul|'17 Clippers": {
    "perimeterDef": 9,
    "shotBlocking": 1,
    "elasticity": 0.4,
    "usageZone": "onball",
    "transitionGear": 0.6
  },
  "Norm Nixon|'85 Clippers": {
    "perimeterDef": 5,
    "shotBlocking": 1,
    "elasticity": 0.6,
    "usageZone": "onball",
    "transitionGear": 0.7
  },
  "James Harden|'25 Clippers": {
    "perimeterDef": 4,
    "shotBlocking": 1,
    "elasticity": 0.5,
    "usageZone": "onball",
    "transitionGear": 0.5
  }
};

/** Per-player usage/elasticity pins and function overrides. */
export const PLAYERS_VOICE: Record<string, VoiceEntry> = {
  "Kareem Abdul-Jabbar": {
    "flags": {
      "noOffball": true,
      "noOverlook": true,
      "alwaysSpotlight": true
    }
  },
  "Shaquille O'Neal": {
    "flags": {
      "noOffball": true,
      "noOverlook": true,
      "alwaysSpotlight": true
    }
  },
  "Shaquille O'Neal|'00 Lakers": {
    "flags": {
      "noOffball": true,
      "noOverlook": true,
      "alwaysSpotlight": true
    }
  },
  "Magic Johnson": {
    "flags": {
      "noOffball": true,
      "alwaysSpotlight": true,
      "reboundCrasher": true
    }
  },
  "Kobe Bryant": {
    "elasticity": 0.6,
    "usageZone": "wing",
    "flags": {
      "alwaysSpotlight": true
    }
  },
  "Kobe Bryant|'06 Lakers": {
    "flags": {
      "alwaysSpotlight": true
    }
  },
  "Kobe Bryant|'01 Lakers": {
    "flags": {
      "alwaysSpotlight": true
    }
  },
  "Kobe Bryant|'09 Lakers": {
    "flags": {
      "alwaysSpotlight": true
    }
  },
  "LeBron James|'20 Lakers": {
    "flags": {
      "noOffball": true,
      "alwaysSpotlight": true
    }
  },
  "Luka Doncic|'26 Lakers": {
    "flags": {
      "noOffball": true,
      "alwaysSpotlight": true
    }
  },
  "Anthony Davis|'20 Lakers": {
    "flags": {
      "alwaysSpotlight": true
    }
  },
  "Gail Goodrich": {
    "overrides": {
      "spacing": 6
    }
  },
  "Rajon Rondo": {
    "flags": {
      "reboundCrasher": true
    }
  },
  "Stephen Curry": {
    "flags": {
      "alwaysSpotlight": true
    }
  },
  "Stephen Curry|'16 Warriors": {
    "flags": {
      "alwaysSpotlight": true
    }
  },
  "Kevin Durant": {
    "elasticity": 0.85,
    "usageZone": "wing"
  },
  "Kevin Durant|'17 Warriors": {
    "flags": {
      "alwaysSpotlight": true
    }
  },
  "Draymond Green": {
    "flags": {
      "noOverlook": true
    }
  },
  "Steve Nash": {
    "flags": {
      "noOffball": true,
      "alwaysSpotlight": true
    }
  },
  "Charles Barkley|'93 Suns": {
    "flags": {
      "alwaysSpotlight": true
    }
  },
  "Devin Booker": {
    "flags": {
      "alwaysSpotlight": true
    }
  },
  "Kevin Durant|'24 Suns": {
    "flags": {
      "alwaysSpotlight": true
    }
  },
  "Amar'e Stoudemire": {
    "flags": {
      "noOffball": true
    }
  },
  "Chris Paul": {
    "elasticity": 0.35,
    "usageZone": "onball",
    "flags": {
      "noOffball": true,
      "alwaysSpotlight": true
    }
  },
  "Blake Griffin|'14 Clippers": {
    "elasticity": 0.6,
    "usageZone": "post"
  },
  "Blake Griffin|'15 Clippers": {
    "elasticity": 0.65,
    "usageZone": "wing"
  },
  "DeAndre Jordan|'15 Clippers": {
    "usageZone": "post",
    "overrides": {
      "rimProtect": 9
    },
    "flags": {
      "noOffball": true
    }
  },
  "Kawhi Leonard|'20 Clippers": {
    "elasticity": 0.7,
    "usageZone": "wing",
    "flags": {
      "alwaysSpotlight": true
    }
  },
  "Paul George|'21 Clippers": {
    "elasticity": 0.75,
    "usageZone": "wing"
  },
  "Bob McAdoo|'75 Braves": {
    "elasticity": 0.55,
    "usageZone": "post"
  },
  "Elton Brand": {
    "usageZone": "post",
    "flags": {
      "noOffball": true
    }
  },
  "Paul George": {
    "elasticity": 0.75,
    "usageZone": "wing"
  },
  "Chris Webber|'01 Kings": {
    "elasticity": 0.6,
    "usageZone": "post",
    "flags": {
      "alwaysSpotlight": true
    }
  },
  "Peja Stojakovic": {
    "elasticity": 1,
    "usageZone": "offball",
    "flags": {
      "alwaysSpotlight": true
    }
  },
  "Mike Bibby|'02 Kings": {
    "elasticity": 0.55,
    "usageZone": "onball"
  },
  "Vlade Divac|'02 Kings": {
    "usageZone": "post",
    "flags": {
      "noOffball": true
    }
  },
  "DeMarcus Cousins|'16 Kings": {
    "elasticity": 0.45,
    "usageZone": "post",
    "flags": {
      "noOffball": true,
      "alwaysSpotlight": true
    }
  },
  "Kevin Martin|'09 Kings": {
    "elasticity": 0.7,
    "usageZone": "wing"
  },
  "Ron Artest|'06 Kings": {
    "flags": {
      "alwaysSpotlight": true
    }
  },
  "De'Aaron Fox|'24 Kings": {
    "elasticity": 0.45,
    "usageZone": "onball",
    "flags": {
      "alwaysSpotlight": true
    }
  },
  "Domantas Sabonis|'24 Kings": {
    "elasticity": 0.55,
    "usageZone": "post",
    "flags": {
      "noOffball": true
    }
  },
  "Giannis Antetokounmpo": {
    "elasticity": 0.55,
    "usageZone": "post",
    "flags": {
      "noOffball": true
    }
  },
  "Russell Westbrook": {
    "elasticity": 0.2,
    "usageZone": "onball",
    "transitionGear": 1,
    "flags": {
      "noOffball": true,
      "reboundCrasher": true
    }
  },
  "Trae Young": {
    "elasticity": 0.3,
    "usageZone": "onball",
    "flags": {
      "noOffball": true
    }
  },
  "Ja Morant": {
    "elasticity": 0.35,
    "usageZone": "onball",
    "flags": {
      "noOffball": true
    }
  },
  "James Harden": {
    "elasticity": 0.4,
    "usageZone": "onball"
  },
  "Derrick Rose": {
    "elasticity": 0.3,
    "usageZone": "onball",
    "flags": {
      "noOffball": true
    }
  },
  "Allen Iverson": {
    "elasticity": 0.3,
    "usageZone": "wing",
    "flags": {
      "noOffball": true
    }
  },
  "Luka Doncic": {
    "elasticity": 0.3,
    "usageZone": "onball",
    "flags": {
      "noOffball": true,
      "reboundCrasher": true
    }
  },
  "Jason Kidd": {
    "flags": {
      "reboundCrasher": true
    }
  },
  "Damian Lillard": {
    "elasticity": 0.4,
    "usageZone": "onball",
    "flags": {
      "noOffball": true,
      "alwaysSpotlight": true
    }
  },
  "CJ McCollum": {
    "elasticity": 0.55,
    "usageZone": "wing"
  },
  "Clyde Drexler|'92 Blazers": {
    "elasticity": 0.6,
    "usageZone": "wing",
    "flags": {
      "alwaysSpotlight": true
    }
  },
  "Clyde Drexler": {
    "elasticity": 0.6,
    "usageZone": "wing"
  },
  "LaMarcus Aldridge|'14 Trail Blazers": {
    "usageZone": "post",
    "flags": {
      "noOffball": true
    }
  },
  "LaMarcus Aldridge": {
    "usageZone": "post"
  },
  "Terry Porter": {
    "elasticity": 0.55,
    "usageZone": "onball"
  },
  "Arvydas Sabonis|'98 Blazers": {
    "usageZone": "post",
    "flags": {
      "noOffball": true
    }
  },
  "Rasheed Wallace|'00 Blazers": {
    "usageZone": "post"
  },
  "Kevin Garnett|'04 Timberwolves": {
    "elasticity": 0.6,
    "usageZone": "post",
    "flags": {
      "alwaysSpotlight": true,
      "generationalRimProtector": true
    }
  },
  "Kevin Garnett": {
    "usageZone": "post",
    "flags": {
      "generationalRimProtector": true
    }
  },
  "Anthony Edwards|'25 Timberwolves": {
    "elasticity": 0.5,
    "usageZone": "wing",
    "flags": {
      "alwaysSpotlight": true
    }
  },
  "Kevin Love|'14 Timberwolves": {
    "elasticity": 0.7,
    "usageZone": "post"
  },
  "Karl-Anthony Towns": {
    "elasticity": 0.6,
    "usageZone": "post",
    "flags": {
      "noOffball": true
    }
  },
  "Rudy Gobert": {
    "usageZone": "post",
    "flags": {
      "noOffball": true,
      "generationalRimProtector": true
    }
  },
  "Mike Conley|'25 Timberwolves": {
    "elasticity": 0.5,
    "usageZone": "onball"
  },
  "Dikembe Mutombo": {
    "overrides": {
      "rimProtect": 10,
      "rebound": 9
    },
    "flags": {
      "generationalRimProtector": true
    }
  },
  "Hakeem Olajuwon": {
    "flags": {
      "noOffball": true,
      "alwaysSpotlight": true
    }
  },
  "Tim Duncan": {
    "flags": {
      "noOffball": true,
      "alwaysSpotlight": true
    }
  },
  "David Robinson": {
    "flags": {
      "noOffball": true
    }
  },
  "Wilt Chamberlain": {
    "flags": {
      "noOffball": true,
      "alwaysSpotlight": true
    }
  },
  "Moses Malone": {
    "flags": {
      "noOffball": true
    }
  },
  "Nikola Jokic": {
    "flags": {
      "noOffball": true,
      "alwaysSpotlight": true
    }
  },
  "LeBron James": {
    "transitionGear": 0.95,
    "flags": {
      "noOffball": true,
      "alwaysSpotlight": true,
      "reboundCrasher": true
    }
  },
  "Larry Bird": {
    "flags": {
      "alwaysSpotlight": true
    }
  },
  "Michael Jordan": {
    "flags": {
      "noOffball": true,
      "alwaysSpotlight": true
    }
  }
};
