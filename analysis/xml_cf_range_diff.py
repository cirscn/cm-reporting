#!/usr/bin/env python3
"""
Report conditional-formatting range differences per template/sheet across versions.

Input:
- analysis/scan-YYYY-MM-DD/xml-cf-report.jsonl

Output:
- analysis/scan-YYYY-MM-DD/xml-cf-range-diff.md
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Dict, List, Set, Tuple


ROOT = Path(__file__).resolve().parents[1]
SCAN_PREFIX = "scan-"


def find_latest_scan(root: Path) -> Path:
    scans = sorted([p for p in root.iterdir() if p.is_dir() and p.name.startswith(SCAN_PREFIX)])
    if not scans:
        raise FileNotFoundError("No scan-YYYY-MM-DD directories found in analysis/.")
    return scans[-1]


def parse_version(value: str) -> Tuple[int, ...]:
    return tuple(int(part) for part in value.split(".") if part.isdigit())


def load_ranges(scan_root: Path) -> Dict[Tuple[str, str, str], Set[str]]:
    path = scan_root / "xml-cf-report.jsonl"
    if not path.exists():
        raise FileNotFoundError(f"Missing {path}")
    ranges: Dict[Tuple[str, str, str], Set[str]] = {}
    with path.open(encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            rec = json.loads(line)
            key = (rec["template"], rec["version"], rec["sheet"])
            sqref = rec.get("sqref", "")
            if not sqref:
                continue
            ranges.setdefault(key, set()).add(sqref)
    return ranges


def run_diff(scan_root: Path, out_path: Path) -> int:
    ranges = load_ranges(scan_root)
    templates = sorted({t for t, _, _ in ranges})

    lines: List[str] = []
    lines.append("# XML CF 范围差异（按版本对比）")
    lines.append("")
    lines.append(f"- Scan: `{scan_root.name}`")
    lines.append("")

    for template in templates:
        versions = sorted({v for t, v, _ in ranges if t == template}, key=parse_version)
        if len(versions) < 2:
            continue
        sheets = sorted({s for t, _, s in ranges if t == template})
        for sheet in sheets:
            diffs = []
            for prev, curr in zip(versions, versions[1:]):
                prev_set = ranges.get((template, prev, sheet), set())
                curr_set = ranges.get((template, curr, sheet), set())
                added = sorted(curr_set - prev_set)
                removed = sorted(prev_set - curr_set)
                if added or removed:
                    diffs.append((prev, curr, added, removed))
            if not diffs:
                continue
            lines.append(f"## {template} - {sheet}（adjacent diffs）")
            lines.append("")
            for prev, curr, added, removed in diffs:
                lines.append(f"- {prev} → {curr}:")
                if added:
                    lines.append(f"  - added: {', '.join(added)}")
                if removed:
                    lines.append(f"  - removed: {', '.join(removed)}")
            lines.append("")

    out_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote range diff report to {out_path}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Report CF range diffs across versions.")
    parser.add_argument("--scan-root", type=Path, default=None, help="analysis/scan-YYYY-MM-DD directory.")
    parser.add_argument(
        "--out",
        type=Path,
        default=None,
        help="Output markdown path (default: scan-root/xml-cf-range-diff.md).",
    )
    args = parser.parse_args()

    scan_root = args.scan_root or find_latest_scan(ROOT / "analysis")
    out_path = args.out or (scan_root / "xml-cf-range-diff.md")
    return run_diff(scan_root, out_path)


if __name__ == "__main__":
    raise SystemExit(main())
