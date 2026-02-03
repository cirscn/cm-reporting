#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Re-scan conflict mineral Excel templates and emit rule catalogs / summaries.

Outputs are written to analysis/scan-YYYY-MM-DD/* and follow the legacy CSV/TSV schema:
- {template}_rule_catalog_{formulas|dv|cf}.csv
- {template}_rules_summary.csv
- {template}_sheet_list.csv
- {template}_sheet_diff_summary.csv
- cross_template_{sheet_presence|metrics_baseline|diff_highlights|diff_report}.csv
- per-sheet TSVs in analysis_{template}_{sheet}/{version}.{formulas|dv|cf}.tsv
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import re
import zipfile
from collections import defaultdict
from pathlib import Path
from typing import Dict, Iterable, List, Tuple
import xml.etree.ElementTree as ET

import openpyxl

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE_ROOT = ROOT / "app" / "templates"
DATE_TAG = dt.date.today().isoformat()
OUT_ROOT = ROOT / "analysis" / f"scan-{DATE_TAG}"
VERSION_RE = re.compile(r"_(\d+(?:\.\d+)*)$")


def sanitize_sheet(name: str) -> str:
    value = name.lower()
    value = re.sub(r"[^a-z0-9]+", "_", value).strip("_")
    return value or "sheet"


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


def contains_cf_extension(xml_bytes: bytes) -> bool:
    if b"extLst" not in xml_bytes:
        return False
    return b"x14:conditionalFormatting" in xml_bytes or b"cx:conditionalFormatting" in xml_bytes


def build_sheet_xml_map(xlsx_path: Path) -> Dict[str, str]:
    sheet_map: Dict[str, str] = {}
    ns_main = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
    ns_r = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
    ns_pkg = "http://schemas.openxmlformats.org/package/2006/relationships"
    with zipfile.ZipFile(xlsx_path) as z:
        wb = ET.fromstring(z.read("xl/workbook.xml"))
        rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        rid_map = {
            rel.get("Id"): rel.get("Target")
            for rel in rels.findall(f"{{{ns_pkg}}}Relationship")
        }
        for sheet in wb.findall(f"{{{ns_main}}}sheets/{{{ns_main}}}sheet"):
            name = sheet.get("name") or ""
            rid = sheet.get(f"{{{ns_r}}}id")
            target = rid_map.get(rid or "")
            if name and target:
                sheet_map[name] = f"xl/{target}"
    return sheet_map


def detect_cf_extensions(xlsx_path: Path) -> List[str]:
    sheets = []
    try:
        sheet_map = build_sheet_xml_map(xlsx_path)
        with zipfile.ZipFile(xlsx_path) as z:
            for sheet_name, xml_path in sheet_map.items():
                xml_bytes = z.read(xml_path)
                if contains_cf_extension(xml_bytes):
                    sheets.append(sheet_name)
    except (KeyError, zipfile.BadZipFile, ET.ParseError):
        return sheets
    return sheets


def iter_formula_cells(ws) -> Dict[str, str]:
    formulas: Dict[str, str] = {}
    for cell in ws._cells.values():
        val = cell.value
        if cell.data_type == "f":
            formula = str(val or "")
        elif isinstance(val, str) and val.startswith("="):
            formula = val[1:]
        else:
            continue
        if formula.startswith("="):
            formula = formula[1:]
        formulas[cell.coordinate] = formula
    return formulas


def iter_data_validations(ws) -> List[Dict[str, str]]:
    items: List[Dict[str, str]] = []
    dvs = getattr(ws, "data_validations", None)
    if not dvs:
        return items
    for dv in dvs.dataValidation:
        items.append(
            {
                "sqref": str(dv.sqref),
                "type": dv.type or "",
                "operator": dv.operator or "",
                "allowBlank": str(int(bool(dv.allow_blank))),
                "showErrorMessage": str(int(bool(dv.showErrorMessage))),
                "showInputMessage": str(int(bool(dv.showInputMessage))),
                "errorTitle": dv.errorTitle or "",
                "error": dv.error or "",
                "promptTitle": dv.promptTitle or "",
                "prompt": dv.prompt or "",
                "formula1": dv.formula1 or "",
                "formula2": dv.formula2 or "",
            }
        )
    return items


def iter_conditional_formats(ws) -> List[Dict[str, str]]:
    items: List[Dict[str, str]] = []
    rules_map = getattr(ws.conditional_formatting, "_cf_rules", {})
    for sqref, rules in rules_map.items():
        for rule in rules:
            formulas = "|".join(rule.formula or [])
            items.append(
                {
                    "sqref": str(sqref),
                    "type": rule.type or "",
                    "operator": getattr(rule, "operator", "") or "",
                    "priority": str(getattr(rule, "priority", "")),
                    "dxfId": str(getattr(rule, "dxfId", "")),
                    "formulas": formulas,
                }
            )
    return items


def write_tsv(path: Path, rows: Iterable[Iterable[str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as f:
        for row in rows:
            f.write("\t".join(map(str, row)))
            f.write("\n")


def write_csv(path: Path, header: List[str], rows: Iterable[Iterable[str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(rows)


def load_templates() -> Dict[str, List[Tuple[str, Path]]]:
    templates: Dict[str, List[Tuple[str, Path]]] = {}
    for folder in TEMPLATE_ROOT.iterdir():
        if not folder.is_dir():
            continue
        files = sorted(p for p in folder.glob("*.xlsx") if is_versioned_xlsx(p))
        versions = []
        for file in files:
            ver_str, ver_key = parse_version(file)
            versions.append((ver_str, ver_key, file))
        versions.sort(key=lambda x: x[1])
        templates[folder.name] = [(ver_str, file) for ver_str, _, file in versions]
    return templates


def build_diff_summary(
    baseline_formulas: Dict[str, Dict[str, str]],
    baseline_dv: Dict[str, List[Dict[str, str]]],
    baseline_cf: Dict[str, List[Dict[str, str]]],
    current_formulas: Dict[str, Dict[str, str]],
    current_dv: Dict[str, List[Dict[str, str]]],
    current_cf: Dict[str, List[Dict[str, str]]],
) -> Dict[str, Dict[str, int]]:
    summary: Dict[str, Dict[str, int]] = {}
    sheets = set(baseline_formulas.keys()) | set(current_formulas.keys())
    for sheet in sheets:
        base_cells = baseline_formulas.get(sheet, {})
        curr_cells = current_formulas.get(sheet, {})

        base_keys = set(base_cells.keys())
        curr_keys = set(curr_cells.keys())

        formula_added = len(curr_keys - base_keys)
        formula_removed = len(base_keys - curr_keys)

        changed = 0
        for cell in base_keys & curr_keys:
            if base_cells[cell] != curr_cells[cell]:
                changed += 1

        base_dv_set = {
            (
                dv["sqref"],
                dv["type"],
                dv["operator"],
                dv["formula1"],
                dv["formula2"],
            )
            for dv in baseline_dv.get(sheet, [])
        }
        curr_dv_set = {
            (
                dv["sqref"],
                dv["type"],
                dv["operator"],
                dv["formula1"],
                dv["formula2"],
            )
            for dv in current_dv.get(sheet, [])
        }
        dv_added = len(curr_dv_set - base_dv_set)
        dv_removed = len(base_dv_set - curr_dv_set)

        base_cf_set = {
            (cf["sqref"], cf["type"], cf["operator"], cf["formulas"])
            for cf in baseline_cf.get(sheet, [])
        }
        curr_cf_set = {
            (cf["sqref"], cf["type"], cf["operator"], cf["formulas"])
            for cf in current_cf.get(sheet, [])
        }
        cf_added = len(curr_cf_set - base_cf_set)
        cf_removed = len(base_cf_set - curr_cf_set)

        summary[sheet] = {
            "formula_added": formula_added,
            "formula_removed": formula_removed,
            "formula_changed": changed,
            "dv_added": dv_added,
            "dv_removed": dv_removed,
            "cf_added": cf_added,
            "cf_removed": cf_removed,
        }
    return summary


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Scan Excel templates and emit rule catalogs.")
    parser.add_argument(
        "--skip-xml-cf",
        action="store_true",
        help="Skip XML conditional formatting report (cfExt-aware).",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    OUT_ROOT.mkdir(parents=True, exist_ok=True)
    templates = load_templates()

    baseline_versions: Dict[str, str] = {}
    baseline_metrics: Dict[str, Dict[str, Dict[str, int]]] = {}
    baseline_states: Dict[str, Dict[str, str]] = {}

    for template, version_files in templates.items():
        if not version_files:
            continue
        baseline_version = version_files[-1][0]
        baseline_versions[template] = baseline_version

        # storage per version
        formulas_by_version: Dict[str, Dict[str, Dict[str, str]]] = {}
        dv_by_version: Dict[str, Dict[str, List[Dict[str, str]]]] = {}
        cf_by_version: Dict[str, Dict[str, List[Dict[str, str]]]] = {}
        sheet_states: Dict[str, Dict[str, str]] = {}

        # rule catalogs
        dv_catalog_rows = []
        cf_catalog_rows = []
        formula_catalog_rows = []

        # rules summary counts
        summary_counts = defaultdict(lambda: defaultdict(dict))

        cf_extension_rows = []
        for version, file_path in version_files:
            wb = openpyxl.load_workbook(file_path, data_only=False, read_only=False)
            for sheet_name in detect_cf_extensions(file_path):
                cf_extension_rows.append(
                    [template, version, sheet_name, "cf_extension_detected"]
                )
            formulas_by_sheet: Dict[str, Dict[str, str]] = {}
            dv_by_sheet: Dict[str, List[Dict[str, str]]] = {}
            cf_by_sheet: Dict[str, List[Dict[str, str]]] = {}
            sheet_states_version: Dict[str, str] = {}

            for ws in wb.worksheets:
                sheet_name = ws.title
                sheet_states_version[sheet_name] = ws.sheet_state

                formulas = iter_formula_cells(ws)
                dvs = iter_data_validations(ws)
                cfs = iter_conditional_formats(ws)

                formulas_by_sheet[sheet_name] = formulas
                dv_by_sheet[sheet_name] = dvs
                cf_by_sheet[sheet_name] = cfs

                # per-sheet TSV
                dir_name = f"analysis_{template.lower()}_{sanitize_sheet(sheet_name)}"
                sheet_dir = OUT_ROOT / dir_name
                write_tsv(
                    sheet_dir / f"{version}.formulas.tsv",
                    [[cell, formula] for cell, formula in formulas.items()],
                )
                write_tsv(
                    sheet_dir / f"{version}.dv.tsv",
                    [
                        [
                            dv["type"],
                            dv["operator"],
                            dv["allowBlank"],
                            dv["showErrorMessage"],
                            dv["showInputMessage"],
                            dv["errorTitle"],
                            dv["error"],
                            dv["promptTitle"],
                            dv["prompt"],
                            dv["formula1"],
                            dv["formula2"],
                            dv["sqref"],
                        ]
                        for dv in dvs
                    ],
                )
                write_tsv(
                    sheet_dir / f"{version}.cf.tsv",
                    [
                        [
                            cf["sqref"],
                            cf["type"],
                            cf["operator"],
                            cf["dxfId"],
                            cf["formulas"],
                        ]
                        for cf in cfs
                    ],
                )

                # catalog rows
                formula_catalog_rows.extend(
                    [[version, sheet_name, cell, formula] for cell, formula in formulas.items()]
                )
                dv_catalog_rows.extend(
                    [
                        [
                            version,
                            sheet_name,
                            dv["sqref"],
                            dv["type"],
                            dv["operator"],
                            dv["allowBlank"],
                            dv["showErrorMessage"],
                            dv["showInputMessage"],
                            dv["errorTitle"],
                            dv["error"],
                            dv["promptTitle"],
                            dv["prompt"],
                            dv["formula1"],
                            dv["formula2"],
                        ]
                        for dv in dvs
                    ]
                )
                cf_catalog_rows.extend(
                    [
                        [
                            version,
                            sheet_name,
                            cf["sqref"],
                            cf["type"],
                            cf["operator"],
                            cf["priority"],
                            cf["dxfId"],
                            cf["formulas"],
                        ]
                        for cf in cfs
                    ]
                )

                # rules summary counts
                summary_counts[sheet_name]["formulaCells"][version] = len(formulas)
                summary_counts[sheet_name]["formulaDefs"][version] = len(
                    set(formulas.values())
                )
                summary_counts[sheet_name]["dataValidations"][version] = len(dvs)
                summary_counts[sheet_name]["conditionalFormats"][version] = len(cfs)

            formulas_by_version[version] = formulas_by_sheet
            dv_by_version[version] = dv_by_sheet
            cf_by_version[version] = cf_by_sheet
            sheet_states[version] = sheet_states_version

        # write catalogs
        write_csv(
            OUT_ROOT / f"{template.lower()}_rule_catalog_formulas.csv",
            ["version", "sheet", "cell", "formula"],
            formula_catalog_rows,
        )
        write_csv(
            OUT_ROOT / f"{template.lower()}_rule_catalog_dv.csv",
            [
                "version",
                "sheet",
                "sqref",
                "type",
                "operator",
                "allowBlank",
                "showErrorMessage",
                "showInputMessage",
                "errorTitle",
                "error",
                "promptTitle",
                "prompt",
                "formula1",
                "formula2",
            ],
            dv_catalog_rows,
        )
        write_csv(
            OUT_ROOT / f"{template.lower()}_rule_catalog_cf.csv",
            ["version", "sheet", "sqref", "type", "operator", "priority", "dxfId", "formulas"],
            cf_catalog_rows,
        )
        if cf_extension_rows:
            write_csv(
                OUT_ROOT / f"{template.lower()}_cf_extension_warnings.csv",
                ["template", "version", "sheet", "note"],
                cf_extension_rows,
            )

        # sheet list (baseline)
        baseline_state = sheet_states.get(baseline_version, {})
        sheet_list_rows = [[sheet, baseline_state.get(sheet, "")] for sheet in baseline_state]
        write_csv(
            OUT_ROOT / f"{template.lower()}_sheet_list.csv",
            ["sheet", f"state_{baseline_version}"],
            sheet_list_rows,
        )

        # rules summary
        versions = [v for v, _ in version_files]
        summary_rows = []
        for sheet, metrics in summary_counts.items():
            for metric, counts in metrics.items():
                row = [sheet, metric] + [str(counts.get(v, 0)) for v in versions]
                summary_rows.append(row)
        write_csv(
            OUT_ROOT / f"{template.lower()}_rules_summary.csv",
            ["sheet", "metric"] + versions,
            summary_rows,
        )

        # diff summary vs baseline
        baseline_formulas = formulas_by_version.get(baseline_version, {})
        baseline_dv = dv_by_version.get(baseline_version, {})
        baseline_cf = cf_by_version.get(baseline_version, {})
        diff_rows = []
        for version, _ in version_files:
            diff = build_diff_summary(
                baseline_formulas,
                baseline_dv,
                baseline_cf,
                formulas_by_version.get(version, {}),
                dv_by_version.get(version, {}),
                cf_by_version.get(version, {}),
            )
            for sheet, counts in diff.items():
                diff_rows.append(
                    [
                        sheet,
                        version,
                        baseline_version,
                        counts["formula_added"],
                        counts["formula_removed"],
                        counts["formula_changed"],
                        counts["dv_added"],
                        counts["dv_removed"],
                        counts["cf_added"],
                        counts["cf_removed"],
                    ]
                )
        write_csv(
            OUT_ROOT / f"{template.lower()}_sheet_diff_summary.csv",
            [
                "sheet",
                "version",
                "baseline",
                "formula_added",
                "formula_removed",
                "formula_changed",
                "dv_added",
                "dv_removed",
                "cf_added",
                "cf_removed",
            ],
            diff_rows,
        )

        # capture baseline metrics for cross-template outputs
        baseline_metrics[template] = {
            sheet: {
                "formulaCells": summary_counts[sheet]["formulaCells"].get(baseline_version, 0),
                "formulaDefs": summary_counts[sheet]["formulaDefs"].get(baseline_version, 0),
                "dataValidations": summary_counts[sheet]["dataValidations"].get(baseline_version, 0),
                "conditionalFormats": summary_counts[sheet]["conditionalFormats"].get(
                    baseline_version, 0
                ),
            }
            for sheet in summary_counts
        }
        baseline_states[template] = sheet_states.get(baseline_version, {})

    # cross-template outputs
    templates_sorted = sorted(baseline_versions.keys())
    sheets_all = set()
    for sheet_map in baseline_states.values():
        sheets_all.update(sheet_map.keys())

    # sheet presence
    presence_rows = []
    for sheet in sorted(sheets_all):
        row = [sheet] + [baseline_states.get(t, {}).get(sheet, "") for t in templates_sorted]
        presence_rows.append(row)
    write_csv(
        OUT_ROOT / "cross_template_sheet_presence.csv",
        ["sheet"] + [f"{t.lower()}_state" for t in templates_sorted],
        presence_rows,
    )

    # metrics baseline
    metric_rows = []
    for sheet in sorted(sheets_all):
        for metric in ["formulaCells", "formulaDefs", "dataValidations", "conditionalFormats"]:
            row = [sheet, metric]
            for t in templates_sorted:
                row.append(str(baseline_metrics.get(t, {}).get(sheet, {}).get(metric, 0)))
            metric_rows.append(row)
    write_csv(
        OUT_ROOT / "cross_template_metrics_baseline.csv",
        ["sheet", "metric"] + [f"{t.lower()}_{baseline_versions[t]}" for t in templates_sorted],
        metric_rows,
    )

    # diff highlights (baseline metrics only)
    highlight_rows = []
    for sheet in sorted(sheets_all):
        for metric in ["formulaDefs", "dataValidations", "conditionalFormats"]:
            row = [sheet, metric] + [
                str(baseline_metrics.get(t, {}).get(sheet, {}).get(metric, 0))
                for t in templates_sorted
            ]
            highlight_rows.append(row)
    write_csv(
        OUT_ROOT / "cross_template_diff_highlights.csv",
        ["sheet", "metric"] + [t.lower() for t in templates_sorted],
        highlight_rows,
    )

    # diff report (includes sheet state + metrics)
    report_rows = []
    for sheet in sorted(sheets_all):
        row = [sheet]
        row += [baseline_states.get(t, {}).get(sheet, "") for t in templates_sorted]
        for metric in ["formulaDefs", "dataValidations", "conditionalFormats"]:
            row += [
                str(baseline_metrics.get(t, {}).get(sheet, {}).get(metric, 0))
                for t in templates_sorted
            ]
        row.append("")
        report_rows.append(row)
    write_csv(
        OUT_ROOT / "cross_template_diff_report.csv",
        ["sheet"]
        + [f"{t.lower()}_state" for t in templates_sorted]
        + [f"{t.lower()}_formulaDefs" for t in templates_sorted]
        + [f"{t.lower()}_dataValidations" for t in templates_sorted]
        + [f"{t.lower()}_conditionalFormats" for t in templates_sorted]
        + ["notes"],
        report_rows,
    )

    if not args.skip_xml_cf:
        try:
            import xml_cf_report
        except ImportError as exc:
            raise SystemExit(f"Missing xml_cf_report: {exc}") from exc
        xml_cf_report.run_report(
            TEMPLATE_ROOT,
            OUT_ROOT / "xml-cf-report.jsonl",
            OUT_ROOT / "xml-cf-report-summary.csv",
        )
        try:
            import xml_cf_doc_compare
        except ImportError as exc:
            raise SystemExit(f"Missing xml_cf_doc_compare: {exc}") from exc
        xml_cf_doc_compare.run_compare(
            OUT_ROOT,
            OUT_ROOT / "xml-cf-doc-compare.md",
        )
        try:
            import xml_cf_range_diff
        except ImportError as exc:
            raise SystemExit(f"Missing xml_cf_range_diff: {exc}") from exc
        xml_cf_range_diff.run_diff(
            OUT_ROOT,
            OUT_ROOT / "xml-cf-range-diff.md",
        )


if __name__ == "__main__":
    main()
