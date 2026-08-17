# cm-reporting

## 0.9.7

### Patch Changes

- fae7e69: 冶炼厂列表移除“冶炼厂出处识别号”（sourceId）表格列；`sourceId` 仍作为数据字段保留，外部回写归一化与 Excel 导出不受影响。

## 0.9.6

### Patch Changes

- 7a4483f: legacy 适配：模板类型与版本推断支持不带 `RMI_` 前缀的标识（如 `CMRT_6.5`），同时保持原有 `RMI_CMRT_6.5` 格式兼容。

## 0.9.5

### Patch Changes

- 61baeff: 统一顶部步骤条当前完成图标与普通完成图标的可见圆圈尺寸。

## 0.9.4

### Patch Changes

- 1ba08a5: 将顶部步骤条当前完成步骤图标改为实心绿色圆底白色对勾，去除内部描边圆。

## 0.9.3

### Patch Changes

- 7de5566: 调整顶部步骤条连接线位置，并简化只读完成步骤的选中高亮样式。

## 0.9.2

### Patch Changes

- fb54d52: 优化只读状态下顶部步骤条的当前步骤高亮，并修正步骤连接线与圆点的居中对齐。

## 0.9.1

### Patch Changes

- 40fcf95: 优化工作流步骤条在编辑态和只读完成态下的展示：编辑态仅真实校验完成的步骤显示勾，未完成或无需校验的步骤显示数字；只读态所有可见步骤显示完成勾并隐藏进度计数。

  移除全局必填提示文案开头的状态图标，避免与提示条自带图标重复显示。

## 0.9.0

### Minor Changes

- 230015f: 破坏性变更：产品列表公开字段统一改名为 `partNumber`、`partName`、`requestPartNumber`、`requestPartName`、`remark`，同步更新 Snapshot、外部选择、校验、Excel 导出与集成文档。

### Patch Changes

- 230015f: 修复外部选择自定义冶炼厂后，冶炼厂主数据信息仍可在列表中编辑的问题。

## 0.8.13

### Patch Changes

- 68e995e: 修复 checker 中重复冶炼厂校验提示重复展示的问题：同一个矿产下即使存在多条重复冶炼厂记录，也只展示一条重复提示。

## 0.8.12

### Patch Changes

- 87bde29: 修复 legacy 导入中公司信息完成日期未填写时被显示为 1970-01-01 的问题。

## 0.8.11

### Patch Changes

- 8856cf8: 修复公司信息完成日期导入时间戳按 UTC 取日期导致显示提前一天的问题，时间戳现在按北京时间日历日归一化。

## 0.8.10

### Patch Changes

- d6cf11b: 调整 checker 页面校验分组顺序，使错误展示按公司信息、冶炼厂清单、矿产相关项、产品清单排列，并移除中文冶炼厂校验文案中的“记录”字样。
- d6cf11b: 修复第一步申报页面折叠面板可同时展开的问题，现在公司信息、矿产申报范围、公司层面问题同一时间只会保留一个展开面板。
- d6cf11b: 修复表格内通过命令式 API 打开的错误、警告、确认弹窗未挂回组件作用域的问题，并为库内弹窗补充作用域定位样式，避免在宿主弹窗中出现左上角定位异常。
- d6cf11b: 将导入或 `setFormData()` 写入的重复冶炼厂纳入 checker / `validate()` 校验；判重口径与行内外部选择一致，同一个 `metal` 下按非临时行 `id` 判重，`smelter-new-*` 临时 ID 不参与判重。
- d6cf11b: 修复手动新增冶炼厂时“冶炼厂查找”列重复显示冶炼厂名称的问题；该列现在只显示 `Smelter not listed`，冶炼厂名称仍在“冶炼厂名称”列填写与校验。
- d6cf11b: 产品列表不再将请求方产品编号作为必填项，保留请求方列展示与字段对接。

## 0.8.9

### Patch Changes

- 87c15ef: 优化冶炼厂清单校验提示：同一不涉及金属只提示一次，并将缺少冶炼厂记录的提示排在不涉及金属提示之前。
- 87c15ef: 修复问题矩阵空备注框在门控切换时可能出现非受控渲染的问题，保持空备注值以空字符串传入。

