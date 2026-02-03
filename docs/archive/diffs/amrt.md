# AMRT 模板（1.1–1.3）差异与逻辑说明（产品可用版）

> 基线版本：AMRT 1.3（中文模板）

## 1. Declaration（申报/声明）—公司信息
**字段清单（公司信息区）**
| 字段 | 必填 | 输入类型 | 校验/选项 | 备注 |
|---|---|---|---|---|
| 请选择你的语言 | 否 | 下拉选择 | English / 中文 Chinese / 日本語 Japanese / 한국어 Korean / Français / Deutsch | 多语言选择（下拉） |
| 公司名称（*） | 是 | 文本 | 无显式格式校验 | Legal Name；不得使用缩写；可包含其他商业名称/DBA（Instructions） |
| 申报范围或种类 (*) | 是 | 下拉选择 | A. Company / B. Product (or List of Products) / C. User defined [Specify in 'Description of scope'] | 影响 产品清单 与范围描述 |
| 范围描述 | 否 | 文本 | 无显式格式校验 | 申报范围=User defined 时必填 |
| 选择/输入贵公司的矿产申报范围（最多 10 种） | 是 | 多选下拉 / 自由输入 | 1.1/1.2：无下拉校验（模板提示“Please enter up to 10 minerals…”）；1.3：下拉列表（含 Other [specify below]） | 控制问题区行数与顺序 |
| 其他矿产（Other） | 否 | 文本 | 自定义校验 | 仅 1.3 存在；D15:I16 为对应输入区；仅当对应槽位选择 Other [specify below] 时允许填写；否则需保持为空 |
| 公司唯一识别信息 | 否 | 文本 | 无显式格式校验 |  |
| 公司唯一授权识别信息 | 否 | 文本 | 无显式格式校验 |  |
| 地址 | 是（模板文字要求） | 文本 | 无显式格式校验 | 模板文字要求必填（以 Instructions 为准）；模板内部不一致：Declaration 未标星且 Checker 未列 |
| 联系人姓名 (*) | 是 | 文本 | 无显式格式校验 |  |
| 电子邮件 - 联系人 (*) | 是 | 文本 | 无显式邮箱格式校验 | 无邮箱可填 `not available`/`n/a`，空白可能导致模板错误（Instructions） |
| 电话 - 联系人 (*) | 是 | 文本 | 无显式格式校验 |  |
| 授权人 (*) | 是 | 文本 | 无显式格式校验 | 授权人可与联系人不同；不可填 `same` 等占位（Instructions） |
| 职务 - 授权人 | 否 | 文本 | 无显式格式校验 |  |
| 电子邮件 - 授权人 (*) | 是 | 文本 | 无显式邮箱格式校验 | 无邮箱可填 `not available`/`n/a`，空白可能导致模板错误（Instructions） |
| 电话 - 授权人 | 否 | 文本 | 无显式格式校验 | 模板说明为可选 |
| 生效日期 (*) | 是 | 日期 | 日期格式：DD-MMM-YYYY（Instructions + DV） | 日期范围：31-Dec-2006 – 31-Mar-2026（DV between 39082–46112）；Excel 可将 `YYYY-MM-DD` 自动转为 `DD-MMM-YYYY`；产品层面仅提示不阻断 |

**申报范围 → 产品清单 联动**
- 申报范围=Product (or List of Products)：产品清单 必填（至少制造商产品序号）。
- 申报范围=User defined：必须填写范围描述。

