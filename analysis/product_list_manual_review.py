#!/usr/bin/env python3
"""
Manual review helper for Product List headers vs docs.

Outputs:
- product-list-manual-diff.md (per-version evidence)
- product-list-manual-fixlist.md (only mismatches)
"""

from __future__ import annotations

import argparse
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple

import openpyxl

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE_ROOT = ROOT / "app" / "templates"
VERSION_RE = re.compile(r"_(\d+(?:\.\d+)*)$")


@dataclass(frozen=True)
class Signal:
    key: str
    patterns: List[re.Pattern]
    note: str


def parse_version(name: str) -> Tuple[str, Tuple[int, ...]]:
    match = VERSION_RE.search(name)
    if not match:
        return "", (0,)
    version = match.group(1)
    parts = [int(part) for part in version.split(".") if part]
    return version, tuple(parts) or (0,)


def load_template_versions() -> Dict[str, List[Tuple[str, Tuple[int, ...], Path]]]:
    templates: Dict[str, List[Tuple[str, Tuple[int, ...], Path]]] = {}
    for folder in TEMPLATE_ROOT.iterdir():
        if not folder.is_dir():
            continue
        entries = []
        for xlsx in folder.glob("*.xlsx"):
            if xlsx.name.startswith("~$"):
                continue
            version, key = parse_version(xlsx.stem)
            if not version:
                continue
            entries.append((version, key, xlsx))
        entries.sort(key=lambda x: x[1])
        templates[folder.name] = entries
    return templates


def detect_header(ws, max_rows: int = 12, max_cols: int = 20) -> Tuple[int, List[str]]:
    best = (0, 1, [])
    for row in range(1, max_rows + 1):
        values: List[str] = []
        nonempty = 0
        for col in range(1, max_cols + 1):
            val = ws.cell(row=row, column=col).value
            text = str(val).strip() if val is not None else ""
            values.append(text)
            if text:
                nonempty += 1
        if nonempty > best[0]:
            best = (nonempty, row, values)
    _, row, values = best
    while values and not values[-1]:
        values.pop()
    if values and not values[0]:
        values = values[1:]
    return row, values


def doc_paths_for(template: str, version: str) -> List[Path]:
    lower = template.lower()
    paths: List[Path] = []
    accept = ROOT / "docs" / "diffs" / "acceptance" / f"{lower}-{version}.md"
    if accept.exists():
        paths.append(accept)
    if template == "AMRT" and version == "1.1":
        legacy = ROOT / "docs" / "diffs" / "amrt-1.1.md"
        if legacy.exists():
            paths.append(legacy)
    for path in [
        ROOT / "docs" / "diffs" / f"{lower}.md",
        ROOT / "docs" / "prd" / "field-dictionary.md",
        ROOT / "docs" / "prd" / "conflict-minerals-prd.md",
    ]:
        if path.exists():
            paths.append(path)
    return paths


def find_doc_evidence(paths: Iterable[Path], patterns: List[re.Pattern]) -> str:
    for path in paths:
        if not path.exists():
            continue
        lines = path.read_text(encoding="utf-8").splitlines()
        for idx, line in enumerate(lines, 1):
            for pat in patterns:
                if pat.search(line):
                    return f"{path}:{idx}: {line.strip()}"
    return ""


