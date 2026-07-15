/* Pure native-input extraction: value diffing, IME multi-char, backspace, garbage. */
const I = require("../input.js");
let fails = 0;
const ok = (c, m) => { if (!c){ fails++; console.log("FAIL " + m); } };
const eq = (got, want, m) => ok(JSON.stringify(got) === JSON.stringify(want),
  `${m}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);

const S = I.NKI_SENTINEL;

// single char typed after the sentinel
eq(I.extractKeys(S, S + "a"), {backspaces:0, keys:["a"]}, "single char");
// multi-char swipe/predictive insertion
eq(I.extractKeys(S, S + "haus"), {backspaces:0, keys:["h","a","u","s"]}, "multi-char IME insertion");
// backspace: field shrank below the sentinel
eq(I.extractKeys(S, ""), {backspaces:1, keys:[]}, "backspace eats the sentinel");
// autocorrect-style replacement: shrink + insert in one event
eq(I.extractKeys(S + "tur", S + "tür"), {backspaces:2, keys:["ü","r"]}, "mid-string replacement");
// no change
eq(I.extractKeys(S, S), {backspaces:0, keys:[]}, "no-op");
// emoji arrives as one key (surrogate-safe), then gets filtered
const emo = I.extractKeys(S, S + "😀");
ok(emo.keys.length === 1, "emoji is one key, not two surrogates");
ok(I.filterKey(emo.keys[0]) === null, "emoji filtered out");

// filterKey: what may reach the game
ok(I.filterKey("a") === "a", "letter passes");
ok(I.filterKey("A") === "a", "uppercase lowercased");
ok(I.filterKey("ü") === "ü", "direct umlaut passes (German layout)");
ok(I.filterKey("ß") === "ß", "ß passes");
ok(I.filterKey("-") === "-", "hyphen passes (T-Shirt)");
ok(I.filterKey(" ") === " ", "space passes (die Tür)");
ok(I.filterKey("\n") === null, "Enter dropped");
ok(I.filterKey("1") === null, "digit dropped");
ok(I.filterKey("!") === null, "punctuation dropped");

console.log(fails === 0 ? "test-input: ALL PASS" : `test-input: ${fails} FAILURES`);
process.exit(fails ? 1 : 0);
