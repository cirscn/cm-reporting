# 冲突矿产产品文档（产品化可读版）

> 目的：将 `docs/` 现有材料整理为可读、可维护、可实施对齐的产品文档，支撑冲突矿产项目的前期设计与后续研发实现。
> 事实来源：仅引用现有文档（`docs/prd`、`docs/diffs`、`docs/plans`、`docs/i18n`）。

## 入口索引
- 概览与范围：`docs/product/00-overview.md`
- 用户流程（填写/校验/导出）：`docs/product/01-user-flows.md`
- 架构与规则体系：`docs/product/02-architecture.md`
- 数据模型与实体关系：`docs/product/03-data-model.md`
- 字段级规范（入口）：`docs/product/04-field-dictionary.md`
- 规则与校验优先级：`docs/product/05-rules-and-validation.md`
- 版本策略与升级影响：`docs/product/06-versioning.md`
- 国际化与语言口径：`docs/product/07-i18n.md`

## 主要来源
- PRD 统一骨架：`docs/prd/conflict-minerals-prd.md`
- 字段标准化词典：`docs/prd/field-dictionary.md`
- 术语与定义：`docs/prd/definitions-summary.md` / `docs/prd/definitions-master.md` / `docs/prd/appendix-definitions.md`
- 模板差异与验收：`docs/diffs/README.md` + `docs/diffs/*`
- 版本化验收用例：`docs/diffs/acceptance/README.md`
- 计划与推导过程：`docs/plans/*.md`

## 维护原则
- **单一事实源**：字段、规则、版本差异只来自现有文档，冲突处明确标注来源。
- **最小惊讶**：不引入实现细节，只描述产品行为与规则口径。
- **可持续维护**：新增版本/模板时仅补充对应模块与差异块。