## 0.8.8

### Patch Changes

- c0bedc4: 新增 checker 对冶炼厂列表无关金属的校验：当导入数据中的冶炼厂金属不在当前申报范围可选金属内时，提示删除无关冶炼厂。
- b8b5cad: 修正 CMRT 公司层面问题 H 的中文选项文案，使其与模板中的证券交易委员会和欧盟条例规限表述一致。
- c0bedc4: 修复 CMRT、CRT 与 EMRT 旧版本冶炼厂列表中文表头显示 Excel 脚注编号的问题，界面中“冶炼厂名称”不再带 “(1)”。
- 98bb610: 隐藏问题矩阵禁用空回答和空备注的占位提示，并加深禁用态背景色，避免把占位文字误看成已填写内容。

## 0.8.7

### Patch Changes

- f3813fa: 移除库样式产物中的 Tailwind preflight/reset，避免 scoped CSS 重置插件内部和弹层中的 Ant Design 按钮、输入框等组件样式。

## 0.8.6

### Patch Changes

- a41ffd5: 修复 CMReporting 默认覆盖宿主 Ant Design 主题的问题：未显式传入 `theme` 时改为继承宿主 `ConfigProvider`，显式传入主题时仍保持局部覆盖能力。

## 0.8.5

### Patch Changes

- 538ce1a: 新增 `styles.scoped.css` 样式入口，用于将组件库样式限制在 `.cm-reporting-scope` 容器内，避免 Tailwind reset 和只读态覆盖规则影响宿主全站。

## 0.8.4

### Patch Changes

- 220459f: 修复冶炼厂金属范围联动：当各调查表的 Q1/Q2 变更后使某金属不再需要申报冶炼厂时，自动删除该金属在冶炼厂列表中的行，并调整 CID 查询不在范围内时的中文提示文案。

## 0.8.3

### Patch Changes

- 49d091a: 修复产品列表和冶炼厂列表中的提示弹窗改用 Ant Design App 上下文弹出，避免静态 Modal 无法继承宿主全局主题与配置。

## 0.8.2

### Patch Changes

- 2a870b3: 修复申报页从校验定位字段后，`focus` 参数持续锁定折叠面板，导致公司层面问题面板点击后无法展开的问题。

## 0.8.1

### Patch Changes

- 907f1ba: 调整步骤导航顶部报告目的标签的布局，使标签在导航区域左侧显示，并为 AMRT 补充报告目的提示。
- 691e08a: 优化冶炼厂识别号码回填：不再自动填充申报范围外金属的冶炼厂；CID 查询多条时新增接入方确认选择回调；外部回写金属支持按当前下拉显示名归一化。

## 0.8.0

### Minor Changes

- 519a627: 新增冶炼厂 CID 编号查询集成入口，支持在“冶炼厂识别号码输入列”输入编号后由宿主系统查询并自动回填冶炼厂信息和金属。

### Patch Changes

- 812ad1b: 修复冶炼厂外部选择回写字段归一化，确保“冶炼厂识别”显示 CID，“冶炼厂出处识别号”显示 RMI 来源识别号。

## 0.7.9

### Patch Changes

- ff78cca: 调整只读与外部锁定字段展示行为：锁定后的空字段不再显示占位提示，避免将 Source ID、街道、城市等 placeholder 误看成真实值；只读文本过长时以省略号结尾，并可通过鼠标悬浮查看全文。

## 0.7.8

### Patch Changes

- 08f2577: 调整 CMRT 和 EMRT 报告目的提示样式：改为信息类型标签展示，并优化长文本换行。
- f55a27b: 调整只读态空值控件展示：只读模式下输入框、下拉框和日期选择器不再显示 placeholder，已有值仍正常展示。

## 0.7.7

### Patch Changes

- 3bfbefb: 调整 CMRT 冶炼厂列表的金属下拉范围：仅显示第一步中同一金属 Q1 和 Q2 都选择 Yes 的金属，历史已有冶炼厂行不自动删除。

## 0.7.6

