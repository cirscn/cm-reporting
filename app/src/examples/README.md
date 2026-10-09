## Examples 能力边界说明

本目录用于验证 `@lib` 的对外能力与边界，不作为生产 UI 的“最佳实践承诺”。

### 场景索引

- 运行入口（可直接在本项目启动后看到）：`app/src/examples/ExamplesApp.tsx`
- 推荐门面组件（`CMReporting` + ref）：`app/src/examples/scenarios/CMReportingRefScenario.tsx`
- legacy transform（roundtrip vs loose）：`app/src/examples/scenarios/LegacyTransformScenario.tsx`
- 自定义行样式（`rowClassName`）：`app/src/examples/scenarios/SmelterRowClassNameScenario.tsx`

启动后可通过页面顶部的 `Examples` 场景选择器切换不同场景。

### 宿主样式接入

- 新项目推荐导入 `cm-reporting/styles.scoped.css`；`CMReporting` 会在内部创建样式作用域容器，宿主不需要额外包 DOM。
- `cm-reporting/styles.scoped.css` 与旧入口 `cm-reporting/styles.css` 都不包含 Tailwind preflight/reset；旧入口仍保留兼容，但它是全局选择器入口，可能影响宿主中同名 class 或同页 Ant Design 组件，生产接入仍优先使用 scoped 入口。
- `CMReporting` 默认继承宿主 Ant Design `ConfigProvider` 主题；Examples 入口为了保持本项目预览外观，会显式传入库内 `defaultAntdTheme`。生产宿主不需要为了继承系统主题额外传 `theme`。

### 外置保存/提交示例

- `CMReportingRefScenario` 已演示外置保存/提交按钮：
  - `saveDraft()`：不校验必填，直接返回当前 Snapshot；
  - `submit()`：执行内部全量校验（`zod + checker`），失败返回 `null` 且自动跳转到 checker，成功返回 Snapshot。
- 示例中通过 `showPageActions={false}` 隐藏库内底部翻页，完全由宿主弹窗/按钮接管流程。
- `id` 与冶炼厂识别号码语义分离：`id` 作为行主键、去重依据和矿场 `MineRow.smelterId` 的关联主键；识别号码使用 `smelterNumber` 展示（`SmelterRow.smelterId` 仅内部兼容）。
- 冶炼厂新增行会先使用临时 ID（`smelter-new-<timestamp>`），当宿主外部选择回写 `id` 后覆盖临时 ID；若未回写 `id` 则本次回写无效并提示错误。
- 同一个 `metal` 下不能重复选择同一冶炼厂（按回写 `id` 判重）。
- 导入或 `setFormData()` 写入的历史数据也会按同一口径进入 checker / `validate()`；同一 `metal` 下重复的非临时 `id` 会报错，`smelter-new-*` 临时 ID 不参与判重。
- 行内外部选择成功后（包括宿主回写正式 `id` 的自定义 `Smelter not listed`，不包括手动新增的临时 `Smelter not listed` 与 `Smelter not yet identified`），`smelterNumber`、`国家`、`冶炼厂识别`、`识别号来源`、`街道`、`城市`、`州/省` 会自动锁定为不可编辑。
- 锁定后的空字段不显示 placeholder；有真实值的只读文本会单行省略，鼠标悬浮显示全文。
- 如果宿主外部回写只带了 `smelterName`、没带 `smelterLookup`，示例里的“冶炼厂查找”列会自动显示这个名称，checker 也会按该值判断为已选冶炼厂。
- 外部回写时，`smelterNumber` 对应 CID，示例里的“冶炼厂识别”列也显示这个 CID；`sourceId` 对应 RMI 来源识别号。若宿主暂时把 RMI 来源放在 `smelterIdentification` 且未传 `sourceId`，库会归一化到 `sourceId`。
- 宿主接入 `onLookupSmelterByNumber` 后，在“冶炼厂识别号码输入列”输入 CID 并离开输入框，库会调用宿主查询；唯一结果只有在对应金属满足当前模板的冶炼厂门控时才会回填（AMRT 为已申报且 `Q1=Yes`；EMRT 由 `Q1/Q2` 共同控制）。
- 如果 CID 查询返回多条，示例通过 `onPickSmelterForNumberLookup` 复用冶炼厂选择弹窗；默认搜索字段是 `smelterNumber`，默认搜索值是用户输入的 CID，用户勾选确认后才回填。
- 外部结果里的 `metal` 可以传内部 key（如 `cobalt`）或当前下拉显示名（如 `钴`），库会统一转成下拉使用的 key；转不出来或不在当前可选范围时只提示，不自动填。

