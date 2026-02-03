# CMRT 模板（6.01–6.5）差异与逻辑说明（产品可用版）

> 基线版本：CMRT 6.5（本地模板解析）
> 背景补充：CMRT = **Conflict Minerals Reporting Template**，RMI 创建的免费标准化模板，面向下游企业披露至冶炼厂之前的供应链信息；若为 3TG 冶炼/精炼厂，建议在 Smelter List 填本公司。

## 1. Declaration（申报/声明）—公司信息
**字段清单（公司信息区）**
| 字段 | 必填 | 输入类型 | 校验/选项 | 备注 |
|---|---|---|---|---|
| 请选择你的语言 | 否 | 下拉选择 | English / 中文 Chinese / 日本語 Japanese / 한국어 Korean / Français / Português / Deutsch / Español / Italiano / Türkçe | 多语言选择（下拉） |
| 公司名称 (*) | 是 | 文本 | 无显式格式校验 | Legal Name；不得使用缩写；可包含其他商业名称/DBA（Instructions） |
| 申报范围或种类 (*) | 是 | 下拉选择 | A. Company / B. Product (or List of Products) / C. User defined [Specify in 'Description of scope'] | 影响 产品清单 与范围描述 |
| 范围描述 | 否 | 文本 | 无显式格式校验 | 当 申报范围=User defined 时必填 |
| 公司唯一识别信息 | 否 | 文本 | 无显式格式校验 |  |
| 公司唯一授权识别信息 | 否 | 文本 | 无显式格式校验 |  |
| 地址 | 否 | 文本 | 无显式格式校验 |  |
| 联系人姓名 (*) | 是 | 文本 | 无显式格式校验 |  |
| 电子邮件 - 联系人 (*) | 是 | 文本 | 无显式邮箱格式校验 | 无邮箱可填 `not available`/`n/a`，空白可能导致模板错误（Instructions） |
| 电话 - 联系人 (*) | 是 | 文本 | 无显式格式校验 |  |
| 授权人 (*) | 是 | 文本 | 无显式格式校验 | 授权人可与联系人不同；不可填 `same` 等占位（Instructions） |
| 职务 - 授权人 | 否 | 文本 | 无显式格式校验 |  |
| 电子邮件 - 授权人 (*) | 是 | 文本 | 无显式邮箱格式校验 | 无邮箱可填 `not available`/`n/a`，空白可能导致模板错误（Instructions） |
| 电话 - 授权人 | 否 | 文本 | 无显式格式校验 | 模板说明为可选 |
| 生效日期 (*) | 是 | 日期 | 日期格式：DD-MMM-YYYY（Instructions + DV） | **6.01–6.22：DV 范围 31-Dec-2006 – 31-Mar-2026；6.31+：DV 下限 >31-Dec-2006**；Excel 可将 `YYYY-MM-DD` 自动转为 `DD-MMM-YYYY`；产品层面仅提示不阻断 |

**申报范围 → 产品清单 联动**
- 申报范围=Product (or List of Products)：产品清单 必填（至少 回复方的产品编号）
- 申报范围=User defined：必须填写范围描述

**说明（来自 Instructions，产品层面仅提示）**
- 公司信息 / 申报问题 / A–H / Smelter List 模板文字要求仅以英文作答；产品执行为提示（不强制校验）。
- 填写表格时，单元格条目不应以“=”或“#”开头（模板提示，产品层面可做弱校验）。
- 模板建议导出/存档文件名：companyname-date.xls（date as YYYY-MM-DD，示例格式与日期字段不同）。
- 填写“冶炼厂联系人姓名/电子邮件”前，需确认已取得联系人同意（模板提示）。

**DV 文案（非日期）**
- 6.01+：申报范围下拉错误提示：errorTitle=“Required Field”；error=“Select from dropdown options to declare survey scope”。  
- 6.22+：联系人姓名为空错误提示：errorTitle=“Blank Field”；error=“Please enter your contact name.”  
- 6.31+：新增公司信息输入提示（prompt 文案，非错误）：  
  - Company Name：Insert your company's Legal Name...  
  - Declaration Scope or Class：Select your company's Declaration Scope...（A/B/C）  
  - Contact Name / Contact Email / Contact Phone / Authorizer Name / Authorizer Email：对应输入说明（模板 prompt）。  

