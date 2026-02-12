## Examples 能力边界说明

本目录用于验证 `@lib` 的对外能力与边界，不作为生产 UI 的“最佳实践承诺”。

### 场景索引

- 运行入口（可直接在本项目启动后看到）：`app/src/examples/ExamplesApp.tsx`
- 推荐门面组件（`CMReporting` + ref）：`app/src/examples/scenarios/CMReportingRefScenario.tsx`
- legacy transform（roundtrip vs loose）：`app/src/examples/scenarios/LegacyTransformScenario.tsx`
- 自定义行样式（`rowClassName`）：`app/src/examples/scenarios/SmelterRowClassNameScenario.tsx`

启动后可通过页面顶部的 `Examples` 场景选择器切换不同场景。

### 外置保存/提交示例

- `CMReportingRefScenario` 已演示外置保存/提交按钮：
  - `saveDraft()`：不校验必填，直接返回当前 Snapshot；
  - `submit()`：执行内部全量校验（`zod + checker`），失败返回 `null` 且自动跳转到 checker，成功返回 Snapshot。
- 示例中通过 `showPageActions={false}` 隐藏库内底部翻页，完全由宿主弹窗/按钮接管流程。
- `id` 与冶炼厂识别号码语义分离：`id` 仅作为行主键与去重依据；识别号码使用 `smelterNumber` 展示（`smelterId` 仅内部兼容）。
- 冶炼厂新增行会先使用临时 ID（`smelter-new-<timestamp>`），当宿主外部选择回写 `id` 后覆盖临时 ID；若未回写 `id` 则本次回写无效并提示错误。
- 同一个 `metal` 下不能重复选择同一冶炼厂（按回写 `id` 判重）。
- 行内外部选择成功后（非 `Smelter not listed / not yet identified`），`smelterNumber`、`国家`、`冶炼厂识别`、`识别号来源`、`街道`、`城市`、`州/省` 会自动锁定为不可编辑。

### 全局只读演示

- `CMReportingRefScenario` 包含 `readOnly` 开关按钮。
- 打开 `readOnly` 后，组件进入“仅浏览”态：
  - 输入、选择、表格编辑不可变更；
  - `smelterNumber`、`国家`、`冶炼厂识别`、`识别号来源`、`街道`、`城市`、`州/省` 等主数据列保持禁用，不会因行内锁定条件失效而恢复可编辑；
  - `checker` 页与必填提示横幅不显示；
  - 底部翻页区不显示；
  - 新增/删除/批量删除/行内外部选择等编辑入口不显示（而非仅 disabled）。

### 冶炼厂外部选择入口（当前行为）

- 冶炼厂列表仅保留“新增一行”入口，不再提供顶部“从外部选择”批量入口。
- 外部冶炼厂选择改为行内触发：先新增一行并选择 `metal`，再在该行点击“选择冶炼厂/编辑”执行外部选择。

### EMRT 申报范围默认行为

- EMRT 默认会选中当前版本全部矿种（包括 `dynamic-dropdown` 版本）。
- 在非只读模式下，用户仍可在 Declaration 页面修改矿种勾选。
- 在只读模式下，矿种范围仅展示，不可编辑。
- 在 `dynamic-dropdown` 模式（EMRT 2.x / AMRT 1.3）中，取消某矿种会自动清空该矿种在按矿种题目/备注中的值，并删除该矿种在 `Smelter List` / `Mine List` 的行数据。
- 在 `dynamic-dropdown` 模式下，若 `other` 仍勾选但某个自定义矿种名称被清空，也会同步清理对应 `other-*` 的按矿种题目/备注与 `Smelter List` / `Mine List` 行数据。

### JSON 导入/导出

- 导入支持两类 JSON：
  - **RMI legacy JSON**：通过 `cirsGpmLegacyAdapter.toInternal()` 导入；会生成 `legacyCtx` 以支持后续精确回写（roundtrip）。
  - **ReportSnapshotV1**：通过 `parseSnapshot()` 导入；不包含 legacy 的“历史字段类型/缺失细节”，因此无法做 byte-level roundtrip。

- 关于公司信息“完成日期”（`authorizationDate`）：
  - 推荐输入 `YYYY-MM-DD`（如 `2026-02-09`）。
  - Snapshot 导入/回填运行时兼容秒级与毫秒级时间戳（number/数字字符串），会自动归一化为 `YYYY-MM-DD`。
  - 非法日期字符串不会自动修正，仍按现有校验规则报错。

- 导出（Examples 约定）：
  - `ExamplesApp` 始终导出 **RMI legacy schema**：
    - 若导入来源是 legacy JSON：使用 `cirsGpmLegacyAdapter.toExternal(snapshot, legacyCtx)` 精确回写。
    - 若未导入 legacy JSON：使用 `cirsGpmLegacyAdapter.toExternalLoose(snapshot)` 进行 loose transform（只保证 schema 兼容）。

### SmelterList 行样式

- `SmelterListIntegration.rowClassName(record, index)` 由宿主决定 className，库不内置任何“标红”等表现。
- Examples 里的 `.smelter-row-unlisted` 仅用于演示宿主自定义样式与规则。

### Checker 门控一致性（EMRT/AMRT）

- `Smelter List` 的 checker 错误与完成度统计使用同一门控条件。
- 当 `Q1/Q2` 调整后使冶炼厂不再必填时，历史残留的 `smelterList` 行不会继续拉低 checker 完成度。
- 因此在该场景下，期望表现是：`checker` 错误数与顶部完成度状态保持一致。
