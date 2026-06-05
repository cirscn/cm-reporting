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
- Prefer importing `cm-reporting/styles.scoped.css` exactly once; `CMReporting` creates its own `.cm-reporting-scope` root and popup container internally. Keep `cm-reporting/styles.css` only for legacy hosts that accept global CSS effects.
- Provide official template `.xlsx` as `ArrayBuffer` when calling Excel export APIs.
- Treat Snapshot as full-state contract (`schemaVersion/templateType/versionId/data`).
- Before calling `cirsGpmLegacyAdapter.toInternal(...)`, normalize only the known legacy nullable-array fields from `null` to `[]`: `cmtRangeQuestions`, `cmtCompanyQuestions`, `cmtSmelters`, `cmtParts`, `minList`, `amrtReasonList`.
- Do not silently coerce unrelated wrong types in legacy payloads; keep non-contract violations visible.
- `companyInfo.authorizationDate` 推荐传 `YYYY-MM-DD`；运行时兼容秒/毫秒时间戳（number/数字字符串），并会归一化为 `YYYY-MM-DD`。
- Return integrations callback result in `{ items: [...] } | null | undefined` shape only.
- 对 `SmelterList` 外部回写结果，`id` 与冶炼厂识别号码语义严格分离：`id` 仅用于行主键与去重判定；识别号码应由 `smelterNumber` 回写并仅用于展示（`smelterId` 仅内部兼容）。
- `SmelterList` 新增行应先生成临时 ID（`smelter-new-<timestamp>`）；宿主外部选择回写 `id` 后覆盖该临时 ID，未回写 `id` 时本次回写无效并提示错误。
- `SmelterList` 行内外部选择需保证同一个 `metal` 下冶炼厂唯一，按回写 `id` 判重。
- `SmelterList` 行内外部选择成功后（非 `Smelter not listed / not yet identified`），应锁定基础主数据字段不可编辑：`smelterNumber`、`country`、`smelterIdentification`、`sourceId`、`street`、`city`、`state`。
- `SmelterList` 锁定后的空字段不得显示 placeholder，避免把 `Source ID`、`街道`、`城市` 等占位提示误看成真实数据；有真实值的只读文本应单行省略，鼠标悬浮显示全文。
- 宿主外部回写若只提供 `smelterName`、未提供 `smelterLookup`，库会自动把 `smelterName` 作为 `smelterLookup` 显示与校验来源；宿主如有独立查找值，仍优先回写 `smelterLookup`。
- `SmelterList` 外部回写里 `smelterNumber` 对应 CID，UI 的“冶炼厂识别”列也显示该 CID；`sourceId` 对应 RMI 来源识别号。若宿主暂时把 RMI 来源写在 `smelterIdentification` 且未提供 `sourceId`，库会归一化到 `sourceId`。
- 如需支持“输入 CID 自动回填”，宿主应实现 `onLookupSmelterByNumber(ctx)`，用 `ctx.smelterNumber` 查询真实冶炼厂主数据，并按 `{ items: [SmelterExternalPickItem] }` 返回结果；唯一结果只有在其 `metal` 属于当前申报范围时才会自动回填，不在范围内时库会提示且不写入。
- `onLookupSmelterByNumber(ctx)` 返回多条时，推荐实现 `onPickSmelterForNumberLookup(ctx)`，用现有冶炼厂选择弹窗展示 `ctx.candidates`；默认搜索字段为 `ctx.searchField === 'smelterNumber'`，默认搜索值为 `ctx.searchValue`（用户输入的 CID），用户勾选确认后返回 `{ items: [picked] }`。
- `SmelterList` 外部回写的 `metal` 可以是内部 key（如 `cobalt`）或当前下拉显示名（如 `钴`），库会归一化到下拉 key；归一化失败或该金属不在当前可选范围时，不要伪造其它 metal 绕过申报范围。
- `SmelterList` 外部选择入口为“行内模式”：仅保留“新增一行”后在行内触发外部选择，不提供顶部批量“从外部选择”入口。
- `Smelter List` 表头必须按当前 `templateType + versionId` 对齐到对应 RMI Excel 模板，不能把所有调查类型强行共用一套表头。
- `CMRT / CRT / EMRT / AMRT` 都要保留版本差异支持；只能调整 UI 列标题、顺序和显隐，不能借机改动 Snapshot / 后端字段语义。
- 以下 3 个辅助列当前不在 UI 冶炼厂表格中展示：`Standard Smelter Name`、`Country Code`、`State / Province Code`。
- `Mine List` 只对模板本身包含该工作表的版本生效：`AMRT` 全版本与 `EMRT` 2.x；`CMRT / CRT / EMRT 1.x` 不应伪造矿厂页。
- `Mine List` 表头也必须对齐对应 RMI Excel 模板；当前 UI 不展示模板中的辅助列 `Country Code`、`State / Province Code`。
- 矿厂表头文案变化不能改变数据契约，仍应回写到既有字段：例如矿厂识别走 `mineId`，矿厂识别来源走 `mineIdSource`。
- `EMRT / AMRT` 的 `Mine List` 行只要选择了 `metal`，`smelterName`、`mineName`、`mineCountry` 就必须参与 checker、进度和 schema 校验；`mineCountry` 是自由文本输入，不是国家/地区下拉。
- Respect package license (`PolyForm-Noncommercial-1.0.0`) in usage recommendations.
- For `readOnly` behavior, treat it as **view-only contract** (not just disabled inputs):
  - hide checker page and checker entry in workflow;
  - hide global required/error hint banner and bottom prev/next actions;
  - keep form fields disabled, hide placeholder text for empty disabled controls, but keep actual values visible with `#f5f5f5` background, transparent borders, and normal label-color content text;
  - render overflowing read-only text with ellipsis and expose the full value on hover;
  - hide table/form editing affordances (add/delete/batch/external pick/edit links), not merely `disabled`;
  - when table cells use explicit `disabled` conditions (for example SmelterList base fields), always merge global disabled state as `componentDisabled || localDisabled`;
  - suppress required yellow highlight when fields are disabled/read-only.