def build_signals(template: str, version_str: str, version_key: Tuple[int, ...]) -> List[Signal]:
    signals: List[Signal] = []

    def v_at_least(target: Tuple[int, ...]) -> bool:
        return version_key >= target

    if template == "CMRT":
        if v_at_least((6, 5)):
            signals.append(
                Signal(
                    key="required_field",
                    patterns=[re.compile(r"回复方.*产品编号")],
                    note="Product List required field is Replying company product ID",
                )
            )
        else:
            signals.append(
                Signal(
                    key="required_field",
                    patterns=[re.compile(r"制造商.*产品(序号|编号)")],
                    note="Product List required field is Manufacturer product number",
                )
            )
        if version_str == "6.01":
            signals.append(
                Signal(
                    key="header_0_placeholder",
                    patterns=[re.compile(r"0/空值"), re.compile(r"第三列表头.*0", re.I)],
                    note="6.01 third header placeholder",
                )
            )
        return signals

    if template == "EMRT":
        if v_at_least((2, 0)):
            signals.append(
                Signal(
                    key="required_field",
                    patterns=[re.compile(r"回复方.*产品编号")],
                    note="Product List required field is Replying company product ID",
                )
            )
        else:
            signals.append(
                Signal(
                    key="required_field",
                    patterns=[re.compile(r"制造商.*产品编号")],
                    note="Product List required field is Manufacturer product number",
                )
            )
        if v_at_least((2, 1)):
            signals.append(
                Signal(
                    key="requester_fields",
                    patterns=[re.compile(r"请求方.*产品编号"), re.compile(r"请求方.*产品名称")],
                    note="Requester fields added",
                )
            )
        return signals

    if template == "CRT":
        signals.append(
            Signal(
                key="required_field",
                patterns=[re.compile(r"制造商.*产品编号")],
                note="Product List required field is Manufacturer product number",
            )
        )
        return signals

    if template == "AMRT":
        signals.append(
            Signal(
                key="required_field",
                patterns=[re.compile(r"制造商.*产品序号")],
                note="Product List required field is Manufacturer product number",
            )
        )
        if v_at_least((1, 3)):
            signals.append(
                Signal(
                    key="requester_fields",
                    patterns=[re.compile(r"请求方.*产品编号"), re.compile(r"请求方.*产品名称")],
                    note="Requester fields added",
                )
            )
        return signals

    return signals


def run_review(out_diff: Path, out_fix: Path) -> int:
    templates = load_template_versions()
    mismatches = 0
    diff_lines: List[str] = []
    fix_lines: List[str] = []

    diff_lines.append("# Product List 手工复核（模板 vs 文档）")
    diff_lines.append("")
    diff_lines.append("- 覆盖范围：`docs/diffs/**` + `docs/prd/**` + `docs/diffs/acceptance/**`")
    diff_lines.append("")

    fix_lines.append("# Product List 文档修正清单（手工复核）")
    fix_lines.append("")
    fix_lines.append("- 覆盖范围：`docs/diffs/**` + `docs/prd/**` + `docs/diffs/acceptance/**`")
    fix_lines.append("")

    for template in sorted(templates):
        for version, version_key, path in templates[template]:
            wb = openpyxl.load_workbook(path, data_only=True)
            ws = wb["Product List"]
            row, headers = detect_header(ws)
            wb.close()

            diff_lines.append(f"## {template} {version}")
            diff_lines.append("")
            diff_lines.append(f"- 模板表头（row {row}）：{headers}")
            doc_paths = doc_paths_for(template, version)
            signals = build_signals(template, version, version_key)
            if not signals:
                diff_lines.append("- 未定义可校验信号。")
                diff_lines.append("")
                continue

            diff_lines.append("| Signal | Doc Evidence | Note |")
            diff_lines.append("| --- | --- | --- |")
            for signal in signals:
                evidence = find_doc_evidence(doc_paths, signal.patterns)
                diff_lines.append(f"| {signal.key} | {evidence or '-'} | {signal.note} |")
                if not evidence:
                    mismatches += 1
                    fix_lines.append(f"## {template} {version}")
                    fix_lines.append("")
                    fix_lines.append(f"- 缺少文档口径：{signal.note}")
                    fix_lines.append(
                        f"  - 期望包含关键词：{', '.join(p.pattern for p in signal.patterns)}"
                    )
                    fix_lines.append("")
            diff_lines.append("")

    if mismatches == 0:
        fix_lines.append("## 结论")
        fix_lines.append("")
        fix_lines.append("- 未发现需要修正的文档项。")
        fix_lines.append("")

    out_diff.write_text("\n".join(diff_lines), encoding="utf-8")
    out_fix.write_text("\n".join(fix_lines), encoding="utf-8")
    print(f"Wrote detailed diff to {out_diff}")
    print(f"Wrote fix list to {out_fix}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Manual Product List review (template vs docs).")
    parser.add_argument("--out-diff", type=Path, default=None)
    parser.add_argument("--out-fix", type=Path, default=None)
    args = parser.parse_args()

    out_diff = args.out_diff or (ROOT / "analysis" / "scan-2026-01-24" / "product-list-manual-diff.md")
    out_fix = args.out_fix or (ROOT / "analysis" / "scan-2026-01-24" / "product-list-manual-fixlist.md")
    return run_review(out_diff, out_fix)


if __name__ == "__main__":
    raise SystemExit(main())
