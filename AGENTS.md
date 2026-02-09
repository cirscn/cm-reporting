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
- 当修改 `app/src/lib` 下对外可感知的集成行为（含 `readOnly` 交互、受控路由、禁用策略）时，除 `app/src/lib/README.md` 外，必须同步更新 `skills/cm-reporting-integration/SKILL.md` 与 `app/src/examples/README.md`（必要时同步对应 scenario 注释/文案），避免技能文档与示例滞后。

## 自动发布流程（Changesets）

- 默认发版路径：`main` 分支触发 `.github/workflows/release.yml`，按 changeset **直发 npm**（不再创建 `Version Packages` PR）；同时支持 `workflow_dispatch` 手动触发。
- 日常功能开发 PR 必须包含 changeset 文件（在 `app` 目录执行 `pnpm changeset` 生成）。
- 所有 changeset 文件中的说明正文必须使用中文编写，避免英文描述。
- 所有 Git commit 提交信息（commit message）必须使用中文编写，避免英文描述。
- 所有 Pull Request 标题必须使用中文编写，避免英文描述。
- 版本号由 Changesets 自动维护，禁止手工修改 `app/package.json` 的 `version`（紧急修复场景除外，且需在 PR 描述说明原因）。
- 发布流程会在 `main` 自动执行 `changeset version`、提交版本变更回 `main`、随后执行 `changeset publish`。
- `release.yml` 使用 npm Trusted Publishing（OIDC）执行发布，npm 侧 Trusted Publisher 必须绑定仓库 `cirscn/cm-reporting`、workflow 文件名 `release.yml`、environment `npm-release`；`NPM_TOKEN` 仅用于可选的 `next` dist-tag 同步（建议在 GitHub Environment `npm-release` 配置 npm automation token，write 权限）。
- 保留 `.github/workflows/publish-npm.yml` 作为应急兜底流程（手动/标签触发），默认不作为主流程。
- 触发发布前仍需满足 `app` 强制校验：`pnpm lint`、`pnpm exec tsc -b --pretty false`、`pnpm test`、`pnpm sg:scan`。

- 开发 PR 若涉及 `app/**` 变更，必须提交 changeset 文件（`app/.changeset/*.md`，`README.md` 除外）；否则 CI 直接失败。
