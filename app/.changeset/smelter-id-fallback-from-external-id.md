---
"cm-reporting": patch
---

完善 SmelterList 外部回写的 ID 映射行为：

- 当宿主回写项提供 `smelterId` 时，继续优先使用 `smelterId`。
- 当 `smelterId` 为空但存在 `id` 时，自动将 `id` 赋值到 `smelterId`。
- 该规则同时覆盖批量外部选择与行内外部选择，并确保在 `saveDraft()/submit()` Snapshot 中回传 `smelterId`。
- 补充对应单元测试与文档说明。