**术语提示（产品释义）**
- SEC：美国证券交易委员会。
- CAHRA：受冲突影响和高风险地区。
- IPC1755：供应链尽职调查信息交换标准（IPC 1755）。
- EU：欧盟。

## 2. 申报问题（1–8）—3TG 金属矩阵
> 结构：每道题都要对 **钽/锡/金/钨** 分别回答；每个金属都有 **回答（下拉）** 和 **注释（备注）**。

**Q1 是否在产品或生产流程中有意添加或使用任何 3TG？（必填）**
- 钽(*)：回答 = Yes / No；注释 可填
- 锡(*)：回答 = Yes / No；注释 可填
- 金(*)：回答 = Yes / No；注释 可填
- 钨(*)：回答 = Yes / No；注释 可填

**Q2 是否有任何 3TG 仍存在于产品中？（必填）**
- 钽(*)：回答 = Yes / No；注释 可填
- 锡(*)：回答 = Yes / No；注释 可填
- 金(*)：回答 = Yes / No；注释 可填
- 钨(*)：回答 = Yes / No；注释 可填

**Q3 是否从 SEC 所指国家采购 3TG？（必填）**
- 钽(*)：回答 = Yes / No / Unknown；注释 可填
- 锡(*)：回答 = Yes / No / Unknown；注释 可填
- 金(*)：回答 = Yes / No / Unknown；注释 可填
- 钨(*)：回答 = Yes / No / Unknown；注释 可填

**Q4 是否从 CAHRA 采购 3TG？（必填）**
- 钽(*)：回答 = Yes / No / Unknown；注释 可填
- 锡(*)：回答 = Yes / No / Unknown；注释 可填
- 金(*)：回答 = Yes / No / Unknown；注释 可填
- 钨(*)：回答 = Yes / No / Unknown；注释 可填

**Q5 是否 100% 来自回收/报废料？（必填）**
- 钽(*)：回答 = Yes / No / Unknown；注释 可填
- 锡(*)：回答 = Yes / No / Unknown；注释 可填
- 金(*)：回答 = Yes / No / Unknown；注释 可填
- 钨(*)：回答 = Yes / No / Unknown；注释 可填

**Q6 相关供应商响应率是多少？（必填）**
- 钽(*)：回答 = 100% / Greater than 90% / Greater than 75% / Greater than 50% / 50% or less / None；注释 可填
- 锡(*)：回答 = 100% / Greater than 90% / Greater than 75% / Greater than 50% / 50% or less / None；注释 可填
- 金(*)：回答 = 100% / Greater than 90% / Greater than 75% / Greater than 50% / 50% or less / None；注释 可填
- 钨(*)：回答 = 100% / Greater than 90% / Greater than 75% / Greater than 50% / 50% or less / None；注释 可填

**Q7 是否识别出全部 3TG 冶炼厂？（必填）**
- 钽(*)：回答 = Yes / No；注释 可填
- 锡(*)：回答 = Yes / No；注释 可填
- 金(*)：回答 = Yes / No；注释 可填
- 钨(*)：回答 = Yes / No；注释 可填

**Q8 是否已在声明中报告全部冶炼厂？（必填）**
- 钽(*)：回答 = Yes / No；注释 可填
- 锡(*)：回答 = Yes / No；注释 可填
- 金(*)：回答 = Yes / No；注释 可填
- 钨(*)：回答 = Yes / No；注释 可填

**依赖关系（来自 Instructions）**
- Q3–Q8：仅当该金属在 Q1/Q2 里为 Yes 时才需要回答。

## 3. 公司层面问题（A–H）—尽调
> 结构：每题一个 回答（下拉）+ 注释（备注）

**题干（与模板一致） + 允许值**  
| 题号 | 题干（模板原文） | 回答 允许值 |
|---|---|---|
| A | 贵公司是否已制定负责任矿产采购政策？ | Yes / No |
| B | 贵公司的负责任矿产采购政策是否公开发布于贵公司网页上？（备注 - 如果是，请在注释字段中注明 URL。） | Yes / No |
| C | 您是否要求您的直接供应商从其尽职调查实践已被被独立第三方审核机构验证过的冶炼厂采购 3TG？ | Yes / No |
| D | 贵公司是否已实施负责任矿产采购的尽职调查措施？ | Yes / No |
| E | 贵公司是否开展了相关供应商的冲突矿产调查？ | Yes, in conformance with IPC1755 (e.g., CMRT) / Yes, using other format (describe) / No |
| F | 贵公司是否根据公司期望来审查供应商提交的尽职调查信息？ | Yes / No |
| G | 贵公司的验证程序是否包括纠正措施管理？ | Yes / No |
| H | 贵公司是否需要提交年度冲突矿产披露？ | Yes, with the SEC / Yes, with the EU / Yes, with the SEC and the EU / No |

