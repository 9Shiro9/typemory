/* Typemory SRS scheduler — pure functions.
   Spliced into the game by build.py AND require()d directly by node tests. */
const SRS_STEPS = [1, 3, 7, 21];        // review intervals in days
const DAY_MS = 86400000;

/* next interval after a result: clean → climb one step, else → drop one step.
   Failure floors at 1 day (never 0): every reviewed word must always become
   due again, otherwise a word whose last review failed would retire forever. */
function srsNextInterval(iv, clean){
  iv = iv || 0;
  if (clean){
    for (const s of SRS_STEPS) if (s > iv) return s;
    return SRS_STEPS[SRS_STEPS.length - 1];
  }
  let prev = SRS_STEPS[0];
  for (const s of SRS_STEPS){ if (s < iv) prev = s; }
  return prev;
}

/* apply a review result to a word stat (mutates and returns it) */
function srsApply(stat, clean, now){
  stat.iv = srsNextInterval(stat.iv, clean);
  stat.ls = now;
  return stat;
}

/* a word is due iff it has been reviewed before AND its interval has elapsed.
   Unseen words (no ls) are never due. */
function srsIsDue(stat, now){
  return !!(stat && stat.ls > 0 && stat.iv > 0 && now >= stat.ls + stat.iv * DAY_MS);
}

/* due sometime in (now, now+ms] — e.g. "due tomorrow" with ms = DAY_MS */
function srsDueWithin(stat, now, ms){
  if (!stat || !(stat.ls > 0) || !(stat.iv > 0)) return false;
  const due = stat.ls + stat.iv * DAY_MS;
  return due > now && due <= now + ms;
}

function srsDueCount(words, now){
  let n = 0;
  for (const w in words) if (srsIsDue(words[w], now)) n++;
  return n;
}
function srsDueTomorrowCount(words, now){
  let n = 0;
  for (const w in words) if (srsDueWithin(words[w], now, DAY_MS)) n++;
  return n;
}

/* spawn weight, ordering: due > weak > new > seen-not-due > mastered-not-due */
function srsWeight(stat, now){
  if (!stat || !(stat.ls > 0)) return 1.5;                      // unseen / only introduced
  if (srsIsDue(stat, now)){
    const overdueDays = (now - (stat.ls + stat.iv * DAY_MS)) / DAY_MS;
    return 8 + Math.min(4, Math.max(0, overdueDays) * 0.5);     // 8..12
  }
  const weak = (stat.e || 0) * 2 + (stat.l || 0) * 3;
  if (weak > 0 && !stat.m) return 1.6 + Math.min(4, weak * 0.5); // 2.1..5.6
  if (stat.m) return 0.08;                                       // mastered, not due
  return 0.5;                                                    // known, resting
}

/* local-calendar day key, used for daily new/review counters */
function dayKey(now){
  const d = new Date(now);
  return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0")
       + "-" + String(d.getDate()).padStart(2,"0");
}

if (typeof module !== "undefined" && module.exports){
  module.exports = { SRS_STEPS, DAY_MS, srsNextInterval, srsApply, srsIsDue,
    srsDueWithin, srsDueCount, srsDueTomorrowCount, srsWeight, dayKey };
}
