# 跨模板字段标准化词典（初稿）

> 目的：统一字段语义、名称与约束，为后续 schema/UI 复用铺路。  
> 版本基线：CMRT 6.5 / EMRT 2.1 / CRT 2.21 / AMRT 1.1–1.3  
> 语言口径：模板要求英文作答；中文环境验证仍以英文选项值为准（产品仅提示不强制）。

## 1. 字段映射表（核心公司信息 + 申报范围）
| 统一字段 | CMRT | EMRT | CRT | AMRT 1.2/1.3 | AMRT 1.1 | 类型 | 必填（Checker） | 备注/约束 |
|---|---|---|---|---|---|---|---|---|
| 公司名称 | 公司名称(*) | 公司名称（*） | 公司名称（*） | 公司名称(*) | 公司名称(*) | 文本 | 全部 Y | Legal Name；不得使用缩写；可包含其他商业名称/DBA（Instructions） |
| 申报范围或种类 | 申报范围或种类(*) | 申报范围或种类(*) | 申报范围或种类(*) | 申报范围或种类(*) | 申报范围或种类(*) | 下拉 | 全部 Y | A. Company / B. Product (or List of Products) / C. User defined [Specify in 'Description of scope'] |
| 范围描述 | 范围描述 | 范围描述 | 范围描述 | 范围描述 | 范围描述 | 文本 | F=0（条件） | Scope=User defined 时必填 |
| 矿产申报范围 | — | 选择贵公司的矿产申报范围(*)（2.0+） | — | 选择贵公司的矿产申报范围（最多10种） | 选择贵公司的矿产申报范围（最多10种） | 下拉/自由输入 | EMRT 2.0+ / AMRT 1.1–1.3 为 Y | EMRT 1.x 无该字段（固定钴/云母）；EMRT 2.0+ 为下拉；AMRT 1.1/1.2 为自由输入（仅提示最多10）；AMRT 1.3 为下拉（含 Other [specify below]）；**AMRT 1.1–1.3 模板要求最多10种（产品强制 ≤10）** |
| 矿物范围-矿种 | — | — | — | Minerals Scope - Mineral/Metal | Minerals Scope - Mineral/Metal | 下拉/列表 | 条件 | 可选；仅可从已申报范围中选择 |
| 矿物范围-纳入原因 | — | — | — | Reasons for inclusion | Reasons for inclusion | 文本 | 条件 | 当矿种有值时必填 |
| 其他矿产 | — | — | — | 其他矿产（Other） | — | 文本 | 条件 | AMRT 1.3：Other 选中槽位需对应填写 D15:I16；数量匹配；内容替代参与问题区排序 |
| 公司唯一识别信息 | 公司唯一识别信息 | 公司唯一识别信息 | 公司唯一识别信息 | 公司唯一识别信息 | 公司唯一识别信息 | 文本 | F=0 | 无显式格式校验 |
| 公司唯一授权识别信息 | 公司唯一授权识别信息 | 公司唯一授权识别信息 | 公司唯一授权识别信息 | 公司唯一授权识别信息 | 公司唯一授权识别信息 | 文本 | F=0 | 无显式格式校验 |
| 地址 | 地址 | 地址 | 地址 | 地址 | 地址 | 文本 | F=0 | 模板文字要求：AMRT 1.1–1.3 地址必填（以 Instructions 为准）；Checker 未标记（模板不一致） |
| 联系人姓名 | 联系人姓名(*) | 联系人姓名(*) | 联系人姓名(*) | 联系人姓名(*) | 联系人姓名(*) | 文本 | 全部 Y |  |
| 电子邮件-联系人 | 电子邮件-联系人(*) | 联系人电邮地址(*) | 联系人电邮地址(*) | 电子邮件-联系人(*) | 电子邮件-联系人(*) | 文本 | 全部 Y | 无显式邮箱格式校验；无邮箱可填 `not available`/`n/a`，空白可能导致模板错误（Instructions） |
| 电话-联系人 | 电话-联系人(*) | 联系人电话(*) | 联系人电话(*) | 电话-联系人(*) | 电话-联系人(*) | 文本 | 全部 Y |  |
| 授权人/授权人姓名 | 授权人(*) | 授权人姓名(*) | 授权人姓名(*) | 授权人(*) | 授权人(*) | 文本 | 全部 Y | 授权人可与联系人不同；不可填 `same` 等占位（Instructions） |
| 授权人职务 | 授权人职务 | 授权人职务 | 授权人职务 | 职务-授权人 | 职务-授权人 | 文本 | F=0 |  |
| 电子邮件-授权人 | 电子邮件-授权人(*) | 授权人电邮地址(*) | 授权人电邮地址(*) | 电子邮件-授权人(*) | 电子邮件-授权人(*) | 文本 | 全部 Y | 无显式邮箱格式校验；无邮箱可填 `not available`/`n/a`，空白可能导致模板错误（Instructions） |
| 电话-授权人 | 电话-授权人 | 授权人电话 | 授权人电话 | 电话-授权人 | 电话-授权人 | 文本 | F=0 | 模板说明为可选 |
| 授权日期/生效日期 | 生效日期(*) | 授权日期(*) | 授权日期(*) | 生效日期(*) | 生效日期(*) | 日期 | 全部 Y | 日期格式：**DD-MMM-YYYY**（Instructions + DV，错误提示“Invalid date / date entered must be in international format...”）；Excel 可将 `YYYY-MM-DD` 自动转换为 `DD-MMM-YYYY`。模板 DV 范围：EMRT/CRT/AMRT **31-Dec-2006 – 31-Mar-2026**；**CMRT 6.01–6.22 为 31-Dec-2006 – 31-Mar-2026，CMRT 6.31+ 为 >31-Dec-2006**；产品层面仅提示不阻断。 |

