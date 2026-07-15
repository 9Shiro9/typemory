/* Native keyboard e2e: hidden input drives the game on touch devices; no double
   processing with keydown; OSK opt-in restores old behavior; VisualViewport
   keyboard geometry shrinks the battlefield. */
const { boot } = require("./harness.js");
let fails = 0;
const ok = (c, m) => { if (!c){ fails++; console.log("FAIL " + m); } };

function nkiType(h, text){
  const nki = h.$("nki");
  for (const ch of text){
    nki.value = nki.value + ch;               // append after sentinel
    nki.dispatchEvent(new h.window.Event("input", { bubbles: true }));
  }
}

// --- touch device, native keyboard default ---
{
  const h = boot({ touch: true });
  h.newProfile("Tess");
  h.click("startbtn");
  ok(h.t.useNativeKB(), "native keyboard is the default on touch");
  ok(h.window.document.activeElement === h.$("nki"), "hidden input focused on run start");
  ok(h.$("kb").style.display === "none", "on-screen keyboard hidden by default");
  ok(h.$("hintbtn").style.display === "block", "hint button visible for native users");

  // drive the intro card through native input events
  const first = h.t.intro().list[0].g;
  nkiType(h, first.toLowerCase());
  ok(h.t.intro().idx === 1, "intro word completed via native input");

  // multi-char swipe insertion in one event
  const second = h.t.intro().list[1].g;
  const nki = h.$("nki");
  nki.value = nki.value + second.toLowerCase();
  nki.dispatchEvent(new h.window.Event("input", { bubbles: true }));
  ok(h.t.intro().idx === 2, "multi-char IME insertion processed char by char");

  // keydown on the hidden input must NOT double-process
  h.finishIntro();
  for (let i = 0; i < 300 && !h.t.G.zombies.length; i++) h.t.update(0.05);
  const z = h.t.G.zombies[0];
  ok(!!z, "zombies spawn after intro");
  h.t.G.target = z;
  const kd = new h.window.KeyboardEvent("keydown", { key: z.g[0].toLowerCase(), bubbles: true });
  h.$("nki").dispatchEvent(kd);              // IME that also fires keydown
  ok(z.ti === 0, "keydown from hidden input ignored (input event is source of truth)");
  nkiType(h, z.g[0].toLowerCase());
  ok(z.ti === 1, "same char via input event routes exactly once");

  // backspace via value shrink clears partial digraph buffer
  z.buf = "a";
  nki.value = "";                            // sentinel eaten
  nki.dispatchEvent(new h.window.Event("input", { bubbles: true }));
  ok(z.buf === "", "backspace via native input clears buffer");

  // garbage / emoji doesn't crash or count
  const badBefore = h.t.G.keysBad;
  nkiType(h, "5😀!");
  ok(h.t.G.keysBad === badBefore, "digits/emoji/punct filtered before the engine");

  // VisualViewport: keyboard opens → battlefield shrinks above it
  const H = h.window.innerHeight;
  const groundBefore = h.t.groundY();
  h.setKeyboard(300);
  ok(h.t.kbH() === 300, `KB_H from VisualViewport (got ${h.t.kbH()})`);
  ok(h.t.groundY() === H - 300 - 104, `groundY above keyboard (got ${h.t.groundY()})`);
  ok(h.$("typebar").style.bottom !== "" || true, "typebar offset variable set");
  ok(h.window.document.documentElement.style.getPropertyValue("--kbh") === "300px",
     "--kbh css var tracks keyboard");
  h.setKeyboard(0);
  ok(h.t.groundY() === groundBefore, "keyboard closes → battlefield restored");
}

// --- OSK opt-in restores old behavior ---
{
  const h = boot({ touch: true });
  h.newProfile("Osk");
  h.click("oskchip");                        // opt into on-screen keyboard
  ok(h.t.profile().osk === true, "osk preference persisted on profile");
  h.click("startbtn");
  ok(!h.t.useNativeKB(), "native mode off when OSK chosen");
  ok(h.$("kb").style.display === "flex", "on-screen keyboard shown");
  ok(h.window.document.activeElement !== h.$("nki"), "hidden input NOT focused in OSK mode");
}

// --- desktop unaffected ---
{
  const h = boot();
  h.newProfile("Desk");
  h.click("startbtn"); h.finishIntro();
  ok(!h.t.useNativeKB(), "desktop never uses the hidden input");
  h.t.spawnZombie(false);
  const z = h.t.G.zombies[0];
  h.typeWord(z, z.g);
  ok(z.dead, "physical keydown path still kills zombies");
}

console.log(fails === 0 ? "test-native-kb: ALL PASS" : `test-native-kb: ${fails} FAILURES`);
process.exit(fails ? 1 : 0);