## 4. Smelter List（冶炼厂清单）
**关键逻辑（来自 Instructions）**
- 冶炼厂查找为下拉字段，包含已知冶炼厂，以及 **Smelter not listed / Smelter not yet identified** 两个特殊选项。
  - **Smelter not listed**：表示不在目录中，需手工填写 冶炼厂名称，并手选 冶炼厂所在国家或地区（模板明确说明）。
  - **Smelter not yet identified**：标准冶炼厂名称=Unknown；国家由 Smelter Look‑up 回填（多数为 Unknown，**6.5 的 Tungsten 行为空**）。该选项不会自动回填到“冶炼厂名称”，仍受“冶炼厂名称必填”提示（需手工填写，可填 Unknown）。
- 若已知冶炼厂识别号码，可先填 冶炼厂识别号码输入列，其他信息自动填充。
- 为触发查找，需先填写 金属 → 冶炼厂查找（从左到右）。
- 若贵公司为冶炼厂/精炼厂，模板建议在冶炼厂清单中填写本公司信息（产品层面提示）。

**填写路径（来自 Smelter List 说明）**
- 选项 A：已知冶炼厂识别号码 → 在“冶炼厂识别号码输入列”输入；其余列自动填充，“冶炼厂名称”变为灰色。
- 选项 B：已知金属 + 冶炼厂查找名称 → 先选金属，再从“冶炼厂查找”下拉选择（错误组合将触发红色）。
- 选项 C：已知金属 + 冶炼厂名称 → 在“冶炼厂查找”选择“冶炼厂未列出”，再手工填写“冶炼厂名称”“冶炼厂所在国家或地区”，并补齐其他信息列。

**与申报区联动（模板条件格式/校验）**
- 6.4+：若对应金属在申报区 Q1/Q2 未作答（模板引用申报区状态），该行 金属 / 冶炼厂查找 会标红。
- 金属 + 冶炼厂查找 必须是清单中的合法组合，否则标红。
- 6.22+：当 冶炼厂查找 ≠ Smelter not listed 时，冶炼厂名称为空 → 标红。
- 当 冶炼厂查找 = Smelter not listed 时，冶炼厂名称 + 冶炼厂所在国家或地区 必须填写，否则标红。
- Smelter not yet identified：冶炼厂名称列不自动回填，仍按“冶炼厂名称必填”提示；国家列由 Look‑up 回填（可能 Unknown 或空）。

**字段清单（顺序 + 规则）**
| 字段 | 必填 | 输入方式 | 校验/下拉 | 说明 |
|---|---|---|---|---|
| 冶炼厂识别号码输入列 | 否 | 手动填写 | — | 有值时触发自动填充 |
| 金属 (*) | 是 | 下拉选择 | 目录内金属 | 与 冶炼厂查找 关联 |
| 冶炼厂查找 (*) | 是 | 下拉选择 | 冶炼厂目录 + Smelter not listed + Smelter not yet identified | 关键选择 |
| 冶炼厂名称 | 否 | 手动填写 | — | Not listed 时必填；not yet identified 不自动回填但仍需填写 |
| 冶炼厂所在国家或地区 (*) | 是 | 自动/手选 | 国家列表（约 249 项） | Not listed 时需手选；not yet identified 由 Look‑up 回填（可能 Unknown 或空） |
| 冶炼厂识别 | 否 | 自动填充 | — |  |
| 冶炼厂出处识别号 | 否 | 自动填充 | — |  |
| 冶炼厂所在街道 | 否 | 自动填充 | — |  |
| 冶炼厂所在城市 | 否 | 自动填充 | — |  |
| 冶炼厂地址：州/省 | 否 | 自动填充 | — |  |
| 冶炼厂联系人 | 否 | 手动填写 | — |  |
| 冶炼厂联系人电子邮件 | 否 | 手动填写 | — |  |
| 建议的后续步骤 | 否 | 手动填写 | — |  |
| 填写矿井名称，或如果所用矿产来自于回收料和报废料，请填写“回收”或“报废”。 | 否 | 手动填写 | — |  |
| 填写矿井所在国家或地区，或如果所用矿产来自于回收料和报废料，请填写“回收”或“报废”。 | 否 | 手动填写 | — |  |
| 冶炼厂的被冶炼物料是否 100% 来自于回收料或报废料？ | 否 | 手动填写 | Yes / No / Unknown |  |
| 注释 | 否 | 手动填写 | — |  |
| Standard Smelter Name | 否 | 自动填充 | — | 模板原文为英文 |
| Country Code | 否 | 自动填充 | — | 模板原文为英文 |
| State / Province Code | 否 | 自动填充 | — | 模板原文为英文 |
| Smelter not yet identified | 否 | 自动填充 | — | 系统列（非用户输入） |
| Smelter Not Listed | 否 | 自动填充 | — | 系统列（非用户输入） |
| Unknown | 否 | 自动填充 | — | 系统列 |