### Patch Changes

- 0edd07c: 修复 EMRT/AMRT 矿厂列表在选择金属后未强制填写冶炼厂名称、矿厂名称和矿厂所在国家或地区的问题，并将矿厂所在国家或地区改为文本输入框。

## 0.7.5

### Patch Changes

- 8e0ebf0: 优化只读模式下输入框、下拉框、日期选择等 disabled 控件样式：保留禁用语义，同时统一浅灰背景、去掉明显边框并保持内容文字清晰可读。

  修复 CMRT 6.6 公司信息页 placeholder 未显示的问题。

## 0.7.4

### Patch Changes

- 2048be1: 按模板版本恢复生效日期选择范围，新增 AMRT 1.31 版本支持，并补齐 1.31 新增矿产与 Excel 导出映射；同时修复 AMRT 1.31 的 `Smelter List` 表头识别，让冶炼厂输入列和查找列在界面中正常显示。

## 0.7.3

### Patch Changes

- ac30420: 调整公司信息页中文字段文案、申报范围下拉选项、范围描述显示逻辑、公司层面问题必填判断，并在 CMRT、EMRT 工作流步骤条上方显示报告目的说明。

## 0.7.2

### Patch Changes

- 960b7ac: 修复带冶炼厂下拉的模板在 `Smelter List` 中“选了 metal 但没选冶炼厂”时未被 checker 判为未完成的问题。
  - 补充 `CMRT` 场景回归测试，锁定缺失 `smelterLookup` 时必须报错的行为。
  - 将 `smelterLookup` 必填校验从模板白名单改为基于模板配置判断，避免 `CMRT` 被漏掉。
  - 当宿主外部选择冶炼厂只回写 `smelterName` 时，库会自动同步填充 `smelterLookup`，保证“冶炼厂查找”列显示和 checker 校验一致。
  - 同步更新对外文档、集成技能说明和 examples 行为说明，避免实现和文档脱节。

- 9a46604: 修复 Declaration 页中“矿产申报范围”和“公司层面问题”折叠面板标题的必填标识显示逻辑。
  - 改为根据面板内是否存在必填题目显示星号，不再依赖当前是否刚好报错。
  - 保持“矿产申报范围”和“公司层面问题”折叠面板标题常驻必填提示，避免折叠后看不出该面板仍有必填回答。
  - 补充页面回归测试，防止折叠面板标题漏掉必填提示。

## 0.7.1

### Patch Changes

- 960b7ac: 修复带冶炼厂下拉的模板在 `Smelter List` 中“选了 metal 但没选冶炼厂”时未被 checker 判为未完成的问题。
  - 补充 `CMRT` 场景回归测试，锁定缺失 `smelterLookup` 时必须报错的行为。
  - 将 `smelterLookup` 必填校验从模板白名单改为基于模板配置判断，避免 `CMRT` 被漏掉。
  - 同步更新对外文档、集成技能说明和 examples 行为说明，避免实现和文档脱节。

- 9a46604: 修复 Declaration 页中“矿产申报范围”和“公司层面问题”折叠面板标题的必填标识显示逻辑。
  - 改为根据面板内真实未通过的必填校验结果显示星号，不再只看固定配置。
  - 覆盖矿产选择、矿产范围行必填、问题矩阵必填和公司层面问题必填/备注必填场景。
  - 补充页面回归测试，防止折叠面板标题漏掉必填提示。

## 0.7.0

### Minor Changes

- 3bfe3bc: 补齐 CMRT 6.6 与 EMRT 2.11 模板版本接入。

  同步将 CMRT 6.6 的 Product List 升级为带请求方两列的新版表头规则，并更新对外文档说明。

### Patch Changes

