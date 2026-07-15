/* Native-keyboard input extraction — pure functions.
   The hidden field holds a one-space sentinel so backspace produces a
   detectable value change. Spliced into the game AND require()d by tests. */
const NKI_SENTINEL = " ";

/* diff previous vs current field value → backspaces + inserted characters.
   Handles multi-char IME/swipe insertions and mid-string autocompletions. */
function extractKeys(prev, val){
  let i = 0;
  while (i < prev.length && i < val.length && prev[i] === val[i]) i++;
  return { backspaces: prev.length - i, keys: [...val.slice(i)] };
}

/* keep only characters the game understands; Enter and garbage are dropped.
   Umlauts pass through directly (German layouts); everything else lowercased. */
function filterKey(k){
  if (k === "\n" || k === "\r") return null;
  const c = k.toLowerCase();
  return /^[a-zäöüß\- ']$/.test(c) ? c : null;
}

if (typeof module !== "undefined" && module.exports){
  module.exports = { NKI_SENTINEL, extractKeys, filterKey };
}
