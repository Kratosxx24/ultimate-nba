// ============================================================================
// PLAYERS.JS — Player Database
// This is the ONLY file you need to edit to add, remove, or adjust players.
//
// FORMAT (one player per line, no commas inside fields):
//   eraTeam, name, pos, cost, ppg, rpg, apg, usg%, ts%, ws/48, off, def, archetype, teamKey, stl, blk, teamWins, teamLosses, playoffRound, mpg
//
// mpg (column 20) is that player's real minutes-per-game for that specific
// season (per-PLAYER, not per-team, unlike teamWins/teamLosses/playoffRound).
// Sourced via web research across all 969 rows. 0.0 means the player recorded
// real per-game stats for the season but did not play (season-long injury/
// personal absence) — e.g. Grant Hill '04 Magic, Royce White '13 Rockets,
// Ben Simmons '22 Nets — kept as 0.0 rather than omitted so the row stays
// intact; the formula's confidence gating naturally zeroes these out.
//
// stl/blk are real per-game steals/blocks for that season, sourced via research
// (see NEXT_AUDIT_PROMPT.md history). The 16 pre-1974 entries (before the NBA
// officially tracked STL/BLK) use archetype/role-based estimates instead of
// real recorded numbers — see STEALS_BLOCKS_ESTIMATED list below.
//
// teamWins/teamLosses are that eraTeam's real regular-season record. teamWinPct
// (wins/(wins+losses)) is derived at formula-run time, not stored separately.
// playoffRound is that eraTeam's real playoff result that season, one of:
//   MISSED (didn't make playoffs) | R1 | R2 | CF (lost conf finals)
//   FINALS (lost NBA Finals) | CHAMPION (won the title)
// Sourced via web research (Basketball-Reference) across the full 496 unique
// eraTeams in this file, one team-season researched once and shared by every
// player row for that team-season.
//
// ARCHETYPES:
//   Generational Playmaker | Heliocentric Playmaker | Elite Playmaker | Floor General
//   Secondary Playmaker | Elite Shot Creator | Shot Creator
//   Elite Transition Maestro | Transition Maestro
//   Elite Lockdown Defender | Lockdown Defender | Elite 3&D Wing | 3&D Wing | Two-Way Anchor
//   Elite Off-Ball Sniper | Off-Ball Sniper
//   Elite Post Scorer | Post Scorer | Stretch Big
//   Elite Enforcer | Enforcer | Elite Rim Runner | Rim Runner | Defensive Unicorn
//   Role Player | Glue Guy | Playmaker
//
// OVR is calculated automatically — do not add it here.
// teamKey must match a key in the teamColors object in script.js.
//
// STEALS_BLOCKS_ESTIMATED — pre-1974 eraTeams whose stl/blk columns are
// archetype/role-based estimates, not real recorded stats (the NBA didn't
// officially track steals/blocks until the 1973-74 season):
//   '62 Lakers Elgin Baylor | '64 Celtics Bill Russell | '64 Royals Oscar Robertson
//   '64 Warriors Wilt Chamberlain | '67 76ers Wilt Chamberlain | '70 Knicks Willis Reed
//   '70 Lakers Jerry West | '70 Warriors Nate Thurmond | '71 Bucks Bob Dandridge
//   '71 Celtics John Havlicek | '72 Knicks Dave DeBusschere | '72 Lakers Gail Goodrich
//   '72 Lakers Happy Hairston | '72 Lakers Jim McMillian | '73 Knicks Earl Monroe
//   '73 Knicks Walt Frazier
// ============================================================================

