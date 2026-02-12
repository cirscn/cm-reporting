---
name: cm-reporting-integration
description: Integrate and operationalize the `cm-reporting` library in host React applications, including dependency setup, template delivery, component wiring, Snapshot import/export, Excel export, integrations callbacks, and legacy adapter flows. Use when users need to adopt this library, design production integration architecture, implement external pickers, troubleshoot runtime/export issues, or standardize delivery checklists.
---

# CM Reporting Integration

Use this skill to deliver production-grade `cm-reporting` integrations, not only demos.

## Fast Routing

Route requests first, then load the minimum references.

- New host integration from zero → read `references/integration-snippets.md`.
- API/contract clarification → read `references/contracts.md`.
- Template/version/file lookup → read `references/template-matrix.md`.
- Runtime/export/restore failures → read `references/troubleshooting.md`.
- Template file path lookup automation → run `scripts/resolve-template-path.mjs`.

## Non-Negotiable Constraints

Apply these rules in every solution:

- Keep `templateType` and `versionId` strictly matched across render, restore, and export.
- Import `cm-reporting/styles.css` exactly once in host runtime.
- Provide official template `.xlsx` as `ArrayBuffer` when calling Excel export APIs.
- Treat Snapshot as full-state contract (`schemaVersion/templateType/versionId/data`).
- `companyInfo.authorizationDate` 推荐传 `YYYY-MM-DD`；运行时兼容秒/毫秒时间戳（number/数字字符串），并会归一化为 `YYYY-MM-DD`。
- Return integrations callback result in `{ items: [...] } | null | undefined` shape only.
- 对 `SmelterList` 外部回写结果，`id` 与冶炼厂识别号码语义严格分离：`id` 仅用于行主键与去重判定；识别号码应由 `smelterNumber` 回写并仅用于展示（`smelterId` 仅内部兼容）。
- `SmelterList` 新增行应先生成临时 ID（`smelter-new-<timestamp>`）；宿主外部选择回写 `id` 后覆盖该临时 ID，未回写 `id` 时本次回写无效并提示错误。
- `SmelterList` 行内外部选择需保证同一个 `metal` 下冶炼厂唯一，按回写 `id` 判重。
- `SmelterList` 行内外部选择成功后（非 `Smelter not listed / not yet identified`），应锁定基础主数据字段不可编辑：`smelterNumber`、`country`、`smelterIdentification`、`sourceId`、`street`、`city`、`state`。
- `SmelterList` 外部选择入口为“行内模式”：仅保留“新增一行”后在行内触发外部选择，不提供顶部批量“从外部选择”入口。
- Respect package license (`PolyForm-Noncommercial-1.0.0`) in usage recommendations.
- For `readOnly` behavior, treat it as **view-only contract** (not just disabled inputs):
  - hide checker page and checker entry in workflow;
  - hide global required/error hint banner and bottom prev/next actions;
  - hide table/form editing affordances (add/delete/batch/external pick/edit links), not merely `disabled`;
  - when table cells use explicit `disabled` conditions (for example SmelterList base fields), always merge global disabled state as `componentDisabled || localDisabled`;
  - suppress required yellow highlight when fields are disabled/read-only.
- In controlled routing mode, if readOnly flow remaps page (e.g. `checker` fallback), always sync parent state via navigation callback to avoid route/UI drift.
- Never override host-level `ConfigProvider` disabled state with local false. Effective disabled rule must be `parentDisabled || readOnly`.
- For `EMRT/AMRT` checker behavior, keep checker errors and progress summary under the same gating: when smelter requirement is disabled by Q1/Q2, do not count `smelterLookup` required progress from historical rows.
- For `EMRT`, default selection should include all declared minerals on empty initialization; when `readOnly=false`, users can still edit the declaration scope selections.
- 对 `dynamic-dropdown` 范围模板（`EMRT` 2.x / `AMRT` 1.3），当取消某个矿种时，应预期库会自动执行级联清理：清空该矿种的按矿种题目/备注答案，并删除关联的 `Smelter List` / `Mine List` 行数据。
- 当 `other` 保持勾选但某个自定义矿种名称被清空时，库会按槽位清理对应 `other-*` 的按矿种答案与关联列表行。

## Standard Delivery Workflow

Follow this order unless user asks otherwise.

1. Confirm host environment and peer dependency ranges.
2. Choose template delivery strategy (static/CDN/internal service).
3. Implement baseline `CMReporting` mounting with required props.
4. Add host orchestration via `CMReportingRef` (`get/set/export/validate`).
5. Add Snapshot persistence and recovery path.
6. Add Excel export action with tested template fetch path.
7. Add integrations callbacks if host needs external pickers.
8. Add legacy adapter flow only when interoperability is required.
9. Run final acceptance checklist from references before handoff.

## Output Requirements

When producing integration code or guidance, always include:

- Explicit dependency and peer dependency install commands.
- Concrete `templateType` + `versionId` examples.
- Snapshot save + restore behavior definition.
- Excel export data flow (template source → ArrayBuffer → Blob download).
- Failure fallback behavior (cancel flow, null return, retry boundaries).
- Explicit readOnly behavior matrix (what is hidden vs what remains visible).

## Anti-Patterns to Avoid

- Do not generate workbook from scratch for export.
- Do not assume template files exist without mapping verification.
- Do not mix incompatible template/version pairs.
- Do not return raw arrays from integrations callbacks; wrap in `{ items }`.
- Do not advise manual mutation of package internals or private APIs.

## References

Load only what the request needs:

- `references/integration-snippets.md`: full quickstart + production recipes.
- `references/contracts.md`: public API and callback contract tables.
- `references/template-matrix.md`: complete template/version/file mapping.
- `references/troubleshooting.md`: symptom-to-action playbook.

## 宿主外置保存/提交（新增集成约定）

当业务希望在弹窗或页面外层接管流程时，推荐使用以下模式：

- 默认底部仅保留翻页；如需完全由宿主控制，传 `showPageActions={false}` 隐藏底部翻页区。
- 使用 `CMReportingRef.saveDraft()` 执行“暂存”动作：
  - 不触发必填校验；
  - 直接返回 `ReportSnapshotV1` 给宿主落库。
- 使用 `CMReportingRef.submit()` 执行“提交”动作：
  - 先走库内 `validate`（全量门控：`zod + checker`）；
  - 失败返回 `null`，并自动跳转 checker 页面；
  - 成功返回 `ReportSnapshotV1`，由宿主决定后续 API 提交。
- `CMReportingRef.validate()` 与 `submit()` 共享同一套全量门控（`zod + checker`），不应再将其视为“仅结构校验”。
- `useCMReporting()` 提供同等能力（`saveDraft/submit`），适合函数式集成场景。
