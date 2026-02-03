# 架构总览与分层说明

## 目标
在不落地真实业务代码前，形成可执行的工程架构基线：统一四模板（CMRT/EMRT/CRT/AMRT）规则承载方式、组件复用边界、数据契约与校验策略，确保后续实现可持续扩展与版本差异可追溯。

## 事实来源（单一真相）
- PRD：`docs/01-04-*-prd.md` 与 `docs/05-cross-template.md`
- 规则快照：`analysis/template_rules_report.json`
- Instructions 关键词：`analysis/instructions_key_lines.json`
- 原型参考：`docs/assets/prototypes/*.html`
- 样例数据：`data/cmrt.json`（仅作契约示例）

## 覆盖范围
- 四模板统一框架 + 版本差异显式配置
- 以配置驱动 UI 与规则逻辑（避免逐模板硬编码）
- 规则与表单统一通过 Zod schema 建模

## 分层结构
- **core/**：schema、rules、transform、template registry
- **core/i18n/**：文案与枚举显示值管理
- **ui/**：可复用组件（字段、表格、checker）
- **app/**：路由、页面编排、模板入口
- **infra/**：构建、样式体系、工程约束（Vite + TS + Tailwind + Antd v6）

## 关键原则
- 显式差异：模板/版本差异必须进入 registry，不得隐藏在组件内
- 规则来源可追溯：任何规则都要能追溯到 PRD/Excel 证据
- 显示值 ≠ 内部值：对齐 Excel “显示 100% / 实际值 1”等差异
- 组件复用优先：可配置列/字段优先于复制页面

## 交付物
- `docs/architecture/00-overview.md`：目标与分层
- `docs/architecture/01-system-context.md`：系统边界与数据流
- `docs/architecture/02-module-breakdown.md`：模块拆分与职责
- `docs/architecture/03-component-reuse-matrix.md`：复用矩阵
- `docs/architecture/04-rules-and-schema.md`：规则与 schema 体系
- `docs/architecture/05-data-contracts.md`：数据契约与状态模型
- `docs/architecture/06-i18n.md`：国际化架构与文案管理
- `docs/architecture/07-react-best-practices.md`：React 性能与工程准则
- `docs/architecture/08-code-review-checklist.md`：Code Review 检查清单
- `docs/architecture/09-pr-template.md`：PR 模板
- `docs/architecture/10-implementation-phases.md`：实现阶段与验收

## 首个垂直切片建议
- 先完成“统一框架 + 规则承载方式”，再落地单模板（建议 CMRT 6.5）。
- 以垂直切片验证：registry、schema、checker、表格组件的正确性与可复用性。