- 3bfe3bc: 让冶炼厂与矿厂列表表头按各调查类型和版本对应的 RMI Excel 模板对齐，并统一冶炼厂表头的必填标识展示。
  - 覆盖 `CMRT / CRT / EMRT / AMRT` 的冶炼厂表头顺序和文案差异。
  - 覆盖带 `Mine List` 工作表的 `AMRT` 与 `EMRT 2.x` 矿厂表头文案。
  - 隐藏当前 UI 中不需要展示的 `Standard Smelter Name`、`Country Code`、`State / Province Code` 三列。
  - 去掉冶炼厂表头里硬写的 `(*)`，改成和其他页面一致的红色必填星号。
  - 保持底层 Snapshot 和后端字段不变，只调整前端表头显示。
  - 当 `Declaration Scope = Product` 时，强制 `Product List` 至少有一行数据。
  - `Product List` 中的 `回复方的产品编号` 始终必填；若模板开启请求方列，则 `请求方的产品编号` 也必填。
  - 将产品列表中的请求方文案统一为“请求方的产品编号 / 请求方的产品名称”，但后端字段仍保持 `requesterNumber / requesterName`。

- 3bfe3bc: 修复步骤条圆点、标题文字和进度标签的垂直对齐问题，避免标题视觉上偏上。
- 3bfe3bc: 调整工作流顶部步骤条布局：
  - 将“申报 / 冶炼厂 / 矿场列表 / 产品列表 / 校验”步骤条固定在组件顶部，滚动长内容时不再随内容一起移出视口。
  - 收紧组件内部滚动区域，让中间内容区单独滚动，避免头部步骤条影响表单阅读与切换。
  - 同步更新库 README、examples 说明和集成 skill，明确宿主容器需要提供可计算高度。

## 0.6.4

### Patch Changes

- f391014: 调整 CMRT 全版本公司层面问题 E 的备注校验规则：
  - 当 E 选择 `Yes, using other format (describe)` 时，备注由必填改为选填。
  - EMRT 对应规则保持不变，仍在选择 `Yes, Using Other Format (Describe)` 时要求填写备注。
  - 同步更新 CMRT 相关文案与主 PRD 描述，确保实现与文档一致。

## 0.6.3

### Patch Changes

- 1311c27: 修复动态矿种模板在“取消申报范围金属”后的数据残留问题，确保申报范围、题目答案与列表数据保持一致。
  - 当在 `dynamic-dropdown` 模式（EMRT 2.x / AMRT 1.3）取消某金属后，自动清空该金属在按金属题目与备注中的答案值。
  - 当 `other` 仍勾选但某个自定义矿种名称被清空时，自动按槽位清理对应 `other-*` 的按金属题目与备注答案，避免残留失活矿种数据。
  - 同步清空该金属在按金属公司题（含备注）中的答案值，避免隐藏的历史回答继续残留。
  - 自动删除该金属在 `Smelter List` / `Mine List` 的历史行，避免继续保留已不在申报范围内的数据。
  - 补充 `TemplateStore` 回归测试，覆盖 EMRT 2.1 与 AMRT 1.3 的取消矿种级联清理场景。
  - 同步更新 `app/src/lib/README.md`、`app/src/examples/README.md` 与 `skills/cm-reporting-integration/SKILL.md` 的行为说明。

## 0.6.2

### Patch Changes

- a844700: 修复提交门控与 Checker 展示不一致的问题，统一 `submit()` / `validate()` 的全量校验语义。
  - `submit()` 现在必须同时通过 `zod` 与 `checker` 校验，任一失败都会返回 `null` 并跳转 checker 页面。
  - `validate()` 与 `submit()` 共享同一套全量门控，不再仅代表结构校验结果。
  - 补充回归测试，覆盖“zod 通过但 checker 不通过时必须拦截提交”的场景。
  - 同步更新 `app/src/lib/README.md`、`app/src/examples/README.md` 与 `skills/cm-reporting-integration/SKILL.md` 的行为说明。

## 0.6.1

### Patch Changes

- 9d8643a: 修复只读模式下 SmelterList 主数据字段仍可编辑的问题。
  - 将冶炼厂主数据列的显式禁用条件统一合并为 `componentDisabled || localDisabled`，避免全局只读被局部逻辑覆盖。
  - 覆盖字段包括：`smelterNumber`、`smelterCountry`、`smelterIdentification`、`sourceId`、`smelterStreet`、`smelterCity`、`smelterState`（以及同类显式禁用列）。
  - 补充只读回归测试，并同步更新 README/示例文档/集成技能文档说明。

