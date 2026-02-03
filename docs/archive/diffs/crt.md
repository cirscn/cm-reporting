# CRT 模板（2.2–2.21）差异与逻辑说明（产品可用版）

> 基线版本：CRT 2.21（本地模板解析）
> 背景补充：CRT = **Cobalt Reporting Template**，RMI 创建的免费标准化模板，面向下游企业披露至冶炼厂之前的供应链信息；若为冶炼/精炼厂，建议在 Smelter List 填本公司。

## 1. Declaration（申报/声明）—公司信息
**字段清单（公司信息区）**
| 字段 | 必填 | 输入类型 | 校验/选项 | 备注 |
|---|---|---|---|---|
| 请选择你的语言 | 否 | 下拉选择 | English / 中文 Chinese / 日本語 Japanese / 한국어 Korean | 多语言选择（下拉） |
| 公司名称（*） | 是 | 文本 | 无显式格式校验 | Legal Name；不得使用缩写；可包含其他商业名称/DBA（Instructions） |
| 申报范围或种类 (*) | 是 | 下拉选择 | A. Company / B. Product (or List of Products) / C. User defined [Specify in 'Description of scope'] | 影响 产品清单 与范围描述 |
| 范围描述 | 否 | 文本 | 无显式格式校验 | 申报范围=User defined 时必填 |
| 公司唯一识别信息 | 否 | 文本 | 无显式格式校验 |  |
| 公司唯一授权识别信息 | 否 | 文本 | 无显式格式校验 |  |
| 地址 | 否 | 文本 | 无显式格式校验 |  |
| 联系人姓名 (*) | 是 | 文本 | 无显式格式校验 |  |
| 联系人电邮地址 (*) | 是 | 文本 | 无显式邮箱格式校验 | 无邮箱可填 `not available`/`n/a`，空白可能导致模板错误（Instructions） |
| 联系人电话 (*) | 是 | 文本 | 无显式格式校验 |  |
| 授权人姓名 (*) | 是 | 文本 | 无显式格式校验 | 授权人可与联系人不同；不可填 `same` 等占位（Instructions） |
| 授权人职务 | 否 | 文本 | 无显式格式校验 |  |
| 授权人电邮地址 (*) | 是 | 文本 | 无显式邮箱格式校验 | 无邮箱可填 `not available`/`n/a`，空白可能导致模板错误（Instructions） |
| 授权人电话 | 否 | 文本 | 无显式格式校验 | 模板说明为可选 |
| 授权日期 (*) | 是 | 日期 | 日期格式：DD-MMM-YYYY（Instructions + DV） | 日期范围：31-Dec-2006 – 31-Mar-2026（DV between 39082–46112）；Excel 可将 `YYYY-MM-DD` 自动转为 `DD-MMM-YYYY`；产品层面仅提示不阻断 |

**说明（来自 Instructions）**
- 公司资料填写说明：模板文字要求仅以英文作答；产品执行为提示（不强制校验）
- 模板要求填写完毕日期为 DD-MMM-YYYY；文件名示例为 companyname-date.xlsx（date as YYYY-MM-DD，示例格式与日期字段不同）。
- 填写“冶炼厂联系人姓名/电子邮件”前，需确认已取得联系人同意（模板提示）。

**DV 文案（非日期）**
- 申报范围下拉错误提示：errorTitle=“Required Field”；error=“Select from dropdown options to declare survey scope”。  
**术语提示（产品释义）**
- CAHRA：受冲突影响和高风险地区。

**申报范围 → 产品清单 联动**
- 申报范围=Product (or List of Products)：产品清单 必填（至少 制造商产品编号）
- 申报范围=User defined：必须填写范围描述

## 2. 申报问题（1–6）—钴
> 结构：每道题都对 **Cobalt** 回答；每题一个 **回答（下拉）** + **注释（备注）**。

**Q1 是否在产品或生产流程中有意添加或使用 cobalt？（必填）**
- Cobalt(*)：回答 = Yes / No / Unknown；注释 可填

**Q2 是否从 CAHRA 采购 cobalt？（必填）**
- Cobalt(*)：回答 = Yes / No / Unknown / DRC or adjoining countries only；注释 可填

**Q3 是否 100% 来自回收/报废料？（必填）**
- Cobalt(*)：回答 = Yes / No / Unknown；注释 可填

**Q4 相关供应商响应率是多少？（必填）**
- Cobalt(*)：回答 = 100% / Greater than 90% / Greater than 75% / Greater than 50% / 50% or less / None；注释 可填

**Q5 是否识别出全部冶炼厂？（必填）**
- Cobalt(*)：回答 = Yes / No / Unknown；注释 可填

**Q6 是否已在声明中报告全部冶炼厂？（必填）**
- Cobalt(*)：回答 = Yes / No / Unknown；注释 可填