### 全局只读演示

- `CMReportingRefScenario` 包含 `readOnly` 开关按钮。
- 打开 `readOnly` 后，组件进入“仅浏览”态：
  - 输入框、下拉框、日期选择等控件仍不可编辑；已有内容正常显示，空值控件不展示 placeholder，背景统一为 `#eeeeee`，边框透明，内容文字与 label 使用同一文本色；
  - 只读文字过长时以省略号结尾，鼠标悬浮显示全文；
  - 表格编辑不可变更；
  - `smelterNumber`、`国家`、`冶炼厂识别`、`识别号来源`、`街道`、`城市`、`州/省` 等主数据列保持禁用，不会因行内锁定条件失效而恢复可编辑；
  - `checker` 页与必填提示横幅不显示；
  - 底部翻页区不显示；
  - 顶部步骤条按已完成任务展示：所有可见步骤显示完成勾，不显示 `12/12` 这类校验计数；
  - 新增/删除/批量删除/行内外部选择等编辑入口不显示（而非仅 disabled）。

### 工作流步骤条布局

- 顶部步骤条（`申报 / 冶炼厂 / 矿场列表 / 产品列表 / 校验`）默认固定在组件顶部。
- 当页面内容较长时，滚动的是中间内容区，不会把步骤条一起卷走。
- 如果把示例放进弹窗、抽屉或自定义容器，宿主需要给容器明确高度，才能看到这个固定效果。
- 编辑态下，未校验成功或无需校验的步骤显示步骤数字；只读态下，所有可见步骤显示完成勾并隐藏进度计数。

### 冶炼厂外部选择入口（当前行为）

- 冶炼厂列表仅保留“新增一行”入口，不再提供顶部“从外部选择”批量入口。
- 外部冶炼厂选择改为行内触发：先新增一行并选择 `metal`，再在该行点击“选择冶炼厂/编辑”执行外部选择。
- 若宿主配置 `onLookupSmelterByNumber`，也可以先输入 CID 并离开输入框，由宿主系统查询；唯一且在申报范围内的结果会自动回填，多条结果会交给 `onPickSmelterForNumberLookup` 弹窗确认。

### Product List 当前行为

- 当 `Declaration Scope` 选择 `Product` 时，`Product List` 不能为空。
- `回复方的产品编号` 始终必填。
- 如果当前模板带请求方列（如 `CMRT 6.6 / 6.6.1`、`EMRT 2.11 / 2.11.1`、`AMRT 1.3 / 1.31 / 1.31.1`），会展示 `请求方的产品编号`，但它不参与必填校验。
- 示例里的请求方列表头已经统一成 `Requester Product # / Requester Product Name`，对接字段是 `requestPartNumber / requestPartName`。

### 冶炼厂表头行为（当前示例）

- `Smelter List` 表头会按当前 `templateType + versionId` 自动切到对应模板版本，不同调查类型看到的列名和顺序可以不同。
- 这个对齐范围不是只看 EMRT 2.1，而是覆盖 `CMRT / CRT / EMRT / AMRT` 全部已支持模板。
- 示例里不会显示这 3 列辅助字段：`Standard Smelter Name`、`Country Code`、`State / Province Code`。
- 表头文案变了，不代表后端字段名也跟着改；对接时仍应按 `SmelterRow` 字段取值，比如识别号码仍然走 `smelterNumber`。

### 矿厂表头行为（当前示例）

