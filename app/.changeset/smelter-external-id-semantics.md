---
"cm-reporting": minor
---

修正 SmelterList 行内外部选择的字段语义与回写规则：

- 行 `id` 与冶炼厂识别号码（`smelterId` 列）严格分离：`id` 仅作为行主键，不再兜底映射到 `smelterId`。
- 冶炼厂识别号码改为仅由宿主回写 `smelterNumber` 映射到 `smelterId` 列。
- 同一 `metal` 下重复选择校验改为按回写 `id` 判重。
- 保持行内外部选择成功后的基础字段锁定行为，并同步更新类型导出、README、Examples 与集成技能文档。

宿主接入建议：

- 外部回写时显式传入 `id`（数据主键）与 `smelterNumber`（识别号码），避免沿用旧的 `id -> smelterId` 兜底逻辑。

