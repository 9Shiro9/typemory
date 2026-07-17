/* Shared jsdom harness: boots the built index.html headlessly.
   Stubs: canvas 2d, AudioContext, serviceWorker, speechSynthesis, VisualViewport.
   Usage: const h = require("./harness.js").boot();  →  h.window, h.$, h.click, h.t (exposed internals) */
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

function boot(opts = {}){
  const html = fs.readFileSync(path.join(__dirname, "..", "..", "index.html"), "utf8");
  const dom = new JSDOM(html, { runScripts: "outside-only", pretendToBeVisual: true, url: "https://typemory.test/" });
  const { window } = dom;

  window.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, {
    get: (t, p) => p === "measureText" ? () => ({ width: 50 })
      : p === "createLinearGradient" ? () => ({ addColorStop(){} })
      : typeof p === "string" ? () => {} : undefined,
    set: () => true
  });
  window.AudioContext = undefined;
  Object.defineProperty(window.navigator, "serviceWorker",
    { value: { register: () => ({ catch(){} }) } });

  // speechSynthesis spy
  const spoken = [];
  window.SpeechSynthesisUtterance = function(text){ this.text = text; };
  window.speechSynthesis = {
    getVoices: () => opts.noGermanVoice ? [{lang:"en-US",name:"E"}] : [{lang:"de-DE", name:"Anna"}],
    speak: u => spoken.push(u.text),
    cancel(){}, onvoiceschanged: null
  };

  // VisualViewport stub with manual keyboard control
  const vvListeners = {};
  const vv = {
    height: window.innerHeight, offsetTop: 0,
    addEventListener: (ev, fn) => { (vvListeners[ev] = vvListeners[ev] || []).push(fn); },
    removeEventListener(){}
  };
  window.visualViewport = vv;
  const setKeyboard = (kbHeight) => {
    vv.height = window.innerHeight - kbHeight;
    (vvListeners.resize || []).forEach(fn => fn());
  };

  window.matchMedia = q => ({ matches: !!opts.touch && /pointer:\s*coarse/.test(q) });
  if (!opts.touch){ try { delete window.ontouchstart; } catch(e){} }
  else if (!("ontouchstart" in window)) window.ontouchstart = null;
  window.requestAnimationFrame = () => 0;

  let script = html.match(/<script>([\s\S]*)<\/script>/)[1];
  script += `\nwindow.__t = { G, profile:()=>profile, spawnZombie, pickWord, handleKey,
    makeTokens, feed, feedEn, meaningAnswers, VOCAB, VOCAB_A2,
    activePool: () => activePool(),
    update:(dt)=>update(dt), killZombie, renderTypebar, wordStat:(w)=>wordStat(profile,w),
    setMode:(m)=>{mode=m;}, layoutKB:()=>layoutKB(), groundY:()=>groundY(),
    routeChar: (typeof routeChar!=="undefined") ? routeChar : null,
    useNativeKB: () => useNativeKB(), kbH: () => KB_H, nkiFocus: () => nkiFocus(),
    assetOk: () => ASSET.ok,
    intro: () => (typeof G!=="undefined" ? G.intro : null) };`;
  window.eval(script);

  const $ = id => window.document.getElementById(id);
  return {
    window, dom, $, spoken, setKeyboard,
    click: id => $(id).onclick && $(id).onclick(),
    t: window.__t,
    newProfile(name){ $("pname").value = name; $("paddbtn").onclick(); },
    finishIntro(){
      const t = window.__t;
      while (t.G.intro){
        const w = t.G.intro.list[t.G.intro.idx].g;
        for (const ch of w.toLowerCase()) t.routeChar(ch);
      }
    },
    typeWord(z, word){    // drive handleKey through a full word
      window.__t.G.target = z;
      for (const ch of word.toLowerCase()) window.__t.handleKey(ch);
    }
  };
}
module.exports = { boot };
