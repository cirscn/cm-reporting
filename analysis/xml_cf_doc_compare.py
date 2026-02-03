#!/usr/bin/env python3
"""
Compare XML conditional formatting signals against documented rules (heuristic).

Inputs:
- analysis/scan-YYYY-MM-DD/xml-cf-report.jsonl (from xml_cf_report via run_scan)

Outputs:
- analysis/scan-YYYY-MM-DD/xml-cf-doc-compare.md
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Tuple


ROOT = Path(__file__).resolve().parents[1]
SCAN_PREFIX = "scan-"


@dataclass(frozen=True)
class Feature:
    key: str
    doc_patterns: List[re.Pattern]
    formula_patterns: List[re.Pattern]
    note: str


FEATURES_SMELTER = [
    Feature(
        key="not_listed",
        doc_patterns=[re.compile(r"Smelter not listed", re.I)],
        formula_patterns=[re.compile(r"Smelter not listed", re.I)],
        note="Smelter not listed",
    ),
    Feature(
        key="not_yet_identified",
        doc_patterns=[re.compile(r"Smelter not yet identified", re.I)],
        formula_patterns=[re.compile(r"Smelter not yet identified", re.I)],
        note="Smelter not yet identified",
    ),
    Feature(
        key="enter_smelter_details",
        doc_patterns=[re.compile(r"Enter smelter details", re.I)],
        formula_patterns=[re.compile(r"Enter smelter details", re.I)],
        note="Enter smelter details",
    ),
    Feature(
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
    Feature(
        key="id_mismatch",
        doc_patterns=[re.compile(r"识别号.*不一致")],
        formula_patterns=[re.compile(r"\$A\d+<>\$F\d+", re.I), re.compile(r"LEN\(\$A\d+\)>0", re.I)],
        note="ID mismatch",
    ),
    Feature(
        key="metal_lookup_invalid",
        doc_patterns=[re.compile(r"组合不在目录")],
        formula_patterns=[re.compile(r"COUNTIF\(\s*MetalSmelter", re.I)],
        note="Metal+Lookup invalid",
    ),
    Feature(
        key="q_no_unknown",
        doc_patterns=[re.compile(r"Q1/Q2.*No/Unknown", re.I), re.compile(r"Not applicable for this declaration", re.I)],
        formula_patterns=[re.compile(r"Declaration!\$P\$38", re.I), re.compile(r"Declaration!\$P\$39", re.I)],
        note="Q1/Q2 No/Unknown triggers",
    ),
]

FEATURES_MINE = [
    Feature(
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
    Feature(
        key="name_required",
        doc_patterns=[re.compile(r"从该矿厂采购的冶炼厂的名称.*必填")],
        formula_patterns=[re.compile(r"AND\(\s*B\d+=\"\",\s*\$A\d+<>\"\"\s*\)", re.I)],
        note="smelter name required",
    ),
    Feature(
        key="country_required",
        doc_patterns=[re.compile(r"矿厂所在国家或地区.*必填")],
        formula_patterns=[re.compile(r"AND\(\s*F\d+=\"\",\s*\$A\d+<>\"\"\s*\)", re.I)],
        note="mine country required",
    ),
]

FEATURES_DECLARATION = [
    Feature(
        key="required_field",
        doc_patterns=[
            re.compile(r"必填"),
            re.compile(r"条件必填"),
            re.compile(r"Required Field", re.I),
            re.compile(r"Blank Field", re.I),
        ],
        formula_patterns=[
            re.compile(r'=""'),
            re.compile(r'IF\(\$[A-Z]+\$\d+="",TRUE\)', re.I),
        ],
        note="blank required field highlight",
    ),
]

FEATURES_CHECKER = [
    Feature(
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
]

NEGATIVE_DOC_PATTERNS = {
    "bang": [
        re.compile(r"不再包含.*!"),
        re.compile(r"不包含.*!"),
        re.compile(r"不再包含.*含.?“!\"", re.I),
    ],
    "id_mismatch": [
        re.compile(r"不再包含.*识别号不一致"),
        re.compile(r"不包含.*识别号不一致"),
    ],
}


def find_latest_scan(root: Path) -> Path:
    scans = sorted([p for p in root.iterdir() if p.is_dir() and p.name.startswith(SCAN_PREFIX)])
    if not scans:
        raise FileNotFoundError("No scan-YYYY-MM-DD directories found in analysis/.")
    return scans[-1]


def extract_section(text: str, sheet: str) -> str:
    label_map = {
        "Smelter List": "Smelter List",
        "Mine List": "Mine List",
        "Declaration": "Declaration",
        "Checker": "Checker",
    }
    label = label_map.get(sheet, sheet)
    if sheet not in label_map:
        return text
    header_re = re.compile(rf"^##\s+.*{re.escape(label)}.*$", re.M)
    match = header_re.search(text)
    if not match:
        return text
    start = match.start()
    tail = text[match.end() :]
    next_header = re.search(r"^##\s+", tail, re.M)
    end = match.end() + (next_header.start() if next_header else len(tail))
    return text[start:end]


def load_docs_text(paths: Iterable[Path], sheet: str) -> str:
    parts = []
    for path in paths:
        if not path.exists():
            continue
        content = path.read_text(encoding="utf-8")
        parts.append(extract_section(content, sheet))
    return "\n".join(parts)


def doc_paths_for(template: str, version: str, sheet: str) -> List[Path]:
    lower = template.lower()
    accept = ROOT / "docs" / "diffs" / "acceptance" / f"{lower}-{version}.md"
    if accept.exists():
        paths = [accept]
        if template == "AMRT" and version == "1.1":
            paths.append(ROOT / "docs" / "diffs" / "amrt-1.1.md")
        if sheet in {"Declaration", "Checker"}:
            paths.extend(
                [
                    ROOT / "docs" / "diffs" / "cross-template.md",
                    ROOT / "docs" / "diffs" / "checker-matrix.md",
                    ROOT / "docs" / "prd" / "field-dictionary.md",
                    ROOT / "docs" / "prd" / "pm-onepager.md",
                    ROOT / "docs" / "diffs" / f"{lower}.md",
                ]
            )
        return paths
    if sheet in {"Declaration", "Checker"}:
        paths = [
            ROOT / "docs" / "diffs" / "cross-template.md",
            ROOT / "docs" / "diffs" / "checker-matrix.md",
            ROOT / "docs" / "prd" / "field-dictionary.md",
            ROOT / "docs" / "prd" / "pm-onepager.md",
            ROOT / "docs" / "diffs" / f"{lower}.md",
        ]
        return paths
    return [ROOT / "docs" / "diffs" / f"{lower}.md"]


def features_for(template: str, version: str, sheet: str) -> List[Feature]:
    if sheet == "Declaration":
        return FEATURES_DECLARATION

    if sheet == "Checker":
        return FEATURES_CHECKER

    if sheet == "Mine List":
        return FEATURES_MINE

    if template == "EMRT":
        features = FEATURES_SMELTER
        if version != "1.3":
            features = [f for f in features if f.key != "q_no_unknown"]
        if version != "2.1":
            features = [f for f in features if f.key != "not_yet_identified"]
        return features

    if template == "CMRT":
        return [
            f
            for f in FEATURES_SMELTER
            if f.key not in {"q_no_unknown", "not_yet_identified"}
        ]

    if template == "CRT":
        return [
            f
            for f in FEATURES_SMELTER
            if f.key not in {"q_no_unknown", "not_yet_identified"}
        ]

    if template == "AMRT":
        if version in {"1.1", "1.2"}:
            return [f for f in FEATURES_SMELTER if f.key not in {"not_listed", "not_yet_identified", "enter_smelter_details", "q_no_unknown", "id_mismatch"}]
        return [
            f
            for f in FEATURES_SMELTER
            if f.key not in {"q_no_unknown", "bang", "id_mismatch"}
        ]

    return FEATURES_SMELTER


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


def doc_has_cfext(text: str) -> bool:
    return bool(re.search(r"cfExt|conditional formatting extension|A57", text, re.I))


def detect_features(text: str, formulas: List[str], features: List[Feature]) -> List[Tuple[Feature, bool, bool]]:
    formula_blob = "\n".join(formulas)
    results = []
    for feat in features:
        negative = any(p.search(text) for p in NEGATIVE_DOC_PATTERNS.get(feat.key, []))
        doc_has = any(p.search(text) for p in feat.doc_patterns) and not negative
        xml_has = any(p.search(formula_blob) for p in feat.formula_patterns)
        results.append((feat, doc_has, xml_has))
    return results


def format_section(
    template: str,
    version: str,
    sheet: str,
    results: List[Tuple[Feature, bool, bool]],
) -> List[str]:
    lines = []
    mismatches = [(f, d, x) for f, d, x in results if d != x]
    if not mismatches:
        return lines
    lines.append(f"### {template} {version} - {sheet}")
    lines.append("")
    lines.append("| Feature | Doc | XML | Note |")
    lines.append("| --- | --- | --- | --- |")
    for feat, doc_has, xml_has in mismatches:
        lines.append(f"| {feat.key} | {doc_has} | {xml_has} | {feat.note} |")
    lines.append("")
    return lines


def run_compare(scan_root: Path, out_path: Path) -> int:
    formulas = load_cf_formulas(scan_root)
    dv_records = load_dv_records(scan_root)
    sections: List[str] = []
    sections.append("# XML 条件格式 vs 文档对照（启发式）")
    sections.append("")
    sections.append(f"- Scan: `{scan_root.name}`")
    sections.append("- 说明：基于关键字与公式片段匹配；仅用于快速发现缺口，需人工复核。")
    sections.append("")

    # Declaration date DV checks
    date_rows = []
    for (template, version, sheet), dvs in dv_records.items():
        if sheet != "Declaration":
            continue
        start, end = extract_declaration_date(dvs)
        if not start:
            continue
        doc_text = load_docs_text(doc_paths_for(template, version, "Declaration"), "Declaration")
        if not doc_has_date_range(doc_text, start, end):
            date_rows.append((template, version, start, end))
    if date_rows:
        sections.append("## Declaration 日期 DV 口径差异")
        sections.append("")
        sections.append("| Template | Version | Start | End |")
        sections.append("| --- | --- | --- | --- |")
        for template, version, start, end in sorted(date_rows):
            sections.append(f"| {template} | {version} | {start} | {end or '> lower bound only'} |")
        sections.append("")

    # Checker cfExt checks
    cfext_rows = []
    summary_path = scan_root / "xml-cf-report-summary.csv"
    if summary_path.exists():
        with summary_path.open(encoding="utf-8") as f:
            header = f.readline().strip().split(",")
            for line in f:
                values = line.rstrip("\n").split(",")
                row = dict(zip(header, values))
                if row.get("source") != "ext" or row.get("sheet") != "Checker":
                    continue
                template = row.get("template", "")
                version = row.get("version", "")
                doc_text = load_docs_text(doc_paths_for(template, version, "Checker"), "Checker")
                if not doc_has_cfext(doc_text):
                    cfext_rows.append((template, version, row.get("rule_count", "")))
    if cfext_rows:
        sections.append("## Checker cfExt 口径差异")
        sections.append("")
        sections.append("| Template | Version | Ext Rules |")
        sections.append("| --- | --- | --- |")
        for template, version, count in sorted(cfext_rows):
            sections.append(f"| {template} | {version} | {count} |")
        sections.append("")

    for (template, version, sheet), sheet_formulas in sorted(formulas.items()):
        if sheet not in {"Smelter List", "Mine List", "Declaration", "Checker"}:
            continue
        doc_text = load_docs_text(doc_paths_for(template, version, sheet), sheet)
        if not doc_text:
            continue
        results = detect_features(doc_text, sheet_formulas, features_for(template, version, sheet))
        sections.extend(format_section(template, version, sheet, results))

    out_path.write_text("\n".join(sections), encoding="utf-8")
    print(f"Wrote compare report to {out_path}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Compare docs vs XML conditional formats (heuristic).")
    parser.add_argument("--scan-root", type=Path, default=None, help="analysis/scan-YYYY-MM-DD directory.")
    parser.add_argument(
        "--out",
        type=Path,
        default=None,
        help="Output markdown path (default: scan-root/xml-cf-doc-compare.md).",
    )
    args = parser.parse_args()

    scan_root = args.scan_root or find_latest_scan(ROOT / "analysis")
    out_path = args.out or (scan_root / "xml-cf-doc-compare.md")
    return run_compare(scan_root, out_path)


if __name__ == "__main__":
    raise SystemExit(main())