- In controlled routing mode, if readOnly flow remaps page (e.g. `checker` fallback), always sync parent state via navigation callback to avoid route/UI drift.
- Never override host-level `ConfigProvider` disabled state with local false. Effective disabled rule must be `parentDisabled || readOnly`.
- Treat the workflow step nav as a sticky header: keep `Declaration / Smelter List / Mine List / Product List / Checker` visible while the middle content area scrolls.
- If host app renders `cm-reporting` inside a modal, drawer, split pane, or custom shell, ensure the container has a calculable height so the library can keep scroll inside the content area instead of the whole page.
- For all templates, keep `Smelter List` rows under the same Q1/Q2 gating as the current template: when a metal no longer requires smelter disclosure, rows for that metal are automatically removed from `smelterList`.
- For any template version with `smelterLookup` dropdown support, once a `Smelter List` row has a selected `metal`, treat `smelterLookup` as checker-required; missing lookup must stay visible as an unfinished item instead of silently passing.
- For `EMRT`, default selection should include all declared minerals on empty initialization; when `readOnly=false`, users can still edit the declaration scope selections.
- For `Product List`, when `Declaration Scope = Product` (`scopeType === 'B'`), the list itself is required; `productNumber` is always required, and `requesterNumber` becomes required only for versions with `hasRequesterColumns=true` (for example `CMRT 6.6`, `EMRT 2.11`, and `AMRT 1.3 / 1.31`).
- Treat “请求方的产品编号 / 请求方的产品名称” as UI labels only; integration payload fields remain `requesterNumber / requesterName`.
- 对 `dynamic-dropdown` 范围模板（`EMRT` 2.x / `AMRT` 1.3+），当取消某个矿种时，应预期库会自动执行级联清理：清空该矿种的按矿种题目/备注答案，并删除关联的 `Smelter List` / `Mine List` 行数据。
- 当 `other` 保持勾选但某个自定义矿种名称被清空时，库会按槽位清理对应 `other-*` 的按矿种答案与关联列表行。

## AMRT 1.31 Notes

- Use `templateType="amrt"` with `versionId="1.31"` for the latest AMRT template file `RMI_AMRT_1.31.xlsx`.
- `AMRT 1.31` adds `Cadmium`, `Lead`, `Molybdenum`, `Rhenium`, `Selenium`, and `Tellurium` compared with `AMRT 1.3`.
- Treat those six entries as first-class minerals in Snapshot data, not as `Other` custom minerals.
- Excel export writes these minerals through Declaration, `Smelter List`, `Mine List`, and `Minerals Scope` using the original template patch flow.

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
