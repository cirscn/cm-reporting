---
"cm-reporting": patch
---

修复只读模式下 SmelterList 主数据字段仍可编辑的问题。

- 将冶炼厂主数据列的显式禁用条件统一合并为 `componentDisabled || localDisabled`，避免全局只读被局部逻辑覆盖。
- 覆盖字段包括：`smelterNumber`、`smelterCountry`、`smelterIdentification`、`sourceId`、`smelterStreet`、`smelterCity`、`smelterState`（以及同类显式禁用列）。
- 补充只读回归测试，并同步更新 README/示例文档/集成技能文档说明。