- `Mine List` 只会出现在模板本身带这个工作表的版本里：`AMRT 1.1 / 1.2 / 1.3 / 1.31 / 1.31.1` 与 `EMRT 2.0 / 2.1 / 2.11 / 2.11.1`。
- 这些版本的矿厂表头现在按模板文案显示，比如“从该矿厂采购的冶炼厂的名称”“矿厂(矿场)名称”“矿厂识别（例如《CID》）”。
- 示例里不会显示矿厂模板里的辅助列 `Country Code`、`State / Province Code`。
- 表头文案与字段名分开看：例如“矿厂识别（例如《CID》）”对应的仍是 `mineId`，不是新造了一个字段。
- 在 `EMRT / AMRT` 里，矿厂行选择金属后，“从该矿厂采购的冶炼厂的名称”“矿厂(矿场)名称”“矿厂所在国家或地区”会变成必填；国家/地区是普通输入框，不是下拉框。
- AMRT 全版本的冶炼厂和矿场金属下拉只包含 Declaration 已申报且 `Q1=Yes` 的矿种；`Q2` 调查比例不限制金属选项。

### 矿场冶炼厂关联（当前行为）

- `AMRT` 全版本与 `EMRT` 2.x 选择冶炼厂建议或下拉项时，会一起保存 `smelterName` 和所选 `SmelterRow.id` 到 `MineRow.smelterId`；外部选择时，该 ID 是宿主后台主键，不能使用 CID 或 `smelterNumber`。
- 同名但不同 ID 的冶炼厂保留为不同选项；可手工输入名称的版本仍支持自由填写，编辑/清空名称会清除旧 ID，切换矿场金属会清空名称和 ID。
- 矿场行 `id` 与关联字段 `smelterId` 分开：同一金属和同一冶炼厂可以对应多条矿场行，这些行的 `smelterId` 相同，但 `id` 必须各自不同，编辑/删除按行 `id` 定位。
- 宿主直接更新矿场数据时，需要同步维护名称与 ID；历史数据只有名称时，库不会按名称自动补猜后台 ID。`CMRT / CRT / EMRT 1.x` 不新增矿场列表。
- `AMRT` 全版本与 `EMRT` 2.x 共用联动清理：用户修改答案，使某金属不再满足本版本冶炼厂门控时，矿场行的 `metal`、`smelterName`、`smelterId` 会清空，行 `id` 和矿场详情保留。EMRT 由 `Q1/Q2` 共同控制；AMRT 由 `Q1` 控制，`Q2` 调查比例本身不关闭冶炼厂门控。
- 删除或替换冶炼厂、清空其有效名称或修改其金属后，原 `SmelterRow.id` 若在同一金属下已无有效名称，关联矿场仅清空名称和关联 ID，保留金属和矿场详情；同名不同 ID 不会误清，同 ID 改名会同步矿场显示名称。
- 下拉版本中，没有关联 ID 的旧选择只在该名称原为本次编辑前同金属有效候选、且编辑后同名候选全部消失时清空；同名其他厂仍存在时保留，不按名称补猜关联 ID。手填名称版本保留没有关联 ID 的自由输入。
- 清空 `smelterLookup` 会同步清空该行自动回填的名称、识别号码、地址等基础数据；冶炼厂编辑只清理受本次变更影响的矿场关联，不清洗无关历史导入数据。
- `AMRT 1.1 / 1.2` 的旧版导入冶炼厂可能保留隐藏 `smelterLookup`；用户清空可见名称时同步清空该隐藏值，保留其他手填详情，避免旧厂名继续成为候选。
- 恢复答案或重新添加冶炼厂不会自动恢复已清空值；取消申报矿种仍删除对应列表整行。`setFormData()` 与快照载入本身保留原始矿场数据，不触发上述交互清理。

### EMRT 申报范围默认行为

- EMRT 默认会选中当前版本全部矿种（包括 `dynamic-dropdown` 版本）。
- 在非只读模式下，用户仍可在 Declaration 页面修改矿种勾选。
- 在只读模式下，矿种范围仅展示，不可编辑。
- 在 `dynamic-dropdown` 模式（EMRT 2.x / AMRT 1.3+）中，取消某矿种会自动清空该矿种在按矿种题目/备注中的值，并删除该矿种在 `Smelter List` / `Mine List` 的行数据。
- 在 `dynamic-dropdown` 模式下，若 `other` 仍勾选但某个自定义矿种名称被清空，也会同步清理对应 `other-*` 的按矿种题目/备注与 `Smelter List` / `Mine List` 行数据。

### AMRT 矿产申报范围联动

