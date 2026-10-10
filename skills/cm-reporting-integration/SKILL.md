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
- Prefer importing `cm-reporting/styles.scoped.css` exactly once; `CMReporting` creates its own `.cm-reporting-scope` root and popup container internally. Both `cm-reporting/styles.scoped.css` and `cm-reporting/styles.css` exclude Tailwind preflight/reset. Keep `cm-reporting/styles.css` only for legacy hosts that accept global selector effects.
- Do not add host-side theme patches for normal integration: `CMReporting` inherits the host Ant Design `ConfigProvider` theme by default. Pass `theme={defaultAntdTheme}` or `mergeThemeConfig(...)` only when the host explicitly wants the library theme instead of the system theme.
- Provide official template `.xlsx` as `ArrayBuffer` when calling Excel export APIs.
- Treat Snapshot as full-state contract (`schemaVersion/templateType/versionId/data`).
- `CMRT / EMRT / AMRT` 的企业地址均为选填；`AMRT` 全部已支持版本的地址留空不触发必填错误，表单不显示必填标记，宿主无需额外添加地址必填校验。
- Before calling `cirsGpmLegacyAdapter.toInternal(...)`, normalize only the known legacy nullable-array fields from `null` to `[]`: `cmtRangeQuestions`, `cmtCompanyQuestions`, `cmtSmelters`, `cmtParts`, `minList`, `amrtReasonList`.
- Do not silently coerce unrelated wrong types in legacy payloads; keep non-contract violations visible.
- `companyInfo.authorizationDate` 推荐传 `YYYY-MM-DD`；运行时兼容秒/毫秒时间戳（number/数字字符串），并会按北京时间日历日归一化为 `YYYY-MM-DD`，例如 `1749657600000` 会得到 `2025-06-12`。
- Legacy `cmtCompany.effectiveDate` 为空字符串、空白字符串、`0` 或 `'0'` 时表示未填写；`toInternal()` 会导入为空的 `companyInfo.authorizationDate`，不要在宿主侧补成 1970。
- Return integrations callback result in `{ items: [...] } | null | undefined` shape only.
- 对 `SmelterList` 外部回写结果，`id` 与冶炼厂识别号码语义严格分离：`id` 用于行主键、去重判定和矿场 `MineRow.smelterId` 关联；识别号码应由 `smelterNumber` 回写并仅用于展示（`SmelterRow.smelterId` 仅内部兼容）。
- `SmelterList` 新增行应先生成临时 ID（`smelter-new-<timestamp>`）；宿主外部选择回写 `id` 后覆盖该临时 ID，未回写 `id` 时本次回写无效并提示错误。
- `SmelterList` 行内外部选择需保证同一个 `metal` 下冶炼厂唯一，按回写 `id` 判重。
- 导入或 `setFormData()` 写入的 `SmelterList` 历史数据也会在 checker / `validate()` 中按同一口径判重：同一个 `metal` 下重复的非临时 `id` 会报错，`smelter-new-*` 临时 ID 不参与判重。
- `SmelterList` 行内外部选择成功后（包括宿主回写正式 `id` 的自定义 `Smelter not listed`，不包括手动新增的临时 `Smelter not listed` 与 `Smelter not yet identified`），应锁定基础主数据字段不可编辑：`smelterNumber`、`country`、`smelterIdentification`、`sourceId`、`street`、`city`、`state`。
- `SmelterList` 中 `smelterLookup` 为 `Smelter not listed`（兼容大小写变体）的自定义冶炼厂由库内置整行文字标红，编辑态、只读态和外部选择锁定态保持一致；宿主 `rowClassName` 只追加额外 className，不应替代该表现。
- 内置标红覆盖 Ant Design 5/6 的 AutoComplete 实际输入文字，包含只读“冶炼厂查找”列；宿主无需额外补写此控件的标红样式。
- `SmelterList` 锁定后的空字段不得显示 placeholder，问题矩阵被门控禁用的空回答/备注也不得显示 placeholder，避免把 `Source ID`、`街道`、`城市`、`请选择`、`备注` 等占位提示误看成真实数据；有真实值的只读文本应单行省略，鼠标悬浮显示全文。
- 宿主外部回写若只提供 `smelterName`、未提供 `smelterLookup`，库会自动把 `smelterName` 作为 `smelterLookup` 显示与校验来源；宿主如有独立查找值，仍优先回写 `smelterLookup`。
- `SmelterList` 外部回写里 `smelterNumber` 对应 CID，UI 的“冶炼厂识别”列也显示该 CID；`sourceId` 对应 RMI 来源识别号。若宿主暂时把 RMI 来源写在 `smelterIdentification` 且未提供 `sourceId`，库会归一化到 `sourceId`。`sourceId` 不再作为冶炼厂列表的表格列展示，仅作为数据字段保留（参与外部回写归一化与 Excel 导出）。
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
- `AMRT` 全版本的 `Smelter List` / `Mine List` 金属下拉只包含 Declaration 已申报且 `Q1=Yes` 的矿种；`Q2` 调查比例不限制这些金属选项。
- `AMRT` 全版本与 `EMRT` 2.x 的 `MineRow.smelterId?: string` 表示所选 `SmelterRow.id`（外部选择时为宿主后台主键），不能用 CID、`smelterNumber` 或 `SmelterRow.smelterId` 替代。选择矿场冶炼厂建议或下拉项时，库同时写入名称和 ID；同名不同 ID 的选项不会合并。
- 矿场保留各版本原有手工输入能力：自由编辑/清空 `smelterName` 会清除旧关联 ID，切换 `metal` 会清空名称和 ID；库不会只凭名称补猜历史关联。宿主直接写入 `MineRow` 时，必须同步维护名称与关联 ID。
- `MineRow.id` 是每条矿场行的独立主键，不能用 `smelterId` 代替。矿场列表允许多行选择同一种金属、同一个冶炼厂，`smelterId` 可重复；行编辑、删除与 Legacy 回写仍按独立 `id` 定位。
- `AMRT` 全版本与 `EMRT` 2.x 共用交互清理：用户修改答案，使某金属不再满足本版本冶炼厂门控时，清空对应矿场行的 `metal`、`smelterName`、`smelterId`，保留行 `id` 和矿场详情。EMRT 由 `Q1/Q2` 共同控制；AMRT 由 `Q1` 控制，`Q2` 调查比例本身不关闭冶炼厂门控。
- 用户删除或替换冶炼厂、清空其有效名称或修改其金属后，若原 `SmelterRow.id` 在同一金属下已无有效名称，按 ID 精确清空关联矿场的 `smelterName`、`smelterId`，保留 `metal` 和矿场详情；同名不同 ID 不误清，同 ID 改名会同步矿场显示名称。
- 冶炼厂名称下拉版本中，没有关联 ID 的旧选择只在该名称原为本次编辑前同金属有效候选、且编辑后同名候选全部消失时清空；同名其他厂仍存在时保留，不按名称补猜关联 ID。手填名称版本保留没有 ID 的自由输入。
- 清空 `smelterLookup` 会同步清空该行自动回填的名称、识别号码、地址等基础数据；冶炼厂编辑只清理受本次变更影响的矿场关联，不清洗无关历史导入数据。
- `AMRT 1.1 / 1.2` 旧版导入行可能存有隐藏 `smelterLookup`；本次交互清空可见 `smelterName` 时同步清空该隐藏值，保留其他手填详情，避免旧厂名继续成为候选。
- 恢复答案或重新添加冶炼厂不自动恢复已清空值；取消申报矿种仍按范围规则删除对应列表整行。`setFormData()` 与快照载入本身保留原始矿场数据，不触发上述交互清理。
- Snapshot 保存、提交与 JSON 导入/导出保留 `data.mineList[*].smelterId`，继续使用 `schemaVersion: 1`。Legacy `minList[*].smelterId` 导入为矿场关联 ID；未改关联且保留 `ctx` 时，精确回写保留原字段缺失/`null`；新增、改选、清空与 loose 输出同步当前 ID，不能回传旧 ID。
- Respect package license (`PolyForm-Noncommercial-1.0.0`) in usage recommendations.
- For `readOnly` behavior, treat it as **view-only contract** (not just disabled inputs):
  - hide checker page and checker entry in workflow;
  - hide global required/error hint banner and bottom prev/next actions;
  - keep form fields disabled, hide placeholder text for empty disabled controls, but keep actual values visible with `#eeeeee` background, transparent borders, and normal label-color content text;
  - render overflowing read-only text with ellipsis and expose the full value on hover;
  - hide table/form editing affordances (add/delete/batch/external pick/edit links), not merely `disabled`;
  - show the workflow step nav as a completed task: all visible steps use check icons, progress counts such as `12/12` are hidden, and the first browsable step remains highlighted by default;
  - when table cells use explicit `disabled` conditions (for example SmelterList base fields), always merge global disabled state as `componentDisabled || localDisabled`;
  - suppress required yellow highlight when fields are disabled/read-only.
