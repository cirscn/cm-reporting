# Code Review Checklist（含 Vercel React Best Practices）

## 结构与分层
- registry 差异是否集中在 `core/registry`？
- ui 是否避免模板/版本分支判断？
- transform 是否承担显示值/内部值映射？

## 规则与校验
- 规则是否可追溯到 PRD/Excel 证据？
- checker 是否仅有 error/pass（无 warning）？
- gating/required 是否只由 rule engine 输出？

## i18n
- 文案是否全部来自 i18n key？
- 枚举显示值是否与内部值分离？
- 语言包是否覆盖新增 key（en/zh 同步）？

## 性能（Vercel 规则）
- `async-*`：是否存在串行 await 可并行化？
- `bundle-*`：是否出现 barrel import 或无必要重依赖？
- `rerender-*`：组件是否拆分并 memo；effect 依赖是否为原始值？
- `rendering-*`：长列表是否支持虚拟滚动或 content-visibility？

## useEffect 与工具库
- 是否将派生状态放入 useEffect（应避免）？
- 是否用 `ahooks` 替代手写副作用/节流/防抖逻辑？
- 是否使用 `lodash-es` 且避免全量导入？

## 工程一致性
- 目录与命名是否遵循架构文档？
- 新增配置/常量是否有来源说明？
- 是否提供最小验证路径与本地运行说明？