**矿种选择联动（关键）**
- 1.3 模板明确：问题 1/2 会自动填充所选矿产并按字母顺序排列。
- 1.1/1.2：模板公式对申报范围输入进行文本排序后输出到问题区（Excel 字符串比较逻辑）。
- 1.1/1.2：申报范围输入区模板预填矿种值（英文/中文模板不同），但无下拉校验，可覆盖。
- 1.3：若某槽位选择 Other，则使用 D15:I16 对应槽位输入替代并参与问题区排序；Other 选中数量需与 D15:I16 填写数量一致。
- 模板提示：公司信息与问题区模板文字要求仅以英文作答；产品层面仅提示（不强制校验）。
- 矿种输入/下拉与问题回答选项为模板原文英文（模板未提供中文翻译）。
- 公司信息 / 问题区 / Minerals Scope / Smelter List / Mine List 模板文字要求仅以英文作答；产品层面仅提示（不强制校验）。
- 填写表格时，单元格条目不应以“=”或“#”开头（模板提示，产品层面可做弱校验）。
- 模板建议导出/存档文件名：companyname-date.xls（date as YYYY-MM-DD，示例格式与日期字段不同）。

**DV 文案（非日期）**
- 申报范围下拉错误提示：errorTitle=“Required Field”；error=“Select from dropdown options to declare survey scope”。  
- 1.1/1.2 矿产输入提示：promptTitle=“Enter Minerals/Metals”；prompt=“Please enter up to 10 minerals or metals for the Declaration.”  
- 1.3 矿产下拉提示：promptTitle=“Select Minerals/Metals”；prompt=“Please select up to 10 minerals or metals for the Declaration... If mineral or metal doesn't appear on the list, select \"Other\".”  
- 1.3 Other 自定义校验：promptTitle=“Enter Other Minerals/Metals”；prompt=“If Other was selected in cell X, enter the mineral/metal here.”；error=“You must select Other in cell X to enter a mineral/metal in this cell.”  
- 联系人姓名为空错误提示：errorTitle=“Blank Field”；error=“Please enter your contact name.”  

## 2. 申报问题（1–2）—矿种矩阵
> 结构：每道题都要对 **所选矿产** 分别回答；每个矿产都有 **回答（下拉）** 和 **注释（备注）**。

**Q1 是否在产品或生产流程中有意添加或使用任何特定矿产？（必填）**
- 1.3 适用矿产：Aluminum / Iridium / Lime / Manganese / Palladium / Platinum / Rare Earth Elements / Rhodium / Ruthenium / Silver / Soda Ash / Zinc / Other（如选择）
- 1.1/1.2 适用矿产：来自 Declaration 申报范围输入（自由输入；模板预填默认列表，可覆盖）
- 回答 = Yes / No / Unknown / Not declaring；注释 可填

**Q2 已对贵公司供应链调查提供答复的相关供应商百分比是多少？（必填）**
- 适用矿产同 Q1
- 回答 = 100% / Greater than 90% / Greater than 75% / Greater than 50% / 50% or less / None / Unknown / Did not survey；注释 可填

**依赖关系（来自 Instructions）**
- 若任一矿产 Q2=100%，需提供该矿产的所有冶炼厂信息，以使答复完整。
- 若选择 Did not survey（未调查），需在注释中提供证据/说明。

## 3. Minerals Scope（矿物范围，选填）
- 说明：AMRT 申请人可选择填写该页签以提供更多细节；不填写不影响 Declaration 必填。
- 填写时：矿种下拉仅包含已在 Declaration 申报范围中选中的矿种；每行选择矿种需填写对应纳入原因。
- Instructions 明确：强烈建议先填写 Minerals Scope，再提交 AMRT 调查（产品层面提示）。
- 表头：Select Minerals/Metals in Scope / Reasons for inclusion on the AMRT（1.1 为 PRT 字样）。
- DV 提示（非日期）：promptTitle=“Select Minerals/Metals in Scope”；prompt=“Select 1 of the entered minerals/metals in scope to provide reasons for inclusion on the AMRT.”（1.1 为 PRT 字样）。

## 4. Smelter List（冶炼厂清单）
**关键逻辑（来自 Instructions）**
- 冶炼厂名称列存在双列：
  - 下拉列：来自 Smelter Look-up 按金属过滤，用于选择目录内冶炼厂；
  - 手工填写列：用于“Smelter not listed”等情况。
