# cm-reporting

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
