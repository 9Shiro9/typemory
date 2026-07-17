/* Animation math — pure functions, spliced into the game AND require()d by tests. */

/* walk cycle: 3-frame sheet played 0,1,2,1 — returns source frame index */
function walkFrame(elapsed, fps){
  const seq = [0, 1, 2, 1];
  return seq[Math.floor(elapsed * (fps || 6)) % 4];
}

/* boss uses 4 distinct frames in order */
function bossFrame(elapsed, fps){
  return Math.floor(elapsed * (fps || 5)) % 4;
}

/* hit-stop: while active, game time crawls (slow-mo beats a hard freeze) */
function hitstopScale(hitStop){
  return hitStop > 0 ? 0.08 : 1;
}

/* corpse fade: alpha over its afterlife (dead runs 1 → CORPSE_TTL) */
const CORPSE_TTL = 5;
function corpseAlpha(dead){
  if (dead <= 1) return 0.9;
  return Math.max(0, 0.9 * (1 - (dead - 1) / (CORPSE_TTL - 1)));
}

if (typeof module !== "undefined" && module.exports){
  module.exports = { walkFrame, bossFrame, hitstopScale, corpseAlpha, CORPSE_TTL };
}
