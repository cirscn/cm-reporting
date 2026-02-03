#!/usr/bin/env python3
"""
Parse conditional formatting rules directly from worksheet XML, including cfExt (x14/cx).

Outputs:
- analysis/xml-cf-report-YYYY-MM-DD.jsonl
- analysis/xml-cf-report-YYYY-MM-DD-summary.csv
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import json
import re
import zipfile
from collections import defaultdict
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
TEMPLATE_ROOT = ROOT / "app" / "templates"
VERSION_RE = re.compile(r"_(\d+(?:\.\d+)*)$")
NS_MAIN = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"


def local_name(tag: str) -> str:
    return tag.split("}", 1)[1] if "}" in tag else tag


def parse_version(path: Path) -> str:
    match = VERSION_RE.search(path.stem)
    return match.group(1) if match else ""


def build_sheet_xml_map(xlsx_path: Path) -> Dict[str, str]:
    ns_main = NS_MAIN
    ns_r = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
    ns_pkg = "http://schemas.openxmlformats.org/package/2006/relationships"
    with zipfile.ZipFile(xlsx_path) as z:
        wb = ET.fromstring(z.read("xl/workbook.xml"))
        rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        rid_map = {
            rel.get("Id"): rel.get("Target")
            for rel in rels.findall(f"{{{ns_pkg}}}Relationship")
        }
        sheet_map: Dict[str, str] = {}
        for sheet in wb.findall(f"{{{ns_main}}}sheets/{{{ns_main}}}sheet"):
            name = sheet.get("name") or ""
            rid = sheet.get(f"{{{ns_r}}}id")
            target = rid_map.get(rid or "")
            if name and target:
                sheet_map[name] = f"xl/{target}"
    return sheet_map


def iter_templates(root: Path) -> Iterable[Tuple[str, Path]]:
    for folder in sorted(root.iterdir()):
        if not folder.is_dir():
            continue
        for path in sorted(folder.glob("*.xlsx")):
            if path.name.startswith("~$"):
                continue
            if not VERSION_RE.search(path.stem):
                continue
            yield folder.name, path


def extract_formula_text(rule: ET.Element) -> List[str]:
    formulas: List[str] = []
    for child in rule:
        if local_name(child.tag) in {"formula", "f"} and child.text:
            formulas.append(child.text.strip())
    return formulas


def extract_color_scale(rule: ET.Element) -> Optional[Dict[str, List[Dict[str, str]]]]:
    for child in rule:
        if local_name(child.tag) != "colorScale":
            continue
        cfvos = []
        colors = []
        for node in child:
            if local_name(node.tag) == "cfvo":
                cfvos.append(
                    {
                        "type": node.get("type", ""),
                        "val": node.get("val", ""),
                        "gte": node.get("gte", ""),
                    }
                )
            elif local_name(node.tag) == "color":
                colors.append({k: v for k, v in node.attrib.items()})
        return {"cfvo": cfvos, "color": colors}
    return None


def extract_data_bar(rule: ET.Element) -> Optional[Dict[str, object]]:
    for child in rule:
        if local_name(child.tag) != "dataBar":
            continue
        data: Dict[str, object] = {
            "minLength": child.get("minLength", ""),
            "maxLength": child.get("maxLength", ""),
            "showValue": child.get("showValue", ""),
        }
        cfvos = []
        colors = []
        for node in child:
            if local_name(node.tag) == "cfvo":
                cfvos.append(
                    {
                        "type": node.get("type", ""),
                        "val": node.get("val", ""),
                        "gte": node.get("gte", ""),
                    }
                )
            elif local_name(node.tag) == "color":
                colors.append({k: v for k, v in node.attrib.items()})
        data["cfvo"] = cfvos
        data["color"] = colors
        return data
    return None


def extract_icon_set(rule: ET.Element) -> Optional[Dict[str, object]]:
    for child in rule:
        if local_name(child.tag) != "iconSet":
            continue
        data: Dict[str, object] = {
            "iconSet": child.get("iconSet", ""),
            "showValue": child.get("showValue", ""),
            "percent": child.get("percent", ""),
            "reverse": child.get("reverse", ""),
        }
        cfvos = []
        for node in child:
            if local_name(node.tag) == "cfvo":
                cfvos.append(
                    {
                        "type": node.get("type", ""),
                        "val": node.get("val", ""),
                        "gte": node.get("gte", ""),
                    }
                )
        data["cfvo"] = cfvos
        return data
    return None


def extract_rule_details(rule: ET.Element) -> Dict[str, object]:
    details: Dict[str, object] = {}
    color_scale = extract_color_scale(rule)
    if color_scale:
        details["color_scale"] = color_scale
    data_bar = extract_data_bar(rule)
    if data_bar:
        details["data_bar"] = data_bar
    icon_set = extract_icon_set(rule)
    if icon_set:
        details["icon_set"] = icon_set
    return details


def iter_cf_rules(
    cf: ET.Element, template: str, version: str, sheet: str, source: str, ext_uri: str = ""
) -> Iterable[Dict[str, object]]:
    sqref = cf.get("sqref", "")
    for idx, rule in enumerate(list(cf)):
        if local_name(rule.tag) != "cfRule":
            continue
        record = {
            "template": template,
            "version": version,
            "sheet": sheet,
            "source": source,
            "ext_uri": ext_uri,
            "sqref": sqref,
            "rule_index": idx,
            "type": rule.get("type", ""),
            "priority": rule.get("priority", ""),
            "dxfId": rule.get("dxfId", ""),
            "operator": rule.get("operator", ""),
            "rule_id": rule.get("id", ""),
            "formulas": extract_formula_text(rule),
        }
        record.update(extract_rule_details(rule))
        yield record


def iter_standard_cf(
    root: ET.Element, template: str, version: str, sheet: str
) -> Iterable[Dict[str, object]]:
    for cf in root.findall(f"{{{NS_MAIN}}}conditionalFormatting"):
        yield from iter_cf_rules(cf, template, version, sheet, source="standard")


def iter_ext_cf(
    root: ET.Element, template: str, version: str, sheet: str
) -> Iterable[Dict[str, object]]:
    extlst = root.find(f"{{{NS_MAIN}}}extLst")
    if extlst is None:
        return []
    records: List[Dict[str, object]] = []
    for ext in extlst:
        ext_uri = ext.get("uri", "")
        for child in list(ext):
            lname = local_name(child.tag)
            if lname == "conditionalFormattings":
                for cf in list(child):
                    if local_name(cf.tag) == "conditionalFormatting":
                        records.extend(
                            iter_cf_rules(cf, template, version, sheet, source="ext", ext_uri=ext_uri)
                        )
            elif lname == "conditionalFormatting":
                records.extend(
                    iter_cf_rules(child, template, version, sheet, source="ext", ext_uri=ext_uri)
                )
    return records


def write_jsonl(path: Path, rows: Iterable[Dict[str, object]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False))
            f.write("\n")


def write_summary(path: Path, counts: Dict[Tuple[str, str, str, str], int]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["template", "version", "sheet", "source", "rule_count"])
        for key in sorted(counts):
            template, version, sheet, source = key
            writer.writerow([template, version, sheet, source, counts[key]])


def run_report(root: Path, out_jsonl: Path, out_summary: Path) -> int:
    all_records: List[Dict[str, object]] = []
    counts: Dict[Tuple[str, str, str, str], int] = defaultdict(int)

    for template, path in iter_templates(root):
        version = parse_version(path)
        with zipfile.ZipFile(path) as z:
            sheet_map = build_sheet_xml_map(path)
            for sheet, xml_path in sheet_map.items():
                root_xml = ET.fromstring(z.read(xml_path))
                standard = list(iter_standard_cf(root_xml, template, version, sheet))
                ext = list(iter_ext_cf(root_xml, template, version, sheet))
                for record in standard + ext:
                    all_records.append(record)
                    key = (template, version, sheet, record["source"])
                    counts[key] += 1

    write_jsonl(out_jsonl, all_records)
    write_summary(out_summary, counts)
    print(f"Wrote {len(all_records)} rules to {out_jsonl}")
    print(f"Wrote summary to {out_summary}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="XML conditional formatting report (incl. cfExt).")
    parser.add_argument("--root", type=Path, default=TEMPLATE_ROOT, help="Template root directory.")
    parser.add_argument(
        "--out",
        type=Path,
        default=None,
        help="Output JSONL path (default: analysis/xml-cf-report-YYYY-MM-DD.jsonl).",
    )
    parser.add_argument(
        "--summary",
        type=Path,
        default=None,
        help="Output CSV summary path (default: analysis/xml-cf-report-YYYY-MM-DD-summary.csv).",
    )
    args = parser.parse_args()

    date_tag = dt.date.today().isoformat()
    out_jsonl = args.out or (ROOT / "analysis" / f"xml-cf-report-{date_tag}.jsonl")
    out_summary = args.summary or (ROOT / "analysis" / f"xml-cf-report-{date_tag}-summary.csv")
    return run_report(args.root, out_jsonl, out_summary)


if __name__ == "__main__":
    raise SystemExit(main())