**AMRT 1.1–1.2 问题区矿种来源**
- 来自 Declaration 申报范围输入（自由输入，无固定候选列表）。

## 2. 字段映射表（产品清单）
| 统一字段 | CMRT | EMRT | CRT | AMRT 1.2/1.3 | AMRT 1.1 | 类型 | 必填（Checker） | 备注/约束 |
|---|---|---|---|---|---|---|---|---|
| 产品编号（主） | 6.4 及以下为制造商的产品序号(*)；6.5 起为回复方的产品编号(*) | 2.0+ 为回复方的产品编号(*)；1.x 为制造商产品编号(*) | 制造商产品编号(*) | 制造商的产品序号(*) | 制造商的产品序号(*) | 文本 | F=0（条件） | Scope=Product 时必填 |
| 产品名称 | 6.4 及以下为制造商的产品名称；6.5 起为回复方的产品名称 | 2.0+ 为回复方的产品名称；1.x 为制造商产品名称 | 制造商产品名称 | 制造商的产品名称 | 制造商的产品名称 | 文本 | F=0 |  |
| 请求方产品编号 | — | 请求方的产品编号 | — | 仅 1.3：请求方的产品编号 | — | 文本 | F=0 | EMRT 2.1+ / AMRT 1.3+ |
| 请求方产品名称 | — | 请求方的产品名称 | — | 仅 1.3：请求方的产品名称 | — | 文本 | F=0 | EMRT 2.1+ / AMRT 1.3+ |
| 注释 | 注释 | 备注 | 备注 | 注释 | 注释 | 文本 | F=0 |  |

## 3. 字段映射表（Smelter List 关键列）
| 统一字段 | CMRT | EMRT | CRT | AMRT 1.2/1.3 | AMRT 1.1 | 类型 | 必填（Checker） | 备注/约束 |
|---|---|---|---|---|---|---|---|---|
| 冶炼厂识别号码输入列 | 有 | 有 | 有 | 1.3 有 / 1.2 无 | — | 文本 | F=0 | 有值时触发自动回填（含 Look-up） |
| 金属 | 金属(*) | 金属(*) | 金属(*) | 金属(*) | 金属(*) | 下拉 | 部分 Y | 取值来源不同（动态/固定）；EMRT 1.x / CRT 2.x 表头误标为“金属 l (*)” |
| 冶炼厂查找/名称下拉 | 冶炼厂查找(*) | 冶炼厂查找(*) | 冶炼厂查找(*) | （仅 1.3）冶炼厂名称(*) | — | 下拉 | 依模板 | AMRT 1.1/1.2 无“查找/下拉”列；1.3 有名称下拉（Smelter Look‑up） |
| 冶炼厂名称（手填） | 冶炼厂名称 | 冶炼厂名称(*) | 冶炼厂名称 | 冶炼厂名称(*) | 冶炼厂名称(*) | 文本 | 条件 | Smelter not listed 时必填；部分版本表头含“(1)”，UI 可忽略括号 |
| 冶炼厂所在国家/地区 | 冶炼厂所在国家或地区(*) | 冶炼工厂地址（国家）(*) | 冶炼工厂地址（国家）(*) | 冶炼厂所在国家或地区(*) | 冶炼厂所在国家或地区(*) | 下拉 | 条件 | Smelter not listed 时必填 |

