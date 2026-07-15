/* Unit tests for the SRS scheduler + 30-day learner simulation. Run: node src/tests/test-scheduler.js */
const S = require("../scheduler.js");
let fails = 0;
const eq = (got, want, msg) => {
  if (JSON.stringify(got) !== JSON.stringify(want)){ fails++; console.log(`FAIL ${msg}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); }
};
const ok = (cond, msg) => { if (!cond){ fails++; console.log("FAIL " + msg); } };

/* interval transitions */
eq(S.srsNextInterval(0, true), 1,  "0 --clean--> 1");
eq(S.srsNextInterval(1, true), 3,  "1 --clean--> 3");
eq(S.srsNextInterval(3, true), 7,  "3 --clean--> 7");
eq(S.srsNextInterval(7, true), 21, "7 --clean--> 21");
eq(S.srsNextInterval(21, true), 21,"21 caps at 21");
eq(S.srsNextInterval(21, false), 7,"21 --fail--> 7");
eq(S.srsNextInterval(7, false), 3, "7 --fail--> 3");
eq(S.srsNextInterval(3, false), 1, "3 --fail--> 1");
eq(S.srsNextInterval(1, false), 1, "1 --fail--> 1 (floor: always due again)");
eq(S.srsNextInterval(0, false), 1, "0 --fail--> 1 (floor)");
eq(S.srsNextInterval(undefined, true), 1, "undefined iv treated as 0");

/* due-date math across day boundaries */
const now = Date.parse("2026-07-15T23:30:00");   // late evening, local
const st = S.srsApply({iv:0, ls:0}, true, now);   // iv=1, ls=now
ok(!S.srsIsDue(st, now), "not due immediately after review");
ok(!S.srsIsDue(st, now + S.DAY_MS - 1), "not due 1ms before interval elapses");
ok(S.srsIsDue(st, now + S.DAY_MS), "due exactly when interval elapses (crosses midnight)");
ok(S.srsIsDue(st, now + 3 * S.DAY_MS), "still due later — never un-dues");

/* dueWithin (due tomorrow) */
ok(S.srsDueWithin(st, now, S.DAY_MS), "iv=1 reviewed now → due within 24h");
ok(!S.srsDueWithin(st, now + 2 * S.DAY_MS, S.DAY_MS), "already-overdue word is not 'due tomorrow'");
ok(!S.srsDueWithin({iv:7, ls:now}, now, S.DAY_MS), "iv=7 not due tomorrow");

/* invariant: unseen word can never be due */
ok(!S.srsIsDue(undefined, now), "undefined stat never due");
ok(!S.srsIsDue({k:0,c:0,e:0,l:0,m:0,iv:0,ls:0}, now), "blank stat never due");
ok(!S.srsIsDue({iv:0, ls:0, in:1}, now + 999 * S.DAY_MS), "introduced-but-unreviewed never due");
ok(!S.srsIsDue({iv:3, ls:0}, now), "iv without lastSeen never due");

/* weight ordering: due > weak > new > seen-not-due > mastered-not-due */
const wDue      = S.srsWeight({iv:1, ls: now - 2*S.DAY_MS}, now);
const wWeak     = S.srsWeight({iv:1, ls: now, e:2, l:1, m:0}, now);
const wNew      = S.srsWeight(undefined, now);
const wIntro    = S.srsWeight({iv:0, ls:0, in:1}, now);
const wSeen     = S.srsWeight({iv:3, ls: now, e:0, l:0, m:0}, now);
const wMastered = S.srsWeight({iv:21, ls: now, m:1}, now);
ok(wDue > wWeak, `due(${wDue}) > weak(${wWeak})`);
ok(wWeak > wNew, `weak(${wWeak}) > new(${wNew})`);
ok(wNew >= wIntro, "unseen ~= introduced");
ok(wNew > wSeen, `new(${wNew}) > seen-not-due(${wSeen})`);
ok(wSeen > wMastered, `seen(${wSeen}) > mastered-not-due(${wMastered})`);
const wMastDue = S.srsWeight({iv:21, ls: now - 22*S.DAY_MS, m:1}, now);
ok(wMastDue >= 8, "mastered word that comes due resurfaces with top weight");

/* timezone sanity: dayKey uses local calendar dates */
ok(/^\d{4}-\d{2}-\d{2}$/.test(S.dayKey(now)), "dayKey format");
ok(S.dayKey(now) !== S.dayKey(now + S.DAY_MS), "dayKey changes across a day");

/* ---- 30-day learner simulation ----
   Plays daily except a 5-day gap (days 12-16). 15% of reviews are sloppy. */
let seed = 42;
const rand = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
const t0 = Date.parse("2026-01-05T19:00:00");
const words = {};
for (let i = 0; i < 60; i++) words["w" + i] = {iv:0, ls:0, e:0, l:0, m:0};

let maxDuePileAfterGap = 0;
for (let day = 0; day < 30; day++){
  const nowD = t0 + day * S.DAY_MS;
  if (day >= 12 && day < 17){ continue; }              // the vacation gap
  // introduce 2 new words per active day, review everything due + some others
  let reviewed = 0;
  const due = Object.values(words).filter(w => S.srsIsDue(w, nowD));
  if (day === 17) maxDuePileAfterGap = due.length;
  for (const w of Object.values(words)){
    const isDue = S.srsIsDue(w, nowD);
    const isNew = !(w.ls > 0);
    if (isDue || (isNew && reviewed < 25)){
      const clean = rand() > 0.15;
      S.srsApply(w, clean, nowD);
      if (!clean){ w.e++; }
      reviewed++;
    }
  }
}
const end = t0 + 30 * S.DAY_MS;
const ivs = Object.values(words).map(w => w.iv);
ok(ivs.some(iv => iv >= 7), "intervals grew to 7+ for well-known words");
ok(ivs.every(iv => iv <= 21), "no interval exceeds the 21-day cap");
ok(maxDuePileAfterGap >= 10, `5-day gap created a due-pile (got ${maxDuePileAfterGap})`);
const retiredForever = Object.values(words).filter(w =>
  w.ls > 0 && !S.srsIsDue(w, end + 22 * S.DAY_MS));
ok(retiredForever.length === 0, "every reviewed word becomes due again within 22 days — nothing retires forever");
const unseenDue = Object.values(words).filter(w => !(w.ls > 0) && S.srsIsDue(w, end));
ok(unseenDue.length === 0, "sim invariant: unseen words never due");

console.log(fails === 0 ? "test-scheduler: ALL PASS" : `test-scheduler: ${fails} FAILURES`);
process.exit(fails ? 1 : 0);
