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
- 锁定后的空字段不显示 placeholder；有真实值的只读文本会单行省略，鼠标悬浮显示全文。
- 如果宿主外部回写只带了 `smelterName`、没带 `smelterLookup`，示例里的“冶炼厂查找”列会自动显示这个名称，checker 也会按该值判断为已选冶炼厂。
- 外部回写时，`smelterNumber` 对应 CID，示例里的“冶炼厂识别”列也显示这个 CID；`sourceId` 对应 RMI 来源识别号。若宿主暂时把 RMI 来源放在 `smelterIdentification` 且未传 `sourceId`，库会归一化到 `sourceId`。
- 宿主接入 `onLookupSmelterByNumber` 后，在“冶炼厂识别号码输入列”输入 CID 并离开输入框，库会调用宿主查询并回填金属、冶炼厂名称、国家、CID、RMI 来源和地址字段。

### 全局只读演示

- `CMReportingRefScenario` 包含 `readOnly` 开关按钮。
- 打开 `readOnly` 后，组件进入“仅浏览”态：
  - 输入框、下拉框、日期选择等控件仍不可编辑；已有内容正常显示，空值控件不展示 placeholder，背景统一为 `#f5f5f5`，边框透明，内容文字与 label 使用同一文本色；
  - 只读文字过长时以省略号结尾，鼠标悬浮显示全文；
  - 表格编辑不可变更；
  - `smelterNumber`、`国家`、`冶炼厂识别`、`识别号来源`、`街道`、`城市`、`州/省` 等主数据列保持禁用，不会因行内锁定条件失效而恢复可编辑；
  - `checker` 页与必填提示横幅不显示；
  - 底部翻页区不显示；
  - 新增/删除/批量删除/行内外部选择等编辑入口不显示（而非仅 disabled）。

### 工作流步骤条布局

- 顶部步骤条（`申报 / 冶炼厂 / 矿场列表 / 产品列表 / 校验`）默认固定在组件顶部。
- 当页面内容较长时，滚动的是中间内容区，不会把步骤条一起卷走。
- 如果把示例放进弹窗、抽屉或自定义容器，宿主需要给容器明确高度，才能看到这个固定效果。

### 冶炼厂外部选择入口（当前行为）

- 冶炼厂列表仅保留“新增一行”入口，不再提供顶部“从外部选择”批量入口。
- 外部冶炼厂选择改为行内触发：先新增一行并选择 `metal`，再在该行点击“选择冶炼厂/编辑”执行外部选择。
- 若宿主配置 `onLookupSmelterByNumber`，也可以先输入 CID 并离开输入框，由宿主系统查询并自动回填当前行。

### Product List 当前行为

- 当 `Declaration Scope` 选择 `Product` 时，`Product List` 不能为空。
- `回复方的产品编号` 始终必填。
- 如果当前模板带请求方列（如 `CMRT 6.6`、`EMRT 2.11`、`AMRT 1.3 / 1.31`），`请求方的产品编号` 也必填。
- 示例里的请求方列表头已经统一成 `Requester Product # / Requester Product Name`，但对接字段仍然是 `requesterNumber / requesterName`。

### 冶炼厂表头行为（当前示例）

- `Smelter List` 表头会按当前 `templateType + versionId` 自动切到对应模板版本，不同调查类型看到的列名和顺序可以不同。
- 这个对齐范围不是只看 EMRT 2.1，而是覆盖 `CMRT / CRT / EMRT / AMRT` 全部已支持模板。
- 示例里不会显示这 3 列辅助字段：`Standard Smelter Name`、`Country Code`、`State / Province Code`。
- 表头文案变了，不代表后端字段名也跟着改；对接时仍应按 `SmelterRow` 字段取值，比如识别号码仍然走 `smelterNumber`。

### 矿厂表头行为（当前示例）

- `Mine List` 只会出现在模板本身带这个工作表的版本里：`AMRT 1.1 / 1.2 / 1.3 / 1.31` 与 `EMRT 2.0 / 2.1 / 2.11`。
- 这些版本的矿厂表头现在按模板文案显示，比如“从该矿厂采购的冶炼厂的名称”“矿厂(矿场)名称”“矿厂识别（例如《CID》）”。
- 示例里不会显示矿厂模板里的辅助列 `Country Code`、`State / Province Code`。
- 表头文案与字段名分开看：例如“矿厂识别（例如《CID》）”对应的仍是 `mineId`，不是新造了一个字段。
- 在 `EMRT / AMRT` 里，矿厂行选择金属后，“从该矿厂采购的冶炼厂的名称”“矿厂(矿场)名称”“矿厂所在国家或地区”会变成必填；国家/地区是普通输入框，不是下拉框。

### EMRT 申报范围默认行为

- EMRT 默认会选中当前版本全部矿种（包括 `dynamic-dropdown` 版本）。
- 在非只读模式下，用户仍可在 Declaration 页面修改矿种勾选。
- 在只读模式下，矿种范围仅展示，不可编辑。
- 在 `dynamic-dropdown` 模式（EMRT 2.x / AMRT 1.3+）中，取消某矿种会自动清空该矿种在按矿种题目/备注中的值，并删除该矿种在 `Smelter List` / `Mine List` 的行数据。
- 在 `dynamic-dropdown` 模式下，若 `other` 仍勾选但某个自定义矿种名称被清空，也会同步清理对应 `other-*` 的按矿种题目/备注与 `Smelter List` / `Mine List` 行数据。

### AMRT 1.31 当前行为

- `AMRT 1.31` 比 `AMRT 1.3` 多出 `Cadmium`、`Lead`、`Molybdenum`、`Rhenium`、`Selenium`、`Tellurium`。
- 示例会把这些新增矿产当作正式矿产处理，不需要走 `Other` 自定义矿产。
- Excel 导出会把这些矿产写入 Declaration、`Smelter List`、`Mine List` 和 `Minerals Scope`。

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

### Checker 门控一致性（Smelter List）

- `Smelter List` 的 checker 错误与完成度统计使用同一门控条件。
- 当 `Q1/Q2` 调整后使冶炼厂不再必填时，历史残留的 `smelterList` 行不会继续拉低 checker 完成度。
- 因此在该场景下，期望表现是：`checker` 错误数与顶部完成度状态保持一致。
- 对带 `smelterLookup` 下拉的模板版本，如果某行已经选了 `metal` 但没选冶炼厂，该行会直接在 checker 中报未完成。