- In controlled routing mode, if readOnly flow remaps page (e.g. `checker` fallback), always sync parent state via navigation callback to avoid route/UI drift.
- Never override host-level `ConfigProvider` disabled state with local false. Effective disabled rule must be `parentDisabled || readOnly`.
- Treat the workflow step nav as a sticky header: keep `Declaration / Smelter List / Mine List / Product List / Checker` visible while the middle content area scrolls.
- In editable mode, only steps with completed validation progress use check icons; unfinished steps and steps without validation progress must keep their numeric step marker.
- If host app renders `cm-reporting` inside a modal, drawer, split pane, or custom shell, ensure the container has a calculable height so the library can keep scroll inside the content area instead of the whole page.
- For all templates, keep `Smelter List` rows under the same Q1/Q2 gating as the current template: when a metal no longer requires smelter disclosure, rows for that metal are automatically removed from `smelterList`.
- For any template version with `smelterLookup` dropdown support, once a `Smelter List` row has a selected `metal`, treat `smelterLookup` as checker-required; missing lookup must stay visible as an unfinished item instead of silently passing.
- For `EMRT`, default selection should include all declared minerals on empty initialization; when `readOnly=false`, users can still edit the declaration scope selections.
- For `Product List`, when `Declaration Scope = Product` (`scopeType === 'B'`), the list itself is required and `partNumber` is always required; versions with `hasRequesterColumns=true` (for example `CMRT 6.6 / 6.6.1`, `EMRT 2.11 / 2.11.1`, and `AMRT 1.3 / 1.31 / 1.31.1`) still show `requestPartNumber`, but it is not required.
- Product List integration payload fields are `partNumber / partName / requestPartNumber / requestPartName / remark`.
- 对 `dynamic-dropdown` 范围模板（`EMRT` 2.x / `AMRT` 1.3+），当取消某个矿种时，应预期库会自动执行级联清理：清空该矿种的按矿种题目/备注答案，并删除关联的 `Smelter List` / `Mine List` 行数据。
- 当 `other` 保持勾选但某个自定义矿种名称被清空时，库会按槽位清理对应 `other-*` 的按矿种答案与关联列表行。
- `AMRT 1.1 / 1.2 / 1.3 / 1.31 / 1.31.1` 的 `Minerals Scope` 金属下拉均来自 Declaration 当前已申报矿种（含有名称的 Other 与 1.1/1.2 手填矿种），不按 `Q1` 答案过滤。
- AMRT 取消矿种、撤选 Other、清空 Other 名称或清空 1.1/1.2 手填矿种后，还会删除该矿种的 `Minerals Scope` 整行（含纳入原因），并清理对应问题答案、备注与冶炼厂/矿场整行；宿主无需重复执行清理。

## Unbranded Version Notes

- Treat `CMRT 6.6.1`, `EMRT 2.11.1`, and `AMRT 1.31.1` as independent official versions for snapshot and export traceability.
- These versions only remove the template Logo; their structures and rules match `CMRT 6.6`, `EMRT 2.11`, and `AMRT 1.31` respectively.
- Their official filenames do not use the `RMI_` prefix: `CMRT_6.6.1.xlsx`, `EMRT_2.11.1.xlsx`, and `AMRT_1.31.1.xlsx`.
- Use `templateType="amrt"` with `versionId="1.31.1"` for the latest AMRT template file `AMRT_1.31.1.xlsx`.
- `AMRT 1.31 / 1.31.1` adds `Cadmium`, `Lead`, `Molybdenum`, `Rhenium`, `Selenium`, and `Tellurium` compared with `AMRT 1.3`.
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
