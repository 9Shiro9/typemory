/* Integration: SRS wired into kill/leak paths, due counter in menu, due-word priority in spawns. */
const { boot } = require("./harness.js");
let fails = 0;
const ok = (c, m) => { if (!c){ fails++; console.log("FAIL " + m); } };

const h = boot();
h.newProfile("Tester");
h.click("startbtn");
const t = h.t;

// kill a word cleanly → interval starts, lastSeen set, daily counter bumps
t.spawnZombie(false);
const z = t.G.zombies[0];
h.typeWord(z, z.g);
const s = t.wordStat(z.g);
ok(z.dead, "zombie killed");
ok(s.iv === 1 && s.ls > 0, `clean kill starts interval at 1 day (iv=${s.iv})`);
ok(t.profile().day.nw === 1, `first-ever kill counts as new word (nw=${t.profile().day.nw})`);

// second kill same day: distinct-per-day, no double count
t.G.zombies.length = 0; t.G.target = null;
t.G.zombies.push({...z, dead:0, ti:0, buf:"", tokens: z.tokens.map(x=>({...x})), err:0, hint:0});
h.typeWord(t.G.zombies[0], z.g);
ok(t.profile().day.nw === 1 && t.profile().day.rev === 0,
   "same word same day counts once");

// due counter renders in menu
Object.assign(t.wordStat(z.g), {iv: 1, ls: Date.now() - 2 * 86400000});  // force overdue
h.click("pausebtn"); h.click("quitbtn"); h.click("menubtn");
ok(h.$("duecount").textContent.includes("1 words due"),
   `menu shows due count ("${h.$("duecount").textContent}")`);

// due words dominate spawning
h.click("startbtn");
let dueHits = 0;
for (let i = 0; i < 60; i++){
  const w = t.pickWord();
  if (w && w.g === z.g) dueHits++;
}
ok(dueHits >= 5, `overdue word dominates spawn sampling (picked ${dueHits}/60 from pool of 25)`);

// leak shrinks/pins interval and sets lastSeen
const before = t.wordStat(z.g).iv;
t.G.zombies.length = 0;
t.spawnZombie(false);
const z2 = t.G.zombies[0];
const s2 = t.wordStat(z2.g);
z2.y = 99999; t.update(0.016);
ok(s2.ls > 0 && s2.iv >= 1, `leaked word gets reviewed-with-failure (iv=${s2.iv}, floor 1)`);

console.log(fails === 0 ? "test-srs-integration: ALL PASS" : `test-srs-integration: ${fails} FAILURES`);
process.exit(fails ? 1 : 0);
