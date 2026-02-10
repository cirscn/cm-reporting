# cm-reporting

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
