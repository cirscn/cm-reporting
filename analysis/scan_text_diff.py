#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extract text diffs between template versions to support product-readable change logs.
Outputs:
- analysis/scan-YYYY-MM-DD/{template}_text_diff.csv
- analysis/scan-YYYY-MM-DD/{template}_text_diff_summary.csv
"""

from __future__ import annotations

import csv
import datetime as dt
import re
from pathlib import Path
from typing import Dict, List, Tuple

import openpyxl

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE_ROOT = ROOT / "app" / "templates"
DATE_TAG = dt.date.today().isoformat()
OUT_ROOT = ROOT / "analysis" / f"scan-{DATE_TAG}"
VERSION_RE = re.compile(r"_(\d+(?:\.\d+)*)$")


def is_versioned_xlsx(path: Path) -> bool:
    if path.name.startswith("~$"):
        return False
    return bool(VERSION_RE.search(path.stem))


def parse_version(path: Path) -> Tuple[str, Tuple[int, ...]]:
    match = VERSION_RE.search(path.stem)
    if not match:
        return "", (0,)
    version = match.group(1)
    parts = [int(part) for part in version.split(".") if part]
    return version, tuple(parts) or (0,)


def normalize_text(value) -> str:
    if value is None:
        return ""
    if not isinstance(value, str):
        return ""
    text = value.replace("\r", "").strip()
    text = re.sub(r"\s+", " ", text)
    return text


def extract_sheet_text(ws) -> Dict[str, str]:
    texts: Dict[str, str] = {}
    for cell in ws._cells.values():
        text = normalize_text(cell.value)
        if not text:
            continue
        texts[cell.coordinate] = text
    return texts


def load_versions(folder: Path) -> List[Tuple[str, Path]]:
    files = sorted(p for p in folder.glob("*.xlsx") if is_versioned_xlsx(p))
    versions = []
    for file in files:
        ver_str, ver_key = parse_version(file)
        versions.append((ver_str, ver_key, file))
    versions.sort(key=lambda x: x[1])
    return [(ver, file) for ver, _, file in versions]


def write_csv(path: Path, header: List[str], rows: List[List[str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(rows)


def main() -> None:
    OUT_ROOT.mkdir(parents=True, exist_ok=True)

    for template_dir in TEMPLATE_ROOT.iterdir():
        if not template_dir.is_dir():
            continue
        versions = load_versions(template_dir)
        if not versions:
            continue
        baseline_version, baseline_file = versions[-1]
        baseline_wb = openpyxl.load_workbook(baseline_file, data_only=True, read_only=False)
        baseline_texts = {
            ws.title: extract_sheet_text(ws) for ws in baseline_wb.worksheets
        }

        diff_rows = []
        summary_counts: Dict[Tuple[str, str], int] = {}

        for version, file_path in versions[:-1]:
            wb = openpyxl.load_workbook(file_path, data_only=True, read_only=False)
            for ws in wb.worksheets:
                sheet = ws.title
                base_sheet_text = baseline_texts.get(sheet, {})
                cur_sheet_text = extract_sheet_text(ws)
                all_cells = set(base_sheet_text.keys()) | set(cur_sheet_text.keys())
                changed = 0
                for cell in all_cells:
                    base_val = base_sheet_text.get(cell, "")
                    cur_val = cur_sheet_text.get(cell, "")
                    if base_val == cur_val:
                        continue
                    if not base_val and not cur_val:
                        continue
                    diff_rows.append(
                        [sheet, version, baseline_version, cell, cur_val, base_val]
                    )
                    changed += 1
                summary_counts[(sheet, version)] = changed

        diff_rows.sort(key=lambda r: (r[0], r[1], r[3]))
        write_csv(
            OUT_ROOT / f"{template_dir.name.lower()}_text_diff.csv",
            ["sheet", "version", "baseline", "cell", "version_text", "baseline_text"],
            diff_rows,
        )

        summary_rows = []
        for (sheet, version), count in sorted(summary_counts.items()):
            summary_rows.append([sheet, version, baseline_version, str(count)])
        write_csv(
            OUT_ROOT / f"{template_dir.name.lower()}_text_diff_summary.csv",
            ["sheet", "version", "baseline", "changed_cells"],
            summary_rows,
        )


if __name__ == "__main__":
    main()
