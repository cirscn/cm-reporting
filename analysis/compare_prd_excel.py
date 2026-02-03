#!/usr/bin/env python3
"""Compare PRD question text/options vs Excel DV and output mismatch report."""
from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Dict, List, Tuple

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
EXCEL = ROOT / "analysis" / "excel_question_options.json"
OUTPUT = ROOT / "analysis" / "prd_excel_mismatch.md"

TEMPLATE_DOCS = {
    "CMRT": DOCS / "01-cmrt-prd.md",
    "EMRT": DOCS / "02-emrt-prd.md",
    "CRT": DOCS / "03-crt-prd.md",
    "AMRT": DOCS / "04-amrt-prd.md",
}

Q_ROW_RE = re.compile(r"\|\s*\*\*Q(\d+)\*\*\s*\|")
CQ_ROW_RE = re.compile(r"\|\s*\*\*([A-I])\*\*\s*\|")
VERSION_HEADING_RE = re.compile(r"^####\s+.*?(?:EMRT|CMRT|CRT|AMRT)\s+(\d+\.\d+)\b")


def normalize_text(text: str) -> str:
    text = text.replace("_x000D_", " ").replace("\u000d", " ")
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"(?<=[\u4e00-\u9fff])\s+(?=[\u4e00-\u9fff])", "", text)
    text = re.sub(r"\s+([（(《])", r"\1", text)
    return text.strip()


def normalize_question_text(text: str) -> str:
    text = normalize_text(text)
    text = re.sub(r"^\d+\)\s*", "", text)
    text = re.sub(r"^[A-I][\).]\s*", "", text)
    text = text.replace("(*)", "")
    text = re.sub(r"\(\*+\)", "", text)
    text = normalize_text(text)
    return text


def normalize_option(opt: str) -> str:
    opt = normalize_text(opt)
    opt = opt.replace("**", "")
    # map 1(显示为100%) to 1
    if re.search(r"\b1\b", opt) and re.search(r"100%", opt):
        return "1"
    return opt


def split_options(raw: str) -> List[str]:
    raw = raw.replace("<br/>", "/").replace("<br>", "/")
    raw = raw.replace("（", "(").replace("）", ")")
    raw = normalize_text(raw)
    raw = raw.replace("**", "")
    parts = [normalize_option(p) for p in re.split(r"/|\n", raw) if p.strip()]
    return [p for p in parts if p]


def parse_prd_questions(path: Path):
    questions: Dict[str, dict] = {}
    company: Dict[str, dict] = {}
    versioned: Dict[str, Dict[str, Dict[str, dict]]] = {}
    current_version: str | None = None
    current_mode: str | None = None
    for line in path.read_text(encoding="utf-8").splitlines():
        heading = VERSION_HEADING_RE.match(line.strip())
        if heading:
            current_version = heading.group(1)
            if "问题矩阵" in line:
                current_mode = "questions"
            elif "公司问题" in line:
                current_mode = "company"
            else:
                current_mode = None
            versioned.setdefault(current_version, {"questions": {}, "company": {}})
            continue
        if not line.startswith("|"):
            continue
        if "**Q" in line and Q_ROW_RE.search(line):
            cols = [c.strip() for c in line.strip("|").split("|")]
            q_key = re.search(r"\*\*Q(\d+)\*\*", cols[0])
            if not q_key:
                continue
            q = q_key.group(1)
            payload = {
                "text": normalize_question_text(cols[1]) if len(cols) > 1 else "",
                "options": split_options(cols[2]) if len(cols) > 2 else [],
            }
            if current_version and current_mode == "questions":
                versioned[current_version]["questions"][q] = payload
            else:
                questions[q] = payload
        elif "**" in line and CQ_ROW_RE.search(line):
            cols = [c.strip() for c in line.strip("|").split("|")]
            key_match = re.search(r"\*\*([A-I])\*\*", cols[0])
            if not key_match:
                continue
            key = key_match.group(1)
            payload = {
                "text": normalize_question_text(cols[1]) if len(cols) > 1 else "",
                "options": split_options(cols[2]) if len(cols) > 2 else [],
            }
            if current_version and current_mode == "company":
                versioned[current_version]["company"][key] = payload
            else:
                company[key] = payload
    if versioned:
        return versioned
    return questions, company


def compare():
    excel = json.loads(EXCEL.read_text(encoding="utf-8"))
    lines: List[str] = ["# PRD vs Excel Mismatch Report", ""]
    for template, doc_path in TEMPLATE_DOCS.items():
        prd_data = parse_prd_questions(doc_path)
        lines.append(f"## {template}")
        template_data = excel.get(template, {})
        for version, data in template_data.items():
            lines.append(f"### {template} {version}")
            mismatches = 0
            if isinstance(prd_data, tuple):
                prd_q, prd_cq = prd_data
            else:
                prd_version = prd_data.get(version)
                if not prd_version:
                    lines.append("- PRD 未找到该版本问题表")
                    lines.append("")
                    continue
                prd_q = prd_version.get("questions", {})
                prd_cq = prd_version.get("company", {})
            # Questions
            for q in data.get("questions", []):
                qnum = q["number"]
                excel_text = normalize_question_text(q["text"])
                excel_opts = [normalize_option(o) for o in q.get("dv", [])]
                prd = prd_q.get(qnum)
                if not prd:
                    lines.append(f"- Q{qnum}: PRD 未找到该题目")
                    mismatches += 1
                    continue
                if prd["text"] and prd["text"] != excel_text:
                    lines.append(f"- Q{qnum} 文案不一致：PRD='{prd['text']}' | Excel='{excel_text}'")
                    mismatches += 1
                # skip complex PRD option cells containing ':'
                if prd.get("options") and any(":" in opt for opt in prd["options"]):
                    continue
                if excel_opts and prd.get("options"):
                    if sorted(prd["options"]) != sorted(excel_opts):
                        lines.append(
                            f"- Q{qnum} 选项不一致：PRD={prd['options']} | Excel={excel_opts}"
                        )
                        mismatches += 1
            # Company questions
            for cq in data.get("company", []):
                key = cq["key"]
                excel_text = normalize_question_text(cq["text"])
                excel_opts = [normalize_option(o) for o in cq.get("dv", [])]
                prd = prd_cq.get(key)
                if not prd:
                    lines.append(f"- {key} 题：PRD 未找到该题目")
                    mismatches += 1
                    continue
                if prd["text"] and prd["text"] != excel_text:
                    lines.append(f"- {key} 文案不一致：PRD='{prd['text']}' | Excel='{excel_text}'")
                    mismatches += 1
                if excel_opts and prd.get("options"):
                    if sorted(prd["options"]) != sorted(excel_opts):
                        lines.append(
                            f"- {key} 选项不一致：PRD={prd['options']} | Excel={excel_opts}"
                        )
                        mismatches += 1
            if mismatches == 0:
                lines.append("- 无差异")
            lines.append("")
    OUTPUT.write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    compare()
