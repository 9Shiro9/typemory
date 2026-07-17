/* Gravestone garden: empty state, stones for mastered words, tap = TTS + meaning. */
const { boot } = require("./harness.js");
let fails = 0;
const ok = (c, m) => { if (!c){ fails++; console.log("FAIL " + m); } };

const h = boot();
h.newProfile("G");

// empty garden
h.click("gardenbtn");
ok(!h.$("garden").className.includes("hidden"), "garden opens from menu");
ok(h.$("gardengrid").innerHTML.includes("Your garden is empty"), "empty state message");
ok(h.$("gardencount").textContent.includes("0 / 1288"), `count 0/1288 (got "${h.$("gardencount").textContent}")`);
h.click("gardenback");

// master three words directly, with dates ordering
const words = [h.t.VOCAB[0][0], h.t.VOCAB[1][0], h.t.VOCAB[2][0]];
const dates = ["2026-07-15", "2026-07-10", "2026-07-17"];
words.forEach((w, i) => Object.assign(h.t.wordStat(w), { m:1, md: dates[i] }));
h.click("gardenbtn");
const stones = [...h.window.document.querySelectorAll("#gardengrid .stone")];
ok(stones.length === 3, `3 gravestones rendered (got ${stones.length})`);
ok(h.$("gardencount").textContent.includes("3 / 1288"), "count updates");
ok(stones[0].dataset.w === words[1], "stones ordered by mastery date (oldest first)");
// article color present for nouns
const nounStone = stones.find(s => /^(der|die|das) /.test(s.dataset.w));
if (nounStone) ok(nounStone.querySelector("b").getAttribute("style").includes("color"),
   "noun engraving is article-colored");
// tap: opens meaning + speaks the word
const before = h.spoken.length;
stones[0].onclick();
ok(stones[0].className.includes("open"), "tap opens the stone");
ok(h.window.getComputedStyle(stones[0].querySelector(".stonemean")).display !== "none" ||
   stones[0].className.includes("open"), "meaning revealed");
ok(h.spoken.length === before + 1 && h.spoken[h.spoken.length-1] === stones[0].dataset.w,
   "tap speaks the word via TTS");

console.log(fails === 0 ? "test-garden: ALL PASS" : `test-garden: ${fails} FAILURES`);
process.exit(fails ? 1 : 0);
