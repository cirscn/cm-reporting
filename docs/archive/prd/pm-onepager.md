# 冲突矿产模板产品一页摘要（PM 版）

> 目标：用一页说明本期覆盖范围、关键差异与统一执行口径，便于产品评审与研发落地。  
> 详细规则：`docs/prd/conflict-minerals-prd.md`、`docs/prd/field-dictionary.md`、`docs/diffs/*.md`。

## 1. 覆盖范围
- 模板/版本：CMRT 6.01–6.5 / EMRT 1.1–2.1 / CRT 2.2–2.21 / AMRT 1.1–1.3
- 口径优先级：Instructions/表内说明 > 条件格式/Checker > 实现约束

## 2. 统一执行口径（产品层）
- 日期格式：DD-MMM-YYYY；Excel 可将 `YYYY-MM-DD` 自动转为 `DD-MMM-YYYY`。  
  DV 范围：EMRT/CRT/AMRT 为 31-Dec-2006 – 31-Mar-2026；CMRT 6.01–6.22 为 31-Dec-2006 – 31-Mar-2026，6.31+ 仅下限 >31-Dec-2006。**超出仅提示不阻断**。
- 语言要求：模板建议英文填写，中文环境验证仍以英文选项值为准（**产品仅提示不强制**）。
- 输入限制提示：文本不应以 “=” 或 “#” 开头（仅提示）。
- 下拉值大小写混用：实现需**大小写不敏感**。
- 系统列/自动回填列：**只读/可隐藏**（与 Excel 对齐）。

## 3. 结构差异速览
- **Mine List**：仅 EMRT 2.0+ / AMRT 1.1–1.3。
- **Minerals Scope**：仅 AMRT（1.1–1.3）。
- **Smelter Look-up**：CMRT/EMRT/CRT/AMRT 1.3 有；AMRT 1.1/1.2 无。

## 4. 矿种范围与问题区（核心差异）
- CMRT：固定 3TG（钽/锡/金/钨）。  
- CRT：固定 Cobalt。  
- EMRT 1.1–1.3：固定 Cobalt/Mica；Q1 选项含 **Not applicable for this declaration**。  
- EMRT 2.0+：动态矿种（Cobalt/Copper/Graphite/Lithium/Mica/Nickel）；Q1 选项含 **Not declaring**；Delete [Mineral] 会移除行但答案不自动重排；矿种按字母序输出。
- AMRT 1.1/1.2：矿种自由输入 ≤10，模板预填默认矿种（1.1 英文、1.2 中文；矿种同 Aluminium/Chromium/Copper/Lithium/Nickel/Silver/Zinc），可覆盖；按文本排序输出。  
- AMRT 1.3：矿种下拉（含 Other [specify below]），Other 需在 D15:I16 输入并参与排序。

## 5. 核心联动规则（跨模板）
- Scope=Product → Product List 必填。  
- Scope=User defined → 范围描述必填。
- Smelter not listed → 冶炼厂名称 + 国家/地区必填（含 Look-up 模板）。  
- Smelter not yet identified：标准冶炼厂名称=Unknown；国家回填口径不同（CMRT/CRT 多为 Unknown；EMRT/AMRT 为空）；**不自动回填到手填名称列**。

## 6. Mine List 关键规则
- 触发：金属列有值即行激活。
- 必填提示：  
  - 从该矿厂采购的冶炼厂的名称  
    - EMRT 2.1 / AMRT 1.3 为下拉（Smelter List 过滤）  
    - EMRT 2.0 / AMRT 1.1–1.2 为手填  
  - 矿厂所在国家或地区（下拉）
- 矿厂名称无条件格式提示，**建议填写但不强制**。

## 7. 版本新增点（高频影响）
- EMRT 2.0：新增 Mine List；矿种扩展为 6 种；Smelter List 表头修正。  
- EMRT 2.1：Product List 新增“请求方产品编号/名称”；Smelter List 新增 Combined Metal/Combined Smelter；Mine List 冶炼厂名称为下拉。
- CRT 2.21：Q2 新增 “DRC or adjoining countries only”；G 题新增 “Yes, Using Other Format (Describe)”。
- AMRT 1.3：新增 Smelter Look-up；Smelter/Mine List 均新增下拉联动。

## 8. 已知不一致/风险提示
- AMRT 地址字段：Instructions 要求必填，但 Declaration 未标 * 且 Checker 未列（模板内部不一致）。  
- AMRT 1.1/1.2 Smelter List：国家为必填列但条件格式未单独提示。  
- CRT 2.2 存在 cfExt 条件格式，需人工核验高亮表现。

## 9. 参考文档
- 规则主文档：`docs/prd/conflict-minerals-prd.md`
- 字段词典：`docs/prd/field-dictionary.md`
- 版本差异：`docs/diffs/cmrt.md` / `docs/diffs/emrt.md` / `docs/diffs/crt.md` / `docs/diffs/amrt.md`
- 条件格式矩阵：`docs/diffs/conditional-format-matrix.md`
- 验收清单：`docs/diffs/acceptance-checklist.md`
