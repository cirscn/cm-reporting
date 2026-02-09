---
"cm-reporting": patch
---

修复 `AppThemeScope` 在 Ant Design 5.22.x 下读取 `theme.useToken()` 时对 `cssVar` 的强依赖问题：当 `cssVar` 不存在时回退使用 `token` 值，避免运行时因 `undefined` 解构导致主题变量注入失败。

同时补充 `AppThemeScope` 兼容性测试，覆盖「`cssVar` 缺失回退」与「`cssVar` 存在优先」两条路径。
