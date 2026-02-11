---
"cm-reporting": patch
---

完善 SmelterList 行内外部选择行为，提升宿主回写一致性：

- 新增冶炼厂行时，行 ID 使用临时格式 `smelter-new-<timestamp>`。
- 宿主在 `onPickSmelterForRow` 回写 `id` 后，覆盖临时行 ID。
- 同一 `metal` 下禁止重复选择同一冶炼厂（优先按 `smelterId` 判重，缺失时按回写 `id` 判重）。
- 新增重复选择提示文案，并同步更新对外 README / Examples / 技能文档说明。

