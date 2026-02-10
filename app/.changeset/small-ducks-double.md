---
"cm-reporting": minor
---

新增外置保存/提交流程能力并解耦底部内置提交：

- `CMReporting` 与 `CMReportingApp` 新增 `showPageActions`（默认 `true`），支持宿主隐藏底部翻页区。
- 底部 `PageActions` 默认仅保留“上一页/下一页”，移除内置“提交”按钮与提交弹窗。
- `CMReportingRef` / `useCMReporting` 新增：
  - `saveDraft()`：不校验必填，返回当前 `ReportSnapshotV1`；
  - `submit()`：执行内部校验，失败返回 `null` 并自动跳转 `checker`，成功返回 `ReportSnapshotV1`。
- 同步更新 examples 与集成文档，明确“宿主自定义保存/提交”的推荐接入方式。
