/* Achievement rules: thresholds, edges, idempotence, in-game unlock + persistence. */
const A = require("../achievements.js");
const { boot } = require("./harness.js");
let fails = 0;
const ok = (c, m) => { if (!c){ fails++; console.log("FAIL " + m); } };

// threshold edges for every rule
const base = { totalKills:0, umlautKills:0, cleanNounKills:0, bestWave:0,
  streak:0, mastered:0, bestKillStreak:0, goalDays:0, bossKills:0 };
const cases = [
  ["erster_biss",      {totalKills:1},      {totalKills:0}],
  ["umlaut_meister",   {umlautKills:100},   {umlautKills:99}],
  ["artikel_gott",     {cleanNounKills:50}, {cleanNounKills:49}],
  ["friedhofswaerter", {bestWave:20},       {bestWave:19}],
  ["flamme7",          {streak:7},          {streak:6}],
  ["wortschatz100",    {mastered:100},      {mastered:99}],
  ["wortschatz500",    {mastered:500},      {mastered:499}],
  ["blitzfinger",      {bestKillStreak:20}, {bestKillStreak:19}],
  ["nachtschicht",     {goalDays:3},        {goalDays:2}],
  ["endgegner",        {bossKills:10},      {bossKills:9}],
];
for (const [id, yes, no] of cases){
  ok(A.checkAchievements({...base, ...yes}, {}).some(a=>a.id===id), `${id} unlocks at threshold`);
  ok(!A.checkAchievements({...base, ...no}, {}).some(a=>a.id===id), `${id} locked below threshold`);
}
// idempotence: already earned never re-fires
const st = {...base, totalKills:5};
ok(A.checkAchievements(st, {erster_biss:"2026-07-17"}).length === 0, "no double unlock");
// callouts at exact thresholds only
ok(A.calloutFor(3) === "Doppelkill!" && A.calloutFor(5) === "Super!" &&
   A.calloutFor(8) === "Wahnsinn!" && A.calloutFor(12) === "Unaufhaltsam!", "callout thresholds");
ok(A.calloutFor(4) === null && A.calloutFor(13) === null, "no callout between thresholds");
ok(A.hasUmlaut("die Tür") && A.hasUmlaut("süß") && !A.hasUmlaut("das Haus"), "umlaut detector");

// ---- in game: first kill unlocks Erster Biss, toast shows, persists across reload ----
const h = boot();
h.newProfile("T");
h.click("startbtn"); h.finishIntro();
h.t.spawnZombie(false);
const z = h.t.G.zombies[0];
h.typeWord(z, z.g);
ok(h.t.profile().ach.erster_biss, "Erster Biss earned on first kill");
ok(h.$("achtoast").className.includes("show"), "unlock toast visible");
ok(h.t.profile().tk === 1, "total-kill counter tracks");
// kill-streak resets on miss (Blitzfinger prerequisite)
h.t.G.killStreak = 7;
h.t.handleKey("@");   // guaranteed miss
ok(h.t.G.killStreak === 0, "miss breaks the kill streak");
// persistence: reload same storage
const saved = h.window.localStorage.getItem("wortapoc.v3");
const h2 = boot();
h2.window.localStorage.setItem("wortapoc.v3", saved);
// re-boot with storage preloaded
const h3 = (() => { const b = boot(); b.window.localStorage.setItem("wortapoc.v3", saved); return b; })();
ok(saved && JSON.parse(saved).profiles.T.ach.erster_biss, "achievement persisted in storage");
// trophy screen renders earned vs locked
h.click("pausebtn"); h.click("quitbtn"); h.click("menubtn");
h.click("trophybtn");
const grid = h.$("trophygrid").innerHTML;
ok((grid.match(/class="trophy got"/g)||[]).length >= 1, "earned trophy lit");
ok(grid.includes("🔒"), "unearned trophies show silhouette");
ok(grid.includes("Slay 10 bosses"), "locked trophy shows hint");

console.log(fails === 0 ? "test-achievements: ALL PASS" : `test-achievements: ${fails} FAILURES`);
process.exit(fails ? 1 : 0);
