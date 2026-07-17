/* Achievements — pure rules over a stats snapshot.
   Spliced into the game by build.py AND require()d by node tests. */
const ACHIEVEMENTS = [
  { id:"erster_biss",     icon:"🩸", name:"Erster Biss",        hint:"Kill your first zombie",              test:s => (s.totalKills||0) >= 1 },
  { id:"umlaut_meister",  icon:"üäö", name:"Umlaut-Meister",    hint:"Kill 100 words containing ä ö ü ß",   test:s => (s.umlautKills||0) >= 100 },
  { id:"artikel_gott",    icon:"⚧",  name:"Artikel-Gott",       hint:"50 clean noun kills (article typed)", test:s => (s.cleanNounKills||0) >= 50 },
  { id:"friedhofswaerter",icon:"🪦", name:"Friedhofswärter",    hint:"Reach wave 20",                       test:s => (s.bestWave||0) >= 20 },
  { id:"flamme7",         icon:"🔥", name:"7-Tage-Flamme",      hint:"Keep a 7-day streak",                 test:s => (s.streak||0) >= 7 },
  { id:"wortschatz100",   icon:"📖", name:"Wortschatz-100",     hint:"Master 100 words",                    test:s => (s.mastered||0) >= 100 },
  { id:"wortschatz500",   icon:"📚", name:"Wortschatz-500",     hint:"Master 500 words",                    test:s => (s.mastered||0) >= 500 },
  { id:"blitzfinger",     icon:"⚡", name:"Blitzfinger",         hint:"20 kills without a single miss",      test:s => (s.bestKillStreak||0) >= 20 },
  { id:"nachtschicht",    icon:"🌙", name:"Nachtschicht",       hint:"Hit the daily goal 3 days running",   test:s => (s.goalDays||0) >= 3 },
  { id:"endgegner",       icon:"👑", name:"Endgegner-Schlächter", hint:"Slay 10 bosses",                    test:s => (s.bossKills||0) >= 10 }
];

/* returns the list of NEWLY earned achievement objects (idempotent: already-earned skipped) */
function checkAchievements(stats, earned){
  const out = [];
  for (const a of ACHIEVEMENTS)
    if (!earned[a.id] && a.test(stats)) out.push(a);
  return out;
}

/* kill-streak callouts at exact thresholds (German flavor is the point) */
function calloutFor(streak){
  return { 3:"Doppelkill!", 5:"Super!", 8:"Wahnsinn!", 12:"Unaufhaltsam!" }[streak] || null;
}

/* does a German word contain umlaut characters? */
function hasUmlaut(w){ return /[äöüßÄÖÜ]/.test(w); }

if (typeof module !== "undefined" && module.exports){
  module.exports = { ACHIEVEMENTS, checkAchievements, calloutFor, hasUmlaut };
}
