# 模块拆分与职责

## core
- `core/registry`：模板/版本定义入口，输出 `TemplateDefinition`
- `core/schema`：Zod schema 生成器与共享字段类型
- `core/rules`：规则引擎（gating/required/DV/checker）
- `core/transform`：外部数据与内部状态映射（含显示值/内部值）
- `core/i18n`：语言包、key 管理与格式化

## ui
- `ui/fields`：通用字段组件（Text/Select/Date/Radio/Checkbox）
- `ui/forms`：组合型表单（CompanyInfo、MineralScope）
- `ui/tables`：复用表格（Smelter/Mine/Product）
- `ui/checker`：校验结果列表与定位
- `ui/layout`：通用布局（Header/Progress/Actions）

## app
- `app/routes`：路由与模板入口
- `app/pages`：模板页面编排（组合 ui + core）
- `app/store`：表单状态容器（细粒度分片）

## infra
- `infra/build`：Vite/TS 约束、路径别名
- `infra/style`：Tailwind + Antd Token 策略
- `infra/lint`：ESLint/Prettier 规范

## 依赖关系
- app 依赖 ui + core
- ui 依赖 core（仅通过 types 与 rule 输出，不读取 registry）
- core 不依赖 app/ui

## 约束
- 任何模板差异只允许出现在 core/registry。
- ui 组件不得出现模板/版本分支判断。
