/* Premium polish: tension flags, boss theater lifecycle, wave ceremony,
   menu ambience never running during play. */
const A = require("../anim.js");
const { boot } = require("./harness.js");
let fails = 0;
const ok = (c, m) => { if (!c){ fails++; console.log("FAIL " + m); } };

// pure tension thresholds
ok(A.tensionLevel(5) === 0 && A.tensionLevel(3) === 0, "healthy = no tension");
ok(A.tensionLevel(2) === 1, "2 hearts = danger");
ok(A.tensionLevel(1) === 2 && A.tensionLevel(0) === 2, "1 heart = critical");

const h = boot();
h.newProfile("P");
// menu ambience runs on the menu…
ok(h.t.menuRunning() === true, "menu ambience active on the menu");
h.click("startbtn"); h.finishIntro();
// …and NEVER during play
ok(h.t.menuRunning() === false, "menu ambience stopped when playing");

// tension reacts to hearts and clears on heal
h.t.G.hearts = 2;
ok(h.t.tension() === 1, "in-game tension at 2 hearts");
h.t.G.hearts = 1;
ok(h.t.tension() === 2, "critical at 1 heart");
h.t.update(0.016);
ok(h.t.G.beatT > 0, "heartbeat scheduled under tension");
h.t.G.hearts = 5;
h.t.update(0.016);
ok(h.t.tension() === 0 && h.t.G.beatT === 0, "tension + heartbeat clear instantly on heal");

// boss theater: banner shows on boss spawn, gone within 2.5s, typing unblocked
for (const w of h.t.activePool()) h.t.wordStat(w.g).in = 1;
h.t.spawnZombie(true);
ok(h.t.G.bossFx && h.t.G.bossFx.t === 0, "bossFx armed on boss spawn");
ok(h.$("bossbanner").className.includes("show"), "boss banner visible");
ok(h.$("bossword").textContent.length > 0, "banner carries the boss word");
const boss = h.t.G.zombies.find(z => z.boss);
h.t.G.target = boss;
h.t.handleKey(boss.g[0].toLowerCase());
ok(boss.ti === 1, "typing works during boss banner");
h.t.update(2.4);
ok(!h.t.G.bossFx && !h.$("bossbanner").className.includes("show"),
   "banner gone within 2.5s");

// wave ceremony: clearing a wave floats the stamp with tally
h.t.G.zombies.length = 0; h.t.G.target = null;
h.t.G.toSpawn = 0; h.t.G.waveGap = 0; h.t.G.waveKills = 4;
h.t.update(0.1);
const texts = h.t.G.floats.map(f => f.txt).join(" | ");
ok(texts.includes("WELLE GESCHAFFT!"), `wave stamp floated (${texts})`);
ok(/4 Wörter · \d+% Treffer/.test(texts), "tally shows kills + accuracy");
ok(h.t.G.waveKills === 0, "per-wave tally resets");

// back to menu → ambience resumes
h.click("pausebtn"); h.click("quitbtn"); h.click("menubtn");
ok(h.t.menuRunning() === true, "menu ambience resumes on return to menu");

console.log(fails === 0 ? "test-premium: ALL PASS" : `test-premium: ${fails} FAILURES`);
process.exit(fails ? 1 : 0);