**说明（来自 Instructions）**
- 六个申报范围问题的答复说明：模板文字要求仅以英文作答；产品执行为提示（不强制校验）。

## 3. 公司层面问题（A–I）—尽调
> 结构：每题一个 回答（下拉）+ 注释（备注）

**题干（与模板一致） + 允许值**
| 题号 | 题干（模板原文） | 回答 允许值 |
|---|---|---|
| A | 贵公司是否制定了可公开查阅的钴采购政策？ | Yes / No |
| B | 贵公司的政策是否至少涵盖《经合组织尽职调查指南》附录二《示范政策》中的所有风险以及童工问题的最恶劣形式？ | Yes / No |
| C | 贵公司是否针对上述指明申报范围中的钴实施了尽职调查措施？ | Yes / No |
| D | 贵公司是否要求供应商按照《经合组织尽职调查指南》针对钴供应链实施尽职调查？ | Yes / No |
| E | 贵公司是否要求贵公司的直接供应商从尽职调查实践经独立第三方审计计划验证过的冶炼厂采购钴？ | Yes / No |
| F | 贵公司是否要求供应商的尽职调查实践至少涵盖《经合组织尽职调查指南》附录二《示范政策》中的所有风险以及童工问题的最恶劣形式？ | Yes / No |
| G | 贵公司是否针对相关供应商进行钴供应链调查？(*) | Yes, CRT / Yes, Using Other Format (Describe) / No |
| H | 贵公司是否会根据预期审核从供应商处收到的尽职调查信息？ | Yes / No |
| I | 贵公司的审核流程是否包括纠错行动管理？ | Yes / No |

**说明（来自 Instructions）**
- 问题 A–I 回答说明：模板文字要求仅以英文作答；产品执行为提示（不强制校验）。

## 4. Smelter List（冶炼厂清单）
**关键逻辑（来自 Instructions）**
- 冶炼厂查找为下拉字段，包含已知冶炼厂，以及 **Smelter not listed / Smelter not yet identified** 两个特殊选项。
  - **Smelter not listed**：需手工填写 冶炼厂名称，并手选 冶炼工厂地址（国家）（模板明确说明）。
- **Smelter not yet identified**：模板仅提供下拉选项，未写明后续填写规则；在冶炼厂查找清单中该项的标准冶炼厂名称为 Unknown，国家为 Unknown（由 Look‑up 回填），且不会自动回填到“冶炼厂名称”（仍需手工填写）。
- 若已知冶炼厂识别号码，可先填 冶炼厂识别号码输入列，其他信息自动填充。
- 为触发查找，需先填写 金属 → 冶炼厂查找（从左到右）。
- 金属下拉固定为 Cobalt（模板仅提供单一选项）。
- 若贵公司为冶炼厂/精炼厂，模板建议在冶炼厂清单中填写本公司信息（产品层面提示）。

**填写路径（来自 Smelter List 说明）**
- 选项 A：已知冶炼厂识别号码 → 在“冶炼厂识别号码输入列”输入；其余列自动填充，“冶炼厂名称”变为灰色。
- 选项 B：已知金属 + 冶炼厂查找名称 → 先选金属，再从“冶炼厂查找”下拉选择。
- 选项 C：已知金属 + 冶炼厂名称 → 在“冶炼厂查找”选择“冶炼厂未列出”，再手工填写“冶炼厂名称”“冶炼工厂地址（国家）”，并补齐其他信息列。

**与 Declaration 联动（模板说明/校验）**
- 当 Q1/Q2 对钴回答 Yes 时，冶炼厂清单需填写以满足“已报告全部冶炼厂”的检查项。
- 金属已选但“冶炼厂查找”为空时会触发高亮提示（必填提示，条件格式）。  
- 选择“Smelter not listed”时，冶炼厂名称与冶炼工厂地址（国家）为空会触发高亮提示（条件格式）。
- 冶炼厂识别号码输入列与自动填充的冶炼厂识别不一致会触发提示（条件格式）。
- “冶炼厂出处识别号”出现 “Enter smelter details” 会触发提示（条件格式）。

**说明（来自 Instructions）**
- 冶炼厂清单工作表（模板原文“名单”）的填写说明：模板文字要求仅以英文作答；产品执行为提示（不强制校验）。
- 填好的表格中不应有单元格条目以“=”或“#”开头（模板提示，产品层面可做弱校验）。