- 冶炼厂下拉包含 **Smelter not listed / Smelter not yet identified**：
  - **Smelter not listed**：需手工填写 冶炼厂名称 与 冶炼厂所在国家或地区。
  - **Smelter not yet identified**：Standard Smelter Name=Unknown、国家为空；国家列会触发提示。
- 若已知冶炼厂识别号码，可先填 冶炼厂识别号码输入列，其他信息自动填充。
- 为触发查找，需先填写 金属 → 冶炼厂名称（下拉）。
- 若贵公司为冶炼厂/精炼厂，模板建议在冶炼厂清单中填写本公司信息（产品层面提示）。
- 联系人信息合规提示：填写“冶炼厂联系人姓名/电子邮件”前，需确认已取得联系人同意（模板提示）。

**版本差异提示**
- 1.1/1.2：无 Smelter Look-up；冶炼厂名称为单一手填列；金属列在 A，国家/地区在 C；条件格式仅提示“金属为空 / 冶炼厂名称为空 / 冶炼厂名称包含 !”。
- 1.3：新增 Smelter Look-up；冶炼厂名称拆分为“下拉/手填”双列，列位置整体右移；条件格式新增 Smelter not listed / not yet identified 等逻辑提示。

**填写路径（来自 Smelter List 说明）**
- 选项 A：已知冶炼厂识别号码 → 在“冶炼厂识别号码输入列”输入；其余列自动填充，“冶炼厂名称”变为灰色。
- 选项 B：已知金属 + 冶炼厂目录名称 → 先选金属，再从“冶炼厂名称（下拉）”选择。
- 选项 C：已知金属 + 冶炼厂名称 → 在下拉选择“Smelter not listed”，再手工填写“冶炼厂名称”“冶炼厂所在国家或地区”，并补齐其他信息列。

**字段清单（顺序 + 规则）**
| 字段 | 必填 | 输入方式 | 校验/下拉 | 说明 |
|---|---|---|---|---|
| 冶炼厂识别号码输入列 | 否 | 手动填写 | — | 仅 1.3；有值时触发自动填充 |
| 金属 (*) | 是 | 下拉选择 | 申报范围矿种（来自申报区已选择矿种） | 与冶炼厂下拉关联 |
| 冶炼厂名称（下拉） (*) | 是 | 下拉选择 | 冶炼厂目录（按所选金属过滤的下拉） | 仅 1.3；目录内选择；包含特殊项 |
| 冶炼厂名称（手填） (*) | 否 | 手动填写 | — | 仅 1.3；Smelter not listed 时必填（1.1/1.2 为单列手填） |
| 冶炼厂所在国家或地区 (*) | 是 | 自动/手选 | 国家列表（约 249 项） | Smelter not listed 时需手选 |
| 冶炼厂识别 | 否 | 自动填充 / 手动填写 | — | 1.3 自动填充；1.1/1.2 手动填写 |
| 冶炼厂出处识别号 | 否 | 自动填充 / 手动填写 | — | 1.3 自动填充；1.1/1.2 手动填写；“Enter smelter details” 触发提示 |
| 冶炼厂所在街道 | 否 | 手动填写 | — |  |
| 冶炼厂所在城市 | 否 | 手动填写 | — |  |
| 冶炼厂地址：州/省 | 否 | 手动填写 | — |  |
| 冶炼厂联系人 | 否 | 手动填写 | — |  |
| 冶炼厂联系人电子邮件 | 否 | 手动填写 | — |  |
| 建议的后续步骤 | 否 | 手动填写 | — |  |
| 填写矿井名称，或回收/报废 | 否 | 手动填写 | — |  |
| 填写矿井所在国家或地区，或回收/报废 | 否 | 手动填写 | — |  |
| 冶炼厂的被冶炼物料是否 100% 来自于回收料或报废料？ | 否 | 下拉选择 | **1.1/1.2：Yes / No / Unknown；1.3：Yes / No** | 下拉来源为模板值 |
| 注释 | 否 | 手动填写 | — |  |
| Standard Smelter Name | 否 | 自动填充 | — | 模板原文为英文（1.1/1.2 标注 Not in use；1.3 为正常字段） |
| Country Code | 否 | 自动填充 | — | 模板原文为英文 |
| State / Province Code | 否 | 自动填充 | — | 模板原文为英文 |
| Missing Entry Check | 否 | 自动填充 | — | 系统辅助列（1.1–1.3） |
| Smelter Counter | 否 | 自动填充 | — | 系统辅助列（1.1–1.3） |
| Smelter not yet identified | 否 | 自动填充 | — | 系统列（1.3） |
| Smelter Not Listed | 否 | 自动填充 | — | 系统列（1.3） |
| Combined Metal | 否 | 自动填充 | — | 系统列（1.3） |
| Combined Smelter | 否 | 自动填充 | — | 系统列（1.3） |
| 未知 | 否 | 自动填充 | — | 系统列（1.1/1.2） |

