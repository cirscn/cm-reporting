# CM 项目变更汇总（2026-01-30）

## 范围
- 基于 `app/templates` 全量抽取规则（DV/Checker/Instructions/Smelter/Mine）。
- 同步修复 PRD 与原型 HTML，确保与 Excel 逻辑一致。

## 证据与产物
- 规则快照：`analysis/template_rules_report.json`（Declaration DV、Smelter/Mine DV、Checker 公式索引）
- Instructions 关键词抽取：`analysis/instructions_key_lines.json`
- 过程记录：`findings.md`、`progress.md`、`task_plan.md`

## AMRT
- **Minerals Scope 下拉来源修正**：不再随 Declaration 已选矿种联动，改为版本固定 listIndex（与模板一致）。
- **1.1/1.2 默认预填顺序对齐**：按 Declaration D12:I13 的顺序预填。
- **1.1 文案/表头切换**：Minerals Scope 说明与表头改为 PRT（其余版本保持 AMRT）。
- **PRD 补充**：1.3 Smelter List 下拉来源=SN；Mine List 冶炼厂名称下拉=SSLX。
- 相关文件：
  - `docs/assets/prototypes/amrt-interactive.html`
  - `docs/04-amrt-prd.md`

## CRT
- **公司信息标签文案对齐 Excel 原文**（括号/冒号/空格一致）。
- 相关文件：`docs/assets/prototypes/crt-interactive.html`

## EMRT
- 规则全量抽取完成，确认 1.x / 2.x DV 与 Checker 差异点已纳入规则基线（Not applicable/Not declaring、DRC only、Q5 选项差异、Mine List 2.0/2.1 的 SSLX）。
- 当前未新增改动（保持既有对齐）。

## CMRT
- 规则全量抽取完成，确认 6.31+ DV 动态选项与 6.01/6.1/6.22 的差异（Q6 的 1 vs 100% 等）均已记录。
- 当前未新增改动（保持既有对齐）。

## 备注
- 所有模板的 Smelter/Mine List 金属下拉来源与版本差异已在规则快照中固定；若需“值级别严格复刻”（例如显示值为 100% 但实际值为数值 1），请明确是否要按 Excel 内部值改造。