**字段清单（顺序 + 规则）**
| 字段 | 必填 | 输入方式 | 校验/下拉 | 说明 |
|---|---|---|---|---|
| 冶炼厂识别号码输入列 | 否 | 手动填写 | — | 有值时触发自动填充 |
| 金属 (*) | 是 | 下拉选择 | Cobalt（固定下拉） | 表头误标为“金属 l (*)” |
| 冶炼厂查找 (*) | 是 | 下拉选择 | 冶炼厂目录 + Smelter not listed + Smelter not yet identified（受金属过滤） | 关键选择 |
| 冶炼厂名称 | 否 | 自动/手动 | — | 非 Not listed 自动填充并灰化；Not listed 时需手工填写 |
| 冶炼工厂地址（国家） (*) | 是 | 自动/手选 | 国家列表 | 非 Not listed 自动填充；Not listed 时需手选；not yet identified 由 Look‑up 回填为 Unknown |
| 冶炼厂识别 | 否 | 自动填充 | — |  |
| 冶炼厂出处识别号 | 否 | 自动填充 | — |  |
| 冶炼工厂地址（街道） | 否 | 自动填充 | — |  |
| 冶炼工厂地址（城市） | 否 | 自动填充 | — |  |
| 冶炼工厂地址（州/省） | 否 | 自动填充 | — |  |
| 冶炼厂联系名称 | 否 | 手动填写 | — |  |
| 冶炼厂联系电邮地址 | 否 | 手动填写 | — |  |
| 建议的后续步骤 | 否 | 手动填写 | — |  |
| 填所有矿井名称，或如所用矿产来自回收料和报废料时请填“回收”或“报废”。 | 否 | 手动填写 | — |  |
| 填所有矿井所在的国家名称，或如所用矿产来自回收料和报废料时请填“回收”或“报废”。 | 否 | 手动填写 | — |  |
| 冶炼厂的被冶炼物料100%完全来自回收料或报废料吗？ | 否 | 手动填写 | Yes / No / Unknown |  |
| 注释 | 否 | 手动填写 | — |  |
| Standard Smelter Name | 否 | 自动填充 | — | 模板原文为英文 |
| Country Code | 否 | 自动填充 | — | 模板原文为英文 |
| State / Province Code | 否 | 自动填充 | — | 模板原文为英文 |
| Smelter not yet identified | 否 | 自动填充 | — | 系统列（非用户输入） |
| Smelter Not Listed | 否 | 自动填充 | — | 系统列（非用户输入） |
| Unknown | 否 | 自动填充 | — | 系统列 |

> 说明：Smelter not listed / Smelter not yet identified 为 **Smelter Look-up** 下拉选项，不是独立输入字段；模板原文表头含“(1)”，UI 可忽略括号。

## 5. Product List（产品清单）
- 仅当 申报范围=Product 时必须填写

**字段清单（顺序 + 规则）**
| 字段 | 必填 | 输入方式 | 校验/下拉 | 说明 |
|---|---|---|---|---|
| 制造商产品编号 (*) | 是 | 手动填写 | — | 必填 |
| 制造商产品名称 | 否 | 手动填写 | — | 可选 |
| 备注 | 否 | 手动填写 | — | 可选 |

## 6. Checker 校验规则（必填与联动）
**Checker 明确列为必填（F=1）**  
- 公司信息：公司名称、申报范围或种类、联系人姓名、联系人电邮地址、联系人电话、授权人姓名、授权人电邮地址、授权日期。  
- Q1–Q6：钴逐题回答（问题区为钴单金属矩阵）。  
- 公司层面问题 A–I：全部必填回答。  
- Smelter List：Smelter List - Cobalt 必填。  

**CRT 2.2/2.21 Checker**  
- 2.2：A57（Smelter List - Cobalt）存在 x14 conditionalFormatting：当 Smelter List 的冶炼厂查找列非全空时触发高亮（COUNTBLANK('Smelter List'!C5:C2498) <> ROWS* COLUMNS）。  
  - 该规则在 cfExt 中，openpyxl 可能无法解析；需人工核验样式表现。  
- 2.21：同一规则以常规 conditionalFormatting 存在（openpyxl 可解析）。

**条件必填（来自 Instructions/Declaration/Smelter 规则）**  
- 申报范围=Product (or List of Products) → Product List 必填（至少“制造商产品编号”）。  
- 申报范围=User defined → 范围描述必填。  
- Instructions 明确：若 Q1（钴）=Yes，则必须回答钴的所有问题（Q1–Q6）并回答 A–I。  
- Q2 与 Q6：当 Q1（钴）=Yes 时要求回答（模板说明）。  
- A 题若回答 Yes → 注释需提供 URL（模板说明）。  
- G 题若回答 “Yes, Using Other Format (Describe)” → 注释必填。  
- Smelter List 中选择 “Smelter not listed” 的行 → 冶炼厂名称与国家/地区必填。

## 7. 版本差异（2.2–2.21）—中文模板对比结论

> 说明：以下对比基于 `app/templates/CRT` 下的中文模板。

### 2.2 → 2.21
- 申报问题 Q2（是否从 CAHRA 采购钴）答案下拉新增选项：**“DRC or adjoining countries only”**。
- 公司层面问题 G 新增答案选项：**“Yes, Using Other Format (Describe)”**（与 IPC1755 并列）。
