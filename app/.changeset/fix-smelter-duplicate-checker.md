---
"cm-reporting": patch
---

将导入或 `setFormData()` 写入的重复冶炼厂纳入 checker / `validate()` 校验；判重口径与行内外部选择一致，同一个 `metal` 下按非临时行 `id` 判重，`smelter-new-*` 临时 ID 不参与判重。
