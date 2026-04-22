---
"cm-reporting": patch
---

让冶炼厂与矿厂列表表头按各调查类型和版本对应的 RMI Excel 模板对齐，并统一冶炼厂表头的必填标识展示。

- 覆盖 `CMRT / CRT / EMRT / AMRT` 的冶炼厂表头顺序和文案差异。
- 覆盖带 `Mine List` 工作表的 `AMRT` 与 `EMRT 2.x` 矿厂表头文案。
- 隐藏当前 UI 中不需要展示的 `Standard Smelter Name`、`Country Code`、`State / Province Code` 三列。
- 去掉冶炼厂表头里硬写的 `(*)`，改成和其他页面一致的红色必填星号。
- 保持底层 Snapshot 和后端字段不变，只调整前端表头显示。
- 当 `Declaration Scope = Product` 时，强制 `Product List` 至少有一行数据。
- `Product List` 中的 `回复方的产品编号` 始终必填；若模板开启请求方列，则 `请求方的产品编号` 也必填。
- 将产品列表中的请求方文案统一为“请求方的产品编号 / 请求方的产品名称”，但后端字段仍保持 `requesterNumber / requesterName`。