> 说明：Smelter not listed / Smelter not yet identified 为 **冶炼厂查找 下拉选项**，不是独立输入字段；模板原文表头含“(1)”，UI 可忽略括号。

## 5. Product List（产品清单）
- 仅当 申报范围=Product 时必须填写

**字段清单（顺序 + 规则）**
| 字段 | 必填 | 输入方式 | 校验/下拉 | 说明 |
|---|---|---|---|---|
| 回复方的产品编号 (*) | 是 | 手动填写 | — | 必填 |
| 回复方的产品名称 | 否 | 手动填写 | — | 可选 |
| 注释 | 否 | 手动填写 | — | 可选 |

## 6. Checker 校验规则（必填与联动）
**Checker 明确列为必填（F=1）**  
- 公司信息：公司名称、申报范围或种类、联系人姓名、电子邮件 - 联系人、电话 - 联系人、授权人、电子邮件 - 授权人、生效日期。  
- Q1–Q8：钽/锡/金/钨均需逐题回答（每题每金属）。  
- 公司层面问题 A–H：全部必填回答。  
- Smelter List：Tantalum / Tin / Gold / Tungsten 均要求提供冶炼厂清单。  

**条件必填（来自 Instructions/Declaration/Smelter 规则）**  
- 申报范围=Product (or List of Products) → Product List 必填（至少“回复方的产品编号”）。  
- 申报范围=User defined → 范围描述必填。  
- Q3–Q8：仅当对应金属在 Q1/Q2 为 Yes 时要求填写（模板说明）。  
- 任一金属在 Q1/Q2 为 Yes → 公司层面问题 A–H 必答（模板说明）。  
- B 题若回答 Yes → 注释需提供 URL（模板提示）。  
- E 题若回答 “Yes, using other format (describe)” → 注释必填（条件格式提示）。  
- Smelter List 中选择 “Smelter not listed” 的行 → 冶炼厂名称与国家/地区必填。

## 7. 版本差异（6.01–6.5）—中文模板对比结论

> 说明：以下对比基于 `app/templates/CMRT` 下的中文模板。

### 6.01 → 6.1（Revision 6.1 April 28, 2021）
- **Product List 表头修复**：第三列表头由“0/空值”修复为“注释”。
- **其他结构/字段**：未发现变化（Q1–Q8 / A–H / Smelter List 表头一致）。

### 6.1 → 6.22（Revision 6.22 May 11, 2022）
- 未发现结构或字段变化。

### 6.22 → 6.31（Revision 6.31 May 26, 2023）
- 未发现结构或字段变化。

### 6.31 → 6.4（Revision 6.4 April 26, 2024）
- 未发现结构或字段变化（字段/表头保持一致）。

### 6.4 → 6.5（Revision 6.5 April 25, 2025）
- **Product List 字段语义变化**：
  - “制造商的产品序号/名称”变为“回复方的产品编号/名称”。
- **Definitions / Instructions 文案更新**：
  - RMAP “audit protocol” 相关措辞与链接更新为 “assessment standard / standards”（不影响字段逻辑，仅为说明文本更新）。
- **其他结构/字段**：未发现变化。