## 4. 字段映射表（Mine List 关键列）
> 仅 EMRT 2.0+ / AMRT 1.1–1.3 含 Mine List。
| 统一字段 | EMRT | AMRT 1.2/1.3 | AMRT 1.1 | 类型 | 必填（条件） | 备注/约束 |
|---|---|---|---|---|---|---|
| 金属 | 金属 | 金属 | 金属 | 下拉 | 条件 | 来源于 Declaration 申报范围已选矿种（动态/固定） |
| 从该矿厂采购的冶炼厂的名称 | **2.1 下拉（Smelter List 按金属过滤）；2.0 手动填写** | （1.3）下拉；1.2 为手动填写 | 手动填写 | 下拉/文本 | 条件 | 金属已选时必填提示（条件格式） |
| 矿厂(矿场)名称 | 手动填写 | 手动填写 | 手动填写 | 文本 | — | 未见条件格式提示；建议填写 |
| 矿厂所在国家或地区 | 下拉（国家列表） | 下拉（国家列表） | 下拉（国家列表） | 下拉 | 条件 | 金属已选时必填提示（条件格式） |
> 备注：其余地址/联系人/建议后续步骤/注释等字段见各模板 `docs/diffs/*.md` 的 Mine List 字段清单。

## 5. 申报问题矩阵（Questions）
> 结构：按矿种逐题回答；矿种行来源于 Declaration 申报范围（CMRT/CRT 固定矿种）。

### CMRT（Q1–Q8，钽/锡/金/钨）
- Q1 是否在产品或生产流程中有意添加或使用任何 3TG？ → Yes / No
- Q2 是否有任何 3TG 仍存在于产品中？ → Yes / No
- Q3 是否从 SEC 所指国家采购 3TG？ → Yes / No / Unknown
- Q4 是否从 CAHRA 采购 3TG？ → Yes / No / Unknown
- Q5 是否 100% 来自回收/报废料？ → Yes / No / Unknown
- Q6 相关供应商响应率是多少？ → 100% / Greater than 90% / Greater than 75% / Greater than 50% / 50% or less / None
- Q7 是否识别出全部 3TG 冶炼厂？ → Yes / No
- Q8 是否已在声明中报告全部冶炼厂？ → Yes / No
- 依赖：Q3–Q8 仅当该金属在 Q1/Q2 为 Yes 时要求填写。

### EMRT（Q1–Q7，申报范围内矿种）
- Q1 是否在产品或生产流程中有意添加或使用任何指定矿产？ → 1.1–1.3：Yes / No / Unknown / Not applicable for this declaration；2.0+：Yes / No / Unknown / Not declaring
- Q2 产品中是否还存有任何指定矿产？ → Yes / No / Unknown
- Q3 是否从 CAHRA 采购指定矿产？ → **1.1–1.3**：Cobalt = Yes / No / Unknown / DRC only；Mica = Yes / No / Unknown / India and/or Madagascar only；**2.0+**：Yes / No / Unknown
- Q4 是否 100% 来自回收/报废料？ → Yes / No / Unknown
- Q5 相关供应商响应率是多少？ → **1.1–1.3**：100% / Greater than 90% / Greater than 75% / Greater than 50% / 50% or less / None；**2.0+**：100% / Greater than 90% / Greater than 75% / Greater than 50% / 50% or less / None / Did not survey
- Q6 是否识别出全部冶炼厂或加工厂？ → Yes / No / Unknown
- Q7 是否已在声明中报告全部冶炼厂/加工厂？ → Yes / No / Unknown
- 依赖：Q3–Q7 仅当对应矿种 Q1=Yes 且 Q2=Yes 时要求填写。

### CRT（Q1–Q6，钴）
- Q1 是否在产品或生产流程中有意添加或使用 cobalt？ → Yes / No / Unknown
- Q2 是否从 CAHRA 采购 cobalt？ → Yes / No / Unknown / DRC or adjoining countries only（2.21）
- Q3 是否 100% 来自回收/报废料？ → Yes / No / Unknown
- Q4 相关供应商响应率是多少？ → 100% / Greater than 90% / Greater than 75% / Greater than 50% / 50% or less / None
- Q5 是否识别出全部冶炼厂？ → Yes / No / Unknown
- Q6 是否已在声明中报告全部冶炼厂？ → Yes / No / Unknown

### AMRT（Q1–Q2，申报范围内矿种）
- Q1 是否在产品或生产流程中有意添加或使用任何特定矿产？ → Yes / No / Unknown / Not declaring
- Q2 已对贵公司供应链调查提供答复的相关供应商百分比是多少？ → 100% / Greater than 90% / Greater than 75% / Greater than 50% / 50% or less / None / Unknown / Did not survey
- 依赖：Q2=100% → 需列出该矿产全部冶炼厂；Q2=Did not survey → 注释需提供证据/说明。
- AMRT 1.1/1.2：矿种来自 Declaration 申报范围输入（自由输入，无固定候选）。
- AMRT 1.1/1.2：问题区矿种按模板排序输出（Excel 字符串比较逻辑）。
- AMRT 1.3：矿种来自下拉列表（含 Other [specify below]）。

## 6. 公司层面问题（Company‑level Questions）
> AMRT 1.1–1.3 无公司层面问题页签；EMRT 的 C 题为矿种矩阵。

