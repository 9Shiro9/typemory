/* Animation math (pure) + in-game juice/audio behavior via harness. */
const A = require("../anim.js");
const { boot } = require("./harness.js");
let fails = 0;
const ok = (c, m) => { if (!c){ fails++; console.log("FAIL " + m); } };

// walk cycle plays 0,1,2,1 and loops
const seq = [];
for (let t = 0; t < 4/6; t += 1/6 + 1e-9) seq.push(A.walkFrame(t, 6));
ok(JSON.stringify(seq.slice(0,4)) === "[0,1,2,1]", `walk sequence 0,1,2,1 (got ${seq})`);
ok(A.walkFrame(0, 6) === A.walkFrame(4/6, 6), "walk cycle loops");
ok([0,1,2,3].every(i => A.bossFrame(i/5 + 0.001, 5) === i), "boss frames advance 0..3");
ok(A.bossFrame(4/5 + 0.001, 5) === 0, "boss cycle loops");

// hit-stop scales time down while active, back to 1 after
ok(A.hitstopScale(0.05) < 0.2 && A.hitstopScale(0) === 1 && A.hitstopScale(-1) === 1, "hitstop scale");

// corpse fade: opaque at death, gone at TTL, monotonic
ok(A.corpseAlpha(1) > 0.8, "fresh corpse visible");
ok(A.corpseAlpha(A.CORPSE_TTL) === 0, "corpse fully faded at TTL");
ok(A.corpseAlpha(2) > A.corpseAlpha(4), "corpse fade monotonic");

// ---- in-game: hit-stop engages on kill; corpses persist; audio spy fires ----
const h = boot();
const sfxLog = [];
h.window.__sfxSpy = (n, on) => sfxLog.push({n, on});
h.newProfile("J");
h.click("startbtn"); h.finishIntro();
h.t.spawnZombie(false);
ok(sfxLog.some(e => e.n.startsWith("groan_")), "spawn triggers groan attempt");
const z = h.t.G.zombies[0];
h.typeWord(z, z.g);
ok(sfxLog.some(e => e.n === "punch_m"), "kill triggers punch");
ok(h.t.G.hitStop > 0, "kill engages hit-stop");
const before = z.dead;
h.t.update(0.016);
ok(z.dead > before && z.dead < A.CORPSE_TTL, "corpse persists after kill");
// hit-stop slows the world: zombie fall during stop is tiny
h.t.spawnZombie(false);
const z2 = h.t.G.zombies.find(x => !x.dead);
if (z2){
  h.t.G.hitStop = 0.05;
  const y0 = z2.y; h.t.update(0.016);
  const dStop = z2.y - y0;
  h.t.G.hitStop = 0;
  const y1 = z2.y; h.t.update(0.016);
  ok((z2.y - y1) > dStop * 5, `hit-stop slows movement (${dStop.toFixed(3)} vs ${(z2.y-y1).toFixed(3)})`);
}
// sound toggle off → attempts logged with on=false (playSfx silences)
const h2 = boot();
const log2 = [];
h2.window.__sfxSpy = (n, on) => log2.push(on);
h2.newProfile("K");
h2.click("soundbtn");
h2.click("startbtn"); h2.finishIntro();
h2.t.spawnZombie(false);
ok(log2.length > 0 && log2.every(on => on === false), "toggle-off: every sfx attempt sees soundOn=false");

// emoji fallback: no assets loaded headlessly, game fully playable
ok(h.t.assetOk() === false, "headless: sprites unavailable → fallback active");

console.log(fails === 0 ? "test-anim: ALL PASS" : `test-anim: ${fails} FAILURES`);
process.exit(fails ? 1 : 0);
