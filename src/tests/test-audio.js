/* Audio: German word spoken on kill; sound toggle respected; no German voice → silent, no crash. */
const { boot } = require("./harness.js");
let fails = 0;
const ok = (c, m) => { if (!c){ fails++; console.log("FAIL " + m); } };

// with a German voice
{
  const h = boot();
  h.newProfile("A");
  h.click("startbtn");
  h.t.spawnZombie(false);
  const z = h.t.G.zombies[0];
  h.typeWord(z, z.g);
  ok(h.spoken.includes(z.g), `kill speaks the German word (spoken: ${JSON.stringify(h.spoken)})`);
}

// sound toggled off → silent
{
  const h = boot();
  h.newProfile("B");
  h.click("soundbtn");           // toggle off
  h.click("startbtn");
  h.t.spawnZombie(false);
  const z = h.t.G.zombies[0];
  h.typeWord(z, z.g);
  ok(h.spoken.length === 0, "sound off → nothing spoken");
}

// no German voice installed → degrade silently
{
  const h = boot({ noGermanVoice: true });
  h.newProfile("C");
  h.click("startbtn");
  h.t.spawnZombie(false);
  const z = h.t.G.zombies[0];
  h.typeWord(z, z.g);
  ok(z.dead, "game still works without a German voice");
  ok(h.spoken.length === 0, "no de voice → nothing spoken, no crash");
}

console.log(fails === 0 ? "test-audio: ALL PASS" : `test-audio: ${fails} FAILURES`);
process.exit(fails ? 1 : 0);