- `AMRT 1.1 / 1.2 / 1.3 / 1.31 / 1.31.1` 的 `Minerals Scope` 金属下拉都来自 Declaration 当前申报矿种，包含有名称的 Other 和 1.1/1.2 手填矿种，不按 `Q1` 答案过滤。
- 取消申报金属、撤选 Other、清空某个 Other 名称或清空 1.1/1.2 手填矿种后，对应 `Minerals Scope` 的金属与纳入原因整行会删除，同时清理对应题目答案、备注及冶炼厂/矿场整行。

### 无 Logo 正式升版当前行为

- `CMRT 6.6.1`、`EMRT 2.11.1`、`AMRT 1.31.1` 分别与对应旧版本结构和规则一致，但使用独立版本号保存和导出，便于溯源。
- 三个无 Logo 官方文件名均不带 `RMI_` 前缀。
- `AMRT 1.31 / 1.31.1` 比 `AMRT 1.3` 多出 `Cadmium`、`Lead`、`Molybdenum`、`Rhenium`、`Selenium`、`Tellurium`。
- 示例会把这些新增矿产当作正式矿产处理，不需要走 `Other` 自定义矿产。
- Excel 导出会把这些矿产写入 Declaration、`Smelter List`、`Mine List` 和 `Minerals Scope`。

### JSON 导入/导出

- 导入支持两类 JSON：
  - **RMI legacy JSON**：通过 `cirsGpmLegacyAdapter.toInternal()` 导入；会生成 `legacyCtx` 以支持后续精确回写（roundtrip）。
  - **ReportSnapshotV1**：通过 `parseSnapshot()` 导入；不包含 legacy 的“历史字段类型/缺失细节”，因此无法做 byte-level roundtrip。

- Snapshot 保存/提交、JSON 导出和回填都会保留 `data.mineList[*].smelterId`，继续使用 `schemaVersion: 1`。Legacy 导入会保留 `minList[*].smelterId`；保留 `legacyCtx` 且未修改关联时，原字段缺失/`null` 保持精确回写；新增、改选或清空矿场关联后，两种 Legacy 导出都会同步当前关联 ID，避免继续回传旧 ID。

- 关于公司信息“完成日期”（`authorizationDate`）：
  - 推荐输入 `YYYY-MM-DD`（如 `2026-02-09`）。
  - Snapshot 导入/回填运行时兼容秒级与毫秒级时间戳（number/数字字符串），会按北京时间日历日自动归一化为 `YYYY-MM-DD`；例如 `1749657600000` 会得到 `2025-06-12`。
  - RMI legacy JSON 的 `cmtCompany.effectiveDate` 若为空字符串、空白字符串、`0` 或 `'0'`，导入后保持为空，不会显示 1970-01-01。
  - 非法日期字符串不会自动修正，仍按现有校验规则报错。

- 导出（Examples 约定）：
  - `ExamplesApp` 始终导出 **RMI legacy schema**：
    - 若导入来源是 legacy JSON：使用 `cirsGpmLegacyAdapter.toExternal(snapshot, legacyCtx)` 精确回写。
    - 若未导入 legacy JSON：使用 `cirsGpmLegacyAdapter.toExternalLoose(snapshot)` 进行 loose transform（只保证 schema 兼容）。

### SmelterList 行样式

- 库会自动将 `smelterLookup = Smelter not listed` 的自定义冶炼厂整行文字标红，禁用输入框和下拉框中的实际值也保持红色。
- Ant Design 5/6 的 AutoComplete 查找输入文字也由库标红，只读查看时仍显示红色。
- `SmelterListIntegration.rowClassName(record, index)` 可继续追加宿主自定义 className，不会覆盖库内置标红。
- Examples 里的 `.smelter-row-unlisted` 只标记“外部名称未命中 lookup 主数据”的宿主附加规则，不处理由库内置标红的 `Smelter not listed`。

### Checker 门控一致性（Smelter List）

- `Smelter List` 的 checker 错误与完成度统计使用同一门控条件。
- 当 `Q1/Q2` 调整后使某金属不再需要填写冶炼厂时，该金属的 `smelterList` 行会自动删除。
- 因此在该场景下，期望表现是：`checker` 错误数与顶部完成度状态保持一致。
- 对带 `smelterLookup` 下拉的模板版本，如果某行已经选了 `metal` 但没选冶炼厂，该行会直接在 checker 中报未完成。
- 导入数据中的重复冶炼厂不会被静默接受；checker 使用与外部选择相同的 `metal + id` 判重规则。
