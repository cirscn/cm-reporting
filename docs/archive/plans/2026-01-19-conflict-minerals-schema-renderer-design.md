> **内部计划文档（非产品交付）**  
> 本文用于研发/实施计划，不作为产品需求基线；对外请以 `docs/prd/` 与 `docs/diffs/` 为准。

# Conflict Minerals SchemaRenderer Design

**Current Stage:** 当前阶段仅深挖 Excel 规则并形成完整需求；设计为后续实现参考，暂不进入 Code/React。

## Goal
用“Rule Graph + Canonical Schema + Adapter”的方式，把 CMRT/EMRT/CRT 各版本 Excel 规则抽象为统一 schema，并由 React + AntD + Tailwind 渲染成可编辑/可查看页面，支持多版本共存、可插拔扩展与国际化。

## Architecture
1. **Canonical Schema**：以 `SchemaBundle` 为中心，描述 Tabs/Sections/Fields/Rules/I18n/Overlays。  
2. **Adapter Layer**：把具体版本（CMRT 6.01–6.5 / EMRT / CRT）映射到 Canonical Schema，负责字段差异、规则差异、UI 差异。  
3. **Rule Graph Engine**：统一执行 `compute/validate/visibility/style` 规则，基于依赖触发与表达式计算。  
4. **Renderer**：将 schema 转换为 AntD Form + Table / List 组件，统一交互与校验。

## Data Model
- **data** 顶层固定结构：`name/questionnaireType/cmtCompany/cmtRangeQuestions/cmtCompanyQuestions/cmtSmelters/cmtParts/minList`  
  仅允许 `data._meta` 作为扩展入口。  
- **field.dataPath** 以 JSON path/点路径描述，渲染层不理解业务含义，仅做绑定与校验。

## Rules
- **compute**：公式/推导值，支持 `Expr` 表达式（ref/value/op）。  
- **validate**：校验表达式 + 中文错误消息。  
- **visibility/style**：控制显示与样式（如高亮冲突、红字提醒）。  
规则必须通过 `deps` 建立依赖，避免全量重算。

## Rendering
- **Tabs** 对应 Declaration / Smelter List / Product List / Mine List 等。  
- **Fields** 以 `FieldDef.type` 驱动组件选择（Input/Select/DatePicker/Switch/表格列编辑器）。  
- **Tables** 用 `Form.List` 管理行，保留虚拟列表开关；默认普通表格。

## Validation
- **Zod** 用于接口 data 校验与 schema 级校验。  
- **TS** 类型约束静态校验。  
AntD `validateMessages` 统一中文提示；Zod 错误映射成中文后投递到 Form。

## Versioning & Overlays
- `baseVersion` 指向最低可兼容版本。  
- `overlays` 按版本 patch 字段/规则/section/tab，实现“差量叠加”。  
- 新版本差异只在 overlay 中表达，保持核心 schema 稳定。

## Extensibility
- `optionsRef` 允许动态选项源。  
- `ui.props` 透传 AntD props，避免二次封装。  
- 新矿种/新表单以新的 bundle + overlay 接入，无需改 renderer。

## Performance
- 使用 `startTransition` 推迟规则批量刷新。  
- 对大表提供虚拟列表开关（默认关）。  
- 规则执行按 deps 精准触发，避免全表 recalculation。
