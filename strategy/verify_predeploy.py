#!/usr/bin/env python3
"""strategy/index.html の公開前チェック。失敗したら非ゼロ終了。"""
from __future__ import annotations

import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "strategy"
# Documents/business-tools 配下で実行される想定
if not ROOT.exists():
    ROOT = Path.home() / "Documents" / "business-tools" / "strategy"


def main() -> int:
    html_path = ROOT / "index.html"
    html = html_path.read_text(encoding="utf-8")
    scripts = re.findall(r"<script(?![^>]*src)[^>]*>(.*?)</script>", html, re.DOTALL)
    if not scripts:
        print("FAIL: no inline script")
        return 1
    js = scripts[-1]

    need = [
        "loadScmRadar",
        "loadTargetSignals",
        "renderLists",
        "buildMap",
        "renderCompanyList",
        "main",
        "selectHotspotDrill",
        "setVisitFilter",
    ]
    bad: list[str] = []
    for name in need:
        if not re.search(rf"(async\s+)?function\s+{name}\s*\(", js):
            bad.append(f"missing fn {name}")

    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False) as f:
        f.write(js)
        tmp = f.name
    r = subprocess.run(["node", "--check", tmp], capture_output=True, text=True)
    if r.returncode != 0:
        bad.append("syntax: " + (r.stderr or "").strip())

    for name in set(re.findall(r"\b(load[A-Z]\w*)\s*\(", js)):
        if not re.search(rf"(async\s+)?function\s+{name}\s*\(", js):
            bad.append(f"call without def: {name}")

    for fname in (
        "scm_process_targets.json",
        "visit_reports.json",
        "strategy_actions.json",
        "target_signals.json",
    ):
        path = ROOT / fname
        try:
            json.loads(path.read_text(encoding="utf-8"))
        except Exception as e:
            bad.append(f"{fname}: {e}")

    if bad:
        print("FAIL")
        print("\n".join(bad))
        return 1
    print("PASS: strategy predeploy checks ok")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
