/* Neue Wörter intro: run starts with an intro card; words can't spawn until
   introduced; typing each word once recruits it; audio fires per word. */
const { boot } = require("./harness.js");
let fails = 0;
const ok = (c, m) => { if (!c){ fails++; console.log("FAIL " + m); } };

const h = boot();
h.newProfile("Tester");
h.click("startbtn");
const t = h.t;

// intro is active with 5 words, card visible, spawning is held
ok(t.intro() && t.intro().list.length === 5, "run starts with a 5-word intro");
ok(!h.$("introcard").className.includes("hidden"), "intro card visible");
for (let i = 0; i < 200; i++) t.update(0.05);
ok(t.G.zombies.length === 0, "no zombies spawn during the intro");
const firstWord = t.intro().list[0].g;
ok(h.spoken.includes(firstWord), "intro speaks the presented word");

// wrong key is calm: no error stats
const before = t.G.keysBad;
h.window.__t.G.intro || 0;
h.t.routeChar ? h.t.routeChar("!") : null;
ok(t.G.keysBad === before, "intro mistakes don't count as battle errors");

// type all 5 words through the real routing path
while (t.intro()){
  const w = t.intro().list[t.intro().idx].g;
  for (const ch of w.toLowerCase()) h.t.routeChar(ch);
}
ok(t.intro() === null, "intro completes after typing all words");
ok(h.$("introcard").className.includes("hidden"), "card hides");
const introduced = Object.values(t.profile().words).filter(s => s.in === 1).length;
ok(introduced === 5, `all 5 words marked introduced (got ${introduced})`);

// spawning resumes and only introduced words fight
for (let i = 0; i < 400 && t.G.zombies.length < 5; i++) t.update(0.05);
ok(t.G.zombies.length > 0, "spawning resumes after intro");
const allIntroduced = t.G.zombies.every(z => (t.profile().words[z.g] || {}).in === 1);
ok(allIntroduced, "every spawned zombie was introduced first");

// no reviewed state was created by intros (invariant: intro ≠ review)
const reviewed = Object.values(t.profile().words).filter(s => s.ls > 0).length;
ok(reviewed === 0, "introduction alone never sets lastSeen (not a review)");

console.log(fails === 0 ? "test-intro: ALL PASS" : `test-intro: ${fails} FAILURES`);
process.exit(fails ? 1 : 0);