## 0.6.0

### Minor Changes

- 65b7145: 统一 SmelterList 字段语义为：`id` 作为唯一主键，`smelterNumber` 作为展示字段，`smelterId` 仅内部兼容保留。
  - 表格 `hasIdColumn` 列改为展示与编辑 `smelterNumber`，不再展示 `smelterId`。
  - 行内外部选择在缺失 `id` 时拒绝回写并提示错误，避免无主键数据进入列表。
  - Excel 导出覆盖策略改为基于稳定 `row.id` 判断，A 列写入值改为 `smelterNumber`。
  - Snapshot/Schema 与 legacy adapter 同步支持 `smelterNumber`，并弱化 `smelterId` 逻辑依赖。
  - 同步更新 README、Examples、集成技能文档与 i18n 文案，确保接入语义一致。

## 0.5.0

### Minor Changes

- 15eda75: 修正 SmelterList 行内外部选择的字段语义与回写规则：
  - 行 `id` 与冶炼厂识别号码（`smelterId` 列）严格分离：`id` 仅作为行主键，不再兜底映射到 `smelterId`。
  - 冶炼厂识别号码改为仅由宿主回写 `smelterNumber` 映射到 `smelterId` 列。
  - 同一 `metal` 下重复选择校验改为按回写 `id` 判重。
  - 保持行内外部选择成功后的基础字段锁定行为，并同步更新类型导出、README、Examples 与集成技能文档。

  宿主接入建议：
  - 外部回写时显式传入 `id`（数据主键）与 `smelterNumber`（识别号码），避免沿用旧的 `id -> smelterId` 兜底逻辑。

## 0.4.1

### Patch Changes

- d59cc4f: 完善 SmelterList 行内外部选择行为，提升宿主回写一致性：
  - 新增冶炼厂行时，行 ID 使用临时格式 `smelter-new-<timestamp>`。
  - 宿主在 `onPickSmelterForRow` 回写 `id` 后，覆盖临时行 ID。
  - 同一 `metal` 下禁止重复选择同一冶炼厂（优先按 `smelterId` 判重，缺失时按回写 `id` 判重）。
  - 新增重复选择提示文案，并同步更新对外 README / Examples / 技能文档说明。

## 0.4.0

### Minor Changes

- 0eb2134: 调整 SmelterList 的外部选择交互为“仅行内模式”：
  - 移除冶炼厂列表顶部“从外部选择”批量入口，仅保留“新增一行”。
  - 用户需先新增一行并选择 `metal`，再在该行触发行内外部选择。
  - 同步收敛公开集成接口：删除 `SmelterListIntegration.onPickSmelters`、`addMode`、`label` 相关能力。
  - 更新 `app/src/lib/README.md`、`app/src/examples/README.md` 与集成技能文档说明。

## 0.3.3

### Patch Changes

- c7a04b8: 完善 SmelterList 外部回写的 ID 映射行为：
  - 当宿主回写项提供 `smelterId` 时，继续优先使用 `smelterId`。
  - 当 `smelterId` 为空但存在 `id` 时，自动将 `id` 赋值到 `smelterId`。
  - 该规则同时覆盖批量外部选择与行内外部选择，并确保在 `saveDraft()/submit()` Snapshot 中回传 `smelterId`。
  - 补充对应单元测试与文档说明。

## 0.3.2

### Patch Changes

- c9b5a13: 调整 EMRT 的矿产申报范围默认行为：
  - EMRT 初始化空表单时默认选中当前版本全部矿种（含 dynamic-dropdown 版本）。
  - 在非只读模式下保留矿种范围可编辑能力，用户可继续按业务修改勾选。
  - 新增回归测试，确保 EMRT 默认全选与 AMRT 默认不预选行为长期稳定。

## 0.3.1

### Patch Changes

