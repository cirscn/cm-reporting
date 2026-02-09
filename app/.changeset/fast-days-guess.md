---
'cm-reporting': patch
---

修复 `DateField` 在已有值时再次选择日期可能触发的运行时异常。

- 抽离并统一日期值解析逻辑，优先严格解析 `YYYY-MM-DD`，兼容 `DD-MMM-YYYY` 历史展示格式。
- 补齐 `dayjs` 周相关插件能力，确保与 `rc-picker` 运行时能力一致。
- 新增 `DateField` 回归测试，覆盖有效值、兜底解析、无效值与周能力校验。
