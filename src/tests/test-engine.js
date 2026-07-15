/* Typing-engine regression: umlaut variants, grace letters, meaning answers,
   and the invariant that every vocab word is typeable verbatim. */
const { boot } = require("./harness.js");
let fails = 0;
const ok = (c, m) => { if (!c){ fails++; console.log("FAIL " + m); } };

const h = boot();
const { makeTokens, feed, feedEn, meaningAnswers, VOCAB, VOCAB_A2 } = h.t;

function typeWord(word, input){
  const z = { tokens: makeTokens(word), ti: 0, buf: "" };
  let pendingGrace = null;
  for (const k of input){
    if (z.ti >= z.tokens.length){
      if (pendingGrace && k === pendingGrace){ pendingGrace = null; continue; }
      return "OVERRUN";
    }
    const r = feed(z, k.toLowerCase());
    if (r === "bad") return "ERROR at '" + k + "'";
    if (z.ti >= z.tokens.length) pendingGrace = z.grace || null;
  }
  return z.ti === z.tokens.length ? "OK" : "partial";
}

const styles = [
  ["die Tür","die tur"],["die Tür","die tuer"],["die Tür","die tür"],
  ["schön","schon"],["schön","schoen"],["hören","hoeren"],
  ["die Straße","die strase"],["die Straße","die strasse"],["der Fuß","der fuss"],
  ["das Mädchen","das madchen"],["die Größe","die groesse"],["die Größe","die grosse"],
  ["süß","sus"],["süß","suess"],["natürlich","naturlich"],
  ["zum Beispiel","zum beispiel"],["das T-Shirt","das t-shirt"],
];
for (const [w, i] of styles) ok(typeWord(w, i) === "OK", `${w} ← "${i}"`);
ok(typeWord("die Tür", "dix").startsWith("ERROR"), "wrong key still errors");

let untypeable = 0;
for (const [g] of [...VOCAB, ...VOCAB_A2])
  if (typeWord(g, [...g].join("")) !== "OK") untypeable++;
ok(untypeable === 0, `all ${VOCAB.length + VOCAB_A2.length} words typeable verbatim (${untypeable} failed)`);

// grace-collision safety: no vocab word has umlaut+e or ß+s adjacency
const risky = [...VOCAB, ...VOCAB_A2].filter(([g]) => /[äöü]e|ßs/.test(g.toLowerCase()));
ok(risky.length === 0, "no grace-letter collisions in vocab");

// meaning answers
const ma = (e, want) => ok(JSON.stringify(meaningAnswers(e)) === JSON.stringify(want),
  `meaningAnswers("${e}") → ${JSON.stringify(meaningAnswers(e))}, want ${JSON.stringify(want)}`);
ma("to depart", ["depart"]);
ma("luck / happiness", ["luck","happiness"]);
ma("from (a time/point)", ["from"]);
ma("Mr. / gentleman", ["mr","gentleman"]);
ma("(bus) stop", ["stop"]);

// feedEn: variant matching + completion
const zEn = { answers: meaningAnswers("luck / happiness"), typed: "", done: false };
for (const c of "happiness") feedEn(zEn, c);
ok(zEn.done, "feedEn completes on any variant");
ok(feedEn({answers:["luck"], typed:"", done:false}, "x") === "bad", "feedEn rejects wrong key");

console.log(fails === 0 ? "test-engine: ALL PASS" : `test-engine: ${fails} FAILURES`);
process.exit(fails ? 1 : 0);