**与申报区联动（模板条件格式/校验）**
- 金属为空 → 金属列标红。
- 1.3：金属已选但冶炼厂下拉为空 → 冶炼厂列标红。
- 1.3：冶炼厂下拉=Smelter not listed → 冶炼厂名称/国家为必填提示。
- 1.3：冶炼厂下拉=Smelter not yet identified → 国家列提示。
- 1.1/1.2：金属已选但冶炼厂名称为空 → 冶炼厂名称列标红；冶炼厂名称包含 “!” → 提示。

## 5. Mine List（矿厂清单）
**联系人信息合规提示（来自 Instructions）**
- 填写“矿厂联系人姓名/电子邮件”前，需确认已取得联系人同意（模板提示）。

**字段清单（顺序 + 规则）**
| 字段 | 必填 | 输入方式 | 校验/下拉 | 说明 |
|---|---|---|---|---|
| 金属 | 是 | 下拉选择 | 申报范围矿种（来自申报区已选择矿种） | 行启用条件 |
| 从该矿厂采购的冶炼厂的名称 | 否 | 下拉选择 / 手填 | 1.3：冶炼厂清单下拉；1.1/1.2：手动填写 | 金属已选时必填提示（条件格式） |
| 矿厂(矿场)名称 | 否 | 手动填写 | — | 未见条件格式提示；建议填写 |
| 矿厂识别（例如《CID》） | 否 | 手动填写 | — |  |
| 冶炼厂出处识别号 | 否 | 手动填写 | — |  |
| 矿厂所在国家或地区 | 否 | 下拉选择 | 国家列表（约 249 项） | 金属已选时必填提示（条件格式） |
| 矿厂所在街道 | 否 | 手动填写 | — |  |
| 矿厂所在城市 | 否 | 手动填写 | — |  |
| 矿厂地址：州/省 | 否 | 手动填写 | — |  |
| 矿厂联系人 | 否 | 手动填写 | — |  |
| 矿厂联系人电子邮件 | 否 | 手动填写 | — |  |
| 建议的后续步骤 | 否 | 手动填写 | — |  |
| 注释 | 否 | 手动填写 | — |  |
| Country Code | 否 | 自动填充 | — | 模板原文为英文（系统列） |
| State / Province Code | 否 | 自动填充 | — | 模板原文为英文（系统列） |
| Missing Entry Check | 否 | 自动填充 | — | 系统辅助列 |
| Smelter Counter | 否 | 自动填充 | — | 系统辅助列 |

**与申报区联动（模板条件格式/校验）**
- 金属为空 → 金属列标红。
- 金属已选但“从该矿厂采购的冶炼厂的名称”为空 → 对应列标红。
- 金属已选但矿厂所在国家或地区为空 → 国家列标红。
- “从该矿厂采购的冶炼厂的名称”或“矿厂所在国家或地区”包含 “!” → 触发提示（1.1–1.3）。

