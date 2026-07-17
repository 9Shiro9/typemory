/* Asset integrity: every referenced file exists, sw CORE ⊆ disk, byte budget,
   woff2 validity, German glyph coverage in @font-face ranges, credits compliance. */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "..");
let fails = 0;
const ok = (c, m) => { if (!c){ fails++; console.log("FAIL " + m); } };

const src = fs.readFileSync(path.join(ROOT, "src/game_src.html"), "utf8");
const sw  = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
const wf  = fs.readFileSync(path.join(ROOT, ".github/workflows/android-apk.yml"), "utf8");

// 1. every assets/ path referenced in game source exists on disk
const refs = [...new Set(src.match(/assets\/[a-z0-9_\-\/.]+/gi) || [])];
ok(refs.length > 20, `game references ${refs.length} asset paths`);
for (const r of refs) ok(fs.existsSync(path.join(ROOT, r)), `missing on disk: ${r}`);

// 2. sw CORE ⊆ disk
const core = [...sw.matchAll(/"\.\/([^"]+)"/g)].map(m => m[1]).filter(p => p !== "");
for (const c of core) ok(fs.existsSync(path.join(ROOT, c)), `sw CORE missing: ${c}`);
ok(core.some(c => c.startsWith("assets/sprites/")), "sw precaches sprites");
ok(core.some(c => c.endsWith(".woff2")), "sw precaches fonts");
ok(/typemory-v2/.test(sw), "cache version bumped");

// 3. no orphans: every file in assets/ is referenced somewhere (source or sw)
const walk = d => fs.readdirSync(d, {withFileTypes:true}).flatMap(e =>
  e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const files = walk(path.join(ROOT, "assets")).map(f => path.relative(ROOT, f));
const CAPACITOR_INPUTS = ["assets/icon.png", "assets/splash.png", "assets/splash-dark.png"];
for (const f of files){
  if (f.endsWith(".txt")) continue;                 // license files ride along
  if (CAPACITOR_INPUTS.includes(f)) continue;       // consumed by @capacitor/assets in CI
  ok(src.includes(f) || sw.includes(f), `orphan asset: ${f}`);
}

// 4. byte budget: assets/ ≤ 900 KB hard
const total = files.reduce((n, f) => n + fs.statSync(path.join(ROOT, f)).size, 0);
ok(total <= 900*1024, `assets total ${Math.round(total/1024)} KB ≤ 900 KB`);
console.log(`  assets: ${files.length} files, ${Math.round(total/1024)} KB`);

// 5. workflow bundles assets
ok(wf.includes("cp -r assets www/"), "APK workflow copies assets/");

// 6. woff2 magic bytes + OFL licenses present
for (const f of files.filter(f => f.endsWith(".woff2"))){
  const b = fs.readFileSync(path.join(ROOT, f));
  ok(b.slice(0,4).toString() === "wOF2", `${f} is valid woff2`);
}
ok(files.some(f => f.includes("OFL-Creepster")), "Creepster OFL license bundled");
ok(files.some(f => f.includes("OFL-JetBrainsMono")), "JetBrains Mono OFL license bundled");

// 7. @font-face unicode-ranges cover ä(E4) ö(F6) ü(FC) ß(DF) — inside U+0000-00FF
ok(/@font-face[\s\S]*JetBrains Mono[\s\S]*U\+0000-00FF/.test(src), "mono latin range covers äöüß");
ok(/U\+1E00-1E9F/.test(src), "latin-ext range covers capital ẞ (U+1E9E)");
ok(/@font-face[\s\S]*Creepster[\s\S]*U\+0000-00FF/.test(src), "display latin range covers äöüß");

// 8. mandatory CC-BY attribution present in credits
ok(src.includes("Svetlana Kushnariova (Cabbit)") && src.includes("Jordan Irwin (AntumDeluge)"),
   "mandatory CC-BY credit line present");
ok(!/craftpix/i.test(src) && !files.some(f => /craftpix/i.test(f)), "no CraftPix anywhere");

console.log(fails === 0 ? "test-assets: ALL PASS" : `test-assets: ${fails} FAILURES`);
process.exit(fails ? 1 : 0);
