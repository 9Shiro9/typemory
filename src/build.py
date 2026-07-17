#!/usr/bin/env python3
"""Splice vocab packs into the game source and emit the shippable index.html."""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src")

src = open(os.path.join(SRC, "game_src.html"), encoding="utf-8").read()
vocab = (open(os.path.join(SRC, "vocab.js"), encoding="utf-8").read() + "\n"
       + open(os.path.join(SRC, "vocab2.js"), encoding="utf-8").read())
sched = open(os.path.join(SRC, "scheduler.js"), encoding="utf-8").read()
inp = open(os.path.join(SRC, "input.js"), encoding="utf-8").read()
anim = open(os.path.join(SRC, "anim.js"), encoding="utf-8").read()
ach = open(os.path.join(SRC, "achievements.js"), encoding="utf-8").read()
out = (src.replace("/*__VOCAB__*/", vocab).replace("/*__SCHEDULER__*/", sched)
          .replace("/*__INPUT__*/", inp).replace("/*__ANIM__*/", anim)
          .replace("/*__ACH__*/", ach))
for ph in ("/*__VOCAB__*/", "/*__SCHEDULER__*/", "/*__INPUT__*/", "/*__ANIM__*/", "/*__ACH__*/"):
    assert ph not in out, ph + " not replaced"

final = ('<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
       + out.replace('<canvas id="cv">', '</head>\n<body>\n<canvas id="cv">', 1)
       + "\n</body>\n</html>\n")
open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8").write(final)

# emit the embedded script for `node --check`
m = re.search(r"<script>(.*)</script>", final, re.S)
open(os.path.join(SRC, ".check.js"), "w", encoding="utf-8").write(m.group(1))
print(f"built index.html ({len(final)} bytes) — run: node --check src/.check.js")
