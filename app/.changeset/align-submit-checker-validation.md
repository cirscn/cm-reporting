---
"cm-reporting": patch
---

修复提交门控与 Checker 展示不一致的问题，统一 `submit()` / `validate()` 的全量校验语义。

- `submit()` 现在必须同时通过 `zod` 与 `checker` 校验，任一失败都会返回 `null` 并跳转 checker 页面。
- `validate()` 与 `submit()` 共享同一套全量门控，不再仅代表结构校验结果。
- 补充回归测试，覆盖“zod 通过但 checker 不通过时必须拦截提交”的场景。
- 同步更新 `app/src/lib/README.md`、`app/src/examples/README.md` 与 `skills/cm-reporting-integration/SKILL.md` 的行为说明。