## 6. Product List（产品清单）
- 仅当 申报范围=Product 时必须填写。

**字段清单（顺序 + 规则）**
| 字段 | 必填 | 输入方式 | 校验/下拉 | 说明 |
|---|---|---|---|---|
| 制造商的产品序号 (*) | 是 | 手动填写 | — | 必填 |
| 制造商的产品名称 | 否 | 手动填写 | — | 可选 |
| 请求方的产品编号 | 否 | 手动填写 | — | 仅 1.3 版本新增 |
| 请求方的产品名称 | 否 | 手动填写 | — | 仅 1.3 版本新增 |
| 注释 | 否 | 手动填写 | — | 可选 |

## 7. Checker 校验规则（必填与联动）
**Checker 明确列为必填（F=1）**  
- 公司名称、申报范围或种类。  
- 矿产申报范围：至少选择 1 种矿产。  
- 联系人姓名、电子邮件 - 联系人、电话 - 联系人。  
- 授权人、电子邮件 - 授权人。  
- 生效日期。  

**条件必填（来自 Instructions/Declaration）**  
- 申报范围=User defined → 范围描述必填。  
- 申报范围=Product (or List of Products) → Product List 至少填写“制造商的产品序号”。  
- 选择 Other [specify below] → “其他矿产”必填；未选 Other 不得填写（仅 1.3）。  
- Q1/Q2：仅对所选矿产逐一回答；未选矿产不生成问题行。  
- Q2=100% → 对应矿产需在 Smelter List 列出全部冶炼厂信息以使答复完整。  
- 地址：按模板文字要求必填（以 Instructions 为准），但 Declaration 未标星且 Checker 未列（模板内部不一致，需在实现说明注明）。  

## 8. 版本差异（1.1–1.3）—中文模板对比结论

> 说明：以下对比基于 `app/templates/AMRT` 下的中文模板。
> 背景补充：AMRT 源自 **Pilot Reporting Template**，用于覆盖 **CMRT/EMRT** 范围之外矿产供应链信息的传递，后更名为 Additional Minerals Reporting Template（模板 Revision 说明）。

### 1.1 → 1.2
- **结构基本一致**：当前扫描未发现显式结构变化；流程、字段顺序与 1.1 保持一致。  
- **文案更新**：Minerals Scope 表头从 PRT 字样改为 AMRT（模板原文更新）。

### 1.2 → 1.3（Revision 1.3 October 17, 2025）
- **矿产申报范围字段调整**：从“自由输入（无下拉校验）”改为“下拉多选”，并新增“Other [specify below]”提示与“其他矿产”补充说明。
- **申报问题说明调整**：问题 1/2 的矿种行由申报范围选择自动填充并按字母顺序排列（模板文字提示新增）。
- **排序实现**：Declaration 公式通过 P/Q/Z/AA 列排序网络按字母序输出已选矿产（与文案一致）。
- **范围排除说明新增**：AMRT 申报范围不包括 3TG、钴、铜、石墨、锂、云母、镍（已在 CMRT/EMRT 覆盖；模板 Instructions 文案新增）。产品执行口径：通过下拉选项与 Other 控制范围，不额外阻断。  
- **Smelter List 结构调整**：
  - 新增 **Smelter Look-up** 工作表；
  - Smelter List 表头重排：新增“冶炼厂识别号码输入列”，并区分“冶炼厂名称（下拉）/ 冶炼厂名称（手填）”；列位置右移。
  - 填写说明更新为选项 A/B/C 路径（识别号码/查找下拉/手填）。
- **Mine List 增强**：新增“从该矿厂采购的冶炼厂的名称”下拉（与 Smelter List 关联）。
- **Product List 表头变化**：新增 请求方的产品编号 / 请求方的产品名称。
