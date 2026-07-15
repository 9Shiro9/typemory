/* Session report: numbers add up against simulated actions; streak requires the 20-word daily goal. */
const { boot } = require("./harness.js");
let fails = 0;
const ok = (c, m) => { if (!c){ fails++; console.log("FAIL " + m); } };
const cell = (h, label) => {
  const m = h.$("overstats").innerHTML.match(new RegExp(`<div class="v">([^<]*)</div><div class="k">${label}`));
  return m ? m[1] : null;
};
function killDistinct(h, n){
  const t = h.t;
  for (const w of t.activePool()) t.wordStat(w.g).in = 1;   // recruit everything unlocked
  const seen = new Set();
  let killed = 0, guard = 0;
  while (killed < n && guard++ < 3000){
    t.G.zombies.length = 0; t.G.target = null;
    t.spawnZombie(false);
    const z = t.G.zombies[0];
    if (!z) break;
    if (seen.has(z.g)) continue;      // ensure DISTINCT words
    seen.add(z.g);
    h.typeWord(z, z.g);
    killed++;
  }
  return killed;
}

// below the goal: counts correct, streak stays 0
{
  const h = boot();
  h.newProfile("A");
  h.click("startbtn"); h.finishIntro();
  const killed = killDistinct(h, 3);
  ok(killed === 3, "killed 3 distinct words");
  h.click("pausebtn"); h.click("quitbtn");
  ok(cell(h, "new words today") === "3", `report new=3 (got ${cell(h,"new words today")})`);
  ok(cell(h, "reviewed today") === "0", `report reviewed=0 (got ${cell(h,"reviewed today")})`);
  ok(cell(h, "due tomorrow") === "3", `report due-tomorrow=3 (got ${cell(h,"due tomorrow")})`);
  ok(h.t.profile().streak.count === 0, "streak NOT granted below the 20-word goal");
}

// reaching the goal grants the streak; second-kill-same-day counts as review once
{
  const h = boot();
  h.newProfile("B");
  h.click("startbtn"); h.finishIntro();
  const killed = killDistinct(h, 21);
  ok(killed >= 20, `killed ${killed} distinct words`);
  h.click("pausebtn"); h.click("quitbtn");
  ok(h.t.profile().streak.count === 1, `streak granted at goal (count=${h.t.profile().streak.count})`);
  ok(cell(h, "new words today") === String(killed), "report new == kills");
  const goalCell = h.$("overstats").innerHTML.includes("goal 20/20");
  ok(goalCell, "goal cell shows 20/20 when met");
}

console.log(fails === 0 ? "test-report: ALL PASS" : `test-report: ${fails} FAILURES`);
process.exit(fails ? 1 : 0);
