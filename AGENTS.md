# 约束：/Users/aaron/Project/cm/app 代码修改后的校验

当修改 `/Users/aaron/Project/cm/app` 下的任意代码后，必须执行并通过以下校验；若失败，需修复问题并重新运行直到通过。

## 必须执行

在 `app` 目录下运行：

```bash
pnpm lint
pnpm exec tsc -b --pretty false
pnpm test
pnpm sg:scan
```

## 要求

- 不得跳过校验。
- 出现 ESLint/TS 错误必须修复后再交付。
- 出现 sg 扫描告警必须修复后再交付。
- 必须保留“全版本支持”的逻辑分支与数据结构，不得删减版本覆盖面。
- “全版本支持”指：各模板/各版本的规则与选项必须完整实现；允许版本差异分支，但不得缩减版本覆盖。
- 禁止保留“无意义的兼容/过渡代码”（例如：旧接口的兼容包装、重复适配、无调用的兼容转换、过渡期标记）；需要变更时直接全量改动并删除旧接口。
- PRD 与 Excel 冲突时，以 Excel 为准，需同步更新文档与 `app/src` 实现。
- 当修改 `app/src/lib` 下的**公开 API**（组件 Props/Ref、导出函数/类型、integrations 接口、snapshot 结构、Excel 导出接口、legacy adapter 接口）时，必须同步更新 `app/src/lib/README.md` 中对应章节，确保文档与代码一致。
