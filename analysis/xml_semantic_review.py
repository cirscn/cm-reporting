#!/usr/bin/env python3
"""
Strict semantic review: compare Excel CF/DV signals vs markdown docs.

Outputs:
- xml-semantic-diff.md (detailed checks + evidence)
- xml-semantic-fixlist.md (only mismatches)
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Dict, Iterable, List, Optional, Tuple

ROOT = Path(__file__).resolve().parents[1]
SCAN_PREFIX = "scan-"
VERSION_RE = re.compile(r"_(\d+(?:\.\d+)*)$")
TARGET_SHEETS = ["Declaration", "Checker", "Smelter List", "Mine List", "Product List"]


@dataclass(frozen=True)
class Signal:
    key: str
    doc_patterns: List[re.Pattern]
    formula_patterns: List[re.Pattern]
    note: str
    dv_predicate: Optional[Callable[[List[Dict[str, str]]], bool]] = None


def find_latest_scan(root: Path) -> Path:
    scans = sorted([p for p in root.iterdir() if p.is_dir() and p.name.startswith(SCAN_PREFIX)])
    if not scans:
        raise FileNotFoundError("No scan-YYYY-MM-DD directories found in analysis/.")
    return scans[-1]


def parse_version(path: Path) -> Tuple[str, Tuple[int, ...]]:
    match = VERSION_RE.search(path.stem)
    if not match:
        return "", (0,)
    version = match.group(1)
    parts = [int(part) for part in version.split(".") if part]
    return version, tuple(parts) or (0,)


def load_template_versions() -> Dict[str, List[str]]:
    templates: Dict[str, List[str]] = {}
    template_root = ROOT / "冲突矿模板"
    for folder in template_root.iterdir():
        if not folder.is_dir():
            continue
        versions: List[Tuple[Tuple[int, ...], str]] = []
        for xlsx in folder.glob("*.xlsx"):
            version, key = parse_version(xlsx)
            if not version:
                continue
            versions.append((key, version))
        versions.sort()
        templates[folder.name] = [v for _, v in versions]
    return templates


def load_cf_formulas(scan_root: Path) -> Dict[Tuple[str, str, str], List[str]]:
    path = scan_root / "xml-cf-report.jsonl"
    if not path.exists():
        raise FileNotFoundError(f"Missing {path}")
    formulas: Dict[Tuple[str, str, str], List[str]] = {}
    with path.open(encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            rec = json.loads(line)
            key = (rec["template"], rec["version"], rec["sheet"])
            formulas.setdefault(key, [])
            for formula in rec.get("formulas", []):
                if formula:
                    formulas[key].append(formula)
    return formulas


def load_dv_records(scan_root: Path) -> Dict[Tuple[str, str, str], List[Dict[str, str]]]:
    dv_map: Dict[Tuple[str, str, str], List[Dict[str, str]]] = {}
    for path in scan_root.glob("*_rule_catalog_dv.csv"):
        template = path.stem.split("_rule_catalog_dv")[0].upper()
        with path.open(encoding="utf-8") as f:
            header = f.readline().strip().split(",")
            for line in f:
                values = line.rstrip("\n").split(",")
                row = dict(zip(header, values))
                key = (template, row.get("version", ""), row.get("sheet", ""))
                dv_map.setdefault(key, []).append(row)
    return dv_map


def load_cfext_summary(scan_root: Path) -> Dict[Tuple[str, str, str], int]:
    summary_path = scan_root / "xml-cf-report-summary.csv"
    cfext: Dict[Tuple[str, str, str], int] = {}
    if not summary_path.exists():
        return cfext
    with summary_path.open(encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get("source") != "ext":
                continue
            key = (row.get("template", ""), row.get("version", ""), row.get("sheet", ""))
            cfext[key] = int(row.get("rule_count", "0") or 0)
    return cfext


def doc_paths_for(template: str, version: str, sheet: str) -> List[Path]:
    lower = template.lower()
    paths: List[Path] = []
    accept = ROOT / "docs" / "diffs" / "acceptance" / f"{lower}-{version}.md"
    if accept.exists():
        paths.append(accept)
    if template == "AMRT" and version == "1.1":
        legacy = ROOT / "docs" / "diffs" / "amrt-1.1.md"
        if legacy.exists():
            paths.append(legacy)

    base = [
        ROOT / "docs" / "diffs" / f"{lower}.md",
        ROOT / "docs" / "prd" / "field-dictionary.md",
        ROOT / "docs" / "prd" / "conflict-minerals-prd.md",
        ROOT / "docs" / "prd" / "pm-onepager.md",
    ]
    if sheet in {"Declaration", "Checker", "Product List"}:
        base.extend(
            [
                ROOT / "docs" / "diffs" / "cross-template.md",
                ROOT / "docs" / "diffs" / "checker-matrix.md",
            ]
        )
    if sheet in {"Smelter List", "Mine List"}:
        base.append(ROOT / "docs" / "diffs" / "conditional-format-matrix.md")

    for path in base:
        if path.exists():
            paths.append(path)
    return paths


def load_docs_text(paths: Iterable[Path]) -> str:
    parts = []
    for path in paths:
        if not path.exists():
            continue
        parts.append(path.read_text(encoding="utf-8"))
    return "\n".join(parts)


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


def find_formula_evidence(formulas: List[str], patterns: List[re.Pattern]) -> str:
    for formula in formulas:
        for pat in patterns:
            if pat.search(formula):
                return formula
    return ""


def excel_date(value: str) -> str:
    if not value:
        return ""
    try:
        number = int(float(value))
    except ValueError:
        return ""
    date = dt.date(1899, 12, 30) + dt.timedelta(days=number)
    return date.strftime("%d-%b-%Y")


def extract_declaration_date(dvs: List[Dict[str, str]]) -> Tuple[str, str]:
    for dv in dvs:
        if dv.get("type") != "date":
            continue
        start = excel_date(dv.get("formula1", ""))
        end = excel_date(dv.get("formula2", ""))
        return start, end
    return "", ""


def doc_has_date_range(text: str, start: str, end: str) -> bool:
    if not start:
        return False
    if end:
        return start in text and end in text
    return bool(re.search(rf">\\s*{re.escape(start)}", text))


def build_signals(template: str, version: str, sheet: str) -> List[Signal]:
    if sheet == "Smelter List":
        signals = [
            Signal(
                key="not_listed",
                doc_patterns=[re.compile(r"Smelter not listed", re.I)],
                formula_patterns=[re.compile(r"Smelter not listed", re.I)],
                note="Smelter not listed",
            ),
            Signal(
                key="not_yet_identified",
                doc_patterns=[re.compile(r"Smelter not yet identified", re.I)],
                formula_patterns=[re.compile(r"Smelter not yet identified", re.I)],
                note="Smelter not yet identified",
            ),
            Signal(
                key="enter_smelter_details",
                doc_patterns=[re.compile(r"Enter smelter details", re.I)],
                formula_patterns=[re.compile(r"Enter smelter details", re.I)],
                note="Enter smelter details",
            ),
            Signal(
                key="bang",
                doc_patterns=[
                    re.compile(r"[“\"]!+[”\"]"),
                    re.compile(r"含.*[“\"]!+[”\"]"),
                    re.compile(r"包含.*[“\"]!+[”\"]"),
                    re.compile(r"!.*提示"),
                    re.compile(r"提示.*!"),
                ],
                formula_patterns=[re.compile(r'FIND\("!"', re.I), re.compile(r'SEARCH\("!"', re.I)],
                note="contains !",
            ),
            Signal(
                key="id_mismatch",
                doc_patterns=[re.compile(r"识别号.*不一致")],
                formula_patterns=[re.compile(r"\$A\d+<>\$F\d+", re.I), re.compile(r"LEN\(\$A\d+\)>0", re.I)],
                note="ID mismatch",
            ),
            Signal(
                key="metal_lookup_invalid",
                doc_patterns=[re.compile(r"组合不在目录")],
                formula_patterns=[re.compile(r"COUNTIF\(\s*MetalSmelter", re.I)],
                note="Metal+Lookup invalid",
            ),
            Signal(
                key="q_no_unknown",
                doc_patterns=[
                    re.compile(r"Q1/Q2.*No/Unknown", re.I),
                    re.compile(r"Not applicable for this declaration", re.I),
                ],
                formula_patterns=[re.compile(r"Declaration!\$P\$38", re.I), re.compile(r"Declaration!\$P\$39", re.I)],
                note="Q1/Q2 No/Unknown triggers",
            ),
        ]
        if template == "EMRT":
            if version != "1.3":
                signals = [s for s in signals if s.key != "q_no_unknown"]
            if version != "2.1":
                signals = [s for s in signals if s.key != "not_yet_identified"]
        if template in {"CMRT", "CRT"}:
            signals = [s for s in signals if s.key not in {"q_no_unknown", "not_yet_identified"}]
        if template == "AMRT":
            if version in {"1.1", "1.2"}:
                signals = [
                    s
                    for s in signals
                    if s.key
                    not in {"not_listed", "not_yet_identified", "enter_smelter_details", "q_no_unknown", "id_mismatch"}
                ]
            else:
                signals = [s for s in signals if s.key not in {"q_no_unknown", "bang", "id_mismatch"}]
        return signals

    if sheet == "Mine List":
        return [
            Signal(
                key="bang",
                doc_patterns=[
                    re.compile(r"[“\"]!+[”\"]"),
                    re.compile(r"含.*[“\"]!+[”\"]"),
                    re.compile(r"包含.*[“\"]!+[”\"]"),
                    re.compile(r"!.*提示"),
                    re.compile(r"提示.*!"),
                ],
                formula_patterns=[re.compile(r'FIND\("!"', re.I), re.compile(r'SEARCH\("!"', re.I)],
                note="contains !",
            ),
            Signal(
                key="name_required",
                doc_patterns=[re.compile(r"从该矿厂采购的冶炼厂的名称.*必填")],
                formula_patterns=[re.compile(r"AND\(\s*B\d+=\"\",\s*\$A\d+<>\"\"\s*\)", re.I)],
                note="smelter name required",
            ),
            Signal(
                key="country_required",
                doc_patterns=[re.compile(r"矿厂所在国家或地区.*必填")],
                formula_patterns=[re.compile(r"AND\(\s*F\d+=\"\",\s*\$A\d+<>\"\"\s*\)", re.I)],
                note="mine country required",
            ),
        ]

    if sheet == "Declaration":
        return [
            Signal(
                key="required_field",
                doc_patterns=[
                    re.compile(r"必填"),
                    re.compile(r"条件必填"),
                    re.compile(r"Required Field", re.I),
                    re.compile(r"Blank Field", re.I),
                    re.compile(r"必答"),
                ],
                formula_patterns=[
                    re.compile(r'=""'),
                    re.compile(r'IF\(\$[A-Z]+\$\d+="",TRUE\)', re.I),
                ],
                note="blank required field highlight",
            ),
            Signal(
                key="yes_requires_comment",
                doc_patterns=[
                    re.compile(r"Yes.*URL", re.I),
                    re.compile(r"Yes.*注释"),
                    re.compile(r"Yes.*说明"),
                    re.compile(r"Yes.*链接"),
                ],
                formula_patterns=[
                    re.compile(
                        r'IF\(AND\(\$D\$?\d+="Yes",\s*\$G\$?\d+=""\)\s*,\s*TRUE\)',
                        re.I,
                    )
                ],
                note="Yes requires comment/URL",
            ),
            Signal(
                key="using_other_format_requires_comment",
                doc_patterns=[
                    re.compile(r"using other format", re.I),
                    re.compile(r"other format", re.I),
                ],
                formula_patterns=[
                    re.compile(r'using other format', re.I),
                ],
                note="Using other format requires comment",
            ),
        ]

    if sheet == "Checker":
        return [
            Signal(
                key="checker_required_flag",
                doc_patterns=[
                    re.compile(r"Checker.*必填", re.I),
                    re.compile(r"F=1"),
                    re.compile(r"F=0（条件）"),
                    re.compile(r"条件必填"),
                ],
                formula_patterns=[
                    re.compile(r"\$F\d+=0", re.I),
                    re.compile(r"IF\(F\d+=0", re.I),
                    re.compile(r"\$H\d+=0", re.I),
                    re.compile(r"\$H\d+=1", re.I),
                    re.compile(r"AND\(\$F\d+=1,\$G\d+=0\)", re.I),
                ],
                note="checker required/conditional flags",
            ),
            Signal(
                key="cfext",
                doc_patterns=[re.compile(r"cfExt|conditional formatting extension|A57", re.I)],
                formula_patterns=[],
                note="cfExt rules in Checker",
                dv_predicate=None,
            ),
        ]

    return []


def detect_signal(
    signal: Signal,
    doc_text: str,
    doc_paths: List[Path],
    formulas: List[str],
    dvs: List[Dict[str, str]],
    cfext_count: int,
) -> Tuple[bool, bool, str, str]:
    doc_has = any(p.search(doc_text) for p in signal.doc_patterns) if signal.doc_patterns else False
    xml_has = False
    xml_evidence = ""

    if signal.key == "cfext":
        xml_has = cfext_count > 0
        xml_evidence = f"ext rules: {cfext_count}" if xml_has else ""
    else:
        if signal.formula_patterns:
            xml_evidence = find_formula_evidence(formulas, signal.formula_patterns)
            xml_has = bool(xml_evidence)
        if not xml_has and signal.dv_predicate is not None:
            xml_has = signal.dv_predicate(dvs)
            xml_evidence = "dv predicate matched" if xml_has else ""

    doc_evidence = find_doc_evidence(doc_paths, signal.doc_patterns) if doc_has else ""
    return doc_has, xml_has, doc_evidence, xml_evidence


def run_review(scan_root: Path, out_diff: Path, out_fix: Path) -> int:
    formulas = load_cf_formulas(scan_root)
    dv_records = load_dv_records(scan_root)
    cfext = load_cfext_summary(scan_root)
    template_versions = load_template_versions()

    diff_lines: List[str] = []
    fix_lines: List[str] = []
    mismatches = 0
    total_checks = 0

    diff_lines.append("# XML 语义复核（全量/全章）")
    diff_lines.append("")
    diff_lines.append(f"- Scan: `{scan_root.name}`")
    diff_lines.append("- 覆盖范围：`docs/diffs/**` + `docs/prd/**` + `docs/diffs/acceptance/**`")
    diff_lines.append("")

    fix_lines.append("# 文档修正清单（XML 语义复核）")
    fix_lines.append("")
    fix_lines.append(f"- Scan: `{scan_root.name}`")
    fix_lines.append("- 覆盖范围：`docs/diffs/**` + `docs/prd/**` + `docs/diffs/acceptance/**`")
    fix_lines.append("")

    for template in sorted(template_versions):
        versions = template_versions[template]
        for version in versions:
            diff_lines.append(f"## {template} {version}")
            diff_lines.append("")
            for sheet in TARGET_SHEETS:
                key = (template, version, sheet)
                sheet_formulas = formulas.get(key, [])
                sheet_dvs = dv_records.get(key, [])
                sheet_cfext = cfext.get(key, 0)
                doc_paths = doc_paths_for(template, version, sheet)
                doc_text = load_docs_text(doc_paths)

                diff_lines.append(f"### {sheet}")
                if not sheet_formulas and not sheet_dvs and sheet_cfext == 0:
                    diff_lines.append("- 无 CF/DV 信号；无法基于模板规则做自动核对，建议人工复核。")
                    diff_lines.append("")
                    continue

                # Declaration date DV
                if sheet == "Declaration":
                    start, end = extract_declaration_date(sheet_dvs)
                    if start:
                        total_checks += 1
                        doc_has = doc_has_date_range(doc_text, start, end)
                        diff_lines.append(
                            f"- 日期 DV：{start} – {end or '> lower bound only'} | Doc: {doc_has}"
                        )
                        if not doc_has:
                            mismatches += 1
                            fix_lines.append(f"## {template} {version} - Declaration")
                            fix_lines.append("")
                            fix_lines.append(
                                f"- 日期 DV 未在文档中出现：{start} – {end or '> lower bound only'}"
                            )
                            fix_lines.append("")

                signals = build_signals(template, version, sheet)
                if not signals:
                    diff_lines.append("- 未定义可比对信号。")
                    diff_lines.append("")
                    continue

                diff_lines.append("| Signal | XML | Doc | XML Evidence | Doc Evidence | Note |")
                diff_lines.append("| --- | --- | --- | --- | --- | --- |")
                for signal in signals:
                    doc_has, xml_has, doc_evidence, xml_evidence = detect_signal(
                        signal, doc_text, doc_paths, sheet_formulas, sheet_dvs, sheet_cfext
                    )
                    total_checks += 1
                    diff_lines.append(
                        f"| {signal.key} | {xml_has} | {doc_has} | {xml_evidence or '-'} | {doc_evidence or '-'} | {signal.note} |"
                    )
                    if xml_has and not doc_has:
                        mismatches += 1
                        fix_lines.append(f"## {template} {version} - {sheet}")
                        fix_lines.append("")
                        fix_lines.append(f"- 缺少口径：{signal.note}")
                        if xml_evidence:
                            fix_lines.append(f"  - XML 证据：`{xml_evidence}`")
                        fix_lines.append("  - 建议：补充对应规则说明（保持原术语与口径）。")
                        fix_lines.append("")
                diff_lines.append("")

    diff_lines.append("## Summary")
    diff_lines.append("")
    diff_lines.append(f"- Total checks: {total_checks}")
    diff_lines.append(f"- Mismatches: {mismatches}")
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
    parser = argparse.ArgumentParser(description="Strict semantic review for docs vs Excel CF/DV signals.")
    parser.add_argument("--scan-root", type=Path, default=None, help="analysis/scan-YYYY-MM-DD directory.")
    parser.add_argument("--out-diff", type=Path, default=None, help="Output detailed diff markdown.")
    parser.add_argument("--out-fix", type=Path, default=None, help="Output fix list markdown.")
    args = parser.parse_args()

    scan_root = args.scan_root or find_latest_scan(ROOT / "analysis")
    out_diff = args.out_diff or (scan_root / "xml-semantic-diff.md")
    out_fix = args.out_fix or (scan_root / "xml-semantic-fixlist.md")
    return run_review(scan_root, out_diff, out_fix)


if __name__ == "__main__":
    raise SystemExit(main())
