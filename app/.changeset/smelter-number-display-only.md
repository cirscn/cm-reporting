---
"cm-reporting": minor
---

统一 SmelterList 字段语义为：`id` 作为唯一主键，`smelterNumber` 作为展示字段，`smelterId` 仅内部兼容保留。

- 表格 `hasIdColumn` 列改为展示与编辑 `smelterNumber`，不再展示 `smelterId`。
- 行内外部选择在缺失 `id` 时拒绝回写并提示错误，避免无主键数据进入列表。
- Excel 导出覆盖策略改为基于稳定 `row.id` 判断，A 列写入值改为 `smelterNumber`。
- Snapshot/Schema 与 legacy adapter 同步支持 `smelterNumber`，并弱化 `smelterId` 逻辑依赖。
- 同步更新 README、Examples、集成技能文档与 i18n 文案，确保接入语义一致。

