# Free asset research for Typemory (2026-07-17)

Deep-research run (107 agents, 25 sources fetched, 110 claims extracted, 23 license/content
claims adversarially confirmed 3-0 unless noted) + follow-up manual verification for
categories 3–6. Constraint recap: assets ship in a PUBLIC GitHub repo + offline PWA + APK,
so licenses must allow **redistribution of raw files**, not just "use in games".

## The big disqualification (important!)

**CraftPix / "Free Game Assets" (itch.io) — ALL freebies are unusable for us.**
Their packs are visually the best (only free zombies WITH death animations, gorgeous
1-bit graveyard parallax backgrounds), BUT their custom license
(craftpix.net/file-licenses/) forbids redistributing art files "in a manner that would
make some or all of the art files useable to another end user". Raw PNGs in a public
repo are exactly that. Verified 3-0 across six claims. Shipping *inside* an APK would be
fine — the public repo is the blocker. (Could email them for written permission; until
then: rejected.)

## Category 1 — Zombie art (verified)

| Asset | License | Notes |
|---|---|---|
| **"Zombies" by Cabbit & AntumDeluge** — opengameart.org/content/zombies | CC-BY 4.0 / OGA-BY 3.0 — credits line required | ⭐ PICK. 115 KB zip, 4 variants (zombie, bloody, rotten, headless), 24x32 & 48x64 px, 4-direction 12-frame walk incl. SOUTH (downward-facing = our faller) + idle. No death anim (fake with shrink/fade/particles). Credit: "Zombies by Svetlana Kushnariova (Cabbit) & Jordan Irwin (AntumDeluge)" |
| "Animated Top Down Zombie" by Riley Gombart — opengameart.org/content/animated-top-down-zombie | CC0 | Idle/Move/Attack only, no death. 1.9 MB zip — crop/downscale a few frames for a boss silhouette. Don't confuse with the author's OGA-BY "Top Down Animated Zombie Set". |
| Kenney Toon Characters — kenney.nl/assets/toon-characters | CC0 (blanket, kenney.nl/support) | Zombie-variant contents unverified; check before relying on it. |

## Category 2 — Environment (verified)

| Asset | License | Notes |
|---|---|---|
| **angrysnail "16x16 Pixel Art Graveyard Tileset"** — angrysnail.itch.io/pixel-art-graveyard-tileset | CC0 (stated in description) | ⭐ PICK. 10 KB PNG: ground, gravestones, fences, animated torches. Near-zero bytes, fits the dark palette. |
| OGA "CC0 Backgrounds" collection — opengameart.org/content/cc0-backgrounds | CC0 (curated list) | Browse for a night sky/moon layer if needed. |
| Kenney (any pack) | CC0 | Blanket fallback for props. |

## Category 3 — UI/FX (Kenney blanket CC0, verified via kenney.nl/support)

- **Kenney Particle Pack** — kenney.nl/assets/particle-pack — ~80 white-on-transparent
  particles (explosions, flares, sparks, muzzle-style flashes). White = canvas-tintable
  to our green/red/amber. ⭐ PICK (select ~10 sprites, not the whole pack).
- Kenney Smoke Particles — kenney.nl/assets/smoke-particles — fog/smoke puffs.
- OGA "Blood splat" + pixel explosion packs — check per-item license before use.

## Category 4 — Audio

- **"Zombies Sound Pack" by artisticdude** — opengameart.org/content/zombies-sound-pack —
  **CC0 verified** (manual fetch 2026-07-17). 24 zombie groans/growls, WAV, 4.7 MB raw →
  convert chosen ~8 sounds to OGG/M4A (~30-60 KB each). ⭐ PICK for groans.
- **Kenney Impact Sounds** (100+ hits/thuds) & **Kenney Interface Sounds** (clicks/UI) —
  CC0 blanket. ⭐ PICK for hits + UI. Small OGGs.
- Ambient/menu loop: Kevin MacLeod (incompetech.com, Horror genre) — CC-BY 4.0 with
  credits line, verify per track at download time. Alternative: keep the WebAudio synth.
- Keep existing synth beeps for typing feedback (zero bytes, already tuned).

## Category 5 — Fonts

- **Typing/mono: JetBrains Mono** — OFL 1.1 (fonts.google.com/specimen/JetBrains+Mono).
  Full German incl. ä ö ü ß certain; capital ẞ (U+1E9E) was requested in
  github.com/JetBrains/JetBrainsMono#262 (closed) — VERIFY the glyph at bundling time
  (we never render capital ẞ in vocab, so not blocking). woff2 subset ≈ 40-90 KB.
- **Display/horror: Creepster** — OFL, subsets latin + latin-ext **verified** via
  google/fonts METADATA.pb (manual fetch 2026-07-17). Covers ä ö ü ß for headings.
- Both self-hostable as woff2/data-URI; OFL requires keeping the font's license file in
  the repo (fine) — no credits-screen requirement.

## Category 6 — Typing-feedback "juice" references

- "Juice it or lose it" — Martin Jonasson & Petri Purho (talk; gamejuice.co.uk mirror) —
  the canonical checklist: tweens, hit-stop, screenshake, particles, sound layering.
- "The Art of Screenshake" — Jan Willem Nijman (Vlambeer) — gunfeel: muzzle flash,
  kickback, hit-stop frames, permanence (corpses stay).
- valdemird.com/blog/game-feel-on-the-web — game feel specifically in browser/canvas.
- Study: ZType (zty.pe) — per-letter laser + letter pop; Monkeytype — caret smoothing,
  per-word color states.
- Implementation shortlist for us: 2-3 frame hit-stop on kill, letter "pop" scale tween
  on each correct keystroke, tinted particle burst per hit (not just kill), combo fire
  on the word bar at 5+, corpse permanence on the field, muzzle flash at the barricade.

## Recommended starter kit (≈ 400-700 KB total added)

1. OGA "Zombies" pack sprites (115 KB) — 4 walking variants [credits line required]
2. angrysnail graveyard tileset (10 KB) — props behind the battlefield
3. ~10 tintable Kenney particles (~50 KB) — explosions/flashes/blood-tint
4. ~8 zombie groans (CC0, converted to OGG, ~300 KB) + a few Kenney impact/UI sounds
5. JetBrains Mono woff2 subset (~60 KB) + Creepster woff2 (~40 KB)
6. Juice pass in code (0 bytes)

Add a credits screen: AntumDeluge/Cabbit (zombies), optional Kenney/artisticdude
mentions, Kevin MacLeod if a music track is used. Re-verify all license pages at
bundling time; pages checked live 2026-07-17.
