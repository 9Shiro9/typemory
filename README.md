# Typemory ⌨️

**Type it to remember it.** Typemory is a vocabulary-focused typing game for language
learners: words fall from the sky, you type them before they land — and because every
word shows its meaning while your fingers spell it out, the vocabulary sticks.

German is the first supported language; the engine is language-agnostic and more
word packs are planned.

## Campaign 1 — Wortschatz Apocalypse 🧟 (German A1 + A2)

Zombies carry German words into battle. Type the word — article included — to shoot
them before they reach your barricade.

**Play:** https://9shiro9.github.io/typemory/ — or open `index.html` locally.

**Install as an app (free, no store):** it's a PWA — after the first visit it works fully
offline. On Android tap the **📲 Install app** button in the menu; on iPhone open in Safari →
Share → **Add to Home Screen**.

- **1,288 words** — Goethe A1 (636) + A2 (652) vocabulary with English meanings
- **Copy mode** (word shown — learn spelling) and **Recall mode** (only the meaning
  shows — remember the German; 💡/Tab reveals a letter for a penalty)
- **Articles required & color-coded** — der = blue, die = pink, das = amber, so noun
  gender sticks visually
- **Umlaut-friendly typing** — `ae oe ue ss` work for `ä ö ü ß`
- **Character-by-character feedback** — every correct letter fires a bullet; a wrong
  letter makes the zombie faster
- **Mobile-first** — built-in on-screen QWERTZ keyboard with umlaut keys
- **Progress tracking** — multiple player profiles (saved in the browser), per-word
  mastery (3 clean kills = learned), weak words respawn more often, day streaks, and a
  head-to-head stats screen
- Waves, bosses every 5th wave, combos, retro synth sounds — all in **one
  dependency-free HTML file**

## Roadmap

- Word packs as data: plug in any language's word→meaning list
- Keyboard layouts per language (QWERTZ today; AZERTY, kana, … later)
- More campaign themes beyond zombies

## Notes

- Progress is stored in `localStorage`, per browser/device.
- `learning-materials/` (source textbooks and wordlist PDFs) is intentionally not committed.
