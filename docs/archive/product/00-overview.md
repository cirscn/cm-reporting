# 概览与范围

## 背景
冲突矿产项目需要统一 CMRT/EMRT/CRT/AMRT 多模板、多版本的编辑与查看规则，并将 Excel 模板中的 Instructions + Checker + 表格结构沉淀为可实施的产品规则集。当前 `docs/` 中已有 PRD、差异、验收与词典，但分散且偏工程化，需要转为可读、可执行对齐的产品文档。

## 目标
- 形成一套可维护的产品文档体系，支撑 UI/规则/导出设计。
- 明确模板与版本矩阵、核心数据结构、字段语义与规则优先级。
- 提供版本升级与兼容策略的产品口径。

## 版本与模板范围（第一期基线）
- CMRT：6.01–6.5
- EMRT：1.1–2.1
- CRT：2.2–2.21
- AMRT：1.1–1.3

## 模板定位（来源：`docs/prd/conflict-minerals-prd.md`）
- CMRT：面向 3TG 披露
- EMRT：扩展矿产披露（含 2.0+ Mine List）
- CRT：钴披露
- AMRT：其他矿产披露（1.3 具备更多下拉/查找能力）

## 范围与非目标
- 范围：定义需求、字段、规则、校验、版本差异与升级策略。
- 非目标：实现 Excel 公式/宏引擎；定义后端 API 与持久层细节。

## 参考索引
- 统一 PRD：`docs/prd/conflict-minerals-prd.md`
- 字段词典：`docs/prd/field-dictionary.md`
- 差异与验收：`docs/diffs/README.md`
- 术语：`docs/prd/definitions-summary.md` / `docs/prd/definitions-master.md`