### CMRT（A–H）
- A 负责任矿产采购政策？ → Yes / No
- B 政策是否公开发布？（Yes 时注释填 URL） → Yes / No
- C 是否要求供应商采购经独立第三方审核的冶炼厂？ → Yes / No
- D 是否实施尽职调查？ → Yes / No
- E 是否开展供应商调查？ → Yes, in conformance with IPC1755 (e.g., CMRT) / Yes, using other format (describe) / No
- F 是否审核供应商提交信息？ → Yes / No
- G 是否包括纠正措施管理？ → Yes / No
- H 是否需年度披露？ → Yes, with the SEC / Yes, with the EU / Yes, with the SEC and the EU / No

### EMRT（A–G）
- A 是否制定可公开查阅的矿产采购政策？ → Yes / No
- B 政策是否公开发布？（Yes 时注释填 URL） → Yes / No
- C 是否要求供应商采购经独立第三方审计计划验证的冶炼厂？ → Yes / Yes, when more processors are validated / No
- D 是否实施尽职调查？ → Yes / No
- E 是否开展供应商调查？ → Yes, in conformance with IPC1755 (e.g. EMRT) / Yes, Using Other Format (Describe) / No
- F 是否审核供应商提交信息？ → Yes / No
- G 是否包括纠错行动管理？ → Yes / No
- 版本差异：1.1 A/B/D 为“钴政策/附录二风险/供应商尽调覆盖”；1.11–1.3 A/B/D 更新为“矿产采购政策/官网公开/已实施尽调”；1.x 的 C/E 仍指“钴/云母”，2.0+ 改为“指定矿产”。

### CRT（A–I）
- A 是否制定可公开查阅的钴采购政策？（Yes 时注释填 URL） → Yes / No
- B 政策是否涵盖经合组织附录二风险与童工问题？ → Yes / No
- C 是否实施尽职调查？ → Yes / No
- D 是否要求供应商按经合组织指南实施尽职调查？ → Yes / No
- E 是否要求供应商采购经独立第三方审计计划验证的冶炼厂？ → Yes / No
- F 是否要求供应商尽职调查覆盖附录二风险与童工问题？ → Yes / No
- G 是否开展钴供应链调查？ → Yes, CRT / Yes, Using Other Format (Describe) / No
- H 是否审核供应商提交信息？ → Yes / No
- I 是否包括纠错行动管理？ → Yes / No

> 注：该词典为初稿，已覆盖核心字段 + Mine List + Questions + Company‑level Questions + 系统/辅助列；其余系统列如有新增版本变化需持续补充。

## 7. 系统/辅助列（导出对齐用）
> 说明：以下列多为模板自动回填或系统辅助字段，**默认只读/可隐藏**，用于与 Excel 导出结构对齐。

### 7.1 Smelter List 系统列
| 系统列 | 出现模板/版本 | 说明 |
|---|---|---|
| Standard Smelter Name | CMRT / EMRT / CRT / AMRT 1.3 | 自动填充列 |
| Standard Smelter Name (Not in use) | AMRT 1.2 / AMRT 1.1 | 模板标注 Not in use |
| Country Code | CMRT / EMRT / CRT / AMRT 1.1–1.3 | 自动填充列 |
| State / Province Code | CMRT / EMRT / CRT / AMRT 1.1–1.3 | 自动填充列 |
| Smelter not yet identified | CMRT / EMRT / CRT / AMRT 1.3 | 系统列（非用户输入） |
| Smelter Not Listed | CMRT / EMRT / CRT / AMRT 1.3 | 系统列（非用户输入） |
| Unknown / 未知 | CMRT / EMRT / CRT（Unknown）; AMRT 1.2 / AMRT 1.1（未知） | 系统列 |
| Combined Metal | EMRT 2.1 / AMRT 1.3 | 自动填充列 |
| Combined Smelter | EMRT 2.1 / AMRT 1.3 | 自动填充列 |
| Missing Entry Check | AMRT 1.2 / AMRT 1.3 / AMRT 1.1 | 系统辅助列 |
| Smelter Counter | AMRT 1.2 / AMRT 1.3 / AMRT 1.1 | 系统辅助列 |

### 7.2 Mine List 系统列
| 系统列 | 出现模板/版本 | 说明 |
|---|---|---|
| Country Code | EMRT 2.0+ / AMRT 1.2/1.3 / AMRT 1.1 | 自动填充列 |
| State / Province Code | EMRT 2.0+ / AMRT 1.2/1.3 / AMRT 1.1 | EMRT 为手动列（非系统列）；AMRT 1.1–1.3 为自动填充列 |
| Missing Entry Check | EMRT 2.0+ / AMRT 1.2/1.3 / AMRT 1.1 | 系统辅助列 |
| Smelter Counter | EMRT 2.0+ / AMRT 1.2/1.3 / AMRT 1.1 | 系统辅助列 |
