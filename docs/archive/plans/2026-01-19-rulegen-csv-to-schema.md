> **内部计划文档（非产品交付）**  
> 本文用于研发/实施计划，不作为产品需求基线；对外请以 `docs/prd/` 与 `docs/diffs/` 为准。

# RuleGen (CSV → RuleDef/Overlay) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Current Stage:** 当前阶段仅深挖 Excel 规则并形成完整需求；RuleGen 实现与提交步骤暂停执行。

**Goal:** 将 `*_rule_catalog_{formulas|dv|cf}.csv` 转换为 SchemaRenderer 可用的 RuleDef/Overlay，并输出未映射规则报告。

**Architecture:**  
Python 生成器读取 CSV → 解析公式/DV/CF → 生成中间规则对象 → 根据 `mapping.json` 映射到 `targetPath`/`fieldKey` → 输出 `rules.json` + `overlays.json` + `unmapped.csv`。

**Tech Stack:** Python 3 stdlib (csv, json, pathlib), Node test runner (现有), JSON output.

---

### Task 1: 规则映射配置与骨架

**Files:**
- Create: `Code/SchemaRenderer/rulegen/mappings/cmrt-6.5.json`
- Create: `Code/SchemaRenderer/rulegen/mappings/emrt-2.1.json`
- Create: `Code/SchemaRenderer/rulegen/mappings/crt-2.21.json`
- Create: `Code/SchemaRenderer/rulegen/README.md`

**Step 1: Write the failing test**

```python
import unittest
from pathlib import Path

class TestMappingSchema(unittest.TestCase):
    def test_mapping_files_exist(self):
        base = Path('Code/SchemaRenderer/rulegen/mappings')
        self.assertTrue((base / 'cmrt-6.5.json').exists())
```

**Step 2: Run test to verify it fails**

Run: `python3 -m unittest Code/SchemaRenderer/rulegen/tests/test_mapping.py`  
Expected: FAIL (file not found)

**Step 3: Write minimal implementation**

```json
{
  "template": "CMRT",
  "version": "6.5",
  "sheetCellMap": {
    "Declaration!B7": "cmtCompany.companyName"
  },
  "tableMap": {
    "Smelter List": "cmtSmelters"
  }
}
```

**Step 4: Run test to verify it passes**

Run: `python3 -m unittest Code/SchemaRenderer/rulegen/tests/test_mapping.py`

**Step 5: Commit**（暂不执行，当前阶段仅规则需求）

```bash
git add Code/SchemaRenderer/rulegen/mappings
git commit -m "feat(rulegen): add mapping skeletons"
```

---

### Task 2: CSV 解析器（formulas/dv/cf）

**Files:**
- Create: `Code/SchemaRenderer/rulegen/parser.py`
- Test: `Code/SchemaRenderer/rulegen/tests/test_parser.py`

**Step 1: Write the failing test**

```python
import unittest
from pathlib import Path
from Code.SchemaRenderer.rulegen.parser import read_csv

class TestParser(unittest.TestCase):
    def test_reads_header(self):
        rows = read_csv('cmrt_rule_catalog_formulas.csv')
        self.assertIn('formula', rows[0])
```

**Step 2: Run test to verify it fails**

Run: `python3 -m unittest Code/SchemaRenderer/rulegen/tests/test_parser.py`  
Expected: FAIL (module not found)

**Step 3: Write minimal implementation**

```python
def read_csv(path):
    ...
```

**Step 4: Run test to verify it passes**

Run: `python3 -m unittest Code/SchemaRenderer/rulegen/tests/test_parser.py`

**Step 5: Commit**（暂不执行，当前阶段仅规则需求）

```bash
git add Code/SchemaRenderer/rulegen/parser.py Code/SchemaRenderer/rulegen/tests/test_parser.py
git commit -m "feat(rulegen): add csv parser"
```

---

### Task 3: Rule 生成与输出

**Files:**
- Create: `Code/SchemaRenderer/rulegen/generate_rules.py`
- Test: `Code/SchemaRenderer/rulegen/tests/test_generate.py`
- Output: `Code/SchemaRenderer/rules/{template}/{version}/rules.json`
- Output: `Code/SchemaRenderer/rules/{template}/{version}/overlays.json`
- Output: `Code/SchemaRenderer/rules/{template}/{version}/unmapped.csv`

**Step 1: Write the failing test**

```python
import unittest
from Code.SchemaRenderer.rulegen.generate_rules import generate

class TestGenerate(unittest.TestCase):
    def test_generates_unmapped_report(self):
        result = generate('CMRT', '6.5', dry_run=True)
        self.assertIn('unmapped', result)
```

**Step 2: Run test to verify it fails**

Run: `python3 -m unittest Code/SchemaRenderer/rulegen/tests/test_generate.py`  
Expected: FAIL

**Step 3: Write minimal implementation**

```python
def generate(template, version, dry_run=False):
    ...
```

**Step 4: Run test to verify it passes**

Run: `python3 -m unittest Code/SchemaRenderer/rulegen/tests/test_generate.py`

**Step 5: Commit**（暂不执行，当前阶段仅规则需求）

```bash
git add Code/SchemaRenderer/rulegen
git commit -m "feat(rulegen): generate rules and unmapped report"
```
