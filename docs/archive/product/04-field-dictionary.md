# 字段级规范（入口）

## 使用方式
- 权威表：`docs/prd/field-dictionary.md`（跨模板字段标准化词典，含字段映射、类型、必填、约束、版本差异）。
- 本文提供**阅读与维护入口**，用于解释字段组织方式与扩展规则，避免重复维护大型表格。

## 字段规范模板（建议后续扩展时使用）
- 字段名（统一字段）
- 类型（文本/日期/下拉/列表）
- 适用模板与版本
- 是否必填（Checker/条件必填/Instructions）
- 依赖条件（如 Q1/Q2=Yes、Scope=Product）
- 选项与国际化（英文原值/中文显示）
- 来源与备注（模板 Instructions / Checker / 表结构）

## 字段分组（与词典一致）
1) 核心公司信息 + 申报范围
2) 产品清单（Product List）
3) Smelter List 关键列
4) Mine List 关键列（EMRT 2.0+ / AMRT 1.1–1.3）
5) 问题矩阵（Questions）
6) 公司层面问题（Company-level Questions）
7) 系统/辅助列（导出对齐用，默认只读/可隐藏）

## 核心字段解读（摘要）
- 公司名称：Legal Name，不可用缩写；所有模板必填。
- 申报范围或种类：Company / Product / User defined；Scope=User defined 时范围描述必填。
- 矿产申报范围：EMRT 2.0+ 下拉；AMRT 1.1/1.2 自由输入（<=10）；AMRT 1.3 下拉含 Other。
- 地址：AMRT 1.1–1.3 Instructions 明确必填，但 Checker 未标记（模板内不一致）。
- 生效/授权日期：格式 DD-MMM-YYYY；CMRT 6.01–6.22 与 6.31+ 的范围不同（产品仅提示）。

## 系统/辅助列说明（摘要）
- Smelter List：Standard Smelter Name/Country Code/Combined 等为自动回填或辅助列。
- Mine List：Country Code/State Code/Missing Entry Check 等为自动回填或辅助列。
- 系统列默认只读/可隐藏，用于导出对齐（详见字段词典 7.x）。

## 相关来源
- 字段权威表：`docs/prd/field-dictionary.md`
- 版本差异：`docs/diffs/*`
- 术语：`docs/prd/definitions-summary.md` / `docs/prd/definitions-master.md`