const PLAYER_CSV = `
'62 Lakers,Elgin Baylor,SF,26,38.3,18.6,4.6,34,49.2,0.198,47,45,Elite Shot Creator,Lakers,1.4,0.5,54,26,FINALS,48.3
'64 Celtics,Bill Russell,C,27,15.0,24.1,4.7,17,52.0,0.280,42,51,Elite Enforcer,Celtics,1.7,4.5,59,21,CHAMPION,44.7
'64 Royals,Oscar Robertson,PG,27,31.4,10.4,11.5,31,52.5,0.218,48,32,Generational Playmaker,Royals,2.0,0.4,55,25,CF,45.3
'64 Warriors,Wilt Chamberlain,C,26,36.9,22.3,5.0,40,55.0,0.250,49,47,Elite Post Scorer,Warriors,1.5,3.5,48,32,FINALS,47.6
'67 76ers,Wilt Chamberlain,C,26,24.1,24.2,7.8,23,68.3,0.268,49,49,Elite Post Scorer,76ers,1.5,3.2,68,13,CHAMPION,45.6
'70 Knicks,Willis Reed,C,26,21.7,13.9,2.0,23,53.2,0.200,34,40,Two-Way Anchor,Knicks,1.0,1.8,60,22,CHAMPION,39.8
'70 Lakers,Jerry West,PG/SG,28,31.2,4.6,7.5,32,52.0,0.210,47,47,Elite Shot Creator,Lakers,2.2,0.4,46,36,FINALS,38.6
'70 Warriors,Nate Thurmond,C,19,20.9,22.2,3.1,22,50.0,0.160,36,48,Elite Enforcer,Warriors,1.2,3.0,30,52,MISSED,43.9
'71 Bucks,Bob Dandridge,SF,16,18.4,8.0,2.4,21,52.0,0.14,36,36,Shot Creator,Bucks,1.5,0.5,66,16,CHAMPION,33.7
'71 Celtics,John Havlicek,SF,27,28.9,9.0,7.5,28,51.0,0.180,44,40,Elite Transition Maestro,Celtics,1.8,0.5,44,38,MISSED,45.4
'72 Knicks,Dave DeBusschere,PF,14,16.0,10.7,2.4,18,53.0,0.140,34,42,Two-Way Anchor,Knicks,1.4,0.7,48,34,FINALS,36.7
'72 Lakers,Gail Goodrich,SG,22,25.9,3.4,4.5,28,53.5,0.165,44,28,Elite Shot Creator,Lakers,1.3,0.2,69,13,CHAMPION,35.7
'72 Lakers,Happy Hairston,PF,12,13.1,13.1,1.9,16,52.5,0.13,30,38,Enforcer,Lakers,1.0,0.5,69,13,CHAMPION,33.5
'72 Lakers,Jim McMillian,SF,14,18.8,6.5,2.7,21,52.0,0.13,36,34,Shot Creator,Lakers,1.2,0.3,69,13,CHAMPION,33.5
'73 Knicks,Earl Monroe,SG,17,15.5,2.5,4.1,23,53.0,0.130,36,28,Shot Creator,Knicks,1.5,0.3,57,25,CHAMPION,30.4
'73 Knicks,Walt Frazier,PG,26,21.1,7.3,5.9,22,54.6,0.220,39,44,Floor General,Knicks,2.0,0.4,57,25,CHAMPION,39.7
'74 Celtics,Dave Cowens,C,20,19.0,15.7,4.1,23,51.5,0.155,36,42,Two-Way Anchor,Celtics,1.6,0.9,56,26,CHAMPION,43.0
'74 Celtics,Jo Jo White,PG,18,18.1,3.5,5.5,23,51.0,0.13,38,32,Shot Creator,Celtics,1.5,0.1,56,26,CHAMPION,39.4
'74 Knicks,Bill Bradley,SF,10,14.0,3.1,3.0,14,53.0,0.110,28,32,3&D Wing,Knicks,1,0.2,49,33,CF,31.7
'75 Braves,Bob McAdoo,C,24,34.5,14.1,2.2,30,55.0,0.205,42,30,Elite Post Scorer,Clippers,1,2.1,49,33,R2,41.6
'75 Warriors,Rick Barry,SF,27,30.6,5.7,6.2,28,50.9,0.180,45,32,Elite Shot Creator,Warriors,2.9,0.5,48,34,CHAMPION,38.6
'76 Suns,Alvan Adams,C,16,19.0,9.3,5.2,22,55.0,0.165,34,36,Floor General,Suns,1.6,1.2,42,40,FINALS,32.9
'76 Suns,Paul Westphal,PG,18,20.5,2.8,5.4,24,57.0,0.155,40,30,Elite Playmaker,Suns,2.1,0.2,42,40,FINALS,34.2
'77 Blazers,Bob Gross,SF,11,12.5,4.8,3.9,16,55.5,0.130,30,40,3&D Wing,Blazers,1.3,0.5,49,33,CHAMPION,25.6
'77 Blazers,Dave Twardzik,PG,10,10.3,2.5,4.7,16,60.5,0.145,30,34,Secondary Playmaker,Blazers,1.2,0.1,49,33,CHAMPION,24.4
'77 Bulls,Artis Gilmore,C,25,18.6,13.0,2.4,20,56.5,0.190,30,42,Elite Enforcer,Bulls,0.7,2.5,44,38,R1,36.0
'77 Jazz,Pete Maravich,SG,26,31.1,5.1,5.4,32,53.5,0.130,45,22,Elite Shot Creator,Jazz,2.1,0.2,35,47,MISSED,37.9
'77 Nuggets,David Thompson,SG/SF,24,25.9,4.1,4.1,29,54.0,0.16,42,30,Elite Shot Creator,Nuggets,1.5,0.7,50,32,R1,35.3
'78 Bullets,Elvin Hayes,PF/C,22,19.7,13.3,1.8,24,51.5,0.14,38,40,Elite Post Scorer,Wizards,1,1.7,44,38,CHAMPION,37.9
'78 Bullets,Wes Unseld,C,16,7.6,11.9,4.0,13,55.0,0.13,28,42,Floor General,Wizards,0.8,0.8,44,38,CHAMPION,33.7
'79 Bucks,Marques Johnson,SF,20,25.6,7.5,4.1,26,57.0,0.160,40,34,Shot Creator,Bucks,1.4,0.6,38,44,MISSED,33.4
'79 Clippers,World B. Free,SG,20,28.8,3.4,4.2,30,54.0,0.130,42,24,Elite Shot Creator,Clippers,1,0.1,43,39,MISSED,34.0
'79 Sonics,Gus Williams,PG,16,19.2,3.2,5.1,24,53.5,0.140,38,30,Shot Creator,Sonics,2,0.3,52,30,CHAMPION,34.6
'79 Sonics,John Johnson,SF,12,11.5,6.2,4.2,16,52.5,0.115,30,36,Secondary Playmaker,Sonics,1.2,0.5,52,30,CHAMPION,27.5
'80 Lakers,Kareem Abdul-Jabbar,C,30,24.8,10.8,4.5,24,63.9,0.227,50,49,Elite Post Scorer,Lakers,0.7,3.4,60,22,CHAMPION,38.3
'80 Spurs,George Gervin,SG/SF,27,33.1,5.2,2.6,31,58.7,0.200,48,28,Elite Shot Creator,Spurs,1.1,0.3,41,41,R1,37.6
'81 Sixers,Julius Erving,SF,28,24.6,8.0,4.4,26,57.2,0.220,46,38,Elite Transition Maestro,76ers,2.1,1.8,62,20,CF,34.4
'81 Jazz,Adrian Dantley,SF,23,30.7,6.4,4.0,28,62.2,0.191,47,26,Elite Post Scorer,Jazz,1.2,0.1,28,54,MISSED,35.5
'81 Celtics,Cedric Maxwell,PF/C,14,19.0,9.5,2.9,22,62.0,0.190,36,34,Elite Post Scorer,Celtics,0.8,0.6,62,20,CHAMPION,32.7
'82 Nuggets,Alex English,SF,22,25.4,5.5,5.0,26,57.0,0.165,42,30,Elite Shot Creator,Nuggets,1.1,0.3,46,36,R1,35.9
'82 Nuggets,Dan Issel,C/PF,17,22.6,7.5,2.1,24,58.0,0.155,38,30,Post Scorer,Nuggets,0.6,0.5,46,36,R1,26.5
'82 Rockets,Robert Reid,SF,12,14.2,5.5,3.2,18,53.5,0.120,32,38,3&D Wing,Rockets,1.5,0.6,46,36,R1,28.9
'83 Sixers,Marc Iavaroni,PF,8,5.8,4.2,1.2,11,52.5,0.095,22,36,Enforcer,76ers,0.6,0.3,65,17,CHAMPION,20.9
'83 Sixers,Mo Cheeks,PG,16,12.5,2.6,6.9,16,57.0,0.175,34,42,Floor General,76ers,2.3,0.2,65,17,CHAMPION,30.7
'83 Sixers,Moses Malone,C,26,24.5,15.3,1.3,25,57.5,0.241,46,42,Elite Post Scorer,76ers,1.3,1.5,65,17,CHAMPION,37.5
'83 Bulls,Reggie Theus,SG,18,23.8,5.1,7.2,26,54.5,0.120,38,28,Shot Creator,Bulls,1.6,0.2,28,54,MISSED,34.8
'84 Jazz,Darrell Griffith,SG,14,20.0,4.1,3.5,24,54.0,0.115,38,28,Off-Ball Sniper,Jazz,1,0.5,45,37,R2,32.3
'84 Jazz,Rickey Green,PG,11,13.8,2.4,7.8,18,53.0,0.120,34,32,Floor General,Jazz,2.6,0.2,45,37,R2,34.2
'84 Knicks,Trent Tucker,SG,9,9.5,2.8,1.8,15,54.0,0.095,28,30,Off-Ball Sniper,Knicks,0.9,0.2,47,35,R2,19.5
'85 Bucks,Junior Bridgeman,SG,11,12.8,3.2,2.4,20,55.0,0.105,32,28,Off-Ball Sniper,Bucks,0.8,0.2,59,23,R2,25.5
'85 Celtics,Bill Walton,C,9,7.6,6.8,2.1,12,54.5,0.120,28,36,Post Scorer,Celtics,0.7,1.8,63,19,FINALS,19.3
'85 Celtics,Dennis Johnson,PG,16,14.2,4.8,6.0,21,53.0,0.115,34,44,Secondary Playmaker,Celtics,1.7,0.4,63,19,FINALS,37.2
'85 Clippers,Norm Nixon,PG,10,17.2,2.7,8.8,21,52.0,0.110,35,28,Secondary Playmaker,Clippers,2,0.1,31,51,MISSED,35.7
'85 Jazz,Mark Eaton,C,16,9.7,11.3,1.5,14,50.2,0.093,26,50,Elite Enforcer,Jazz,0.4,5.6,41,41,R2,34.3
'85 Kings,Larry Drew,PG,10,14.0,2.5,9.0,20,51.0,0.095,32,28,Floor General,Kings,1.4,0.1,31,51,MISSED,33.0
'85 Knicks,Bernard King,SF,23,32.9,5.8,3.7,34,57.0,0.195,46,28,Elite Shot Creator,Knicks,1.5,0.3,24,58,MISSED,37.5
'85 Nuggets,Calvin Natt,SF,13,23.3,7.1,2.6,24,57.0,0.15,38,30,Shot Creator,Nuggets,1.2,0.5,52,30,CF,34.1
'85 Nuggets,Fat Lever,PG,15,12.9,5.5,6.4,19,51.0,0.13,34,38,Floor General,Nuggets,2.4,0.3,52,30,CF,31.2
'86 Bucks,Paul Pressey,SF,16,14.3,5.0,7.8,19,54.3,0.142,38,42,Secondary Playmaker,Bucks,2.4,0.6,57,25,CF,33.8
'86 Bucks,Ricky Pierce,SG,14,16.5,3.2,3.0,22,57.0,0.140,36,28,Off-Ball Sniper,Bucks,0.8,0.2,57,25,CF,26.5
'86 Bucks,Sidney Moncrief,SG,16,20.2,4.6,4.9,21,57.5,0.155,37,49,Elite 3&D Wing,Bucks,1.4,0.3,57,25,CF,35.2
'86 Bucks,Terry Cummings,PF,16,23.6,9.8,2.2,25,53.5,0.145,40,30,Post Scorer,Bucks,1,0.7,57,25,CF,32.5
'86 Celtics,Danny Ainge,SG,13,10.7,2.9,4.7,18,55.0,0.095,30,31,Off-Ball Sniper,Celtics,1.6,0.2,67,15,CHAMPION,30.1
'86 Celtics,Dennis Johnson,PG,18,15.6,4.2,6.1,22,52.5,0.125,35,46,Secondary Playmaker,Celtics,1.5,0.4,67,15,CHAMPION,35.0
'86 Celtics,Kevin McHale,PF,24,21.3,8.1,2.6,25,62.3,0.214,40,40,Elite Post Scorer,Celtics,0.9,2,67,15,CHAMPION,35.3
'86 Celtics,Larry Bird,SF/PF,30,25.8,9.8,6.8,27,58.0,0.244,49,44,Generational Playmaker,Celtics,1.8,0.6,67,15,CHAMPION,38.0
'86 Celtics,Robert Parish,C,18,16.1,9.5,1.8,20,58.4,0.168,38,44,Two-Way Anchor,Celtics,0.7,1.6,67,15,CHAMPION,31.7
'86 Hawks,Glenn Rivers,PG,11,11.0,3.0,6.2,17,51.0,0.105,30,34,Secondary Playmaker,Hawks,2.2,0.3,50,32,R2,29.6
'86 Hawks,Kevin Willis,PF,13,12.5,8.5,1.2,18,52.0,0.115,30,32,Post Scorer,Hawks,0.5,0.8,50,32,R2,28.0
'86 Hawks,Randy Wittman,SG,9,10.5,2.8,2.5,16,55.0,0.095,28,28,Off-Ball Sniper,Hawks,0.8,0.1,50,32,R2,34.1
'86 Mavericks,Rolando Blackman,SG,16,21.5,4.1,3.0,23,56.5,0.155,38,32,Off-Ball Sniper,Mavericks,1,0.2,44,38,R2,34.0
'86 Rockets,Hakeem Olajuwon,C,27,23.5,11.5,2.0,25,56.5,0.248,44,49,Elite Post Scorer,Rockets,2.1,3.4,51,31,FINALS,36.3
'86 Bullets,Manute Bol,C,4,3.7,6.0,0.3,12,49.0,0.080,12,48,Enforcer,Wizards,0.4,5,39,43,R1,26.1
'86 Pistons,Vinnie Johnson,SG,14,16.2,2.6,3.3,22,54.0,0.130,34,32,Shot Creator,Pistons,0.7,0.2,46,36,R1,25.0
'87 Bucks,Terry Cummings,PF,17,20.8,8.5,2.5,24,53.0,0.14,38,32,Post Scorer,Bucks,1,0.6,50,32,R2,33.8
'87 Celtics,Danny Ainge,SG,13,10.3,2.9,4.0,19,54.5,0.090,30,29,Off-Ball Sniper,Celtics,1.6,0.2,59,23,FINALS,35.2
'87 Celtics,Dennis Johnson,PG,17,15.0,4.0,7.1,20,53.5,0.120,35,46,Secondary Playmaker,Celtics,1.3,0.3,59,23,FINALS,37.1
'87 Celtics,Kevin McHale,PF,21,26.1,9.9,2.4,24,59.4,0.226,41,40,Elite Post Scorer,Celtics,0.8,1.5,59,23,FINALS,39.7
'87 Lakers,Magic Johnson,PG/SF,30,23.9,6.3,12.2,24,60.2,0.263,49,38,Generational Playmaker,Lakers,1.7,0.4,65,17,CHAMPION,36.3
'87 Lakers,Michael Cooper,SG,12,10.5,3.1,4.7,15,53.5,0.095,32,48,Elite Lockdown Defender,Lakers,1.6,0.5,65,17,CHAMPION,27.5
'87 Lakers,Byron Scott,SG,14,17.0,3.4,3.8,20,57.8,0.148,40,34,Off-Ball Sniper,Lakers,1.1,0.2,65,17,CHAMPION,33.3
'87 Pacers,Chuck Person,SF,14,18.8,6.2,2.6,24,55.5,0.115,38,28,Off-Ball Sniper,Pacers,1,0.3,41,41,R1,36.0
'87 Warriors,Sleepy Floyd,PG,14,18.5,4.1,10.3,22,54.0,0.140,37,30,Secondary Playmaker,Warriors,1.7,0.2,42,40,R2,37.4
'87 SuperSonics,Dale Ellis,SG,15,24.9,4.6,2.7,25,58.5,0.15,40,26,Off-Ball Sniper,Sonics,1.1,0.2,39,43,CF,37.5
'87 SuperSonics,Tom Chambers,PF,16,23.3,6.4,2.4,26,55.0,0.13,40,26,Shot Creator,Sonics,1,0.6,39,43,CF,36.8
'88 Trail Blazers,Kiki Vandeweghe,SF,16,20.2,3.4,2.0,24,58.5,0.14,38,24,Off-Ball Sniper,Blazers,0.7,0.3,53,29,R1,28.1
'88 Cavaliers,Larry Nance,PF,17,15.5,7.8,2.4,19,60.0,0.165,34,46,Two-Way Anchor,Cavaliers,0.9,2.2,42,40,R1,33.6
'88 Hawks,Dominique Wilkins,SF,23,30.7,6.4,2.9,31,57.0,0.180,46,34,Elite Shot Creator,Hawks,1.6,0.5,50,32,R2,37.8
'88 Hawks,Mike McGee,SG,9,10.8,2.5,1.8,18,53.0,0.085,30,26,Off-Ball Sniper,Hawks,0.6,0.1,50,32,R2,10.6
'88 Hawks,Spud Webb,PG,10,11.2,2.4,5.4,18,53.5,0.100,30,28,Secondary Playmaker,Hawks,1,0.1,50,32,R2,16.4
'88 Knicks,Mark Jackson,PG,14,13.6,3.6,10.6,15.5,50.5,0.121,38,30,Floor General,Knicks,1.9,0.1,38,44,R1,39.6
'88 Lakers,James Worthy,SF,24,19.7,5.2,3.0,24,56.1,0.141,46,42,Elite Shot Creator,Lakers,1.4,0.6,62,20,CHAMPION,35.4
'89 Sixers,Mike Gminski,C,11,12.5,7.5,1.0,17,55.5,0.125,28,34,Post Scorer,76ers,0.5,1,46,36,R1,33.4
'89 Sixers,Ron Anderson,SF,12,15.5,4.2,2.0,20,55.5,0.115,34,26,Off-Ball Sniper,76ers,0.7,0.3,46,36,R1,31.9
'89 Bucks,Terry Cummings,PF,16,22.0,9.5,2.2,24,53.0,0.145,38,32,Post Scorer,Bucks,1,0.6,49,33,R2,35.3
'89 Cavs,Larry Nance,PF,21,17.2,8.0,2.2,20,59.5,0.190,38,46,Two-Way Anchor,Cavaliers,1.1,2.6,57,25,R1,34.6
'89 Hawks,Doc Rivers,PG,13,12.1,3.1,6.8,19,51.5,0.115,32,36,Secondary Playmaker,Hawks,1.7,0.4,52,30,R1,32.4
'89 Pistons,Bill Laimbeer,C,12,11.5,9.6,2.0,15,50.5,0.090,28,40,Stretch Big,Pistons,0.5,0.6,63,19,CHAMPION,32.6
'89 Pistons,Joe Dumars,SG,17,17.2,2.5,5.7,21,53.0,0.165,34,48,Elite Lockdown Defender,Pistons,1.2,0.2,63,19,CHAMPION,34.9
'89 Pistons,Vinnie Johnson,SG,12,13.8,2.9,3.4,22,52.0,0.095,34,32,Shot Creator,Pistons,0.7,0.2,63,19,CHAMPION,25.3
'90 Blazers,Clyde Drexler,SG,24,23.3,6.5,5.9,27,55.5,0.190,43,36,Elite Shot Creator,Blazers,2.1,0.7,59,23,FINALS,36.8
'90 Blazers,Terry Porter,PG,18,16.0,4.0,8.8,20,60.5,0.200,41,36,Elite Playmaker,Blazers,1.1,0.1,59,23,FINALS,34.8
'90 Pistons,Bill Laimbeer,C,13,10.4,9.4,1.7,15,51.5,0.095,28,42,Stretch Big,Pistons,0.5,0.5,59,23,CHAMPION,33.0
'90 Pistons,Dennis Rodman,PF,14,8.8,9.7,0.9,10,54.0,0.095,30,48,Elite Enforcer,Pistons,0.9,1.4,59,23,CHAMPION,29.0
'90 Pistons,Isiah Thomas,PG,26,18.2,3.2,9.4,28,51.3,0.160,46,38,Elite Playmaker,Pistons,1.9,0.2,59,23,CHAMPION,37.0
'90 Pistons,Joe Dumars,SG,18,17.8,2.8,4.9,22,53.5,0.155,35,44,Lockdown Defender,Pistons,1,0.2,59,23,CHAMPION,34.4
'90 Pistons,Mark Aguirre,SF,15,14.4,4.4,2.4,22,50.8,0.095,36,28,Shot Creator,Pistons,0.7,0.2,59,23,CHAMPION,25.7
'90 Warriors,Chris Mullin,SF,20,25.1,5.1,4.2,26,58.5,0.170,42,28,Elite Shot Creator,Warriors,1.6,0.2,37,45,MISSED,36.3
'90 Warriors,Mitch Richmond,SG,18,22.0,5.2,3.0,25,55.0,0.140,40,28,Shot Creator,Warriors,1.4,0.3,37,45,MISSED,35.9
'90 Warriors,Rod Higgins,SF,9,9.5,4.2,1.8,15,54.0,0.095,28,30,3&D Wing,Warriors,0.7,0.4,37,45,MISSED,24.3
'91 Blazers,Terry Porter,PG,20,17.0,3.5,8.0,21,63.2,0.220,42,38,Elite Playmaker,Blazers,1,0.2,63,19,CF,32.9
'91 Bulls,Horace Grant,PF,14,12.0,8.4,2.8,17,54.0,0.130,34,40,Enforcer,Bulls,1,0.8,61,21,CHAMPION,33.9
'91 Bulls,Michael Jordan,SG,30,31.5,6.0,5.5,33,60.5,0.321,50,48,Elite Shot Creator,Bulls,2.7,1,61,21,CHAMPION,37.0
'91 Bulls,Scottie Pippen,SF,21,17.8,7.3,6.2,21,54.0,0.160,39,44,3&D Wing,Bulls,2.4,1,61,21,CHAMPION,36.8
'91 Jazz,John Stockton,PG,24,17.2,2.6,14.2,21,60.5,0.215,44,36,Elite Playmaker,Jazz,2.7,0.2,54,28,CF,37.8
'91 Jazz,Karl Malone,PF,24,29.0,11.8,2.8,30,57.5,0.235,42,40,Elite Post Scorer,Jazz,1.1,0.9,54,28,CF,40.3
'91 Spurs,David Robinson,C,26,25.6,12.5,2.0,28,58.5,0.245,42,44,Elite Enforcer,Spurs,1.5,3.9,55,27,R1,37.7
'91 Warriors,Chris Mullin,SF,22,25.7,5.6,4.0,27,59.0,0.18,42,28,Elite Shot Creator,Warriors,1.8,0.3,44,38,R2,40.4
'91 Warriors,Mitch Richmond,SG,18,23.9,5.9,3.1,26,55.5,0.145,40,30,Shot Creator,Warriors,1.3,0.3,44,38,R2,39.3
'92 Warriors,Tim Hardaway,PG,18,23.4,3.3,9.7,24,55.0,0.150,41,34,Elite Playmaker,Warriors,1.7,0.2,55,27,R1,41.1
'91 Bullets,Bernard King,SF,17,24.0,5.2,2.2,28,55.0,0.145,46,24,Elite Shot Creator,Wizards,0.9,0.2,30,52,MISSED,37.5
'91 Bullets,Harvey Grant,SF,11,12.0,5.5,1.8,17,53.0,0.110,30,34,3&D Wing,Wizards,1.2,0.7,30,52,MISSED,36.9
'91 Bullets,LaBradford Smith,PG,10,11.5,2.5,4.5,18,52.0,0.090,30,28,Shot Creator,Wizards,1.2,0.2,30,52,MISSED,14.8
'92 Blazers,Clyde Drexler,SG,25,24.4,6.6,6.6,27,57.0,0.200,44,38,Elite Shot Creator,Blazers,1.8,0.6,57,25,FINALS,36.2
'92 Bucks,Dale Ellis,SG,13,18.5,3.8,2.0,23,57.5,0.125,36,28,Off-Ball Sniper,Bucks,1,0.2,31,51,MISSED,27.0
'92 Bulls,Michael Jordan,SG,30,30.1,6.4,6.1,31,57.9,0.274,50,50,Elite Shot Creator,Bulls,2.3,0.8,67,15,CHAMPION,38.8
'92 Bulls,Scottie Pippen,SF,24,21.0,7.7,7.0,23,55.5,0.185,41,46,Elite Lockdown Defender,Bulls,1.9,0.9,67,15,CHAMPION,38.6
'92 Cavs,Brad Daugherty,C,22,21.5,10.4,3.6,22,60.5,0.200,42,38,Elite Post Scorer,Cavaliers,0.8,0.8,57,25,CF,36.2
'92 Cavs,Chucky Brown,PF,8,9.5,6.5,1.0,14,53.5,0.095,24,32,Enforcer,Cavaliers,0.6,0.3,57,25,CF,8.3
'92 Cavs,John Battle,SG,9,10.5,2.0,2.5,17,56.0,0.095,30,26,Off-Ball Sniper,Cavaliers,0.8,0.1,57,25,CF,21.5
'92 Cavaliers,Mark Price,PG,21,17.3,2.4,7.4,23,60.5,0.205,42,30,Elite Playmaker,Cavaliers,1.4,0.1,57,25,CF,29.7
'92 Clippers,Danny Manning,PF,17,19.2,7.5,3.0,25,54.5,0.140,38,30,Post Scorer,Clippers,1.3,1.1,45,37,R1,35.4
'92 SuperSonics,Ricky Pierce,SG,13,17.6,2.3,2.9,24,57.0,0.130,38,26,Off-Ball Sniper,Sonics,0.9,0.2,47,35,R1,34.1
'92 SuperSonics,Shawn Kemp,PF,16,15.5,10.4,1.3,21,57.5,0.185,34,36,Rim Runner,Sonics,1.1,1.8,47,35,R1,28.3
'93 Blazers,Clifford Robinson,PF,18,19.1,6.6,2.2,22,54.0,0.110,38,40,Stretch Big,Blazers,1,1.5,51,31,R1,31.4
'93 Bulls,Scottie Pippen,SF,23,18.6,7.7,6.3,22,54.5,0.175,40,46,Elite Lockdown Defender,Bulls,1.8,0.9,57,25,CHAMPION,38.6
'93 Cavs,Gerald Wilkins,SG,11,14.5,3.5,3.5,20,51.5,0.095,32,30,Shot Creator,Cavaliers,1.3,0.3,54,28,R2,26.0
'93 Cavs,Mark Price,PG,22,18.2,2.7,8.0,24,60.5,0.210,43,32,Elite Playmaker,Cavaliers,1.4,0.1,54,28,R2,31.7
'93 Hornets,Alonzo Mourning,C,21,21.0,10.3,1.0,26,54.0,0.190,38,46,Elite Enforcer,Hornets,0.7,3.5,44,38,R2,33.9
'93 Hornets,Larry Johnson,PF,24,22.1,10.5,4.3,23,57.5,0.180,44,36,Elite Post Scorer,Hornets,1,0.4,44,38,R2,40.5
'93 Jazz,John Stockton,PG,24,15.1,2.8,12.0,18,63.0,0.225,44,36,Elite Playmaker,Jazz,2.5,0.2,47,35,R1,34.9
'93 Jazz,Karl Malone,PF,24,27.0,11.2,4.2,29,58.5,0.225,42,41,Elite Post Scorer,Jazz,1.4,0.9,47,35,R1,37.8
'93 Knicks,Charles Oakley,PF,10,10.0,10.7,2.3,14,50.0,0.085,26,42,Enforcer,Knicks,1,0.5,60,22,CF,27.2
'93 Knicks,John Starks,SG,12,15.6,2.5,4.2,23,52.0,0.095,36,36,Shot Creator,Knicks,1.9,0.3,60,22,CF,31.0
'93 Magic,Nick Anderson,SG,13,15.9,5.7,3.0,22,53.5,0.115,34,28,Shot Creator,Magic,1.6,0.7,41,41,MISSED,37.0
'93 Magic,Shaquille O'Neal,C,28,23.4,13.9,1.9,28,56.0,0.245,44,42,Elite Post Scorer,Magic,0.7,3.5,41,41,MISSED,37.9
'93 Nets,Drazen Petrovic,SG,18,22.3,3.5,3.0,25,60.0,0.185,42,28,Elite Shot Creator,Nets,1.1,0.1,43,39,R1,38.0
'93 Nets,Kevin Edwards,SG,9,12.0,3.5,2.8,19,51.5,0.090,30,28,Shot Creator,Nets,1,0.2,43,39,R1,33.3
'93 Pacers,Vern Fleming,PG,11,11.8,4.5,5.5,17,56.0,0.130,32,32,Secondary Playmaker,Pacers,1,0.2,41,41,R1,20.0
'93 Sonics,Eddie Johnson,SF,12,15.4,3.5,2.1,22,55.0,0.11,36,26,Off-Ball Sniper,Sonics,0.8,0.2,55,27,CF,22.8
'93 SuperSonics,Gary Payton,PG,16,13.5,3.4,4.9,20,53.5,0.150,35,42,Lockdown Defender,Sonics,2.2,0.2,55,27,CF,31.1
'93 Sonics,Kendall Gill,SG,12,14.0,4.0,3.4,21,52.0,0.11,34,34,Shot Creator,Sonics,1.8,0.4,55,27,CF,30.8
'93 Spurs,David Robinson,C,25,23.4,11.7,2.4,26,57.5,0.230,42,44,Elite Enforcer,Spurs,1.7,3.9,49,33,R2,39.2
'93 Suns,Cedric Ceballos,SF,13,12.5,4.5,1.0,19,59.5,0.130,32,24,Rim Runner,Suns,0.9,0.5,62,20,FINALS,21.7
'93 Suns,Charles Barkley,PF,29,25.6,12.2,5.1,26,59.6,0.242,48,44,Elite Post Scorer,Suns,1.6,1,62,20,FINALS,37.6
'93 Suns,Dan Majerle,SG,12,15.9,4.8,3.2,20,58.2,0.170,34,36,3&D Wing,Suns,1.5,0.4,62,20,FINALS,39.0
'93 Suns,Frank Johnson,PG,9,8.5,2.5,5.5,14,54.5,0.105,28,28,Floor General,Suns,0.8,0.1,62,20,FINALS,14.6
'93 Suns,Kevin Johnson,PG,20,16.1,2.1,7.8,26,59.2,0.190,42,33,Elite Playmaker,Suns,2.1,0.2,62,20,FINALS,33.5
'94 76ers,Shawn Bradley,C,1,7.7,6.2,0.5,17,47.0,0.050,16,30,Enforcer,76ers,0.5,3.4,25,57,MISSED,28.3
'94 Clippers,Loy Vaught,PF,11,13.8,10.5,1.2,17,56.0,0.150,28,36,Enforcer,Clippers,0.9,1.1,27,55,MISSED,28.2
'94 Hawks,Craig Ehlo,SG,9,9.2,3.5,3.0,15,52.5,0.095,28,32,3&D Wing,Hawks,1,0.2,57,25,R2,26.2
'94 Hawks,Stacey Augmon,SF,11,12.5,5.0,2.6,16,54.0,0.115,28,40,3&D Wing,Hawks,1.5,0.8,57,25,R2,31.8
'94 Hornets,Dell Curry,SG,16,16.3,3.2,2.7,24,56.0,0.120,38,28,Elite Off-Ball Sniper,Hornets,1.2,0.2,41,41,R1,26.5
'94 Hornets,Muggsy Bogues,PG,14,10.8,4.1,10.1,14,53.5,0.130,34,36,Floor General,Hornets,2.1,0.1,41,41,R1,35.7
'94 Knicks,Anthony Mason,SF,10,7.2,5.8,2.1,14,55.5,0.115,28,38,Glue Guy,Knicks,1.3,0.5,57,25,FINALS,26.1
'94 Knicks,Charles Oakley,PF,11,8.0,11.7,2.3,14,49.0,0.085,24,44,Enforcer,Knicks,1,0.5,57,25,FINALS,35.8
'94 Knicks,Derek Harper,PG,15,12.5,2.7,5.2,20,52.0,0.095,32,35,Secondary Playmaker,Knicks,1.5,0.2,57,25,FINALS,24.3
'94 Knicks,John Starks,SG,12,14.5,2.5,3.9,22,52.9,0.110,36,40,Shot Creator,Knicks,1.9,0.3,57,25,FINALS,34.9
'94 Knicks,Patrick Ewing,C,27,24.5,11.2,2.0,28,53.6,0.177,46,44,Elite Post Scorer,Knicks,1,2.9,57,25,FINALS,37.6
'94 Nets,Benoit Benjamin,C,10,10.5,7.8,1.2,17,52.0,0.100,26,34,Post Scorer,Nets,0.6,1.5,45,37,R1,23.6
'94 Nets,Derrick Coleman,PF,20,20.2,10.3,3.3,23,52.5,0.140,40,32,Elite Post Scorer,Nets,1.4,1.2,45,37,R1,36.1
'94 Nets,Kenny Anderson,PG,14,18.8,3.0,9.6,24,52.5,0.120,38,28,Elite Playmaker,Nets,2.2,0.2,45,37,R1,38.2
'94 Nuggets,Mahmoud Abdul-Rauf,PG,14,18.0,1.9,4.2,25,52.0,0.11,38,26,Shot Creator,Nuggets,1.4,0.2,42,40,R2,32.7
'94 Pacers,Haywoode Workman,PG,8,9.5,3.8,7.2,16,50.5,0.085,28,30,Secondary Playmaker,Pacers,1.5,0.1,47,35,CF,26.4
'94 Pacers,Pooh Richardson,PG,10,12.5,3.5,7.0,18,52.0,0.095,32,28,Floor General,Pacers,1.5,0.2,47,35,CF,27.6
'94 Rockets,Hakeem Olajuwon,C,30,27.3,11.9,3.6,29,56.5,0.210,49,49,Elite Enforcer,Rockets,1.6,3.7,58,24,CHAMPION,41.0
'94 Rockets,Kenny Smith,PG,14,12.5,2.7,6.0,19,54.0,0.095,31,28,Secondary Playmaker,Rockets,1.2,0.1,58,24,CHAMPION,28.3
'94 Rockets,Otis Thorpe,PF,15,12.7,9.3,2.4,19,55.0,0.120,33,38,Post Scorer,Rockets,1,0.7,58,24,CHAMPION,35.5
'94 Rockets,Robert Horry,SF/PF,11,7.7,5.6,2.5,14,51.5,0.110,28,38,3&D Wing,Rockets,1.5,1.4,58,24,CHAMPION,29.3
'94 Rockets,Vernon Maxwell,SG,13,12.0,2.6,2.8,21,48.0,0.070,32,33,Shot Creator,Rockets,1.7,0.2,58,24,CHAMPION,34.3
'94 SuperSonics,Gary Payton,PG,18,16.5,3.3,6.0,22,54.0,0.160,36,44,Lockdown Defender,Sonics,2.3,0.4,63,19,R1,36.7
'94 Warriors,Latrell Sprewell,SG,17,21.0,4.5,4.2,25,52.5,0.130,40,30,Shot Creator,Warriors,2,0.7,50,32,R1,38.2
'94 Bullets,Tom Gugliotta,PF,14,17.5,9.5,3.5,21,53.5,0.140,34,30,Secondary Playmaker,Wizards,1.3,0.9,24,58,MISSED,35.7
'95 Bucks,Vin Baker,PF,16,17.7,8.3,2.2,23,53.0,0.135,36,34,Post Scorer,Bucks,0.9,1.5,34,48,MISSED,35.7
'95 Bulls,B.J. Armstrong,PG,11,13.0,2.3,4.2,17,57.5,0.115,34,28,Off-Ball Sniper,Bulls,1,0.1,47,35,R2,32.5
'95 Bulls,Luc Longley,C,9,8.0,5.2,2.0,15,52.0,0.095,30,38,Post Scorer,Bulls,0.5,0.8,47,35,R2,22.9
'95 Cavaliers,Brad Daugherty,C,18,17.6,9.6,3.2,21,59.5,0.175,40,36,Elite Post Scorer,Cavaliers,0.8,1,43,39,R1,29.4
'95 Cavaliers,Tyrone Hill,PF,10,13.8,10.9,1.0,16,55.0,0.135,30,38,Enforcer,Cavaliers,0.7,1,43,39,R1,31.7
'95 Knicks,Patrick Ewing,C,25,24.4,10.9,2.3,27,52.5,0.170,44,42,Elite Post Scorer,Knicks,1,2.1,55,27,R2,36.9
'95 Magic,Anfernee Hardaway,PG/SG,23,20.9,4.4,7.2,27,58.0,0.180,42,38,Elite Playmaker,Magic,1.7,0.3,57,25,FINALS,37.5
'95 Magic,Horace Grant,PF,14,12.0,7.8,2.4,16,54.5,0.130,32,40,Enforcer,Magic,1.2,0.8,57,25,FINALS,35.3
'95 Rockets,Clyde Drexler,SG,17,21.0,6.0,4.5,24,54.0,0.150,40,36,Elite Shot Creator,Rockets,1.9,0.5,47,35,CHAMPION,35.5
'95 Rockets,Robert Horry,PF,11,10.2,5.1,3.4,15,52.5,0.111,32,38,Stretch Big,Rockets,1.5,1.1,47,35,CHAMPION,35.9
'95 Sonics,Detlef Schrempf,SF,20,19.2,6.2,3.8,21,64.0,0.200,41,36,Secondary Playmaker,Sonics,1.1,0.3,57,25,R1,33.1
'95 Sonics,Hersey Hawkins,SG,14,16.0,3.8,3.2,21,58.5,0.125,37,36,3&D Wing,Sonics,1.6,0.2,57,25,R1,33.2
'95 SuperSonics,Nate McMillan,PG,9,8.5,4.5,7.6,13,51.5,0.085,30,42,Lockdown Defender,Sonics,1.8,0.2,57,25,R1,28.6
'95 Sonics,Sarunas Marciulionis,SG,12,14.2,2.2,3.3,22,59.5,0.145,38,28,Shot Creator,Sonics,1,0.1,57,25,R1,20.7
'95 Spurs,David Robinson,C,29,27.6,10.8,2.9,28,60.2,0.273,43,43,Elite Enforcer,Spurs,1.65,3.2,62,20,CF,38.0
'95 Timberwolves,Isaiah Rider,SG,14,20.4,3.3,3.3,26,53.0,0.110,38,26,Shot Creator,Timberwolves,1,0.3,21,61,MISSED,35.8
'96 Bulls,Bill Wennington,C,3,5.3,2.5,0.6,13,51.5,0.100,30,26,Post Scorer,Bulls,0.3,0.6,72,10,CHAMPION,14.6
'96 Bulls,Dennis Rodman,PF,20,5.5,14.9,2.5,10,54.3,0.120,30,49,Elite Enforcer,Bulls,0.6,0.4,72,10,CHAMPION,32.6
'96 Bulls,Jud Buechler,SF,2,3.8,1.5,0.8,11,54.0,0.100,28,28,Off-Ball Sniper,Bulls,0.5,0.2,72,10,CHAMPION,12.7
'96 Bulls,Luc Longley,C,8,9.1,5.1,1.9,16,51.5,0.105,32,40,Post Scorer,Bulls,0.4,0.9,72,10,CHAMPION,26.9
'96 Bulls,Michael Jordan,SG,30,30.4,6.6,4.3,33,58.2,0.317,50,50,Elite Shot Creator,Bulls,2.2,0.5,72,10,CHAMPION,37.7
'96 Bulls,Ron Harper,PG,10,7.4,2.7,2.6,13,53.1,0.110,28,46,Lockdown Defender,Bulls,1.1,0.3,72,10,CHAMPION,26.9
'96 Bulls,Scottie Pippen,SF,24,19.4,6.4,5.9,23,55.1,0.194,42,48,Floor General,Bulls,1.9,0.6,72,10,CHAMPION,36.7
'96 Bulls,Steve Kerr,PG,10,8.4,1.3,2.3,12,66.7,0.180,33,24,Off-Ball Sniper,Bulls,0.7,0.1,72,10,CHAMPION,24.5
'96 Bulls,Toni Kukoc,SF,18,13.1,4.0,3.5,20,58.9,0.200,42,34,Secondary Playmaker,Bulls,1.1,0.3,72,10,CHAMPION,28.7
'96 Cavaliers,Terrell Brandon,PG,16,19.3,3.3,6.5,23,56.0,0.155,40,32,Floor General,Cavaliers,1.8,0.2,47,35,R1,35.7
'96 Heat,Bimbo Coles,PG,8,9.5,2.5,5.0,17,52.0,0.085,28,30,Secondary Playmaker,Heat,1.3,0.2,42,40,R1,35.2
'96 Jazz,Jeff Hornacek,SG,16,12.5,3.0,4.5,18,57.0,0.120,36,30,Off-Ball Sniper,Jazz,1.1,0.1,55,27,CF,33.6
'96 Knicks,Allan Houston,SG,16,16.5,3.2,2.5,22,56.0,0.105,36,30,Off-Ball Sniper,Knicks,0.9,0.2,47,35,R2,35.4
'96 Magic,Anfernee Hardaway,PG/SG,20,21.7,4.5,7.1,26,56.0,0.160,42,36,Elite Playmaker,Magic,1.7,0.3,60,22,CF,36.7
'96 Magic,Shaquille O'Neal,C,29,26.6,11.0,3.0,28,59.3,0.262,48,44,Elite Post Scorer,Magic,0.6,2.1,60,22,CF,36.0
'96 Pacers,Reggie Miller,SG,22,17.6,2.6,2.1,22,60.5,0.158,40,34,Elite Off-Ball Sniper,Pacers,1.1,0.2,52,30,R1,36.0
'96 Rockets,Mario Elie,SF,11,11.7,3.7,3.0,16,57.5,0.13,32,36,3&D Wing,Rockets,1.2,0.2,48,34,R2,32.9
'96 SuperSonics,Gary Payton,PG,24,19.3,4.3,7.5,26,56.3,0.207,36,50,Elite Lockdown Defender,Sonics,2.9,0.2,64,18,FINALS,36.9
'96 SuperSonics,Shawn Kemp,PF,23,19.6,11.4,1.8,25,63.1,0.235,35,39,Elite Rim Runner,Sonics,1.5,1.3,64,18,FINALS,33.7
'96 Bullets,Gheorghe Muresan,C,11,14.5,9.6,0.5,22,60.0,0.130,28,34,Post Scorer,Wizards,0.3,3.5,39,43,MISSED,26.6
'97 Bucks,Vin Baker,PF,17,21.1,9.1,2.4,25,53.5,0.145,38,32,Post Scorer,Bucks,1.1,1.6,33,49,MISSED,38.4
'97 Bulls,Steve Kerr,PG,9,7.8,1.3,2.0,11,65.0,0.160,32,24,Off-Ball Sniper,Bulls,0.6,0.1,69,13,CHAMPION,24.5
'97 Bulls,Toni Kukoc,SF,16,13.1,5.0,4.0,20,59.0,0.190,42,30,Secondary Playmaker,Bulls,1.2,0.4,69,13,CHAMPION,29.8
'97 Cavaliers,Bobby Phills,SG,10,13.5,3.5,3.2,18,52.5,0.105,32,36,3&D Wing,Cavaliers,1.6,0.3,42,40,MISSED,35.8
'97 Cavaliers,Terrell Brandon,PG,17,19.5,3.9,6.3,23,56.5,0.160,41,32,Floor General,Cavaliers,2,0.2,42,40,MISSED,37.3
'97 Hawks,Christian Laettner,PF,13,12.8,6.5,2.0,18,54.0,0.110,32,30,Stretch Big,Hawks,0.9,0.9,56,26,R2,33.1
'97 Hawks,Mookie Blaylock,PG,13,14.4,4.0,5.9,20,51.0,0.12,34,40,Lockdown Defender,Hawks,2.6,0.2,56,26,R2,39.2
'97 Hawks,Steve Smith,SG,14,20.1,3.5,3.0,24,56.0,0.13,38,32,Shot Creator,Hawks,1.4,0.3,56,26,R2,39.1
'97 Heat,P.J. Brown,PF,11,9.8,8.2,1.5,14,52.5,0.120,26,40,Enforcer,Heat,0.8,1.5,61,21,CF,32.4
'97 Heat,Tim Hardaway,PG,23,20.3,3.4,8.6,26,55.0,0.180,39,32,Elite Playmaker,Heat,1.7,0.2,61,21,CF,38.7
'97 Heat,Voshon Lenard,SG,10,14.0,2.9,2.0,21,53.0,0.09,34,30,Off-Ball Sniper,Heat,0.9,0.2,61,21,CF,28.9
'97 Hornets,Alonzo Mourning,C,23,19.5,10.4,1.7,25,55.5,0.200,38,47,Elite Enforcer,Hornets,0.9,2.9,54,28,R2,35.2
'97 Hornets,Glen Rice,SF,20,22.3,4.8,2.1,25,56.5,0.140,42,28,Elite Off-Ball Sniper,Hornets,1.1,0.3,54,28,R2,42.6
'97 Jazz,Bryon Russell,SF,11,10.0,4.6,1.8,16,49.5,0.085,30,38,3&D Wing,Jazz,1,0.4,64,18,FINALS,31.2
'97 Jazz,Greg Ostertag,C,9,5.4,6.1,0.5,12,52.0,0.060,21,38,Rim Runner,Jazz,0.4,1.8,64,18,FINALS,23.6
'97 Jazz,Jeff Hornacek,SG,18,14.5,3.4,4.5,19,58.0,0.130,38,30,Off-Ball Sniper,Jazz,1,0.1,64,18,FINALS,31.6
'97 Jazz,John Stockton,PG,26,14.4,2.9,10.5,18,65.6,0.234,44,38,Elite Playmaker,Jazz,2.9,0.2,64,18,FINALS,35.3
'97 Jazz,Karl Malone,PF,27,27.4,9.9,4.5,31,60.0,0.268,41,40,Elite Post Scorer,Jazz,1.4,0.7,64,18,FINALS,36.6
'97 Knicks,Patrick Ewing,C,22,22.4,11.0,1.7,26,52.0,0.160,42,40,Elite Post Scorer,Knicks,0.9,2,57,25,R2,37.0
'97 Magic,Anfernee Hardaway,PG/SG,19,20.4,4.5,6.5,25,56.5,0.150,41,36,Elite Playmaker,Magic,1.7,0.3,45,37,R1,37.6
'97 Pistons,Grant Hill,SF,23,21.4,9.0,7.3,26,56.0,0.196,42,40,Elite Playmaker,Pistons,1.8,0.6,54,28,R1,39.3
'97 Sonics,Detlef Schrempf,SF,15,16.5,7.6,4.4,20,60.5,0.165,40,32,Secondary Playmaker,Sonics,1,0.4,57,25,R2,35.9
'97 Sonics,Hersey Hawkins,SG,13,14.5,4.0,3.5,19,57.5,0.115,36,34,3&D Wing,Sonics,1.5,0.3,57,25,R2,33.6
'97 Timberwolves,Joe Smith,PF,2,11.4,5.9,1.0,21,49.0,0.060,24,24,Post Scorer,Timberwolves,0.9,1.6,40,42,R1,38.6
'97 Timberwolves,Stacey King,C,8,7.5,5.5,1.0,14,52.0,0.085,22,32,Enforcer,Timberwolves,0.3,0.5,40,42,R1,9.4
'97 Timberwolves,Tom Gugliotta,PF,15,20.6,9.3,3.5,22,54.0,0.155,38,30,Secondary Playmaker,Timberwolves,1.5,0.9,40,42,R1,38.7
'97 Warriors,Donyell Marshall,PF,12,13.5,7.2,1.5,20,54.5,0.105,32,28,Stretch Big,Warriors,1.1,1,30,52,MISSED,16.8
'97 Bullets,Juwan Howard,PF,14,16.6,8.5,2.5,21,52.0,0.110,34,28,Post Scorer,Wizards,1.1,0.6,44,38,R1,40.5
'98 Blazers,Arvydas Sabonis,C,19,16.0,10.0,3.0,24,56.5,0.180,40,42,Post Scorer,Blazers,0.9,1.7,46,36,R1,32.0
'98 Bucks,Glenn Robinson,SF,19,21.1,6.5,3.0,25,53.5,0.100,40,28,Shot Creator,Bucks,1.4,0.4,36,46,MISSED,41.0
'98 Bulls,Bill Wennington,C,3,3.5,1.7,0.4,12,50.5,0.075,28,24,Post Scorer,Bulls,0.2,0.5,62,20,CHAMPION,12.8
'98 Bulls,Toni Kukoc,SF,15,13.5,5.5,4.7,22,56.0,0.165,40,30,Secondary Playmaker,Bulls,1.3,0.5,62,20,CHAMPION,30.2
'98 Cavaliers,Shawn Kemp,PF,17,18.0,9.3,2.5,23,55.0,0.140,36,34,Elite Post Scorer,Cavaliers,1,1.5,47,35,R1,34.6
'98 Hornets,Bobby Phills,SG,10,12.3,3.6,2.6,18,52.0,0.1,32,36,3&D Wing,Hornets,1.7,0.3,51,31,R2,30.4
'98 Jazz,Bryon Russell,SF,8,9.3,4.2,1.9,14,55.1,0.170,30,40,3&D Wing,Jazz,1.1,0.4,62,20,FINALS,27.1
'98 Lakers,Eddie Jones,SG,18,16.9,3.8,3.0,22,56.0,0.155,38,38,3&D Wing,Lakers,2.2,0.5,61,21,CF,36.4
'98 Lakers,Nick Van Exel,PG,15,13.8,2.6,7.0,23,52.0,0.11,38,28,Shot Creator,Lakers,1.4,0.1,61,21,CF,32.1
'98 Magic,Anfernee Hardaway,PG/SG,17,16.0,4.0,5.5,22,56.0,0.130,38,34,Secondary Playmaker,Magic,1.9,0.4,41,41,MISSED,32.9
'98 Pacers,Reggie Miller,SG,20,19.5,2.9,2.6,22,60.8,0.181,45,36,Elite Off-Ball Sniper,Pacers,1.1,0.2,58,24,CF,34.5
'98 Pacers,Rik Smits,C,16,16.7,6.9,1.4,25,53.0,0.140,38,34,Post Scorer,Pacers,0.4,1.5,58,24,CF,28.6
'98 Suns,Danny Manning,PF,14,15.5,6.5,2.2,20,54.5,0.100,36,30,Post Scorer,Suns,1.1,0.5,56,26,R1,25.6
'98 Timberwolves,Sam Mitchell,SF,10,10.5,5.5,2.0,16,52.5,0.100,28,34,3&D Wing,Timberwolves,0.7,0.2,45,37,R1,27.6
'99 Trail Blazers,Brian Grant,PF,13,11.5,7.3,1.4,17,53.5,0.13,30,38,Enforcer,Blazers,0.9,0.9,35,15,CF,31.8
'99 Trail Blazers,Isaiah Rider,SG,14,13.9,3.5,2.2,24,53.0,0.1,36,28,Shot Creator,Blazers,1,0.2,35,15,CF,29.5
'99 Heat,Alonzo Mourning,C,26,20.1,11.0,1.6,27,56.4,0.231,40,49,Elite Enforcer,Heat,0.6,3.9,33,17,R1,38.1
'99 Heat,Clarence Weatherspoon,PF,11,11.5,9.5,1.5,17,52.0,0.115,26,36,Enforcer,Heat,1,0.6,33,17,R1,21.2
'99 Heat,Eddie Jones,SG,14,16.5,4.2,3.5,21,55.5,0.135,36,36,3&D Wing,Heat,2.2,0.4,33,17,R1,37.6
'99 Knicks,Latrell Sprewell,SG,16,16.4,4.2,2.5,27,53.0,0.130,38,34,Elite Shot Creator,Knicks,1.4,0.3,27,23,FINALS,33.3
'99 Knicks,Marcus Camby,C,12,7.2,5.5,0.3,14,50.5,0.095,26,44,Enforcer,Knicks,1,2.6,27,23,FINALS,20.5
'99 Lakers,Derek Fisher,PG,7,8.0,2.0,3.5,13,51.5,0.080,28,34,3&D Wing,Lakers,0.9,0.2,31,19,R2,22.6
'99 Pacers,Austin Croshere,PF,10,11.5,5.8,1.5,17,55.5,0.115,30,32,Stretch Big,Pacers,0.4,0.3,33,17,CF,9.2
'99 Pacers,Jalen Rose,SF,16,15.2,4.1,3.3,21,52.0,0.100,36,28,Shot Creator,Pacers,1.2,0.3,33,17,CF,25.3
'99 Raptors,Alvin Williams,PG,9,10.5,3.0,4.5,17,52.5,0.095,28,32,Secondary Playmaker,Raptors,0.7,0.2,23,27,MISSED,21.0
'99 Raptors,Kevin Willis,C,10,13.5,9.0,1.2,18,52.5,0.110,28,32,Post Scorer,Raptors,0.5,0.5,23,27,MISSED,29.0
'99 Raptors,Oliver Miller,C,9,8.5,7.8,2.5,14,55.5,0.110,22,34,Enforcer,Raptors,1.2,0.8,23,27,MISSED,25.4
'99 Spurs,Avery Johnson,PG,12,10.7,2.1,6.3,18,51.0,0.090,36,38,Secondary Playmaker,Spurs,1.1,0.1,37,13,CHAMPION,33.4
'99 Spurs,Tim Duncan,PF/C,29,21.2,11.4,2.4,25,53.9,0.213,42,46,Elite Enforcer,Spurs,0.7,2.5,37,13,CHAMPION,39.3
'00 Blazers,Damon Stoudamire,PG,12,13.2,2.5,6.9,21,51.0,0.095,39,30,Secondary Playmaker,Blazers,1.3,0.1,59,23,CF,30.4
'00 Blazers,Rasheed Wallace,PF,19,16.0,6.3,2.3,20,55.5,0.180,40,44,Stretch Big,Blazers,1,1.3,59,23,CF,35.1
'00 Clippers,Michael Olowokandi,C,1,9.8,8.2,0.7,18,46.0,0.040,18,28,Enforcer,Clippers,0.5,1.9,15,67,MISSED,31.2
'00 Hornets,David Wesley,PG,11,15.5,2.9,5.2,22,51.5,0.085,35,28,Secondary Playmaker,Hornets,1.4,0.2,49,33,R1,33.7
'00 Hornets,Jamal Mashburn,SF,19,20.7,6.7,5.0,26,50.0,0.110,40,28,Shot Creator,Hornets,1,0.4,49,33,R1,39.3
'00 Knicks,Allan Houston,SG,20,19.7,3.3,2.7,24,56.5,0.130,40,32,Off-Ball Sniper,Knicks,1,0.2,50,32,CF,38.6
'00 Lakers,A.C. Green,PF,6,4.3,6.7,0.5,9,55.0,0.085,22,38,Enforcer,Lakers,0.6,0.3,67,15,CHAMPION,23.5
'00 Lakers,Glen Rice,SF,15,15.9,4.1,2.2,21,55.5,0.120,42,34,Off-Ball Sniper,Lakers,0.8,0.2,67,15,CHAMPION,31.6
'00 Lakers,Kobe Bryant,SG,29,22.5,6.3,4.9,27,46.8,0.198,41,36,Shot Creator,Lakers,1.6,0.9,67,15,CHAMPION,38.2
'00 Lakers,Ron Harper,PG,5,4.5,2.0,2.5,10,51.0,0.075,26,36,Lockdown Defender,Lakers,0.7,0.2,67,15,CHAMPION,25.5
'00 Lakers,Shaquille O'Neal,C,30,29.7,13.6,3.8,31,57.8,0.283,50,46,Elite Post Scorer,Lakers,0.5,3,67,15,CHAMPION,40.0
'00 Pacers,Jalen Rose,SF,19,18.2,4.8,4.0,24,53.5,0.120,40,30,Shot Creator,Pacers,1.5,0.2,56,26,FINALS,37.2
'00 Pacers,Reggie Miller,SG,19,18.1,3.0,2.4,22,59.0,0.165,40,34,Elite Off-Ball Sniper,Pacers,1.1,0.1,56,26,FINALS,36.9
'00 Raptors,Tracy McGrady,SF,14,15.4,6.3,3.3,20,54.0,0.120,36,28,Shot Creator,Raptors,1.2,0.8,45,37,R1,31.2
'00 Raptors,Vince Carter,SF,24,25.7,5.8,3.9,28,54.3,0.165,43,34,Elite Transition Maestro,Raptors,1.5,1.1,45,37,R1,38.1
'01 76ers,Aaron McKie,SG,12,11.6,4.1,5.0,19,54.9,0.118,32,40,3&D Wing,76ers,1.7,0.3,56,26,FINALS,31.5
'01 76ers,Allen Iverson,SG/PG,27,31.1,3.8,4.6,36,51.8,0.190,45,38,Elite Shot Creator,76ers,2.5,0.2,56,26,FINALS,42.0
'01 76ers,Dikembe Mutombo,C,22,11.7,12.4,0.8,16,53.5,0.180,28,50,Elite Enforcer,76ers,0.5,2.7,56,26,FINALS,33.7
'01 76ers,Eric Snow,PG,8,9.8,3.3,7.4,14,49.5,0.072,26,34,Secondary Playmaker,76ers,1.3,0.1,56,26,FINALS,34.8
'01 Bucks,Glenn Robinson,SF,21,22.0,6.9,3.3,26,54.5,0.110,41,30,Shot Creator,Bucks,1.1,0.3,52,30,CF,37.0
'01 Bucks,Sam Cassell,PG,20,21.7,4.0,5.1,26,58.0,0.165,40,32,Shot Creator,Bucks,1.5,0.1,52,30,CF,35.6
'01 Bucks,Tim Thomas,SF,12,13.0,4.5,1.7,21,54.5,0.1,34,28,Stretch Big,Bucks,0.9,0.4,52,30,CF,27.4
'01 Kings,Chris Webber,PF,28,27.1,11.1,4.2,32,51.6,0.183,45,38,Elite Post Scorer,Kings,1.4,1.6,55,27,R2,40.5
'01 Kings,Peja Stojakovic,SF/PF,20,20.6,5.8,1.5,22,60.0,0.185,41,30,Elite Off-Ball Sniper,Kings,1.1,0.3,55,27,R2,38.7
'01 Lakers,Brian Shaw,SG,3,5.3,3.8,3.2,14,49.0,0.070,28,32,Secondary Playmaker,Lakers,0.7,0.2,56,26,CHAMPION,22.9
'01 Lakers,Derek Fisher,PG,8,11.5,3.0,4.4,15,53.5,0.115,31,37,3&D Wing,Lakers,1,0.2,56,26,CHAMPION,35.5
'01 Lakers,Kobe Bryant,SG,29,28.5,5.9,5.0,31,54.6,0.212,46,44,Elite Shot Creator,Lakers,1.7,0.6,56,26,CHAMPION,40.9
'01 Lakers,Mark Madsen,PF,2,2.0,2.2,0.3,8,50.0,0.080,20,30,Enforcer,Lakers,0.3,0.3,56,26,CHAMPION,9.2
'01 Lakers,Rick Fox,SF,10,9.6,4.0,3.2,16,52.4,0.122,31,37,3&D Wing,Lakers,1.1,0.4,56,26,CHAMPION,27.9
'01 Lakers,Robert Horry,PF,10,5.2,3.7,1.6,12,50.1,0.095,32,42,Stretch Big,Lakers,0.9,0.7,56,26,CHAMPION,20.1
'01 Lakers,Shaquille O'Neal,C,30,28.7,12.7,3.7,31,57.4,0.245,50,45,Elite Post Scorer,Lakers,0.6,2.8,56,26,CHAMPION,39.5
'01 Lakers,Tyronn Lue,PG,4,5.9,1.2,1.2,13,52.0,0.080,34,36,3&D Wing,Lakers,0.7,0.1,56,26,CHAMPION,12.3
'01 Magic,Tracy McGrady,SG/SF,25,26.8,7.5,4.6,31,54.5,0.203,44,36,Elite Shot Creator,Magic,1.6,0.7,43,39,R1,40.1
'01 Mavericks,Michael Finley,SG,20,19.9,4.8,3.5,24,53.0,0.115,39,32,Shot Creator,Mavericks,1.4,0.4,53,29,R2,42.0
'01 Nets,Kerry Kittles,SG,12,13.7,4.0,2.5,18,54.0,0.100,35,38,3&D Wing,Nets,1.5,0.3,26,56,MISSED,0.0
'01 Nets,Stephon Marbury,PG,22,23.9,3.1,7.6,28,53.0,0.130,41,28,Shot Creator,Nets,1.5,0.2,26,56,MISSED,38.2
'01 Pistons,Jerry Stackhouse,SG,24,29.8,3.9,5.1,35,52.1,0.120,43,28,Elite Shot Creator,Pistons,1.1,0.3,32,50,MISSED,40.2
'01 Raptors,Antonio Davis,C,13,11.5,9.0,1.2,17,52.0,0.120,28,38,Enforcer,Raptors,0.9,1.1,47,35,R2,35.0
'01 Raptors,Vince Carter,SF,25,27.6,5.5,3.9,30,54.5,0.175,44,32,Elite Transition Maestro,Raptors,1.5,1.1,47,35,R2,39.7
'01 Spurs,David Robinson,C,18,13.2,8.9,1.7,19,52.5,0.135,36,46,Two-Way Anchor,Spurs,0.8,2,58,24,CF,29.6
'01 Spurs,Tim Duncan,PF/C,28,22.2,12.2,3.0,26,54.0,0.228,44,48,Elite Enforcer,Spurs,0.9,2.3,58,24,CF,38.7
'02 Bucks,Ray Allen,SG,21,22.1,4.2,3.4,25,57.0,0.175,41,32,Elite Off-Ball Sniper,Bucks,1.3,0.2,41,41,MISSED,36.6
'02 Celtics,Antoine Walker,PF,22,22.1,8.8,5.0,30,48.0,0.090,32,32,Shot Creator,Celtics,1.6,0.4,49,33,CF,42.0
'02 Grizzlies,Shane Battier,SF,11,8.8,4.2,1.8,13,54.0,0.110,26,44,Elite Lockdown Defender,Grizzlies,1.3,0.7,23,59,MISSED,39.7
'02 Hornets,Jamaal Magloire,C,11,11.0,10.8,0.7,15,51.0,0.085,28,36,Enforcer,Hornets,0.5,1.4,44,38,R2,18.9
'02 Kings,Lawrence Funderburke,PF,8,9.5,5.5,0.8,15,55.0,0.11,28,34,Enforcer,Kings,0.5,0.4,61,21,R2,12.9
'02 Kings,Mike Bibby,PG,18,13.7,2.8,5.0,20,54.5,0.130,38,30,Secondary Playmaker,Kings,1.2,0.1,61,21,R2,33.2
'02 Kings,Vlade Divac,C,16,11.1,8.4,3.7,18,52.5,0.140,36,38,Floor General,Kings,0.9,0.8,61,21,R2,30.3
'02 Lakers,Rick Fox,SF,8,7.2,3.5,2.2,14,52.5,0.090,30,34,3&D Wing,Lakers,1,0.3,58,24,CHAMPION,27.9
'02 Lakers,Robert Horry,PF,8,7.0,5.5,2.0,13,51.5,0.085,30,38,Stretch Big,Lakers,0.8,0.6,58,24,CHAMPION,26.4
'02 Magic,Pat Garrity,SF,7,10.5,4.9,1.5,15,54.0,0.090,28,28,Stretch Big,Magic,0.6,0.4,43,39,R1,30.1
'02 Mavericks,Michael Finley,SG,20,20.6,5.2,3.3,24,53.5,0.120,40,34,Shot Creator,Mavericks,1.3,0.4,57,25,R2,39.9
'02 Nets,Jason Kidd,PG,19,14.7,7.3,9.9,21,47.5,0.110,38,40,Elite Playmaker,Nets,2.1,0.2,52,30,FINALS,37.3
'02 Nets,Kenyon Martin,PF,18,14.9,5.3,2.6,20,50.0,0.120,34,44,Rim Runner,Nets,1.1,1.5,52,30,FINALS,34.3
'02 Nets,Richard Jefferson,SF,14,9.4,3.7,1.8,20,58.5,0.155,34,32,Secondary Playmaker,Nets,1,0.4,52,30,FINALS,24.3
'02 Nets,Todd MacCulloch,C,8,9.6,6.1,0.8,16,58.0,0.14,26,32,Rim Runner,Nets,0.4,0.6,52,30,FINALS,24.2
'02 Pacers,Jermaine O'Neal,PF,24,19.2,9.9,2.1,27,50.5,0.145,38,43,Elite Post Scorer,Pacers,0.8,2.3,42,40,R1,37.6
'02 Rockets,Steve Francis,PG,23,21.6,7.0,6.4,28,53.0,0.140,42,32,Elite Transition Maestro,Rockets,1.7,0.3,28,54,MISSED,41.1
'02 Warriors,Antawn Jamison,PF,14,24.9,7.7,2.2,28,52.5,0.125,40,24,Post Scorer,Warriors,1.2,0.6,21,61,MISSED,37.0
'02 Warriors,Jason Richardson,SG,15,14.5,4.5,2.7,21,52.0,0.090,37,28,Shot Creator,Warriors,1,0.5,21,61,MISSED,32.9
'02 Wizards,Kwame Brown,C,1,4.5,3.5,0.4,13,46.0,0.030,15,24,Enforcer,Wizards,0.5,1.2,37,45,MISSED,14.3
'03 76ers,Allen Iverson,SG/PG,24,27.6,4.0,5.5,34,50.0,0.140,40,34,Elite Shot Creator,76ers,2.7,0.2,48,34,R2,42.5
'03 Sixers,Keith Van Horn,SF,13,14.2,6.4,1.8,21,53.0,0.085,35,30,Stretch Big,76ers,0.7,0.5,48,34,R2,31.6
'03 Blazers,Damon Stoudamire,PG,12,13.1,2.8,5.1,22,51.0,0.110,42,32,Secondary Playmaker,Blazers,1,0.1,50,32,R1,22.3
'03 Bucks,Sam Cassell,PG,18,19.5,3.8,4.8,24,57.0,0.150,40,30,Shot Creator,Bucks,1.1,0.2,42,40,R1,34.6
'03 Cavaliers,Carlos Boozer,PF,12,15.5,10.4,1.5,18,55.0,0.130,36,30,Post Scorer,Cavaliers,0.8,0.4,17,65,MISSED,25.3
'03 Celtics,Paul Pierce,SF,22,25.9,6.9,4.6,30,52.5,0.155,42,34,Shot Creator,Celtics,1.9,0.5,44,38,R1,39.2
'03 Grizzlies,Mike Miller,SF,12,13.5,5.0,2.5,19,58.0,0.130,34,30,Off-Ball Sniper,Grizzlies,1,0.3,28,54,MISSED,22.5
'03 Hornets,Baron Davis,PG,16,20.4,4.1,7.4,26,50.0,0.110,40,28,Transition Maestro,Hornets,2.4,0.4,47,35,R1,37.8
'03 Hornets,Jamaal Magloire,C,12,13.0,10.5,0.8,17,53.5,0.135,28,38,Enforcer,Hornets,0.6,1,47,35,R1,29.8
'03 Hornets,Jamal Mashburn,SF,22,21.6,6.1,5.6,27,50.5,0.130,41,34,Shot Creator,Hornets,1.3,0.4,47,35,R1,40.5
'03 Kings,Doug Christie,SG,16,9.4,4.3,4.7,14,58.0,0.160,32,48,Elite Lockdown Defender,Kings,2,0.3,59,23,R2,33.9
'03 Kings,Peja Stojakovic,SF/PF,22,22.3,5.9,2.0,24,61.0,0.200,43,32,Elite Off-Ball Sniper,Kings,1.1,0.3,59,23,R2,34.0
'03 Magic,Tracy McGrady,SG/SF,29,32.1,6.5,5.5,35,56.4,0.262,48,36,Elite Shot Creator,Magic,1.5,0.7,42,40,R1,39.4
'03 Mavericks,Michael Finley,SG,19,17.5,3.9,3.0,22,53.0,0.110,39,34,Shot Creator,Mavericks,1.4,0.4,60,22,CF,38.3
'03 Mavericks,Steve Nash,PG,20,17.7,3.0,7.3,22,58.5,0.190,47,28,Elite Playmaker,Mavericks,0.6,0.1,60,22,CF,33.1
'03 Nets,Jason Collins,C,7,3.8,4.2,0.6,9,51.0,0.055,18,42,Enforcer,Nets,0.5,0.7,49,33,FINALS,23.5
'03 Nets,Jason Kidd,PG,20,18.7,6.3,8.9,22,50.1,0.140,41,40,Elite Playmaker,Nets,2.2,0.3,49,33,FINALS,37.4
'03 Nets,Kenyon Martin,PF,20,16.7,8.3,2.4,22,51.0,0.130,36,45,Elite Rim Runner,Nets,0.9,1.2,49,33,FINALS,34.1
'03 Nets,Lucious Harris,SG,8,9.5,3.0,2.2,16,50.0,0.080,30,28,Off-Ball Sniper,Nets,1,0.2,49,33,FINALS,25.6
'03 Nets,Richard Jefferson,SF,15,15.5,6.4,2.5,18,58.0,0.160,34,32,Secondary Playmaker,Nets,1.3,0.5,49,33,FINALS,36.0
'03 Pistons,Cliff Robinson,PF,10,9.5,4.6,1.6,16,51.0,0.095,30,38,Stretch Big,Pistons,0.9,1,50,32,CF,34.9
'03 Spurs,Hedo Turkoglu,SF,9,7.5,3.7,2.5,14,53.5,0.085,30,30,Role Player,Spurs,0.8,0.3,60,22,CHAMPION,25.9
'03 Spurs,Stephen Jackson,SG,14,11.8,3.6,2.3,19,53.5,0.100,34,38,3&D Wing,Spurs,1,0.3,60,22,CHAMPION,28.2
'03 Spurs,Tim Duncan,PF/C,30,23.3,12.9,3.9,27,56.4,0.248,45,48,Elite Enforcer,Spurs,0.7,2.9,60,22,CHAMPION,39.3
'03 Spurs,Tony Parker,PG,16,15.5,2.6,5.3,20,51.5,0.095,38,30,Transition Maestro,Spurs,1.1,0.1,60,22,CHAMPION,33.8
'04 Bucks,Michael Redd,SG,21,21.7,5.0,2.3,26,54.0,0.130,40,28,Shot Creator,Bucks,1,0.2,41,41,R1,36.8
'04 Hornets,Baron Davis,PG,17,22.6,4.5,8.5,28,50.0,0.110,40,30,Transition Maestro,Hornets,2,0.5,41,41,R1,40.1
'04 Hornets,David Wesley,PG,12,13.0,3.0,4.8,21,52.0,0.085,34,28,Secondary Playmaker,Hornets,1,0.1,41,41,R1,32.8
'04 Jazz,Andrei Kirilenko,PF,20,16.5,8.1,3.1,20,55.9,0.226,36,49,Defensive Unicorn,Jazz,1.9,3.3,42,40,MISSED,37.1
'04 Kings,Peja Stojakovic,SF/PF,24,24.2,6.3,2.1,25,62.4,0.210,44,32,Elite Off-Ball Sniper,Kings,1.1,0.3,55,27,R2,40.3
'04 Knicks,Stephon Marbury,PG,18,20.2,3.1,8.1,27.5,51.9,0.108,40,26,Elite Shot Creator,Knicks,1.5,0.1,39,43,R1,39.1
'04 Lakers,Kobe Bryant,SG,26,27.2,5.5,5.0,31,54.2,0.180,45,38,Elite Shot Creator,Lakers,1.7,0.4,56,26,FINALS,37.6
'04 Magic,Grant Hill,SF,17,19.7,5.9,4.5,24,54.5,0.150,38,36,Secondary Playmaker,Magic,1.4,0.3,21,61,MISSED,0.0
'04 Magic,Tracy McGrady,SG/SF,27,28.0,5.5,5.5,33,58.4,0.188,46,33,Elite Shot Creator,Magic,1.4,0.6,21,61,MISSED,39.9
'04 Pacers,Jermaine O'Neal,PF,26,20.1,10.0,2.1,28,50.0,0.160,38,43,Elite Post Scorer,Pacers,0.8,2.3,61,21,CF,35.7
'04 Pacers,Ron Artest,SF,15,17.4,5.0,2.7,22,49.5,0.100,34,48,Elite Lockdown Defender,Pacers,2.4,0.7,61,21,CF,37.2
'04 Pistons,Ben Wallace,C,20,9.5,12.4,1.7,12,43.6,0.145,34,49,Elite Enforcer,Pistons,1.4,3,54,28,CHAMPION,37.7
'04 Pistons,Carlos Delfino,SG,5,5.0,2.4,1.5,13,52.0,0.080,28,28,Role Player,Pistons,0.4,0.2,54,28,CHAMPION,15.3
'04 Pistons,Chauncey Billups,PG,20,16.9,3.5,5.7,21,57.1,0.215,37,37,Secondary Playmaker,Pistons,1.3,0.2,54,28,CHAMPION,35.4
'04 Pistons,Corliss Williamson,SF,5,9.5,3.2,0.7,18,55.0,0.130,34,32,Post Scorer,Pistons,0.5,0.2,54,28,CHAMPION,19.9
'04 Pistons,Darko Milicic,C,1,1.4,1.2,0.2,13,44.0,0.010,12,20,Enforcer,Pistons,0.2,0.4,54,28,CHAMPION,4.7
'04 Pistons,Elden Campbell,C,7,5.7,4.5,0.6,12,51.0,0.075,24,32,Enforcer,Pistons,0.4,1,54,28,CHAMPION,13.7
'04 Pistons,Lindsey Hunter,PG,3,3.5,2.0,2.6,12,45.0,0.060,32,45,Lockdown Defender,Pistons,0.8,0.1,54,28,CHAMPION,20.0
'04 Pistons,Rasheed Wallace,PF,21,13.7,7.0,1.8,20,52.0,0.120,40,46,Stretch Big,Pistons,1,1.5,54,28,CHAMPION,30.6
'04 Pistons,Richard Hamilton,SG,17,17.6,3.6,4.0,24,52.0,0.100,39,36,Shot Creator,Pistons,1.2,0.2,54,28,CHAMPION,35.5
'04 Pistons,Tayshaun Prince,SF,12,10.3,4.8,2.3,14,52.5,0.115,35,48,Lockdown Defender,Pistons,1,0.9,54,28,CHAMPION,32.9
'04 Timberwolves,Kevin Garnett,PF/C,29,24.2,13.9,5.0,29,54.7,0.272,46,50,Two-Way Anchor,Timberwolves,1.5,2.2,58,24,CF,39.4
'04 Timberwolves,Troy Hudson,PG,9,10.0,2.0,4.3,20,51.5,0.085,32,26,Secondary Playmaker,Timberwolves,0.8,0.1,58,24,CF,17.3
'04 Timberwolves,Wally Szczerbiak,SF,13,14.5,3.5,2.4,20,57.0,0.13,36,28,Off-Ball Sniper,Timberwolves,0.8,0.2,58,24,CF,22.2
'05 Blazers,Shareef Abdur-Rahim,PF,16,18.0,7.8,3.0,23,54.5,0.110,38,32,Post Scorer,Blazers,0.8,0.5,27,55,MISSED,34.6
'05 Clippers,Elton Brand,PF,24,20.0,9.5,2.6,25,57.5,0.200,36,40,Elite Post Scorer,Clippers,0.9,2,37,45,MISSED,37.0
'05 Hawks,Josh Smith,PF,10,8.6,7.1,1.2,14,51.5,0.080,26,44,Rim Runner,Hawks,1.4,2.4,13,69,MISSED,27.7
'05 Bobcats,Emeka Okafor,C,11,9.9,10.9,0.8,15,55.0,0.145,24,44,Rim Runner,Hornets,0.9,1.7,18,64,MISSED,35.6
'05 Mavericks,Jason Terry,SG,15,12.4,2.4,5.4,17,60.3,0.165,38,34,Off-Ball Sniper,Mavericks,1.4,0.2,58,24,R2,30.0
'05 Pacers,Jermaine O'Neal,PF,22,22.6,10.5,2.2,27,51.5,0.150,38,42,Elite Post Scorer,Pacers,1,2.3,44,38,R2,34.8
'05 Pacers,Stephen Jackson,SG,14,15.0,5.0,3.5,22,52.0,0.095,34,36,3&D Wing,Pacers,1.5,0.3,44,38,R2,35.4
'05 Rockets,Yao Ming,C,24,18.3,8.4,1.5,24,57.0,0.185,34,38,Elite Post Scorer,Rockets,0.5,1.9,51,31,R1,30.6
'05 SuperSonics,Luke Ridnour,PG,10,10.0,2.6,5.6,18,53.5,0.105,32,28,Secondary Playmaker,Sonics,1,0.1,52,30,R2,31.4
'05 Spurs,Bruce Bowen,SF,11,8.2,3.5,1.5,12,51.5,0.095,30,46,3&D Wing,Spurs,1,0.3,59,23,CHAMPION,32.0
'05 Spurs,Dejan Bodiroga,SG,8,7.0,2.4,2.0,16,55.0,0.100,30,28,3&D Wing,Spurs,0,0,59,23,CHAMPION,0.0
'05 Spurs,Manu Ginobili,SG,22,16.0,4.4,3.9,24,60.9,0.240,37,34,Secondary Playmaker,Spurs,1.4,0.3,59,23,CHAMPION,29.6
'05 Spurs,Nazr Mohammed,C,7,7.5,6.0,0.5,14,55.0,0.095,26,34,Enforcer,Spurs,0.5,0.7,59,23,CHAMPION,18.0
'05 Spurs,Robert Horry,PF,8,5.0,4.0,2.5,11,50.0,0.080,28,36,Stretch Big,Spurs,0.7,0.5,59,23,CHAMPION,18.6
'05 Spurs,Tony Parker,PG,19,16.6,3.7,6.1,22,52.7,0.110,41,32,Elite Transition Maestro,Spurs,1,0.2,59,23,CHAMPION,34.2
'05 Suns,Amar'e Stoudemire,PF/C,20,26.0,8.9,1.6,27,61.7,0.235,43,34,Elite Rim Runner,Suns,0.9,1.7,62,20,CF,36.1
'05 Suns,Kurt Thomas,C,12,9.0,7.9,1.4,14,53.0,0.080,27,40,Enforcer,Suns,0.6,0.9,62,20,CF,35.7
'05 Suns,Quentin Richardson,SG,14,12.7,5.0,2.0,19,55.0,0.075,33,31,3&D Wing,Suns,1.1,0.3,62,20,CF,35.9
'05 Suns,Shawn Marion,SF/PF,22,19.4,11.3,1.9,21,55.6,0.210,40,42,Elite 3&D Wing,Suns,2,1.6,62,20,CF,38.8
'05 Suns,Steve Nash,PG,27,15.5,3.3,11.5,22,60.6,0.212,47,28,Elite Transition Maestro,Suns,1.6,0.1,62,20,CF,34.3
'06 Trail Blazers,Sebastian Telfair,PG,1,6.8,1.4,3.0,20,45.0,0.010,18,16,Secondary Playmaker,Blazers,0.9,0.1,21,61,MISSED,24.1
'06 Bucks,Michael Redd,SG,23,25.4,4.3,2.9,28,55.5,0.150,42,28,Elite Off-Ball Sniper,Bucks,1,0.2,40,42,R1,39.1
'06 Cavaliers,Drew Gooden,PF,11,10.7,8.4,1.0,18,53.5,0.12,30,32,Post Scorer,Cavaliers,0.6,0.6,50,32,R2,27.5
'06 Cavaliers,Larry Hughes,SG,14,15.5,4.5,3.6,24,49.5,0.08,36,34,Shot Creator,Cavaliers,1.9,0.4,50,32,R2,35.6
'06 Clippers,Elton Brand,PF,26,24.7,10.0,2.6,26,58.0,0.210,34,38,Elite Post Scorer,Clippers,0.9,2.5,47,35,R2,39.2
'06 Hawks,Marvin Williams,SF,3,8.5,4.8,0.8,17,52.3,0.069,24,26,3&D Wing,Hawks,0.6,0.5,26,56,MISSED,24.7
'06 Heat,Antoine Walker,SF,14,12.2,5.8,2.1,22,44.5,0.085,34,28,Shot Creator,Heat,1,0.3,52,30,CHAMPION,26.8
'06 Heat,Dwyane Wade,SG/PG,29,27.2,5.7,6.7,32,57.7,0.239,42,39,Elite Shot Creator,Heat,1.9,0.8,52,30,CHAMPION,38.6
'06 Heat,Shaquille O'Neal,C,24,20.0,9.2,3.8,24,60.4,0.231,46,40,Elite Post Scorer,Heat,0.6,1.8,52,30,CHAMPION,30.6
'06 Heat,Udonis Haslem,PF,9,9.3,7.8,0.7,14,55.4,0.134,30,36,Enforcer,Heat,0.7,0.3,52,30,CHAMPION,30.8
'06 Bobcats,Raymond Felton,PG,11,12.7,3.3,7.3,20,51.0,0.080,34,26,Secondary Playmaker,Hornets,1.3,0.1,26,56,MISSED,30.1
'06 Kings,Ron Artest,SF,16,19.0,4.3,3.2,25,51.0,0.115,34,48,Lockdown Defender,Kings,1.6,0.4,44,38,R1,39.4
'06 Lakers,Kobe Bryant,SG,29,35.4,5.3,4.5,38,55.9,0.224,48,44,Elite Shot Creator,Lakers,1.8,0.4,45,37,R1,41.0
'06 Magic,Jameer Nelson,PG,12,14.6,2.8,5.5,20,53.5,0.120,34,28,Shot Creator,Magic,1.2,0.1,36,46,MISSED,28.8
'06 Mavericks,Jason Terry,SG,14,15.3,2.5,3.5,21,58.5,0.145,38,34,Off-Ball Sniper,Mavericks,1.4,0.2,60,22,FINALS,35.0
'06 Nets,Richard Jefferson,SF,17,19.5,6.8,3.8,23,58.5,0.148,40,34,Transition Maestro,Nets,1.5,0.5,49,33,R2,39.2
'06 Nets,Vince Carter,SF,21,24.2,5.2,3.6,27,53.5,0.150,42,30,Elite Shot Creator,Nets,1.3,0.6,49,33,R2,36.8
'06 Nuggets,Carmelo Anthony,SF,24,26.5,5.9,2.7,33,52.5,0.160,47,29,Elite Shot Creator,Nuggets,1.1,0.4,44,38,R1,36.8
'06 Nuggets,Marcus Camby,C,14,12.8,11.9,2.1,14,49.0,0.130,26,44,Elite Enforcer,Nuggets,1,3.3,44,38,R1,33.2
'06 Pacers,Jermaine O'Neal,PF,20,16.5,8.3,2.5,24,50.5,0.115,37,41,Elite Enforcer,Pacers,1,2.3,41,41,R1,35.3
'06 Rockets,Yao Ming,C,26,22.3,10.2,1.5,27,59.5,0.200,36,40,Elite Post Scorer,Rockets,0.3,1.9,34,48,MISSED,34.2
'06 SuperSonics,Ray Allen,SG,24,23.9,4.5,4.5,28,59.0,0.200,42,36,Elite Off-Ball Sniper,Sonics,1.1,0.2,35,47,MISSED,38.7
'06 Suns,Leandro Barbosa,PG,11,13.4,2.4,3.2,23,52.0,0.090,37,26,Transition Maestro,Suns,1,0.2,54,28,CF,27.9
'06 Suns,Raja Bell,SG,12,12.0,3.4,2.2,17,55.0,0.110,32,38,3&D Wing,Suns,1.3,0.2,54,28,CF,37.5
'06 Warriors,Jason Richardson,SG,18,23.2,5.8,3.1,28,53.8,0.122,41,28,Shot Creator,Warriors,1.4,0.5,34,48,MISSED,38.4
'06 Wizards,Gilbert Arenas,PG,26,29.3,3.5,6.1,30,58.1,0.198,46,26,Elite Shot Creator,Wizards,1.6,0.3,42,40,R1,42.3
'07 Blazers,LaMarcus Aldridge,PF,16,11.5,6.7,1.2,18,51.5,0.115,33,34,Post Scorer,Blazers,0.6,1.5,32,50,MISSED,22.1
'07 Cavaliers,LeBron James,SF/PF,27,27.3,6.7,6.0,31,58.5,0.248,48,40,Generational Playmaker,Cavaliers,1.6,0.7,50,32,FINALS,40.9
'07 Bobcats,Adam Morrison,SF,1,11.8,2.9,2.1,24,46.5,0.000,22,14,Shot Creator,Hornets,0.6,0.1,33,49,MISSED,29.8
'07 Hornets,Chris Paul,PG,22,17.3,4.4,8.9,24,57.5,0.220,42,38,Elite Playmaker,Hornets,2.2,0.1,39,43,MISSED,36.8
'07 Bobcats,Gerald Wallace,SF,11,14.5,7.9,2.0,20,51.0,0.085,32,36,Lockdown Defender,Hornets,1.7,1.1,33,49,MISSED,36.7
'07 Jazz,Andrei Kirilenko,PF,16,11.8,6.0,2.8,17,53.0,0.165,33,48,Defensive Unicorn,Jazz,1.4,1.4,51,31,CF,29.3
'07 Jazz,Carlos Boozer,PF,24,20.9,11.7,3.0,26,58.5,0.200,43,34,Elite Post Scorer,Jazz,0.9,0.3,51,31,CF,34.6
'07 Jazz,Deron Williams,PG,22,16.2,3.3,9.3,28,51.8,0.155,38,29,Heliocentric Playmaker,Jazz,1.4,0.1,51,31,CF,36.9
'07 Jazz,Kirk Snyder,SG,7,6.5,2.4,1.2,14,48.5,0.065,24,28,3&D Wing,Jazz,0.7,0.2,51,31,CF,14.4
'07 Jazz,Matt Harpring,SF,11,12.0,5.5,2.1,16,53.5,0.090,32,34,Post Scorer,Jazz,0.8,0.2,51,31,CF,25.5
'07 Jazz,Mehmet Okur,C,18,17.6,7.2,2.0,22,57.5,0.160,38,32,Stretch Big,Jazz,0.6,0.5,51,31,CF,33.3
'07 Mavericks,Dirk Nowitzki,PF,28,24.6,8.9,3.4,29,60.5,0.281,43,33,Stretch Big,Mavericks,0.9,0.8,67,15,R1,36.2
'07 Mavericks,Jason Terry,SG,14,13.7,2.4,3.0,20,57.0,0.130,38,32,Off-Ball Sniper,Mavericks,1.2,0.1,67,15,R1,35.1
'07 Nuggets,Allen Iverson,SG/PG,20,24.8,3.2,4.8,32,48.5,0.095,42,28,Elite Shot Creator,Nuggets,2,0.1,45,37,R1,42.5
'07 Nuggets,Carmelo Anthony,SF,22,28.9,6.0,3.8,33,49.0,0.160,44,26,Elite Shot Creator,Nuggets,1.2,0.4,45,37,R1,38.2
'07 Nuggets,Chucky Atkins,PG,7,7.2,1.8,3.0,16,46.0,0.058,26,26,Secondary Playmaker,Nuggets,0.7,0.1,45,37,R1,27.5
'07 Nuggets,Marcus Camby,C,17,11.2,11.7,3.2,15,49.9,0.125,28,46,Elite Enforcer,Nuggets,1.3,3.3,45,37,R1,33.8
'07 Raptors,Jorge Garbajosa,PF,9,9.2,5.3,2.2,14,54.0,0.110,30,34,Stretch Big,Raptors,1,0.3,47,35,R1,28.5
'07 Rockets,Luis Scola,PF,11,13.5,7.5,1.8,18,55.5,0.105,32,30,Post Scorer,Rockets,0.5,0.3,52,30,R1,25.6
'07 Rockets,Shane Battier,SF,13,11.0,4.8,1.8,14,56.5,0.130,31,44,3&D Wing,Rockets,1.1,1,52,30,R1,33.4
'07 Spurs,Manu Ginobili,SG,18,16.5,3.8,3.9,25,57.0,0.158,38,33,Shot Creator,Spurs,1.5,0.2,58,24,CHAMPION,31.1
'07 Spurs,Michael Finley,SF,12,10.8,3.4,1.9,17,50.5,0.095,32,30,Off-Ball Sniper,Spurs,0.9,0.2,58,24,CHAMPION,25.6
'07 Spurs,Tim Duncan,PF/C,24,19.0,10.6,3.0,22,53.5,0.185,42,48,Elite Enforcer,Spurs,0.8,2.4,58,24,CHAMPION,33.6
'07 Spurs,Tony Parker,PG,20,18.6,3.1,5.5,24,54.0,0.115,42,30,Elite Transition Maestro,Spurs,0.9,0.1,58,24,CHAMPION,32.9
'07 Suns,Boris Diaw,PF,12,13.2,6.5,6.1,17,55.0,0.135,37,32,Secondary Playmaker,Suns,1.1,0.6,61,21,R2,33.0
'07 Suns,Leandro Barbosa,PG,10,12.8,2.8,2.8,22,52.5,0.095,37,26,Transition Maestro,Suns,1.1,0.2,61,21,R2,32.7
'07 Warriors,Baron Davis,PG,19,21.6,4.7,8.3,29,52.1,0.140,42,34,Elite Transition Maestro,Warriors,1.9,0.2,42,40,R2,36.5
'07 Warriors,Jason Richardson,SG,20,16.0,5.1,3.4,22,53.5,0.100,38,30,Elite Transition Maestro,Warriors,1.4,0.4,42,40,R2,37.9
'07 Warriors,Matt Barnes,SF,10,8.5,5.0,2.5,14,54.0,0.100,28,38,3&D Wing,Warriors,1.2,0.4,42,40,R2,24.4
'08 Blazers,LaMarcus Aldridge,PF,18,17.8,8.5,1.9,23,51.5,0.130,38,34,Post Scorer,Blazers,0.6,1.2,41,41,MISSED,34.7
'08 Cavaliers,Ben Wallace,C,9,4.0,7.9,1.0,9,44.0,0.080,22,46,Enforcer,Cavaliers,1,1.7,45,37,R2,27.4
'08 Celtics,Eddie House,PG,4,7.5,2.1,1.9,17,51.0,0.090,34,26,Off-Ball Sniper,Celtics,0.5,0.1,66,16,CHAMPION,16.6
'08 Celtics,James Posey,SF,8,7.4,4.4,1.5,13,58.7,0.134,32,38,3&D Wing,Celtics,1,0.4,66,16,CHAMPION,26.4
'08 Celtics,Kevin Garnett,PF/C,27,18.8,9.2,3.4,23,58.8,0.265,39,49,Elite Enforcer,Celtics,1.4,1.3,66,16,CHAMPION,32.8
'08 Celtics,Leon Powe,PF,4,7.9,4.1,0.3,16,62.0,0.180,20,26,Enforcer,Celtics,0.4,0.4,66,16,CHAMPION,13.5
'08 Celtics,Paul Pierce,SF,24,19.6,5.1,3.5,28,59.9,0.195,39,38,Shot Creator,Celtics,1.4,0.4,66,16,CHAMPION,35.9
'08 Celtics,Rajon Rondo,PG,15,10.6,4.2,5.1,17,51.9,0.120,33,38,Elite Playmaker,Celtics,1.9,0.3,66,16,CHAMPION,30.6
'08 Celtics,Ray Allen,SG,22,17.4,3.9,2.7,22,63.0,0.145,44,28,Off-Ball Sniper,Celtics,0.9,0.2,66,16,CHAMPION,35.1
'08 Celtics,Tony Allen,SG,10,9.1,3.4,1.3,14,50.0,0.090,28,48,Elite Lockdown Defender,Celtics,1.1,0.3,66,16,CHAMPION,16.7
'08 Hawks,Mike Bibby,PG,14,15.0,2.7,5.4,22,55.5,0.110,36,28,Secondary Playmaker,Hawks,1,0.2,37,45,R1,35.7
'08 Hornets,Chris Paul,PG,27,21.1,4.0,11.6,27,59.8,0.268,46,46,Elite Playmaker,Hornets,2.7,0.1,56,26,R2,37.6
'08 Hornets,David West,PF,15,16.0,7.6,2.3,20,53.5,0.130,36,36,Post Scorer,Hornets,0.9,0.7,56,26,R2,37.9
'08 Hornets,Jannero Pargo,PG,7,9.0,1.5,2.5,21,49.5,0.06,30,26,Shot Creator,Hornets,0.7,0.1,56,26,R2,20.8
'08 Hornets,Morris Peterson,SG,10,9.4,3.5,1.8,15,55.0,0.1,32,32,3&D Wing,Hornets,0.7,0.2,56,26,R2,26.5
'08 Jazz,Deron Williams,PG,25,18.8,3.0,10.5,23,59.5,0.183,44,34,Elite Playmaker,Jazz,1.5,0.2,54,28,R2,36.3
'08 Magic,Hedo Turkoglu,SF,17,19.5,5.7,5.0,24,58.7,0.152,41,32,Secondary Playmaker,Magic,1,0.3,52,30,R2,37.1
'08 Magic,Rashard Lewis,PF,18,18.2,5.4,2.4,22,59.0,0.155,40,32,Stretch Big,Magic,0.9,0.4,52,30,R2,36.5
'08 Nuggets,Kenyon Martin,PF,12,12.4,6.5,1.3,15,50.5,0.085,28,40,Enforcer,Nuggets,0.8,1,50,32,R1,32.8
'08 Raptors,Andrea Bargnani,C,2,10.2,3.7,0.8,22,50.0,0.030,24,16,Stretch Big,Raptors,0.5,0.7,41,41,R1,29.5
'08 Spurs,Manu Ginobili,SG,24,19.5,4.8,4.5,28,61.2,0.232,43,38,Elite Shot Creator,Spurs,1.6,0.3,56,26,CF,31.4
'08 Spurs,Tony Parker,PG,19,18.8,3.2,6.0,24,55.0,0.120,40,32,Elite Transition Maestro,Spurs,0.9,0.1,56,26,CF,34.5
'08 Timberwolves,Randy Foye,SG,11,13.8,2.8,4.5,22,52.5,0.095,34,28,Shot Creator,Timberwolves,1,0.2,22,60,MISSED,34.5
'08 Warriors,Monta Ellis,SG,16,20.2,5.0,3.9,23,58.0,0.128,41,30,Transition Maestro,Warriors,1.7,0.2,48,34,MISSED,40.1
'08 Warriors,Stephen Jackson,SG,14,17.0,5.0,3.1,24,52.5,0.085,35,32,Shot Creator,Warriors,1.8,0.4,48,34,MISSED,37.5
'09 Cavaliers,Anderson Varejao,C,10,7.2,8.6,1.5,12,54.0,0.120,26,38,Enforcer,Cavaliers,0.7,0.9,66,16,CF,25.1
'09 Cavaliers,Antawn Jamison,PF,13,17.0,7.5,2.0,23,53.0,0.090,35,28,Post Scorer,Cavaliers,1.1,0.5,66,16,CF,35.0
'09 Cavaliers,Delonte West,SG,8,9.5,3.4,3.7,16,51.0,0.085,35,34,3&D Wing,Cavaliers,1,0.2,66,16,CF,29.0
'09 Cavs,LeBron James,SF/PF/PG,30,28.4,7.6,7.2,33,59.1,0.318,49,48,Generational Playmaker,Cavaliers,1.7,1.1,66,16,CF,37.7
'09 Cavaliers,Mo Williams,PG,14,17.8,2.8,4.1,25,54.0,0.140,38,26,Shot Creator,Cavaliers,0.9,0.1,66,16,CF,35.0
'09 Celtics,Paul Pierce,SF,22,18.9,5.2,3.2,26,57.0,0.165,41,36,Shot Creator,Celtics,1.1,0.4,62,20,R2,36.5
'09 Hawks,Joe Johnson,SG,20,21.4,4.6,5.0,27,55.0,0.140,40,32,Shot Creator,Hawks,1.2,0.2,47,35,R2,39.5
'09 Hawks,Marvin Williams,SF,12,13.9,6.3,1.3,18,56.9,0.140,32,32,3&D Wing,Hawks,0.8,0.5,47,35,R2,32.2
'09 Bobcats,Gerald Wallace,SF,13,18.2,9.3,2.2,22,52.0,0.110,34,40,Lockdown Defender,Hornets,2,1.1,35,47,MISSED,38.6
'09 Bobcats,Raymond Felton,PG,12,12.5,3.5,6.5,20,50.5,0.085,34,28,Secondary Playmaker,Hornets,1.6,0.1,35,47,MISSED,37.6
'09 Kings,Kevin Martin,SG,17,22.6,3.2,2.5,27,62.5,0.170,42,22,Elite Shot Creator,Kings,1.1,0.2,17,65,MISSED,38.2
'09 Knicks,Nate Robinson,PG,10,17.2,3.1,4.1,27,53.0,0.070,34,24,Shot Creator,Knicks,1,0.1,32,50,MISSED,29.9
'09 Lakers,Derek Fisher,PG,9,10.5,2.5,3.8,14,50.8,0.100,28,32,3&D Wing,Lakers,0.7,0.1,65,17,CHAMPION,29.8
'09 Lakers,Kobe Bryant,SG,27,26.8,5.2,4.9,31,55.9,0.197,44,38,Elite Shot Creator,Lakers,1.5,0.5,65,17,CHAMPION,36.1
'09 Lakers,Lamar Odom,PF,16,11.3,8.2,2.6,17,54.2,0.132,34,38,Secondary Playmaker,Lakers,0.8,0.7,65,17,CHAMPION,29.7
'09 Lakers,Pau Gasol,PF/C,24,18.9,9.6,3.5,23,61.7,0.223,37,38,Elite Post Scorer,Lakers,0.5,1.4,65,17,CHAMPION,37.0
'09 Lakers,Shannon Brown,SF,8,8.2,2.6,1.4,14,53.5,0.085,28,32,3&D Wing,Lakers,0.5,0.2,65,17,CHAMPION,7.6
'09 Magic,Courtney Lee,SG,6,7.5,3.5,2.0,15,55.0,0.100,30,32,3&D Wing,Magic,0.8,0.3,59,23,FINALS,25.2
'09 Magic,Dwight Howard,C,22,20.6,13.8,1.4,22,60.4,0.273,38,49,Elite Enforcer,Magic,0.9,2.9,59,23,FINALS,35.7
'09 Magic,Hedo Turkoglu,SF,12,13.9,5.0,4.5,21,53.5,0.150,38,34,Secondary Playmaker,Magic,1,0.4,59,23,FINALS,36.6
'09 Magic,Jameer Nelson,PG,14,15.3,3.4,5.2,24,53.1,0.136,36,29,Secondary Playmaker,Magic,1.2,0.1,59,23,FINALS,31.2
'09 Magic,Mickael Pietrus,SG,10,8.5,2.8,1.2,14,54.5,0.095,28,38,3&D Wing,Magic,1,0.4,59,23,FINALS,24.6
'09 Magic,Rashard Lewis,PF,15,17.7,5.7,2.6,20,58.0,0.170,40,36,Off-Ball Sniper,Magic,0.9,0.5,59,23,FINALS,36.2
'09 Nuggets,Carmelo Anthony,SF,25,22.8,6.3,3.0,31,54.0,0.165,45,28,Elite Shot Creator,Nuggets,1.3,0.5,54,28,CF,34.5
'09 Rockets,Luis Scola,PF,12,14.6,8.1,1.6,20,55.0,0.110,34,28,Post Scorer,Rockets,0.6,0.3,53,29,R2,30.3
'09 Spurs,Manu Ginobili,SG,20,19.5,4.0,3.9,28,60.5,0.210,41,34,Shot Creator,Spurs,1.1,0.3,54,28,R1,26.8
'09 Spurs,Tim Duncan,PF/C,19,15.0,8.9,2.4,20,51.5,0.140,38,46,Elite Enforcer,Spurs,0.9,1.9,54,28,R1,33.7
'09 Thunder,Robert Swift,C,1,1.0,1.5,0.1,14,44.0,0.000,10,20,Enforcer,Thunder,0.2,0.5,23,59,MISSED,13.2
'09 Warriors,Anthony Randolph,PF,2,11.6,6.5,1.5,24,48.0,0.040,24,22,Enforcer,Warriors,0.9,1.4,29,53,MISSED,17.9
'10 Trail Blazers,Greg Oden,C,1,6.2,5.1,0.5,16,55.0,0.060,18,28,Enforcer,Blazers,0.5,2.3,50,32,R1,23.9
'10 Cavaliers,Mo Williams,PG,16,17.2,2.8,4.5,22,54.5,0.110,38,28,Secondary Playmaker,Cavaliers,0.9,0.1,61,21,R2,34.2
'10 Cavaliers,Zydrunas Ilgauskas,C,8,7.4,5.4,0.8,15,51.0,0.120,34,38,Post Scorer,Cavaliers,0.3,1,61,21,R2,20.9
'10 Grizzlies,Hasheem Thabeet,C,1,2.1,2.8,0.1,11,48.0,0.020,10,26,Enforcer,Grizzlies,0.2,1.1,40,42,MISSED,13.0
'10 Hawks,Jamal Crawford,SG,14,18.0,2.5,2.9,25,54.0,0.090,38,24,Shot Creator,Hawks,1.1,0.2,53,29,R2,31.1
'10 Hawks,Joe Johnson,SG,21,21.3,4.6,4.9,28,55.0,0.140,40,32,Shot Creator,Hawks,1.2,0.2,53,29,R2,38.0
'10 Hornets,David West,PF,14,15.7,7.8,2.0,20,52.5,0.120,35,34,Post Scorer,Hornets,0.9,0.4,37,45,MISSED,36.4
'10 Lakers,Metta World Peace,SF,14,10.9,4.0,2.2,16,53.0,0.110,28,48,Elite Lockdown Defender,Lakers,1.3,0.4,57,25,CHAMPION,33.8
'10 Lakers,Pau Gasol,PF/C,22,17.8,10.2,3.3,22,58.0,0.190,39,38,Elite Post Scorer,Lakers,0.6,1.6,57,25,CHAMPION,37.0
'10 Magic,Dwight Howard,C,26,18.3,13.2,1.4,22,63.0,0.223,40,49,Elite Enforcer,Magic,0.9,2.8,59,23,CF,34.7
'10 Magic,Jason Williams,PG,9,8.2,2.5,5.1,17,48.0,0.085,30,26,Secondary Playmaker,Magic,0.8,0.1,59,23,CF,20.8
'10 Magic,Rashard Lewis,PF,14,14.1,4.4,1.5,21,57.5,0.130,38,30,Stretch Big,Magic,0.9,0.4,59,23,CF,32.9
'10 Magic,Vince Carter,SG/SF,16,16.6,4.0,2.3,24,53.0,0.100,38,30,Shot Creator,Magic,1.1,0.4,59,23,CF,30.8
'10 Nuggets,Chauncey Billups,PG,18,16.0,3.8,5.8,22,57.5,0.150,38,36,Secondary Playmaker,Nuggets,1.1,0.2,53,29,R1,34.1
'10 Nuggets,Nene,PF,14,14.5,7.2,2.1,20,55.5,0.130,34,36,Post Scorer,Nuggets,0.6,1.1,53,29,R1,33.6
'10 Suns,Amar'e Stoudemire,PF/C,20,23.1,8.4,1.0,29,61.5,0.200,42,29,Elite Rim Runner,Suns,0.7,1.1,54,28,CF,34.6
'10 Wizards,Gilbert Arenas,PG,17,18.6,3.2,4.7,26,53.5,0.125,42,24,Elite Shot Creator,Wizards,1.5,0.3,26,56,MISSED,36.5
'11 Bulls,Derrick Rose,PG,26,25.0,4.1,7.7,32,55.0,0.208,45,34,Heliocentric Playmaker,Bulls,1,0.6,62,20,CF,37.4
'11 Bulls,Joakim Noah,C,14,8.1,8.7,1.8,13,50.0,0.120,28,44,Two-Way Anchor,Bulls,1.1,1.1,62,20,CF,32.8
'11 Bulls,Taj Gibson,PF,8,7.1,5.7,0.7,15,50.5,0.104,26,38,Enforcer,Bulls,0.8,1,62,20,CF,21.8
'11 Cavaliers,Mo Williams,PG,14,15.0,2.8,5.0,22,54.0,0.100,37,26,Secondary Playmaker,Cavaliers,0.9,0.1,19,63,MISSED,29.6
'11 Grizzlies,Zach Randolph,PF,18,20.1,12.2,2.2,26,52.5,0.130,44,34,Post Scorer,Grizzlies,0.9,0.3,46,36,R2,36.3
'11 Hornets,Chris Paul,PG,24,15.9,4.1,9.8,25,58.5,0.255,44,40,Elite Playmaker,Hornets,2.4,0.1,46,36,R1,36.0
'11 Magic,Hedo Turkoglu,SF,10,12.0,5.0,3.8,19,51.0,0.075,34,28,Secondary Playmaker,Magic,0.9,0.2,52,30,R1,34.1
'11 Magic,Jameer Nelson,PG,12,13.0,3.4,5.8,19,53.0,0.090,35,28,Secondary Playmaker,Magic,1.1,0.1,52,30,R1,30.5
'11 Mavericks,Brian Cardinal,PF,4,4.3,2.5,1.2,12,50.0,0.075,24,28,Glue Guy,Mavericks,0.3,0.1,57,25,CHAMPION,11.0
'11 Mavericks,DeShawn Stevenson,SG,7,5.5,2.3,1.5,11,50.5,0.085,30,40,Lockdown Defender,Mavericks,0.6,0.2,57,25,CHAMPION,16.1
'11 Mavericks,Dirk Nowitzki,PF,27,23.0,7.0,2.6,28,61.2,0.213,47,38,Stretch Big,Mavericks,0.8,0.6,57,25,CHAMPION,34.3
'11 Mavs,J.J. Barea,PG,7,9.5,1.8,3.9,17,50.5,0.075,34,28,Role Player,Mavericks,0.6,0.1,57,25,CHAMPION,20.6
'11 Mavericks,Jason Kidd,PG,14,7.9,4.4,8.2,13,53.0,0.110,31,40,Elite Playmaker,Mavericks,1.3,0.2,57,25,CHAMPION,33.2
'11 Mavericks,Jason Terry,SG,10,15.8,2.4,2.9,20,56.4,0.130,38,34,Off-Ball Sniper,Mavericks,1,0.1,57,25,CHAMPION,31.3
'11 Mavericks,Peja Stojakovic,SF/PF,8,6.9,2.4,1.2,14,57.0,0.095,35,26,Off-Ball Sniper,Mavericks,0.4,0.1,57,25,CHAMPION,18.7
'11 Mavericks,Shawn Marion,SF/PF,19,12.5,6.9,1.4,17,54.5,0.140,38,44,Elite 3&D Wing,Mavericks,1.4,0.6,57,25,CHAMPION,28.2
'11 Mavericks,Tyson Chandler,C,19,10.1,9.4,0.5,13,67.9,0.190,32,46,Elite Rim Runner,Mavericks,0.5,1.4,57,25,CHAMPION,27.8
'11 Thunder,James Harden,SG/PG,14,12.2,3.1,2.1,19,55.0,0.125,34,28,Off-Ball Sniper,Thunder,1.2,0.4,55,27,CF,26.7
'11 Thunder,Serge Ibaka,PF,15,11.0,7.5,0.5,15,56.0,0.155,32,46,Elite Enforcer,Thunder,0.7,2.4,55,27,CF,27.0
'11 Timberwolves,Jonny Flynn,PG,1,5.3,1.6,3.6,20,46.0,0.000,18,16,Secondary Playmaker,Timberwolves,0.7,0.1,17,65,MISSED,18.5
'12 76ers,Andre Iguodala,SF,18,12.4,6.1,5.5,18,53.7,0.116,36,44,Elite Lockdown Defender,76ers,1.7,0.6,35,31,R2,35.6
'12 Bobcats,Bismack Biyombo,C,8,5.2,5.8,0.4,13,47.0,0.075,18,42,Rim Runner,Hornets,0.5,1.6,7,59,MISSED,23.1
'12 Bucks,Brandon Jennings,PG,14,19.1,3.8,5.5,27,47.0,0.075,37,26,Shot Creator,Bucks,1.3,0.2,31,35,MISSED,35.3
'12 Bucks,Luc Richard Mbah a Moute,SF,9,7.5,5.2,1.5,13,53.0,0.100,24,40,3&D Wing,Bucks,0.9,0.5,31,35,MISSED,23.5
'12 Bulls,Luol Deng,SF,17,15.3,6.5,2.9,21,51.8,0.117,36,42,3&D Wing,Bulls,1.3,0.5,50,16,R1,39.4
'10 Celtics,Glen Davis,PF,8,11.7,4.4,1.0,20,53.0,0.090,26,28,Post Scorer,Celtics,0.5,0.4,50,32,FINALS,17.3
'12 Celtics,Kevin Garnett,PF/C,18,14.9,8.2,3.7,19,52.5,0.160,35,46,Two-Way Anchor,Celtics,1,1,39,27,CF,31.1
'12 Celtics,Paul Pierce,SF,19,19.4,6.3,4.5,27,56.0,0.160,40,34,Shot Creator,Celtics,1.5,0.4,39,27,CF,34.0
'12 Celtics,Rajon Rondo,PG,17,11.9,4.8,11.7,18,50.5,0.130,40,38,Elite Playmaker,Celtics,1.8,0.2,39,27,CF,36.9
'12 Celtics,Ray Allen,SG,16,14.2,3.4,2.0,17,59.8,0.152,36,32,Off-Ball Sniper,Celtics,0.8,0.1,39,27,CF,34.0
'12 Clippers,Caron Butler,SF,12,12.5,4.5,2.2,17,52.0,0.085,35,36,3&D Wing,Clippers,1,0.2,40,26,R2,29.7
'12 Clippers,Chauncey Billups,PG,13,10.5,2.7,3.9,18,56.5,0.115,36,34,Secondary Playmaker,Clippers,0.7,0.1,40,26,R2,30.4
'12 Grizzlies,Marc Gasol,C,22,14.6,7.8,3.8,20,56.5,0.180,39,44,Elite Post Scorer,Grizzlies,0.9,1.7,41,25,R1,36.5
'12 Grizzlies,Mike Conley,PG,17,12.8,2.8,5.9,20,52.0,0.130,40,42,Secondary Playmaker,Grizzlies,1.8,0.2,41,25,R1,35.1
'12 Grizzlies,Rudy Gay,SF,20,19.0,6.1,3.1,27,51.5,0.100,43,34,Elite Shot Creator,Grizzlies,1.3,0.7,41,25,R1,37.3
'12 Grizzlies,Tony Allen,SG,11,8.0,3.0,1.4,13,51.0,0.100,24,49,Elite Lockdown Defender,Grizzlies,1.8,0.5,41,25,R1,26.3
'12 Knicks,Jeremy Lin,PG,10,14.6,3.1,6.2,28,55.2,0.115,36,26,Shot Creator,Knicks,1.6,0.3,36,30,R1,26.9
'12 Knicks,Tyson Chandler,C,17,11.3,9.9,0.9,13,70.8,0.220,32,46,Two-Way Anchor,Knicks,0.5,1.2,36,30,R1,33.2
'12 Knicks,Steve Novak,SF/PF,7,8.8,1.8,0.4,12.9,64.0,0.145,30,22,Elite Off-Ball Sniper,Knicks,0.3,0.1,36,30,R1,18.9
'12 Lakers,Kobe Bryant,SG,25,27.9,5.4,4.6,33,53.7,0.175,46,38,Elite Shot Creator,Lakers,1.2,0.3,41,25,R2,38.5
'12 Lakers,Andrew Bynum,C,20,18.9,11.8,1.9,24,58.8,0.199,37,39,Elite Post Scorer,Lakers,0.5,1.9,41,25,R2,35.2
'12 Pacers,Danny Granger,SF,16,18.7,5.0,2.1,24,53.0,0.115,38,32,Shot Creator,Pacers,1.1,0.4,42,24,R2,33.3
'12 Pacers,Darren Collison,PG,11,10.4,2.5,4.8,18,55.0,0.11,34,28,Secondary Playmaker,Pacers,1,0.2,42,24,R2,31.3
'12 Suns,Wesley Johnson,SF,1,6.5,3.0,0.9,16,48.0,0.030,18,22,3&D Wing,Suns,0.7,0.4,33,33,MISSED,22.6
'12 Thunder,James Harden,SG/PG,15,16.8,4.1,3.7,22,58.3,0.167,38,30,Shot Creator,Thunder,1.6,0.4,47,19,FINALS,31.4
'12 Thunder,Kendrick Perkins,C,9,4.7,6.3,0.8,11,50.2,0.068,20,44,Enforcer,Thunder,0.5,1,47,19,FINALS,26.8
'12 Thunder,Kevin Durant,SF/PF,27,28.0,8.0,3.5,30,61.0,0.230,45,36,Elite Shot Creator,Thunder,1.3,1.2,47,19,FINALS,38.6
'12 Thunder,Nick Collison,PF,6,4.5,4.3,1.3,11,61.5,0.125,26,38,Glue Guy,Thunder,0.5,0.4,47,19,FINALS,20.7
'12 Thunder,Russell Westbrook,PG/SG,24,23.6,4.6,5.5,32,53.8,0.170,44,30,Heliocentric Playmaker,Thunder,1.5,0.3,47,19,FINALS,35.3
'12 Thunder,Serge Ibaka,PF,18,9.1,7.5,0.4,15,55.6,0.147,30,45,Elite Enforcer,Thunder,0.8,3.65,47,19,FINALS,27.2
'12 Wizards,Jan Vesely,PF,1,2.7,3.0,0.6,12,52.0,0.040,12,22,Rim Runner,Wizards,0.3,0.5,20,46,MISSED,18.9
'13 Celtics,Kevin Garnett,PF/C,17,14.8,7.6,2.7,19,53.5,0.145,34,46,Two-Way Anchor,Celtics,0.8,1.3,41,40,R1,29.7
'13 Clippers,Caron Butler,SF,10,9.7,4.8,2.0,15,52.0,0.110,34,38,3&D Wing,Clippers,0.9,0.2,56,26,R1,24.1
'13 Grizzlies,Mike Conley,PG,18,14.6,2.8,6.1,21,54.0,0.160,38,42,Floor General,Grizzlies,1.8,0.2,56,26,CF,34.1
'13 Grizzlies,Tony Allen,SG,10,8.5,3.2,1.5,13,52.5,0.095,25,49,Elite Lockdown Defender,Grizzlies,1.7,0.5,56,26,CF,26.4
'13 Grizzlies,Zach Randolph,PF,17,15.4,11.2,1.4,24,52.0,0.126,40,34,Post Scorer,Grizzlies,0.6,0.4,56,26,CF,34.9
'13 Hawks,Al Horford,C/PF,17,15.5,9.8,2.5,19,57.5,0.170,33,40,Two-Way Anchor,Hawks,0.9,1.1,44,38,R1,36.2
'13 Heat,Chris Andersen,C,4,4.9,4.1,0.4,10,61.0,0.200,18,28,Rim Runner,Heat,0.4,1.4,66,16,CHAMPION,19.5
'13 Heat,Chris Bosh,PF/C,20,16.6,6.8,1.7,21,58.0,0.180,39,39,Stretch Big,Heat,0.5,1.2,66,16,CHAMPION,33.9
'13 Heat,Dwyane Wade,SG/PG,24,21.2,5.0,5.1,28,57.1,0.190,42,38,Shot Creator,Heat,1.7,0.8,66,16,CHAMPION,33.5
'13 Heat,LeBron James,SF/PF/PG,30,26.8,8.0,7.3,30,64.0,0.322,50,50,Generational Playmaker,Heat,1.7,0.9,66,16,CHAMPION,37.9
'13 Heat,Mario Chalmers,PG,8,8.6,2.2,3.5,15,55.3,0.125,30,40,3&D Wing,Heat,1.4,0.2,66,16,CHAMPION,31.0
'13 Heat,Mike Miller,SF,3,4.8,2.7,1.7,11,59.0,0.140,32,28,Off-Ball Sniper,Heat,0.5,0.1,66,16,CHAMPION,18.6
'13 Heat,Norris Cole,PG,4,5.6,1.6,2.1,14,48.0,0.050,34,38,3&D Wing,Heat,0.8,0.1,66,16,CHAMPION,22.4
'13 Heat,Ray Allen,SG,13,10.9,2.7,1.7,17,58.2,0.140,38,30,Off-Ball Sniper,Heat,0.7,0.1,66,16,CHAMPION,25.7
'13 Heat,Shane Battier,SF,10,6.6,2.3,1.0,10,57.5,0.115,30,39,3&D Wing,Heat,0.7,0.5,66,16,CHAMPION,27.4
'13 Heat,Udonis Haslem,PF,8,3.9,5.4,0.5,10,55.0,0.110,28,38,Enforcer,Heat,0.4,0.2,66,16,CHAMPION,19.6
'13 Bobcats,Bismack Biyombo,C,1,4.8,7.3,0.4,11,50.0,0.080,12,40,Enforcer,Hornets,0.6,1.8,21,61,MISSED,22.5
'13 Jazz,Alec Burks,SG,12,12.5,3.4,2.5,20,53.5,0.105,33,28,Shot Creator,Jazz,0.7,0.2,43,39,MISSED,18.5
'13 Knicks,Carmelo Anthony,SF,27,28.7,6.9,2.6,36,56.0,0.174,47,30,Elite Shot Creator,Knicks,0.8,0.5,54,28,R2,37.0
'13 Knicks,J.R. Smith,SG,13,18.1,5.3,2.7,26,52.2,0.101,38,32,Shot Creator,Knicks,1.1,0.3,54,28,R2,32.6
'13 Magic,Arron Afflalo,SG,14,18.2,3.7,2.7,23,55.5,0.110,36,30,Shot Creator,Magic,1,0.2,20,62,MISSED,36.4
'13 Nuggets,Kenneth Faried,PF,13,11.5,9.2,1.0,17,60.5,0.155,28,34,Rim Runner,Nuggets,0.9,0.9,57,25,R1,29.7
'13 Nuggets,Ty Lawson,PG,16,16.7,3.5,6.9,23,57.0,0.14,38,28,Elite Transition Maestro,Nuggets,1.6,0.1,57,25,R1,32.1
'13 Rockets,Royce White,PF,1,0.5,0.8,0.5,15,40.0,0.000,10,16,Enforcer,Rockets,0,0,45,37,R1,0.0
'13 Suns,Goran Dragic,PG,16,18.0,3.0,5.5,23,58.5,0.155,40,28,Transition Maestro,Suns,1.4,0.2,25,57,MISSED,32.5
'13 Thunder,Serge Ibaka,PF,18,13.2,8.2,0.6,17,60.5,0.200,36,48,Elite Enforcer,Thunder,0.7,3,60,22,R2,30.6
'14 Trail Blazers,LaMarcus Aldridge,PF,22,23.4,10.2,2.3,26,50.7,0.160,42,36,Elite Post Scorer,Blazers,0.6,0.8,54,28,R2,36.4
'14 Blazers,Wesley Matthews,SG,14,16.8,3.0,2.1,21,56.0,0.115,36,38,3&D Wing,Blazers,1.3,0.2,54,28,R2,35.9
'14 Bulls,Carlos Boozer,PF,14,14.7,9.0,2.0,19,54.0,0.120,36,28,Post Scorer,Bulls,0.6,0.3,48,34,R1,30.3
'14 Bulls,Joakim Noah,C,19,12.6,11.3,5.4,17,53.1,0.211,34,48,Two-Way Anchor,Bulls,1.4,1.5,48,34,R1,35.9
'14 Cavaliers,Anthony Bennett,PF,1,4.2,3.0,0.3,18,42.0,0.010,14,18,Enforcer,Cavaliers,0.2,0.3,33,49,MISSED,12.8
'14 Clippers,Blake Griffin,PF,21,24.1,9.5,3.9,29,56.0,0.175,43,34,Elite Post Scorer,Clippers,1,0.5,57,25,R2,36.9
'14 Grizzlies,Marc Gasol,C,21,17.4,8.0,3.0,20,56.5,0.185,40,44,Elite Post Scorer,Grizzlies,1,1.7,50,32,R1,31.4
'14 Grizzlies,Zach Randolph,PF,16,17.4,9.9,2.0,24,51.0,0.100,40,30,Post Scorer,Grizzlies,0.7,0.3,50,32,R1,32.6
'14 Jazz,Trey Burke,PG,2,12.8,2.2,5.7,24,46.5,0.020,24,18,Shot Creator,Jazz,0.8,0.2,25,57,MISSED,32.4
'14 Mavs,Monta Ellis,SG,16,19.0,4.4,5.2,24,50.5,0.090,38,28,Transition Maestro,Mavericks,1.5,0.2,49,33,R1,35.1
'14 Pacers,David West,PF,14,13.4,7.3,2.6,18,53.5,0.160,38,42,Post Scorer,Pacers,1,0.4,56,26,CF,29.7
'14 Pacers,George Hill,PG,13,13.1,3.6,4.1,19,55.6,0.125,35,35,Secondary Playmaker,Pacers,1.2,0.2,56,26,CF,27.3
'14 Pacers,Paul George,SF/SG,22,21.7,6.8,3.5,27,55.5,0.190,41,44,Elite 3&D Wing,Pacers,1.9,0.4,56,26,CF,36.2
'14 Pacers,Roy Hibbert,C,14,10.8,7.9,1.4,16,49.0,0.130,30,41,Elite Enforcer,Pacers,0.3,2.2,56,26,CF,30.4
'14 Raptors,Terrence Ross,SG,11,11.6,3.2,1.6,19,54.0,0.090,33,28,Off-Ball Sniper,Raptors,0.8,0.3,48,34,R1,28.9
'14 Rockets,Chandler Parsons,SF,14,15.7,5.0,2.7,20,57.5,0.110,36,30,3&D Wing,Rockets,1.2,0.3,54,28,R1,34.9
'14 Rockets,Omer Asik,C,10,8.9,11.6,0.6,12,55.5,0.100,26,36,Enforcer,Rockets,0.5,1.3,54,28,R1,20.0
'14 Spurs,Boris Diaw,PF,14,9.1,4.1,2.8,15,56.4,0.130,38,38,Secondary Playmaker,Spurs,0.8,0.2,62,20,CHAMPION,22.5
'14 Spurs,Danny Green,SG,12,9.1,3.4,1.5,14,59.0,0.150,36,42,3&D Wing,Spurs,1.1,0.7,62,20,CHAMPION,26.2
'14 Spurs,Kawhi Leonard,SF,18,16.5,6.2,2.5,18,57.0,0.155,39,48,Elite Lockdown Defender,Spurs,1.7,0.6,62,20,CHAMPION,29.1
'14 Spurs,Marco Belinelli,SG,10,9.4,2.5,2.0,17,57.0,0.140,35,28,Off-Ball Sniper,Spurs,0.6,0.1,62,20,CHAMPION,24.7
'14 Spurs,Matt Bonner,PF,6,5.7,3.3,0.8,13,56.0,0.115,28,26,Stretch Big,Spurs,0.3,0.1,62,20,CHAMPION,11.3
'14 Spurs,Patty Mills,PG,6,10.2,2.1,1.8,18,58.0,0.150,38,30,Off-Ball Sniper,Spurs,0.7,0.1,62,20,CHAMPION,18.9
'14 Spurs,Tiago Splitter,C,5,8.2,6.2,1.5,14,54.5,0.170,32,40,Rim Runner,Spurs,0.4,0.9,62,20,CHAMPION,21.5
'14 Suns,Goran Dragic,PG,18,20.3,3.2,5.9,24,60.4,0.181,43,32,Elite Transition Maestro,Suns,1.4,0.2,48,34,MISSED,35.1
'14 Thunder,Kevin Durant,SF/PF,29,32.0,7.4,5.5,33,63.5,0.295,47,38,Elite Shot Creator,Thunder,1.3,0.7,59,23,CF,38.5
'14 Thunder,Reggie Jackson,PG,11,13.2,3.4,5.0,21,52.5,0.095,36,28,Secondary Playmaker,Thunder,1.1,0.3,59,23,CF,29.0
'14 Timberwolves,Kevin Love,PF,26,26.1,12.5,4.4,28,59.1,0.245,44,31,Stretch Big,Timberwolves,0.8,0.5,40,42,MISSED,36.3
'14 Warriors,David Lee,PF,15,18.2,9.3,3.5,22,55.0,0.14,38,30,Post Scorer,Warriors,0.8,0.3,51,31,R1,33.2
'14 Wizards,John Wall,PG,22,19.3,4.1,8.8,26,52.0,0.130,40,36,Elite Playmaker,Wizards,1.8,0.5,44,38,R2,36.3
'15 Trail Blazers,Nicolas Batum,SF,14,13.4,6.2,5.7,18,54.0,0.110,33,32,3&D Wing,Blazers,1.1,0.5,51,31,R1,33.5
'15 Cavaliers,Kyrie Irving,PG/SG,22,21.7,3.3,5.2,29,57.0,0.155,42,28,Elite Shot Creator,Cavaliers,1.4,0.3,53,29,FINALS,36.4
'15 Clippers,Blake Griffin,PF,19,21.9,7.6,4.9,27,55.4,0.190,42,34,Elite Post Scorer,Clippers,0.9,0.5,56,26,R2,35.2
'15 Clippers,Chris Paul,PG,29,19.1,4.6,10.2,24,59.6,0.270,42,40,Elite Playmaker,Clippers,1.9,0.1,56,26,R2,34.8
'15 Clippers,DeAndre Jordan,C,19,11.5,15.0,0.7,13,71.8,0.200,22,44,Rim Runner,Clippers,0.7,2.2,56,26,R2,34.4
'15 Hawks,Jeff Teague,PG,14,17.3,3.0,7.6,22,54.0,0.120,37,30,Floor General,Hawks,1.4,0.2,60,22,CF,30.5
'15 Hawks,Kyle Korver,SG,13,12.1,4.1,2.6,14,69.9,0.174,42,34,Elite Off-Ball Sniper,Hawks,0.6,0.2,60,22,CF,32.2
'15 Kings,Rudy Gay,SF,15,18.2,5.4,2.5,24,51.5,0.095,37,30,Shot Creator,Kings,1.1,0.5,29,53,MISSED,35.4
'15 Magic,Tobias Harris,SF,14,17.5,7.4,2.3,22,55.5,0.110,36,30,Shot Creator,Magic,0.8,0.4,25,57,MISSED,34.8
'15 Pacers,C.J. Miles,SF,10,13.5,3.0,1.3,21,54.5,0.1,34,30,Off-Ball Sniper,Pacers,0.7,0.3,38,44,MISSED,26.3
'15 Pelicans,Anthony Davis,PF/C,25,24.4,10.2,2.0,25,58.8,0.263,42,44,Elite Enforcer,Pelicans,1.5,2.9,45,37,R1,36.1
'15 Pelicans,Ryan Anderson,PF,14,17.1,6.2,1.5,22,59.5,0.125,36,26,Stretch Big,Pelicans,0.5,0.3,45,37,R1,27.5
'15 Suns,Goran Dragic,PG,17,16.5,2.9,4.5,23,56.0,0.135,40,28,Transition Maestro,Suns,1.4,0.2,39,43,MISSED,33.4
'15 Warriors,Andre Iguodala,SF,12,7.8,3.3,3.3,13,54.0,0.109,32,42,Glue Guy,Warriors,0.9,0.3,67,15,CHAMPION,26.9
'15 Warriors,Klay Thompson,SG,22,21.7,3.2,2.9,25,59.3,0.170,41,40,Elite Off-Ball Sniper,Warriors,1.2,0.5,67,15,CHAMPION,31.9
'15 Warriors,Shaun Livingston,PG,9,6.7,2.4,3.1,15,56.5,0.110,33,34,Role Player,Warriors,0.7,0.2,67,15,CHAMPION,18.8
'16 Blazers,CJ McCollum,SG,16,20.8,3.8,4.3,26,52.5,0.110,39,28,Shot Creator,Blazers,1.2,0.3,44,38,R2,34.8
'16 Bulls,Jimmy Butler,SF/SG,20,20.9,5.3,4.8,27,60.5,0.200,39,40,Elite 3&D Wing,Bulls,1.6,0.4,42,40,MISSED,36.9
'16 Cavs,Channing Frye,PF,7,7.0,3.3,1.2,13,57.0,0.100,29,26,Stretch Big,Cavaliers,0.3,0.3,57,25,CHAMPION,17.1
'16 Cavs,Iman Shumpert,SG,8,6.3,3.6,1.5,13,50.0,0.065,26,40,3&D Wing,Cavaliers,1.1,0.3,57,25,CHAMPION,24.4
'16 Cavs,J.R. Smith,SG,10,12.4,2.8,1.7,16,54.2,0.110,36,40,3&D Wing,Cavaliers,1.1,0.3,57,25,CHAMPION,30.7
'16 Cavs,Kevin Love,PF,17,16.0,9.9,2.4,22,55.3,0.160,42,32,Stretch Big,Cavaliers,0.8,0.5,57,25,CHAMPION,31.5
'16 Cavs,Kyrie Irving,PG/SG,22,19.6,3.0,4.7,27,55.0,0.140,42,26,Shot Creator,Cavaliers,1,0.3,57,25,CHAMPION,31.5
'16 Cavs,LeBron James,SF/PF/PG,29,25.3,7.4,6.8,31,58.8,0.242,49,46,Generational Playmaker,Cavaliers,1.4,0.6,57,25,CHAMPION,35.6
'16 Cavs,Matthew Dellavedova,PG,5,7.5,2.1,4.4,15,53.5,0.100,30,38,Lockdown Defender,Cavaliers,0.6,0.1,57,25,CHAMPION,24.6
'16 Cavs,Richard Jefferson,SF,4,5.5,1.7,0.8,12,55.0,0.110,28,32,3&D Wing,Cavaliers,0.6,0.3,57,25,CHAMPION,17.9
'16 Cavs,Timofey Mozgov,C,6,4.8,3.8,0.4,10,65.0,0.120,20,32,Rim Runner,Cavaliers,0.3,1,57,25,CHAMPION,17.4
'16 Cavs,Tristan Thompson,C,10,7.8,9.0,0.8,11,55.6,0.150,28,44,Enforcer,Cavaliers,0.6,0.7,57,25,CHAMPION,27.7
'16 Celtics,Avery Bradley,SG,13,15.0,3.3,2.3,19,53.5,0.110,33,40,Lockdown Defender,Celtics,1.5,0.3,48,34,R1,33.4
'16 Celtics,Isaiah Thomas,PG,17,22.8,2.7,6.0,30,57.5,0.130,40,20,Elite Shot Creator,Celtics,1,0.1,48,34,R1,32.2
'16 Clippers,J.J. Redick,SG,13,16.3,2.0,1.4,18,61.0,0.150,36,26,Elite Off-Ball Sniper,Clippers,0.8,0.2,53,29,R1,28.0
'16 Hornets,Jeremy Lin,PG,10,11.8,3.0,4.3,21,53.0,0.095,33,26,Shot Creator,Hornets,0.9,0.2,48,34,R1,26.3
'16 Hornets,Spencer Hawes,C,9,7.2,4.1,1.7,16,53.0,0.09,30,28,Stretch Big,Hornets,0.5,0.5,48,34,R1,18.2
'16 Kings,DeMarcus Cousins,C/PF,25,26.9,11.5,3.3,33,56.0,0.170,44,30,Elite Post Scorer,Kings,1.5,1.4,33,49,MISSED,34.6
'16 Lakers,D'Angelo Russell,PG,2,13.2,3.4,3.3,26,48.0,0.030,26,16,Shot Creator,Lakers,1,0.2,17,65,MISSED,28.2
'16 Nets,Brook Lopez,C,16,20.0,5.3,1.3,22,57.5,0.140,39,30,Post Scorer,Nets,0.6,1.7,21,61,MISSED,33.7
'16 Pacers,Paul George,SF/SG,22,23.7,7.0,4.1,29,58.4,0.210,39,43,Elite 3&D Wing,Pacers,1.9,0.4,45,37,R1,34.8
'16 Raptors,Bismack Biyombo,C,7,5.5,8.0,0.4,11,58.4,0.125,22,38,Rim Runner,Raptors,0.6,1.5,56,26,CF,22.0
'16 Raptors,DeMar DeRozan,SG/SF,21,23.5,4.5,4.0,31,53.5,0.140,40,28,Shot Creator,Raptors,1.1,0.2,56,26,CF,35.9
'16 Raptors,Kyle Lowry,PG,19,21.2,4.7,6.4,26,57.8,0.196,42,38,Floor General,Raptors,1.7,0.3,56,26,CF,37.0
'16 Raptors,Patrick Patterson,PF,10,9.4,5.9,1.2,14,56.0,0.095,28,36,Stretch Big,Raptors,0.7,0.4,56,26,CF,25.6
'16 Spurs,Boban Marjanovic,C,4,5.5,3.6,0.4,20,66.2,0.270,28,26,Post Scorer,Spurs,0.4,0.6,67,15,R2,9.4
'16 Suns,Eric Bledsoe,PG,16,21.1,4.8,6.1,26,53.5,0.120,40,34,Elite Playmaker,Suns,1.6,0.3,23,59,MISSED,34.2
'16 Suns,T.J. Warren,SF,13,14.7,4.6,1.1,22,55.5,0.105,36,28,Shot Creator,Suns,0.7,0.3,23,59,MISSED,22.8
'16 Suns,Tyson Chandler,C,10,7.7,9.4,0.6,13,68.0,0.160,24,42,Rim Runner,Suns,0.6,1,23,59,MISSED,24.5
'16 Timberwolves,Andrew Wiggins,SF,16,20.7,4.6,2.4,24,47.0,0.085,38,28,Shot Creator,Timberwolves,0.9,0.6,29,53,MISSED,35.1
'16 Warriors,Andrew Bogut,C,14,5.4,7.0,2.3,10,62.3,0.160,28,46,Enforcer,Warriors,0.7,1.2,73,9,FINALS,20.7
'16 Warriors,Draymond Green,PF/C,20,14.0,9.5,7.4,18,58.7,0.190,36,45,Floor General,Warriors,1.5,1.4,73,9,FINALS,34.7
'16 Warriors,Harrison Barnes,SF,12,11.7,5.0,1.8,16,55.9,0.130,35,38,3&D Wing,Warriors,0.8,0.4,73,9,FINALS,30.9
'16 Warriors,Klay Thompson,SG,24,22.1,3.8,2.1,26,59.7,0.160,43,43,Elite Off-Ball Sniper,Warriors,1.1,0.5,73,9,FINALS,33.3
'16 Warriors,Shaun Livingston,PG,8,6.3,2.2,3.0,14,57.0,0.116,32,34,Role Player,Warriors,0.5,0.2,73,9,FINALS,19.5
'16 Warriors,Stephen Curry,PG,30,30.1,5.4,6.7,32,66.9,0.318,51,31,Elite Off-Ball Sniper,Warriors,2.1,0.2,73,9,FINALS,34.2
'17 Bucks,Greg Monroe,C,12,11.7,6.6,2.3,21,57.5,0.15,32,30,Post Scorer,Bucks,0.7,0.5,42,40,R1,22.5
'17 Cavs,Deron Williams,PG,7,10.0,2.0,4.5,17,52.0,0.070,36,26,Secondary Playmaker,Cavaliers,0.7,0.1,51,31,FINALS,20.3
'17 Cavs,Kyle Korver,SG,9,8.2,2.8,1.6,13,67.0,0.155,36,28,Off-Ball Sniper,Cavaliers,0.6,0.1,51,31,FINALS,24.5
'17 Cavs,Kyrie Irving,PG/SG,23,25.2,3.2,5.8,30,57.5,0.165,42,26,Elite Shot Creator,Cavaliers,1.3,0.3,51,31,FINALS,35.1
'17 Celtics,Avery Bradley,SG,12,14.5,3.0,2.4,18,53.0,0.100,32,40,Lockdown Defender,Celtics,1.1,0.3,53,29,CF,33.4
'17 Celtics,Isaiah Thomas,PG,18,28.9,2.7,5.9,32,59.0,0.157,44,29,Elite Shot Creator,Celtics,0.9,0.2,53,29,CF,33.8
'17 Celtics,Jaylen Brown,SF/SG,10,6.6,2.8,0.7,14,52.0,0.075,28,30,Role Player,Celtics,0.8,0.3,53,29,CF,17.2
'17 Clippers,Austin Rivers,PG,10,12.1,2.0,2.8,19,52.0,0.075,33,30,Role Player,Clippers,0.8,0.2,51,31,R1,27.8
'17 Clippers,Chris Paul,PG,22,18.1,5.0,9.2,25.8,61.4,0.265,40,36,Elite Playmaker,Clippers,2,0.1,51,31,R1,31.5
'17 Jazz,Gordon Hayward,SF,20,21.9,5.4,3.6,26,58.0,0.175,40,36,Shot Creator,Jazz,1,0.3,51,31,R2,34.5
'17 Nets,Timofey Mozgov,C,8,6.5,5.8,0.5,13,56.0,0.095,22,36,Rim Runner,Nets,0.4,0.9,20,62,MISSED,20.4
'17 Pelicans,DeMarcus Cousins,C/PF,23,25.2,12.9,4.8,31,53.5,0.160,42,28,Elite Post Scorer,Pelicans,1.5,1.4,34,48,MISSED,33.8
'17 Raptors,DeMar DeRozan,SG/SF,24,27.3,5.2,3.9,34,55.2,0.170,43,30,Elite Shot Creator,Raptors,1.1,0.2,51,31,R2,35.4
'17 Raptors,P.J. Tucker,SF,8,5.0,6.0,1.5,10,52.0,0.065,24,42,3&D Wing,Raptors,1,0.4,51,31,R2,25.4
'17 Rockets,Eric Gordon,SG,16,16.2,2.8,2.5,25,56.0,0.120,40,30,Off-Ball Sniper,Rockets,1,0.3,55,27,R2,31.0
'17 Spurs,Kawhi Leonard,SF/PF,27,25.5,5.8,3.5,31,61.0,0.277,46,48,Elite Shot Creator,Spurs,1.8,0.7,61,21,CF,33.4
'17 Thunder,Russell Westbrook,PG/SG,27,31.6,10.7,10.4,41,55.4,0.224,48,30,Heliocentric Playmaker,Thunder,1.6,0.4,47,35,R1,34.6
'17 Timberwolves,Andrew Wiggins,SF,14,23.6,4.0,2.2,26,46.5,0.070,37,28,Shot Creator,Timberwolves,0.9,0.6,31,51,MISSED,37.2
'17 Timberwolves,Karl-Anthony Towns,C/PF,21,25.1,12.3,2.7,27,60.0,0.165,42,28,Stretch Big,Timberwolves,0.9,1.3,31,51,MISSED,37.0
'17 Warriors,Andre Iguodala,SF,12,7.6,4.0,3.4,11,62.4,0.167,32,42,Glue Guy,Warriors,0.9,0.4,67,15,CHAMPION,26.3
'17 Warriors,David West,PF,4,4.6,3.0,2.2,14,57.5,0.160,30,36,Enforcer,Warriors,0.5,0.6,67,15,CHAMPION,12.6
'17 Warriors,Draymond Green,PF/C,19,10.2,7.9,7.0,16,52.2,0.130,34,47,Floor General,Warriors,2,1.4,67,15,CHAMPION,32.5
'17 Warriors,Ian Clark,SG,3,6.8,1.6,1.2,16,57.0,0.100,32,26,Off-Ball Sniper,Warriors,0.5,0.1,67,15,CHAMPION,14.8
'17 Warriors,Kevin Durant,SF/PF,29,25.1,8.3,4.8,27,65.1,0.278,46,42,Elite Shot Creator,Warriors,1.1,1.6,67,15,CHAMPION,33.4
'17 Warriors,Klay Thompson,SG,23,22.3,3.7,2.1,26,59.8,0.150,42,42,Elite Off-Ball Sniper,Warriors,0.8,0.5,67,15,CHAMPION,34.0
'17 Warriors,Patrick McCaw,SG,3,5.0,1.8,1.7,11,54.0,0.085,28,28,Role Player,Warriors,1,0.3,67,15,CHAMPION,15.1
'17 Warriors,Stephen Curry,PG,29,25.3,4.5,6.6,30,62.4,0.228,49,30,Elite Off-Ball Sniper,Warriors,1.6,0.2,67,15,CHAMPION,33.4
'17 Warriors,Zaza Pachulia,C,7,6.1,5.9,1.9,12,58.8,0.161,20,28,Enforcer,Warriors,0.5,0.4,67,15,CHAMPION,18.1
'17 Wizards,John Wall,PG,25,23.1,4.2,10.7,30,54.1,0.149,43,36,Elite Playmaker,Wizards,1.6,0.6,49,33,R2,36.4
'18 76ers,Ben Simmons,PG/SF,14,15.8,8.1,8.2,18,54.5,0.135,30,44,Floor General,76ers,1.7,0.9,52,30,R2,33.7
'18 Blazers,CJ McCollum,SG,17,21.4,3.7,3.8,27,52.5,0.120,40,28,Shot Creator,Blazers,1,0.3,49,33,R1,36.1
'18 Cavs,LeBron James,SF/PF/PG,30,27.5,8.6,9.1,35,62.1,0.221,50,42,Generational Playmaker,Cavaliers,1.4,0.9,50,32,FINALS,36.9
'18 Clippers,Danilo Gallinari,SF,15,15.4,5.4,2.1,22,58.0,0.125,38,28,Stretch Big,Clippers,0.7,0.2,42,40,MISSED,32.0
'18 Clippers,Lou Williams,SG,13,22.6,2.5,5.3,30,57.4,0.129,43,22,Shot Creator,Clippers,1,0.2,42,40,MISSED,32.8
'18 Grizzlies,Dillon Brooks,SF,10,11.0,3.2,1.5,18,50.5,0.085,28,38,3&D Wing,Grizzlies,0.8,0.2,22,60,MISSED,28.7
'18 Grizzlies,Mike Conley,PG,18,17.1,2.9,5.5,21,53.0,0.130,38,36,Floor General,Grizzlies,1.2,0.3,22,60,MISSED,31.1
'18 Knicks,Kristaps Porzingis,C/PF,19,22.7,6.6,1.2,33.5,54.9,0.121,40,38,Defensive Unicorn,Knicks,0.7,2.4,29,53,MISSED,32.4
'18 Lakers,Lonzo Ball,PG,9,10.2,6.9,7.2,17,47.7,0.077,26,36,Secondary Playmaker,Lakers,1.7,0.4,35,47,MISSED,34.2
'18 Pacers,Victor Oladipo,SG,23,23.1,5.2,4.3,30,57.7,0.180,34,38,Elite Shot Creator,Pacers,2.4,0.8,48,34,R1,34.0
'18 Pelicans,E'Twaun Moore,SG,8,11.5,2.5,2.5,16,57.5,0.095,32,28,Role Player,Pelicans,0.8,0.2,48,34,R2,31.5
'18 Pelicans,Nikola Mirotic,PF,14,16.0,6.6,1.5,22,58.5,0.120,36,28,Stretch Big,Pelicans,0.8,0.5,48,34,R2,29.1
'18 Raptors,Kyle Lowry,PG,18,16.2,5.6,6.9,24,55.0,0.155,38,38,Floor General,Raptors,1,0.3,59,23,CF,32.2
'18 Rockets,Chris Paul,PG,26,18.6,5.4,7.9,24,60.4,0.250,43,41,Elite Playmaker,Rockets,2,0.2,65,17,CF,31.8
'18 Rockets,Clint Capela,C,20,13.9,10.8,0.9,17,65.0,0.240,36,44,Rim Runner,Rockets,0.9,1.9,65,17,CF,27.5
'18 Rockets,Eric Gordon,SG,14,18.0,2.5,2.2,24,57.5,0.130,42,32,Off-Ball Sniper,Rockets,1,0.3,65,17,CF,31.2
'18 Rockets,James Harden,SG/PG,27,30.4,5.4,8.8,36,61.9,0.289,45,28,Heliocentric Playmaker,Rockets,1.8,0.7,65,17,CF,35.4
'18 Rockets,P.J. Tucker,PF,10,6.1,5.6,0.9,10,51.0,0.090,30,44,3&D Wing,Rockets,0.9,0.4,65,17,CF,27.8
'18 Rockets,Trevor Ariza,SF,12,11.7,4.4,1.6,14,55.0,0.120,34,42,3&D Wing,Rockets,1.5,0.4,65,17,CF,33.9
'18 Spurs,LaMarcus Aldridge,PF,21,23.1,9.0,2.0,27,53.5,0.165,42,36,Post Scorer,Spurs,0.9,1.2,47,35,R1,33.5
'18 Thunder,Russell Westbrook,PG/SG,24,25.4,10.1,10.3,40,47.5,0.145,42,28,Heliocentric Playmaker,Thunder,1.8,0.3,48,34,R1,36.4
'18 Timberwolves,Karl-Anthony Towns,C/PF,21,21.3,12.0,2.6,25,59.5,0.155,40,28,Stretch Big,Timberwolves,0.9,1.4,47,35,R1,35.6
'19 76ers,Ben Simmons,PG/SF,16,16.9,8.8,7.7,19,57.5,0.155,31,44,Floor General,76ers,1.3,0.8,51,31,R2,34.2
'19 Blazers,Al-Farouq Aminu,PF,11,8.5,7.8,1.3,13,53.0,0.065,26,40,3&D Wing,Blazers,0.8,0.5,53,29,CF,28.3
'19 Blazers,CJ McCollum,SG,17,21.8,3.9,3.4,26,53.0,0.110,40,30,Shot Creator,Blazers,1,0.3,53,29,CF,33.9
'19 Blazers,Damian Lillard,PG,22,25.8,4.6,6.9,32,58.8,0.205,46,31,Heliocentric Playmaker,Blazers,1.1,0.4,53,29,CF,35.5
'19 Blazers,Enes Kanter,C,14,14.4,10.1,0.9,18,57.0,0.100,38,24,Post Scorer,Blazers,0.5,0.4,53,29,CF,22.3
'19 Blazers,Maurice Harkless,SF,10,8.5,4.8,1.3,13,53.0,0.088,28,38,3&D Wing,Blazers,0.7,0.4,53,29,CF,23.6
'19 Blazers,Rodney Hood,SG,12,10.8,2.4,1.5,19,55.0,0.085,33,27,Shot Creator,Blazers,0.6,0.2,53,29,CF,24.4
'19 Bucks,Khris Middleton,SF,17,18.3,6.0,4.3,23,56.0,0.135,38,34,Shot Creator,Bucks,1.1,0.2,60,22,CF,31.1
'19 Celtics,Al Horford,C/PF,15,13.6,6.7,4.2,15,60.0,0.165,35,42,Two-Way Anchor,Celtics,0.9,1.3,49,33,R2,29.0
'19 Hornets,Jeremy Lamb,SG,11,15.3,4.2,2.0,20,53.0,0.085,35,28,Shot Creator,Hornets,1.3,0.4,39,43,MISSED,28.5
'19 Hornets,Kemba Walker,PG,24,25.6,4.4,5.9,31,55.8,0.150,43,28,Elite Shot Creator,Hornets,1.2,0.4,39,43,MISSED,34.9
'19 Jazz,Donovan Mitchell,SG/PG,21,23.8,4.4,4.1,28,54.5,0.135,40,30,Shot Creator,Jazz,1.4,0.4,50,32,R1,33.7
'19 Kings,Buddy Hield,SG,15,20.7,5.0,2.5,24,59.0,0.130,37,26,Elite Off-Ball Sniper,Kings,0.8,0.2,39,43,MISSED,31.9
'19 Magic,Markelle Fultz,PG,2,8.2,3.7,3.1,21,49.0,0.040,22,24,Secondary Playmaker,Magic,0.9,0.3,42,40,R1,22.5
'19 Magic,Nikola Vucevic,C,18,20.8,12.0,3.8,24,56.5,0.165,40,31,Post Scorer,Magic,0.8,1,42,40,R1,31.4
'19 Nets,Spencer Dinwiddie,PG,14,16.8,3.7,6.8,24,54.0,0.100,36,28,Shot Creator,Nets,1.4,0.3,42,40,R1,28.1
'19 Pelicans,Jrue Holiday,PG,17,19.1,5.0,5.5,22,52.5,0.120,36,44,Elite Lockdown Defender,Pelicans,1.6,0.8,33,49,MISSED,35.9
'19 Pistons,Andre Drummond,C,16,17.8,15.8,1.6,18,57.0,0.165,28,42,Rim Runner,Pistons,1.7,1.7,41,41,R1,33.5
'19 Raptors,Kawhi Leonard,SF/PF,27,26.6,7.3,3.3,31,60.6,0.224,46,46,Elite Shot Creator,Raptors,1.8,0.4,58,24,CHAMPION,34.0
'19 Raptors,Kyle Lowry,PG,17,14.2,4.8,8.7,21,56.2,0.150,37,38,Secondary Playmaker,Raptors,1.5,0.3,58,24,CHAMPION,34.0
'19 Raptors,Marc Gasol,C,15,8.3,6.4,2.7,12,56.0,0.130,35,45,Floor General,Raptors,0.8,1,58,24,CHAMPION,24.9
'19 Raptors,Norman Powell,SG,12,8.6,2.3,1.5,16,55.0,0.110,32,33,Shot Creator,Raptors,0.6,0.2,58,24,CHAMPION,18.8
'19 Raptors,Pascal Siakam,PF/SF,16,16.9,6.9,3.1,22,56.5,0.140,36,36,Shot Creator,Raptors,0.9,0.8,58,24,CHAMPION,31.9
'19 Raptors,Serge Ibaka,PF,13,10.5,6.2,1.0,16,60.5,0.155,33,42,Stretch Big,Raptors,0.6,1,58,24,CHAMPION,19.9
'19 Thunder,Steven Adams,C,15,13.9,9.5,1.6,16,63.0,0.173,32,42,Rim Runner,Thunder,1.5,1,49,33,R1,33.4
'19 Thunder,Paul George,SF/SG,26,28.0,8.2,4.1,29,58.3,0.201,42,42,Elite 3&D Wing,Thunder,2.2,0.4,49,33,R1,36.9
'19 Thunder,Russell Westbrook,PG/SG,23,22.9,11.1,10.7,41,47.0,0.135,42,26,Heliocentric Playmaker,Thunder,1.9,0.5,49,33,R1,36.0
'19 Warriors,D'Angelo Russell,PG,15,23.6,3.9,5.7,28,55.0,0.130,40,24,Shot Creator,Warriors,1.3,0.2,57,25,FINALS,30.3
'19 Warriors,Draymond Green,PF/C,15,7.4,6.9,6.9,14,46.5,0.075,30,44,Floor General,Warriors,1.4,0.5,57,25,FINALS,32.7
'20 Blazers,Damian Lillard,PG,29,30.0,4.3,8.0,33,62.7,0.225,48,31,Heliocentric Playmaker,Blazers,1.1,0.3,35,39,R1,37.5
'20 Bucks,Giannis Antetokounmpo,PF/SF,28,29.6,13.7,5.6,31,61.7,0.255,45,46,Generational Playmaker,Bucks,1,1,56,17,R2,30.9
'20 Bucks,Khris Middleton,SF,18,20.9,6.5,4.3,25,57.0,0.140,40,36,Shot Creator,Bucks,0.8,0.2,56,17,R2,31.1
'20 Clippers,Kawhi Leonard,SF/PF,27,27.2,6.3,4.9,29,62.7,0.244,46,45,Elite Shot Creator,Clippers,1.8,0.4,49,23,R2,32.4
'20 Heat,Bam Adebayo,C/PF,18,15.9,10.2,5.1,22,57.0,0.175,36,42,Two-Way Anchor,Heat,1.1,1.3,44,29,FINALS,33.6
'20 Jazz,Donovan Mitchell,SG/PG,22,24.0,4.4,4.2,29,56.0,0.150,40,28,Elite Shot Creator,Jazz,1.1,0.3,44,28,R1,33.9
'20 Lakers,Anthony Davis,PF/C,27,26.1,9.3,3.2,28,61.0,0.250,44,48,Elite Enforcer,Lakers,1.5,2.3,52,19,CHAMPION,34.4
'20 Lakers,Danny Green,SF,8,8.0,3.3,1.3,13,56.8,0.110,30,40,3&D Wing,Lakers,0.8,0.3,52,19,CHAMPION,26.6
'20 Lakers,Dwight Howard,C,17,7.5,7.3,0.7,14,73.2,0.200,24,40,Enforcer,Lakers,0.5,1.2,52,19,CHAMPION,18.9
'20 Lakers,Kentavious Caldwell-Pope,SG,10,9.3,2.1,1.6,14,58.4,0.100,32,42,3&D Wing,Lakers,1,0.3,52,19,CHAMPION,26.2
'20 Lakers,Kyle Kuzma,PF,12,12.8,4.5,1.3,20,53.0,0.070,35,36,Shot Creator,Lakers,0.5,0.3,52,19,CHAMPION,26.6
'20 Lakers,LeBron James,PG/SF/PF,29,25.3,7.8,10.2,31,57.7,0.204,46,40,Generational Playmaker,Lakers,1.2,0.5,52,19,CHAMPION,34.6
'20 Lakers,Rajon Rondo,PG,8,7.1,3.0,5.0,16,45.0,0.050,31,38,Secondary Playmaker,Lakers,1.2,0.2,52,19,CHAMPION,19.5
'20 Mavericks,Luka Doncic,PG/SG,27,28.8,9.4,8.8,36,58.5,0.176,45,30,Heliocentric Playmaker,Mavericks,1,0.2,43,32,R1,33.6
'20 Nets,Caris LeVert,SG,14,18.0,4.6,4.7,24,54.5,0.100,36,30,Shot Creator,Nets,1.1,0.4,35,37,R1,32.2
'20 Nuggets,Jamal Murray,PG,17,18.5,4.0,4.8,23,55.0,0.135,37,30,Shot Creator,Nuggets,1.3,0.4,46,27,CF,32.0
'20 Nuggets,Michael Porter Jr.,SF,12,12.0,5.3,0.9,16,58.5,0.110,32,30,Off-Ball Sniper,Nuggets,0.5,0.6,46,27,CF,20.6
'20 Suns,Devin Booker,SG/PG,22,26.1,4.0,6.3,30,57.8,0.155,40,28,Elite Shot Creator,Suns,0.9,0.4,34,39,MISSED,34.9
'20 Thunder,Shai Gilgeous-Alexander,PG,18,19.0,4.7,3.3,25,57.0,0.140,37,32,Shot Creator,Thunder,1.5,0.6,44,28,R1,31.4
'20 Wizards,Rui Hachimura,SF,11,13.5,5.8,1.3,20,55.0,0.105,32,28,Shot Creator,Wizards,0.6,0.2,25,47,MISSED,28.4
'21 Bucks,Brook Lopez,C,14,12.3,5.0,1.7,17,59.5,0.120,38,46,Stretch Big,Bucks,0.5,1.9,46,26,CHAMPION,26.9
'21 Bucks,Donte DiVincenzo,SG,11,9.1,3.8,2.7,14,53.5,0.108,28,34,3&D Wing,Bucks,0.8,0.2,46,26,CHAMPION,27.4
'21 Bucks,Giannis Antetokounmpo,PF/SF,30,28.1,11.0,5.9,32,63.3,0.244,47,46,Generational Playmaker,Bucks,1.2,1.2,46,26,CHAMPION,33.0
'21 Bucks,Jrue Holiday,PG,19,17.7,4.5,6.1,21,59.2,0.140,39,45,Elite Lockdown Defender,Bucks,1.6,0.8,46,26,CHAMPION,32.1
'21 Bucks,Khris Middleton,SF,19,20.4,6.0,5.4,26,58.5,0.160,40,38,Shot Creator,Bucks,1.1,0.2,46,26,CHAMPION,32.1
'21 Bucks,P.J. Tucker,SF,12,7.6,5.5,1.5,13,57.0,0.075,24,44,3&D Wing,Bucks,0.7,0.3,46,26,CHAMPION,26.0
'21 Bulls,Zach LaVine,SG,22,27.4,5.0,4.9,30,63.4,0.170,43,26,Elite Shot Creator,Bulls,0.8,0.4,31,41,MISSED,35.1
'21 Celtics,Jaylen Brown,SF/SG,18,24.7,5.1,3.4,28,53.0,0.115,40,32,Shot Creator,Celtics,1.2,0.4,36,36,R1,34.0
'21 Celtics,Marcus Smart,PG,12,13.1,4.0,5.7,18,53.5,0.095,28,44,Elite Lockdown Defender,Celtics,1.5,0.4,36,36,R1,31.3
'21 Clippers,Paul George,SF/SG,24,24.3,6.7,5.2,29,56.8,0.175,41,42,Elite 3&D Wing,Clippers,1.5,0.4,47,25,CF,32.6
'21 Hawks,Bogdan Bogdanovic,SG,14,16.4,3.6,3.3,22,58.5,0.135,38,30,Off-Ball Sniper,Hawks,0.9,0.2,41,31,CF,27.9
'21 Heat,Jimmy Butler,SF/SG,26,21.5,7.4,5.9,23,62.0,0.250,38,40,Secondary Playmaker,Heat,1.8,0.6,40,32,R1,31.5
'21 Jazz,Bojan Bogdanovic,SF,15,18.1,4.1,2.1,23,59.0,0.120,36,28,Off-Ball Sniper,Jazz,0.6,0.1,52,20,R2,30.8
'21 Jazz,Donovan Mitchell,SG/PG,23,26.4,4.4,5.2,30,57.5,0.170,41,30,Elite Shot Creator,Jazz,1,0.3,52,20,R2,33.8
'21 Jazz,Royce O'Neale,PF,10,8.2,4.3,1.8,12,52.0,0.090,26,38,3&D Wing,Jazz,0.9,0.5,52,20,R2,29.4
'21 Jazz,Rudy Gobert,C,14,14.3,13.5,1.2,13,67.8,0.230,36,48,Elite Enforcer,Jazz,0.7,2.7,52,20,R2,30.8
'21 Knicks,Julius Randle,PF,22,24.1,10.2,6.0,29,56.1,0.170,41,30,Shot Creator,Knicks,0.9,0.5,41,31,R1,37.6
'21 Lakers,Alex Caruso,PG,10,6.4,2.9,2.8,11,53.1,0.098,26,48,Lockdown Defender,Lakers,1,0.5,42,30,R1,22.7
'21 Nets,Blake Griffin,C,13,10.5,5.1,2.5,18,52.5,0.095,33,32,Stretch Big,Nets,0.5,0.3,48,24,R2,21.5
'21 Nets,James Harden,PG/SG,22,24.6,8.5,10.9,30,58.5,0.155,44,28,Heliocentric Playmaker,Nets,1.2,0.8,48,24,R2,36.6
'21 Nets,Kevin Durant,SF/PF,30,26.9,7.1,5.6,29,66.3,0.290,48,38,Elite Shot Creator,Nets,0.7,1.3,48,24,R2,33.1
'21 Nuggets,Nikola Jokic,C,28,26.4,10.8,8.3,26,64.0,0.285,49,38,Generational Playmaker,Nuggets,1.3,0.7,47,25,R2,34.6
'21 Raptors,Pascal Siakam,PF/SF,19,21.4,7.2,4.5,26,55.0,0.125,39,34,Shot Creator,Raptors,0.9,0.5,27,45,MISSED,35.8
'21 Suns,Cameron Payne,PG,7,8.4,2.7,4.5,17,57.0,0.110,32,28,Role Player,Suns,0.7,0.2,51,21,FINALS,18.0
'21 Suns,Deandre Ayton,C,16,14.4,10.5,1.4,18,65.3,0.180,36,42,Rim Runner,Suns,0.6,0.8,51,21,FINALS,30.7
'21 Suns,E'Twaun Moore,SG,6,7.5,2.0,2.2,14,60.0,0.115,32,28,Role Player,Suns,0.4,0.1,51,21,FINALS,14.4
'21 Suns,Jae Crowder,PF,11,8.9,4.4,1.6,14,51.5,0.100,28,36,3&D Wing,Suns,0.9,0.4,51,21,FINALS,27.5
'21 Suns,Mikal Bridges,SF/SG,14,13.5,3.8,2.1,15,61.0,0.130,32,42,Elite 3&D Wing,Suns,1,0.5,51,21,FINALS,32.6
'21 Wizards,Bradley Beal,SG,26,31.3,4.7,4.4,34,59.3,0.134,46,26,Elite Shot Creator,Wizards,1.2,0.4,34,38,R1,35.8
'22 76ers,Joel Embiid,C,28,30.6,11.7,4.2,33,61.5,0.222,45,40,Elite Post Scorer,76ers,1.1,1.5,51,31,R2,33.8
'22 76ers,Tyrese Maxey,PG,16,17.5,3.2,4.3,22,55.5,0.120,35,28,Shot Creator,76ers,1,0.4,51,31,R2,35.3
'22 Bucks,Bobby Portis,PF,11,14.6,8.5,1.4,19,57.5,0.115,33,26,Stretch Big,Bucks,0.6,0.4,51,31,R2,28.2
'22 Bucks,Jrue Holiday,PG,17,18.6,4.5,5.1,21,57.5,0.140,38,44,Elite Lockdown Defender,Bucks,1.6,0.7,51,31,R2,33.0
'22 Celtics,Grant Williams,PF,6,7.4,4.4,1.3,12,59.0,0.130,24,34,3&D Wing,Celtics,0.7,0.5,51,31,FINALS,24.4
'22 Celtics,Jaylen Brown,SF/SG,21,23.6,6.1,3.5,27,54.0,0.120,41,34,Shot Creator,Celtics,1.1,0.4,51,31,FINALS,33.6
'22 Celtics,Marcus Smart,PG,15,12.1,3.8,5.9,18,54.0,0.116,30,47,Elite Lockdown Defender,Celtics,1.7,0.4,51,31,FINALS,32.3
'22 Celtics,Robert Williams III,C,12,10.0,9.6,1.7,14,74.0,0.220,28,43,Rim Protector,Celtics,0.9,2.2,51,31,FINALS,29.6
'22 Grizzlies,Brandon Clarke,PF,9,9.5,5.4,0.8,15,65.0,0.155,24,34,Rim Runner,Grizzlies,0.6,0.8,56,26,R2,19.5
'22 Grizzlies,Desmond Bane,SG,15,18.2,4.4,2.7,22,59.9,0.150,34,34,Off-Ball Sniper,Grizzlies,1.1,0.3,56,26,R2,29.8
'22 Grizzlies,Dillon Brooks,SF,13,18.0,3.9,2.2,26,49.5,0.070,30,38,Lockdown Defender,Grizzlies,0.9,0.3,56,26,R2,27.7
'22 Grizzlies,Ja Morant,PG,22,27.4,5.7,6.7,34,57.5,0.171,43,31,Heliocentric Playmaker,Grizzlies,1.2,0.3,56,26,R2,33.1
'22 Grizzlies,Jaren Jackson Jr.,PF,17,16.3,5.8,1.0,22,54.0,0.140,32,46,Defensive Unicorn,Grizzlies,0.9,2.3,56,26,R2,27.3
'22 Grizzlies,Kyle Anderson,PF,10,7.6,5.0,3.5,12,55.0,0.100,30,36,Glue Guy,Grizzlies,1.4,0.6,56,26,R2,21.5
'22 Grizzlies,Steven Adams,C,12,8.6,10.7,2.5,12,59.5,0.155,24,38,Rim Runner,Grizzlies,0.9,0.8,56,26,R2,26.3
'22 Grizzlies,Tyus Jones,PG,9,8.7,2.4,4.4,16,57.0,0.13,32,32,Secondary Playmaker,Grizzlies,1.1,0.1,56,26,R2,21.2
'22 Heat,Jimmy Butler,SF/SG,27,21.4,5.9,5.5,25,63.0,0.260,40,40,Secondary Playmaker,Heat,1.6,0.6,53,29,CF,33.9
'22 Heat,Tyler Herro,SG,18,20.7,5.0,4.0,28,56.1,0.110,40,28,Shot Creator,Heat,0.6,0.2,53,29,CF,32.6
'22 Hornets,LaMelo Ball,PG,21,20.1,6.7,7.6,27,55.8,0.110,40,24,Elite Playmaker,Hornets,1.6,0.3,43,39,MISSED,32.3
'22 Jazz,Rudy Gobert,C,13,15.6,14.7,1.1,14,71.5,0.240,36,48,Elite Enforcer,Jazz,0.7,2.1,49,33,R1,32.1
'22 Knicks,RJ Barrett,SF/SG,15,20.0,5.8,3.0,25,54.3,0.080,36,30,Shot Creator,Knicks,0.7,0.3,37,45,MISSED,34.5
'22 Nets,Ben Simmons,PG/SF,14,7.9,6.9,6.1,14,62.5,0.130,30,42,Lockdown Defender,Nets,0,0,44,38,R1,0.0
'22 Nuggets,Nikola Jokic,C,29,27.1,13.8,7.9,28,67.3,0.298,49,38,Generational Playmaker,Nuggets,1.5,0.9,48,34,R1,33.5
'22 Pelicans,Herbert Jones,SF,10,9.4,4.2,2.1,13,55.0,0.115,26,46,Lockdown Defender,Pelicans,1.1,0.6,36,46,R1,29.9
'22 Raptors,Fred VanVleet,PG,17,20.3,4.4,6.7,24,54.3,0.110,36,38,Floor General,Raptors,1.6,0.6,48,34,R1,37.9
'22 Spurs,Dejounte Murray,PG,20,21.1,8.3,9.2,27,52.9,0.120,38,42,Elite Playmaker,Spurs,2,0.4,34,48,MISSED,34.8
'22 Suns,Devin Booker,SG/PG,24,26.8,5.0,4.8,30,57.4,0.150,40,28,Elite Shot Creator,Suns,1.1,0.4,64,18,R2,34.5
'22 Suns,Mikal Bridges,SF/SG,16,14.2,4.2,2.3,15,62.7,0.146,35,44,Elite 3&D Wing,Suns,1.1,0.5,64,18,R2,34.8
'22 Thunder,Shai Gilgeous-Alexander,PG,22,24.5,4.8,5.6,30,60.0,0.190,40,32,Elite Shot Creator,Thunder,1.3,0.9,24,58,MISSED,34.7
'22 Warriors,Andrew Wiggins,SF,19,17.2,4.5,2.2,21,56.0,0.110,35,42,3&D Wing,Warriors,0.9,0.5,53,29,CHAMPION,31.9
'22 Warriors,Draymond Green,PF/C,15,7.5,7.3,7.1,14,49.5,0.090,32,46,Floor General,Warriors,1.3,1.1,53,29,CHAMPION,28.9
'22 Warriors,Jordan Poole,SG,17,18.5,3.4,4.0,26,59.8,0.120,38,26,Shot Creator,Warriors,0.9,0.3,53,29,CHAMPION,30.0
'22 Warriors,Kevon Looney,C,7,6.1,6.0,2.0,11.5,62.0,0.145,22,27,Enforcer,Warriors,0.5,0.4,53,29,CHAMPION,21.1
'22 Warriors,Klay Thompson,SG,19,20.4,3.9,2.8,23,57.8,0.135,39,38,Elite Off-Ball Sniper,Warriors,0.8,0.5,53,29,CHAMPION,29.4
'22 Warriors,Stephen Curry,PG,26,25.5,5.2,6.3,30,63.9,0.231,44,32,Elite Shot Creator,Warriors,1.3,0.4,53,29,CHAMPION,34.5
'23 76ers,Tobias Harris,PF,16,14.5,6.4,2.1,20,58.0,0.130,39,34,3&D Wing,76ers,0.7,0.5,54,28,R2,32.9
'23 Bucks,Khris Middleton,SF,17,19.6,5.1,5.0,24,57.5,0.135,39,36,Shot Creator,Bucks,1,0.2,58,24,R1,24.3
'23 Bulls,Alex Caruso,PG,11,5.6,2.9,2.9,11,58.5,0.105,28,48,Elite Lockdown Defender,Bulls,1.7,0.8,40,42,MISSED,23.5
'23 Celtics,Marcus Smart,PG,13,11.5,3.4,5.0,17,52.5,0.100,28,44,Elite Lockdown Defender,Celtics,1.6,0.4,57,25,CF,32.1
'23 Heat,Bam Adebayo,C/PF,23,20.4,9.2,3.2,25,57.6,0.150,38,46,Two-Way Anchor,Heat,1,0.8,44,38,FINALS,34.6
'23 Heat,Jimmy Butler,SF/SG,29,22.9,5.9,5.3,25,64.7,0.277,39,38,Secondary Playmaker,Heat,1.8,0.9,44,38,FINALS,33.4
'23 Heat,Kyle Lowry,PG,14,11.1,3.3,5.6,18,51.0,0.095,32,31,Secondary Playmaker,Heat,0.9,0.2,44,38,FINALS,31.2
'23 Knicks,Immanuel Quickley,PG/SG,12,14.9,3.4,2.2,20.6,59.6,0.163,28,26,Shot Creator,Knicks,0.9,0.3,47,35,R2,28.9
'23 Magic,Wendell Carter Jr.,C,12,12.9,8.9,2.9,16,56.5,0.145,30,36,Enforcer,Magic,0.7,0.9,34,48,MISSED,29.6
'23 Nuggets,Aaron Gordon,PF,15,16.3,6.6,3.0,18,61.7,0.180,35,41,Elite Lockdown Defender,Nuggets,0.7,0.7,53,29,CHAMPION,30.2
'23 Nuggets,Bruce Brown,SG,14,11.5,4.1,3.4,17,57.5,0.130,38,42,Secondary Playmaker,Nuggets,0.9,0.4,53,29,CHAMPION,28.5
'23 Nuggets,Jamal Murray,PG,20,20.0,4.1,6.2,26,57.1,0.150,38,32,Shot Creator,Nuggets,1.1,0.3,53,29,CHAMPION,32.8
'23 Nuggets,Jeff Green,PF,8,7.8,2.6,1.2,13,59.0,0.110,32,34,Stretch Big,Nuggets,0.4,0.4,53,29,CHAMPION,19.5
'23 Nuggets,Kentavious Caldwell-Pope,SG,10,10.8,2.4,2.4,13,58.0,0.110,30,44,3&D Wing,Nuggets,1.3,0.3,53,29,CHAMPION,31.3
'23 Nuggets,Michael Porter Jr.,SF,15,17.4,5.5,1.0,18,59.9,0.140,35,34,Off-Ball Sniper,Nuggets,0.6,0.5,53,29,CHAMPION,29.0
'23 Nuggets,Nikola Jokic,C,30,24.5,11.8,9.8,27,70.1,0.308,49,38,Generational Playmaker,Nuggets,1.3,0.7,53,29,CHAMPION,33.7
'23 Timberwolves,Karl-Anthony Towns,C/PF,20,20.8,8.1,4.8,24,60.5,0.155,40,30,Stretch Big,Timberwolves,0.7,0.5,42,40,R1,33.0
'24 76ers,Joel Embiid,C,27,34.7,11.0,5.6,36,64.4,0.240,48,40,Elite Post Scorer,76ers,1,1.7,47,35,R1,33.6
'24 76ers,Tyrese Maxey,PG,20,25.9,3.7,6.2,28,59.0,0.160,39,28,Shot Creator,76ers,1,0.5,47,35,R1,37.5
'24 Celtics,Al Horford,C/PF,15,8.6,6.4,2.6,12,63.0,0.160,38,44,Stretch Big,Celtics,0.6,0.9,64,18,CHAMPION,26.8
'24 Celtics,Derrick White,SG,19,15.2,4.2,5.2,18,60.9,0.170,35,38,Lockdown Defender,Celtics,1,1.2,64,18,CHAMPION,32.6
'24 Celtics,Jaylen Brown,SF/SG,24,23.0,5.5,3.6,28,58.0,0.150,43,36,Shot Creator,Celtics,1.1,0.5,64,18,CHAMPION,33.5
'24 Celtics,Jayson Tatum,PF/SF,30,26.9,8.1,4.9,29,60.4,0.189,44,36,Elite Shot Creator,Celtics,1,0.6,64,18,CHAMPION,35.7
'24 Celtics,Jrue Holiday,PG,17,12.5,5.4,4.8,16,59.0,0.140,33,43,3&D Wing,Celtics,0.9,0.8,64,18,CHAMPION,32.8
'24 Celtics,Kristaps Porzingis,C/PF,20,20.1,7.2,2.0,24,64.6,0.225,34,32,Stretch Big,Celtics,0.7,1.9,64,18,CHAMPION,29.6
'24 Celtics,Luke Kornet,C,3,5.3,4.1,1.1,10,72.0,0.200,16,26,Rim Runner,Celtics,0.5,1.3,64,18,CHAMPION,15.6
'24 Celtics,Payton Pritchard,PG,7,9.6,3.2,3.4,16,60.5,0.150,38,32,Off-Ball Sniper,Celtics,0.5,0.2,64,18,CHAMPION,22.3
'24 Celtics,Sam Hauser,SF,8,9.0,3.5,1.0,13,61.0,0.130,36,34,Off-Ball Sniper,Celtics,0.5,0.2,64,18,CHAMPION,22.0
'24 Hornets,Brandon Miller,SF/SG,15,17.3,4.3,2.4,25,54.5,0.070,35,30,Shot Creator,Hornets,0.6,0.5,21,61,MISSED,32.2
'24 Kings,De'Aaron Fox,PG,20,26.6,4.6,5.6,31,58.0,0.150,42,30,Elite Transition Maestro,Kings,1.9,0.5,46,36,MISSED,35.9
'24 Kings,Domantas Sabonis,C,19,19.4,13.7,8.2,22,63.0,0.200,40,30,Floor General,Kings,0.7,0.5,46,36,MISSED,35.7
'24 Kings,Harrison Barnes,PF,13,13.1,5.4,2.1,21,55.0,0.085,33,34,3&D Wing,Kings,0.7,0.3,46,36,MISSED,29.0
'24 Kings,Keegan Murray,SF,14,13.5,4.9,1.9,19,57.0,0.080,34,32,3&D Wing,Kings,0.8,0.5,46,36,MISSED,33.6
'24 Kings,Malik Monk,SG,16,15.0,3.9,4.7,22,57.0,0.110,36,27,Shot Creator,Kings,0.7,0.2,46,36,MISSED,26.0
'24 Knicks,Donte DiVincenzo,SG,10,15.5,4.0,3.5,18,56.0,0.110,34,32,3&D Wing,Knicks,0.9,0.4,50,32,R2,29.1
'24 Knicks,Precious Achiuwa,C,8,8.1,6.5,0.8,12,55.0,0.090,24,32,Enforcer,Knicks,0.6,0.7,50,32,R2,24.2
'24 Magic,Franz Wagner,SF,17,19.7,5.3,3.7,24,55.5,0.12,38,34,Shot Creator,Magic,1.1,0.4,47,35,R1,32.5
'24 Magic,Paolo Banchero,PF/SF,22,22.6,6.9,5.4,30,54.6,0.105,42,33,Shot Creator,Magic,0.8,0.5,47,35,R1,35.0
'24 Mavericks,Daniel Gafford,C,14,10.9,7.2,1.3,13,73.2,0.240,20,34,Rim Runner,Mavericks,0.6,1.3,50,32,FINALS,21.5
'24 Mavericks,Dereck Lively II,C,10,8.8,6.9,1.1,11,71.0,0.190,25,34,Rim Runner,Mavericks,0.6,1.4,50,32,FINALS,23.5
'24 Mavericks,Klay Thompson,SG/SF,15,17.5,3.1,2.0,21,52.6,0.085,36,32,Off-Ball Sniper,Mavericks,0.6,0.4,50,32,FINALS,29.7
'24 Mavericks,Kyrie Irving,PG/SG,24,25.6,5.0,5.2,29,60.8,0.170,41,30,Elite Shot Creator,Mavericks,1.3,0.4,50,32,FINALS,35.0
'24 Mavericks,Luka Doncic,PG/SG,30,33.9,9.2,9.8,36,61.7,0.224,49,32,Heliocentric Playmaker,Mavericks,1.4,0.5,50,32,FINALS,37.5
'24 Mavericks,P.J. Washington,PF,12,12.0,5.8,2.2,16,55.0,0.100,29,35,3&D Wing,Mavericks,0.8,0.7,50,32,FINALS,30.4
'24 Pelicans,Brandon Ingram,SF,19,20.8,5.1,5.7,28,57.0,0.120,35,30,Shot Creator,Pelicans,0.9,0.5,49,33,MISSED,32.9
'24 Pelicans,Zion Williamson,PF,20,22.9,5.8,5.0,29,61.0,0.170,40,28,Elite Rim Runner,Pelicans,1.1,0.6,49,33,MISSED,31.5
'24 Raptors,Scottie Barnes,PF/SF,18,19.9,8.2,6.1,24,54.5,0.110,36,40,Secondary Playmaker,Raptors,1.3,0.9,25,57,MISSED,34.9
'24 Rockets,Jalen Green,SG,16,19.6,5.2,3.5,27,55.1,0.070,38,28,Shot Creator,Rockets,0.8,0.3,41,41,MISSED,31.7
'24 Suns,Kevin Durant,SF/PF,27,27.1,6.7,4.5,30,59.4,0.240,45,36,Elite Shot Creator,Suns,0.9,1.2,49,33,R1,37.2
'24 Thunder,Isaiah Hartenstein,C,10,9.2,8.3,3.2,13,65.0,0.160,24,42,Enforcer,Thunder,0.7,1.1,57,25,R2,25.3
'24 Thunder,Isaiah Joe,SG,6,9.5,2.9,1.3,15,58.5,0.110,28,30,Off-Ball Sniper,Thunder,0.5,0.2,57,25,R2,18.5
'24 Thunder,Kenrich Williams,SF,7,6.5,4.0,2.0,11,54.5,0.085,26,38,Glue Guy,Thunder,0.7,0.3,57,25,R2,14.9
'24 Warriors,Jonathan Kuminga,PF/SF,12,16.1,4.8,2.2,24,56.0,0.090,33,32,Shot Creator,Warriors,0.6,0.4,46,36,MISSED,26.3
'25 Bulls,Josh Giddey,PG,13,14.6,8.1,7.2,21,56.0,0.110,33,28,Floor General,Bulls,1,0.4,39,43,MISSED,30.2
'25 Cavs,Darius Garland,PG,20,20.6,2.9,6.7,26,56.0,0.110,40,32,Secondary Playmaker,Cavaliers,1.1,0.1,64,18,CF,30.7
'25 Cavs,De'Andre Hunter,SF,15,16.5,4.1,1.9,22,56.0,0.095,36,37,3&D Wing,Cavaliers,0.7,0.3,64,18,CF,25.0
'25 Cavs,Donovan Mitchell,SG/PG,24,24.0,4.5,5.0,30,59.5,0.180,43,29,Elite Shot Creator,Cavaliers,1.5,0.3,64,18,CF,31.4
'25 Cavs,Evan Mobley,PF,19,18.5,9.3,3.2,21,61.5,0.160,32,40,Elite Enforcer,Cavaliers,0.8,1.4,64,18,CF,30.5
'25 Cavs,Jarrett Allen,C,17,13.5,9.7,2.7,16,65.0,0.210,28,40,Rim Runner,Cavaliers,0.6,1.1,64,18,CF,28.0
'25 Clippers,James Harden,PG/SG,18,22.8,5.8,8.7,30.9,58.2,0.148,42,27,Elite Shot Creator,Clippers,1.5,0.7,50,32,R1,35.3
'25 Clippers,Ivica Zubac,C,16,16.8,12.6,2.7,19,64.0,0.190,31,42,Elite Enforcer,Clippers,0.6,1,50,32,R1,32.8
'25 Hawks,Dyson Daniels,SG,13,14.1,5.9,4.4,18,53.5,0.110,28,46,Elite Lockdown Defender,Hawks,3,0.7,40,42,MISSED,33.8
'25 Hawks,Jalen Johnson,PF/SF,16,18.9,10.0,5.0,22,58.5,0.140,35,36,Secondary Playmaker,Hawks,1.2,0.8,40,42,MISSED,35.7
'25 Hawks,Trae Young,PG,20,24.0,3.1,11.6,29,58.5,0.160,42,30,Heliocentric Playmaker,Hawks,1.3,0.1,40,42,MISSED,36.0
'25 Knicks,Jalen Brunson,PG,24,26.0,2.9,7.3,32,59.2,0.190,42,24,Elite Shot Creator,Knicks,0.9,0.2,51,31,CF,35.4
'25 Knicks,Josh Hart,SG,12,13.6,9.4,5.9,15,55.0,0.120,30,39,Secondary Playmaker,Knicks,1.3,0.4,51,31,CF,37.6
'25 Knicks,Karl-Anthony Towns,C/PF,22,24.4,12.8,3.1,26,62.0,0.160,39,32,Stretch Big,Knicks,0.7,0.6,51,31,CF,35.0
'25 Knicks,Landry Shamet,SG,7,8.0,2.0,2.2,14,57.0,0.100,30,28,Off-Ball Sniper,Knicks,0.5,0.1,51,31,CF,15.2
'25 Knicks,Mikal Bridges,SF/SG,17,17.6,3.2,3.7,18,56.0,0.110,34,37,3&D Wing,Knicks,1,0.4,51,31,CF,37.0
'25 Knicks,Miles McBride,SG,6,10.0,3.2,3.0,16,56.0,0.095,32,32,3&D Wing,Knicks,1,0.2,51,31,CF,24.9
'25 Knicks,OG Anunoby,SF/PF,17,18.0,4.8,2.2,18,59.0,0.140,32,39,Elite Lockdown Defender,Knicks,1.6,0.6,51,31,CF,36.6
'25 Lakers,Austin Reaves,SG/PG,17,20.2,4.5,5.8,23,59.0,0.140,39,30,Secondary Playmaker,Lakers,1.3,0.4,50,32,R1,34.9
'25 Magic,Franz Wagner,SF/PF,21,24.2,5.7,4.7,31,55.8,0.125,40,34,Shot Creator,Magic,1.2,0.4,41,41,R1,33.7
'25 Pacers,Aaron Nesmith,SF,10,12.0,4.0,1.4,15,62.0,0.120,28,36,3&D Wing,Pacers,1,0.4,50,32,FINALS,24.9
'25 Pacers,Andrew Nembhard,SG,7,10.0,3.3,5.0,15,58.0,0.100,34,36,3&D Wing,Pacers,1,0.2,50,32,FINALS,28.9
'25 Pacers,Ben Sheppard,SG,6,8.5,3.0,2.1,14,57.0,0.095,28,30,Role Player,Pacers,0.5,0.2,50,32,FINALS,19.5
'25 Pacers,Myles Turner,C,15,15.6,6.5,1.5,20,62.5,0.150,33,42,Stretch Big,Pacers,0.7,1.9,50,32,FINALS,30.2
'25 Pacers,Pascal Siakam,PF/SF,20,20.2,6.9,3.4,25,60.0,0.140,38,38,Shot Creator,Pacers,0.9,0.5,50,32,FINALS,32.7
'25 Pacers,Tyrese Haliburton,PG,26,18.6,3.5,9.2,23,59.5,0.160,40,28,Elite Playmaker,Pacers,1.2,0.6,50,32,FINALS,33.6
'25 Pistons,Ausar Thompson,SF/SG,11,10.1,5.1,2.3,19,56.8,0.100,25,46,Elite Lockdown Defender,Pistons,1.6,1,44,38,R1,22.5
'25 Pistons,Cade Cunningham,PG/SG,25,26.1,6.1,9.1,33,56.5,0.155,45,31,Heliocentric Playmaker,Pistons,1.3,0.5,44,38,R1,35.0
'25 Pistons,Jalen Duren,C,14,11.8,10.3,2.7,16,70.3,0.218,27,38,Rim Runner,Pistons,0.6,0.6,44,38,R1,26.1
'25 Rockets,Alperen Sengun,C,18,19.1,10.3,4.9,24,58.5,0.15,38,32,Floor General,Rockets,1.1,0.8,52,30,R1,31.5
'25 Rockets,Amen Thompson,PG/SF,17,14.1,8.2,3.8,17,60.2,0.135,32,46,Elite Lockdown Defender,Rockets,1.5,1,52,30,R1,32.2
'25 Spurs,Stephon Castle,PG/SG,15,14.7,3.7,4.1,26,52.2,0.045,34,38,Shot Creator,Spurs,1.1,0.5,34,48,MISSED,29.9
'25 Suns,Devin Booker,SG/PG,26,25.6,4.1,7.1,30,61.1,0.160,42,26,Elite Shot Creator,Suns,0.7,0.4,36,46,MISSED,37.3
'25 Thunder,Aaron Wiggins,SG,7,12.4,3.9,2.0,17,57.0,0.100,32,34,3&D Wing,Thunder,0.9,0.3,68,14,CHAMPION,22.9
'25 Thunder,Alex Caruso,PG,9,9.0,4.5,3.5,13,55.0,0.110,28,48,Elite Lockdown Defender,Thunder,1.5,0.6,68,14,CHAMPION,19.3
'25 Thunder,Cason Wallace,PG/SG,9,9.0,3.8,2.2,14,52.0,0.090,26,35,3&D Wing,Thunder,1.1,0.5,68,14,CHAMPION,27.6
'25 Thunder,Chet Holmgren,C,17,15.0,8.0,1.3,19,63.2,0.175,37,45,Stretch Big,Thunder,0.7,2,68,14,CHAMPION,27.4
'25 Thunder,Isaiah Hartenstein,C,8,11.2,10.7,3.8,14,64.0,0.210,30,38,Enforcer,Thunder,0.9,1.1,68,14,CHAMPION,27.9
'25 Thunder,Jalen Williams,SF,20,21.6,5.3,5.1,24,62.1,0.170,34,34,Secondary Playmaker,Thunder,1.4,0.6,68,14,CHAMPION,32.4
'25 Thunder,Lu Dort,SG,11,10.1,4.0,1.7,15,58.5,0.110,30,46,3&D Wing,Thunder,1,0.5,68,14,CHAMPION,29.7
'25 Thunder,Shai Gilgeous-Alexander,PG,30,32.7,5.0,6.4,34,63.6,0.260,48,36,Elite Shot Creator,Thunder,1.7,1,68,14,CHAMPION,33.2
'25 Timberwolves,Anthony Edwards,SG,27,27.6,5.7,4.5,33,57.5,0.150,40,34,Elite Shot Creator,Timberwolves,1.2,0.6,49,33,CF,36.3
'25 Timberwolves,Jaden McDaniels,SF,12,12.2,5.9,1.8,14,56.0,0.100,28,44,Elite Lockdown Defender,Timberwolves,1.1,0.6,49,33,CF,32.0
'25 Timberwolves,Mike Conley,PG,12,11.0,2.8,5.6,16,54.0,0.110,30,28,Secondary Playmaker,Timberwolves,0.8,0.2,49,33,CF,24.7
'25 Timberwolves,Naz Reid,PF,12,14.2,6.0,1.9,20,58.0,0.120,33,35,Stretch Big,Timberwolves,0.6,0.6,49,33,CF,27.5
'25 Timberwolves,Rudy Gobert,C,15,12.0,10.9,1.5,13,66.0,0.220,36,48,Elite Enforcer,Timberwolves,0.7,1.9,49,33,CF,33.2
'26 76ers,VJ Edgecombe,SG/PG,15,16.0,5.6,4.2,20,54.0,0.081,35,36,Shot Creator,76ers,1,0.3,45,37,R2,35.0
'26 Hornets,Kon Knueppel,SG/SF,16,18.5,5.3,3.4,22,63.3,0.151,38,28,Off-Ball Sniper,Hornets,0.8,0.2,44,38,MISSED,31.5
'26 Knicks,Jalen Brunson,PG,25,26.0,3.3,6.8,33,59.5,0.200,44,26,Elite Shot Creator,Knicks,0.8,0.2,53,29,CHAMPION,35.0
'26 Knicks,Jose Alvarado,PG,8,8.5,2.2,3.5,18,54.0,0.095,30,38,Lockdown Defender,Knicks,1.3,0.2,53,29,CHAMPION,21.9
'26 Knicks,Josh Hart,SG/SF,13,12.0,7.4,4.8,16,56.0,0.125,32,40,Secondary Playmaker,Knicks,1,0.5,53,29,CHAMPION,30.2
'26 Knicks,Karl-Anthony Towns,C/PF,22,20.1,11.9,3.0,26,61.5,0.160,40,32,Stretch Big,Knicks,0.7,0.6,53,29,CHAMPION,31.0
'26 Knicks,Landry Shamet,SG,7,8.5,2.0,1.8,15,58.0,0.105,30,28,Off-Ball Sniper,Knicks,0.5,0.1,53,29,CHAMPION,23.0
'26 Knicks,Mikal Bridges,SF/SG,16,14.4,3.8,3.7,18,57.0,0.120,34,40,Elite 3&D Wing,Knicks,1,0.4,53,29,CHAMPION,34.5
'26 Knicks,Mitchell Robinson,C,12,8.0,9.5,1.0,13,68.0,0.165,26,46,Elite Rim Runner,Knicks,0.5,1.5,53,29,CHAMPION,19.6
'26 Knicks,OG Anunoby,PF/SF,18,16.7,5.2,2.2,19,58.5,0.145,34,40,Elite Lockdown Defender,Knicks,1.3,0.5,53,29,CHAMPION,33.2
'26 Lakers,Luka Doncic,PG/SG,29,33.5,7.7,8.3,34,61.0,0.210,48,30,Heliocentric Playmaker,Lakers,1.5,0.4,53,29,R2,35.8
'26 Mavericks,Cooper Flagg,PF/SF,22,21.0,6.7,4.5,27,54.8,0.078,39,40,Shot Creator,Mavericks,1,1,26,56,MISSED,33.5
'26 Spurs,De'Aaron Fox,PG,20,18.6,3.8,6.2,28,57.8,0.110,40,32,Elite Transition Maestro,Spurs,1.5,0.4,62,20,FINALS,31.0
'26 Spurs,Dylan Harper,PG/SG,12,11.8,3.4,3.9,22,57.4,0.130,33,32,Secondary Playmaker,Spurs,1,0.3,62,20,FINALS,22.6
'26 Spurs,Victor Wembanyama,C/PF,28,25.0,11.5,3.1,28,60.5,0.260,41,50,Defensive Unicorn,Spurs,1.1,3.5,62,20,FINALS,29.2
`;