- 8035cc4: 修复 EMRT/AMRT 下 Checker 的冶炼厂门控一致性问题：
  - 对齐 `checker` 与 `summary` 的 `Smelter List` 门控逻辑：仅在矿种确实要求填写冶炼厂时，才统计 `smelterLookup` 相关必填进度与错误。
  - 修复可复现场景：用户先填写过冶炼厂行，后续将 `Q1/Q2` 改为否定导致冶炼厂不再必填时，不再出现“错误数为 0 但完成度下降”的状态不一致。
  - 新增回归测试覆盖门控开启/关闭两种路径，确保后续改动不回归。

## 0.3.0

### Minor Changes

- b474890: 新增外置保存/提交流程能力并解耦底部内置提交：
  - `CMReporting` 与 `CMReportingApp` 新增 `showPageActions`（默认 `true`），支持宿主隐藏底部翻页区。
  - 底部 `PageActions` 默认仅保留“上一页/下一页”，移除内置“提交”按钮与提交弹窗。
  - `CMReportingRef` / `useCMReporting` 新增：
    - `saveDraft()`：不校验必填，返回当前 `ReportSnapshotV1`；
    - `submit()`：执行内部校验，失败返回 `null` 并自动跳转 `checker`，成功返回 `ReportSnapshotV1`。
  - 同步更新 examples 与集成文档，明确“宿主自定义保存/提交”的推荐接入方式。

## 0.2.1

### Patch Changes

- 1eabb5a: 修复 `DateField` 在已有值时再次选择日期可能触发的运行时异常。
  - 抽离并统一日期值解析逻辑，优先严格解析 `YYYY-MM-DD`，兼容 `DD-MMM-YYYY` 历史展示格式。
  - 补齐 `dayjs` 周相关插件能力，确保与 `rc-picker` 运行时能力一致。
  - 新增 `DateField` 回归测试，覆盖有效值、兜底解析、无效值与周能力校验。

## 0.2.0

### Minor Changes

- f5d4aba: 支持公司信息完成日期（authorizationDate）在运行时兼容时间戳输入（秒级/毫秒级，含数字字符串），并自动归一化为 YYYY-MM-DD。
  - Snapshot 导入（parseSnapshot）支持该兼容行为。
  - setSnapshot / initialSnapshot 回填链路通过 setFormData 统一归一化。
  - 非法日期输入保持现有校验报错，不做静默修正。
  - 同步更新对外文档与集成说明。

## 0.1.7

### Patch Changes

- 7e31be3: 新增 `readOnly` 全局只读参数：支持在 `CMReporting` / `CMReportingApp` 层启用只读模式，统一禁用页面内编辑控件，并在 store action 层增加用户编辑写入拦截，避免绕过 UI 直接修改数据。

  同步更新接入文档、示例场景与集成 skill 参考文档，补充只读模式使用说明与排障指引。

## 0.1.6

### Patch Changes

- 4e9cd83: 构建流程新增 CSS 去层化后处理：发布前自动展开 `@layer`，确保 `styles.css` 为可直接消费的纯 CSS 产物，避免宿主项目（含 Tailwind v3）因层指令二次处理导致构建报错。

  同时在文档中补充样式消费契约说明：宿主无需（也不应）对该文件再次执行 Tailwind 编译。

## 0.1.5

### Patch Changes

- 5ebcc4b: 修复 `AppThemeScope` 在 Ant Design 5.22.x 下读取 `theme.useToken()` 时对 `cssVar` 的强依赖问题：当 `cssVar` 不存在时回退使用 `token` 值，避免运行时因 `undefined` 解构导致主题变量注入失败。

  同时补充 `AppThemeScope` 兼容性测试，覆盖「`cssVar` 缺失回退」与「`cssVar` 存在优先」两条路径。

## 0.1.4

### Patch Changes

- 22ac063: 移除 Declaration 页面中的 EMRT 矿种删减人工校对提示条，并清理相关状态与 i18n 冗余实现。

## 0.1.3

### Patch Changes

- db62401: 更新包内 README：补充模板覆盖、Peer dependencies、API/Ref/Hook、Snapshot 与 Excel 导出说明，优化 npm 使用文档可读性。

## 0.1.2

### Patch Changes

- f138bc9: 完善 npm 包元数据（repository/homepage/bugs/keywords/engines），并补充项目贡献与行为准则文档，提升外部使用与协作体验。
