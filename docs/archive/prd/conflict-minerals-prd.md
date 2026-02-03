# 冲突矿产编辑/查看（多模板多版本）PRD 骨架（评审版）

> 文档定位：统一 CMRT/EMRT/CRT/AMRT 1.1–1.3 的编辑/查看需求基线，面向产品评审与研发实现。  
> 版本范围：CMRT 6.01–6.5 / EMRT 1.1–2.1 / CRT 2.2–2.21 / AMRT 1.1–1.3  
> 规则来源：中文模板（`app/templates`）+ 现有差异文档（`docs/diffs/*.md`）  

## 1. 背景与目标
- 统一多模板、多版本的“Declaration / Smelter List / Product List / Mine List / Minerals Scope”编辑与查看。
- 基于模板规则（Instructions + Checker + 表单结构）形成可执行的产品规则集。
- 支持版本并存、规则可插拔、国际化可扩展。

## 1.1 模板定位（来自模板说明）
- **CMRT（Conflict Minerals Reporting Template）**：RMI 创建的免费标准化模板，面向下游企业披露至冶炼厂之前的供应链信息；若为 3TG 冶炼/精炼厂，建议在 Smelter List 填本公司。
- **EMRT（Extended Mineral Reporting Template）**：RMI 创建的免费标准化模板，面向下游企业披露至冶炼厂之前的供应链信息；若为冶炼/精炼厂建议在 Smelter List 填本公司。
- **CRT（Cobalt Reporting Template）**：RMI 创建的免费标准化模板，面向下游企业披露至冶炼厂之前的供应链信息；若为冶炼/精炼厂建议在 Smelter List 填本公司。
- **AMRT（Additional Minerals Reporting Template）**：RMI 创建的免费标准化模板，面向下游企业披露至冶炼厂之前的供应链信息；若为冶炼/精炼/加工厂，建议在 Smelter List 填本公司。

## 2. 范围与非目标
**范围**
- 以上述版本范围为第一期基线。
- 仅定义需求/规则/校验，不落地技术实现。

**非目标**
- 不实现 Excel 公式/宏引擎。
- 不在本阶段定义后端 API 细节与数据持久层设计。

## 3. 角色与场景
- 供应商/回复方：填写或更新模板要求的申报数据。
- 采购方/审核方：查看、复核、导出/对齐模板要求。

## 4. 信息架构（页面/Tab）
- **CMRT**：Revision / Instructions / Definitions / Declaration / Smelter List / Checker / Product List / Smelter Look-up
- **EMRT**：Revision / Instructions / Definitions / Declaration / Smelter List / Checker / Product List / Smelter Look-up（2.0+ 追加 Mine List）
- **CRT**：Instructions / Revision / Definitions / Declaration / Smelter List / Checker / Product List / Smelter Look-up
- **AMRT**：Revision / Instructions / Definitions / Declaration / Minerals Scope / Smelter List / Checker / Mine List / Product List / Smelter Look-up
- **AMRT 1.1**：与 AMRT 同页签结构，无独立入口
> 注：模板内部还包含支撑表（下拉/校验数据），不作为 UI 页面展示。

## 5. 核心数据结构（概念层）
- **Company Information**：公司主体信息 + 联系人/授权人信息 + 日期。
- **Declaration Scope**：Company / Product (or List of Products) / User defined + Scope Description。
- **Minerals/Metals in Scope**：
  - CMRT/CRT：固定 3TG / Cobalt
  - EMRT 1.1–1.3：固定 Cobalt / Mica（无“矿产申报范围”选择）
  - EMRT 2.0+：动态矿种（下拉，含 Delete [Mineral]；Cobalt / Copper / Graphite / Lithium / Mica / Nickel）
  - AMRT 1.3：动态矿种（下拉，含 Other [specify below]）
  - AMRT 1.1/1.2：来源于 Declaration 的矿产申报范围（自由输入；模板预填默认矿种：1.1 为英文、1.2 为中文，矿种同 Aluminium/Chromium/Copper/Lithium/Nickel/Silver/Zinc；可覆盖；模板文字要求最多 10 种；产品限制 ≤10）
- **Declaration Questions**：按矿种矩阵回答（Q1–Q8 / Q1–Q7 / Q1–Q6 / Q1–Q2）。
- **Company-level Questions（仅 CMRT/EMRT/CRT；AMRT 无此区）**：CMRT A–H / EMRT A–G / CRT A–I（部分题目需 URL 注释；选择 “Yes, Using Other Format (Describe)” 需补充说明）。
- **Smelter List**：
  - CMRT/EMRT/CRT：Smelter Look-up + not listed/not yet identified 逻辑
  - AMRT 1.3：无“冶炼厂查找”列，但有“冶炼厂名称下拉”与 Smelter Look-up 联动
  - AMRT 1.1：纯手工录入（无 Look-up）；金属下拉来源于 Declaration 申报范围已选矿种
- **Mine List / Product List / Minerals Scope**：按模板支持页签提供。
- **系统/辅助列**：用于导出对齐（默认只读/可隐藏），详见 `docs/prd/field-dictionary.md`。

## 6. 校验规则（融合 Checker + Instructions）
> 详细矩阵见：`docs/diffs/checker-matrix.md`

**统一原则**
- **优先级**：Excel 文本要求（Instructions/表内说明） > Excel 校验标记（Checker/条件格式/数据验证） > 代码实现约束。  
- **Checker（F=1）** → 直接视为必填（若与文本要求冲突，以文本为准）。  
- **Instructions** 文字规则 → 作为条件必填/联动规则补充。  
- AMRT 1.1–1.3 地址按模板文字要求必填（以 Instructions 为准），并注明模板内部不一致。

**关键差异摘录**
- CMRT：Q1–Q8 × 3TG；Q3–Q8 条件必填（对应金属 Q1/Q2=Yes）；A–H 条件必填（任一金属 Q1/Q2=Yes）；Smelter List 按金属必填（Tantalum/Tin/Gold/Tungsten）。
- EMRT：Q1–Q7 × 申报矿种；Q3–Q7 条件必填（对应矿种 Q1=Yes 且 Q2=Yes）；A/B/D–G 条件必填（任一矿种 Q1/Q2=Yes）；C 按矿种矩阵必填；Smelter List 按矿种必填。
- CRT：Q1–Q6 × 钴；当 Q1=Yes 时 Q2–Q6 与 A–I 必答；Smelter List - Cobalt 必填。
- AMRT 1.1–1.3：Checker 未覆盖全部问题区与清单，但 Instructions 明确要求填写（需要规则补齐）。
- AMRT 1.1–1.3：Q2=Did not survey → 备注需提供证据/说明（模板 Instructions）。
- AMRT 1.1–1.3：Q2=100% → 需在 Smelter List 列出全部冶炼厂信息以使答复完整（模板 Instructions）。

**差异复核清单（摘要）**
> 详见 `docs/diffs/review-summary.md`，此处为评审摘要。

**CMRT（6.01–6.5）**
- 生效日期 DV 口径按版本区分（6.01–6.22 vs 6.31+），产品仅提示不阻断；建议改写一句话：生效日期仅提示校验：6.01–6.22 为 31-Dec-2006–31-Mar-2026，6.31+ 仅下限 >31-Dec-2006。
- Product List 表头语义随版本变化（6.01 无注释列；6.4 及以下为“制造商”；6.5 起为“回复方”）；建议改写一句话：Product List 表头按版本区分：6.01 无注释列；6.4 及以下为“制造商”，6.5 起为“回复方”。
- Smelter not yet identified 回填差异（Standard Smelter Name=Unknown，Country 多为 Unknown；6.5 Tungsten 行为空）；建议改写一句话：Smelter not yet identified 仅回填 Standard Smelter Name/Country（6.5 Tungsten 行为空），冶炼厂名称仍需手填。
- 仅 CMRT 存在“金属+冶炼厂查找组合合法性”提示；建议改写一句话：“金属+冶炼厂查找”组合合法性提示仅适用于 CMRT。

**EMRT（1.1–2.1）**
- 1.x 无 Mine List；2.0+ 新增 Mine List，且“!” 触发提示；建议改写一句话：EMRT 1.x 无 Mine List；2.0+ 新增且“!” 触发提示。
- 矿产申报范围与问题区联动（2.0+ 动态矿种、字母序输出；Delete [Mineral] 不自动重排）；建议改写一句话：2.0+ 问题区矿种由申报范围动态生成并按字母序输出，Delete [Mineral] 后需人工校对。
- 公司层面问题 A/B/D 与 C/E 的版本差异（1.1→1.11 文案更新；2.0+ C/E 改为“指定矿产”）；建议改写一句话：公司层面问题文案按版本区分：1.1→1.11 更新 A/B/D；2.0+ C/E 改为“指定矿产”。
- Smelter List 表头误标与版本字段差异（1.x “金属 l (*)”“冶炼厂名称 (1)”；2.0+ 修正并新增 Combined 列）；建议改写一句话：Smelter List 表头按版本区分：1.x 存在“金属 l (*)/冶炼厂名称 (1)”误标，2.0+ 修正并新增 Combined 列（2.1）。
- Smelter not yet identified 行为与 L 页说明不一致（国家空、触发提示）；建议改写一句话：以 Look‑up+条件格式为准：Smelter not yet identified 的国家为空并触发提示，L 页说明不一致。
- Product List 2.1 新增“请求方产品编号/名称”；建议改写一句话：EMRT 2.1 的 Product List 新增请求方产品编号/名称。

**CRT（2.2–2.21）**
- 2.21 版本新增选项（Q2 “DRC or adjoining countries only”；G 题 “Yes, Using Other Format (Describe)”）；建议改写一句话：CRT 2.21 新增 Q2“DRC or adjoining countries only”与 G 题“Using Other Format”。
- Smelter List 表头误标（“金属 l (*)”）；建议改写一句话：CRT Smelter List 的“金属 l (*)”为模板误标。
- Smelter not yet identified 回填规则（Standard Smelter Name/Country=Unknown，名称不自动回填）；建议改写一句话：Smelter not yet identified 仅回填 Standard Smelter Name/Country=Unknown，冶炼厂名称仍需手填。
- Checker cfExt（A57）规则需人工核验表现；建议改写一句话：A57（Smelter List - Cobalt）为 cfExt 规则，需人工核验高亮表现。

**AMRT（1.1–1.3）**
- 矿产申报范围输入方式随版本变化（1.1/1.2 自由输入≤10，预填但可改；1.3 下拉+Other）；建议改写一句话：AMRT 1.1/1.2 为自由输入（≤10，预填可改），1.3 改为下拉并支持 Other。
- 矿种问题区排序与 Other 映射（1.3 公式字母序；Other 用 D15:I16 替换并参与排序）；建议改写一句话：1.3 按字母序输出所选矿种，Other 由 D15:I16 替换后参与排序。
- Smelter Look‑up 仅 1.3 存在，表头/列位移与双列名称差异；建议改写一句话：AMRT 仅 1.3 有 Smelter Look‑up，冶炼厂名称分为下拉/手填两列且列位右移。
- Mine List 1.3 有 Smelter 下拉，1.1/1.2 手填；“!” 触发提示；建议改写一句话：AMRT 1.3 Mine List 连接 Smelter 下拉，1.1/1.2 为手填且“!” 触发提示。
- Instructions 排除矿种口径（不含 3TG/钴/铜/石墨/锂/云母/镍），产品仅通过下拉/Other 控制不做阻断；建议改写一句话：AMRT 排除矿种仅通过下拉/Other 控制范围，不额外阻断。
- 地址字段 Instructions 要求必填，但 Declaration 未标星、Checker 未列（模板内部不一致）；建议改写一句话：地址以 Instructions 为准必填，但模板内部标星/Checker 不一致需说明。

**Minerals Scope（AMRT）**
- 可选补充信息；但一旦填写：矿种必须从已申报范围中选择，且填写了矿种必须补充对应“纳入原因”。

## 7. 版本策略与可插拔规则
- 版本为“模板 + 规则”一体：每个版本独立 schema + 规则集。
- 版本兼容策略：同模板内仅向后兼容显示/导出，不强行兼容填写逻辑。
- 规则冲突处理：以模板版本为单位判定，不做跨版本“自动推断”。

## 8. 国际化与语言
- 模板内部分字段/选项仅有英文原文（矿种、回答选项、系统列）。
- 模板文字要求“仅以英文作答”；中文环境验证仍以英文选项值为准（产品执行为提示口径，不做强制校验）。

## 8.1 术语与缩写（通用）
- CAHRA：受冲突影响和高风险地区。
- SEC：美国证券交易委员会。
- IPC1755：供应链尽职调查信息交换标准（IPC 1755）。
- EU：欧盟。

## 8.2 术语统一口径（产品层）
- 统一字段口径以 `docs/prd/field-dictionary.md` 为准（同义字段统一展示）。
- UI 统一称呼：公司信息 / 申报范围 / 矿物范围 / 申报问题 / 公司层面问题 / 冶炼厂清单 / 矿厂清单 / 产品清单。
  - 注：AMRT 中文模板中 Minerals Scope 译为“矿物范围”，本文与 UI 统一为“矿物范围”（英文导出不变）。
- “注释/备注”在 UI 中统一展示为“注释”。
- Smelter List / Mine List / Minerals Scope 等英文名仅保留为辅助说明，不作为主标题。

## 9. 交互与行为约束（摘要）
- Scope=Product → Product List 必填；Scope=User defined → Scope Description 必填。
- 动态矿种模板（EMRT 2.0+）：矿种选择驱动问题区生成顺序；Delete [Mineral] 删除后答案不自动重排；**2.0+ 公式已按字母序排序**（2.1 文案明确说明按字母顺序自动填充）。
- EMRT 1.1–1.3：问题区固定为 Cobalt / Mica，不受选择影响。
- AMRT 1.3：矿种选择驱动问题区生成顺序；无 Delete [Mineral] 机制（模板文字说明按字母序自动填充，公式实现亦为字母序）。
- AMRT 1.1/1.2：申报范围输入驱动问题区生成（自由输入，模板预填默认矿种：1.1 英文/1.2 中文）；并按文本排序输出；无 Delete [Mineral] 机制。
- AMRT 1.1–1.3：矿产申报范围最多 10 种（模板文字要求，产品强制 ≤10）。
- AMRT：模板 Instructions 强烈建议先填写 Minerals Scope 再提交（提示，不强制）。
- AMRT 1.3：Other 选中槽位必须填写对应 D15:I16；数量匹配；Other 内容替代进入问题区排序。
- AMRT 1.3：模板 Instructions 说明申报范围不包括 3TG、钴、铜、石墨、锂、云母、镍（已在 CMRT/EMRT 覆盖）；产品执行口径：**通过下拉选项与 Other 控制范围，不做额外阻断**。
- Smelter List：
  - Smelter not listed → Name + Country 必填（仅含 Smelter Look‑up 的模板：CMRT/EMRT/CRT/AMRT 1.3）。
  - not yet identified → 标准冶炼厂名称=Unknown；国家可能为空（EMRT/AMRT）或为 Unknown（CMRT/CRT；**CMRT 6.5 的 Tungsten 行为空**）；且不自动回填到“冶炼厂名称”手填列（建议提示用户补全，非强制）。
  - 回填差异：CMRT/EMRT/CRT 对 not yet identified 的回填细节不同，以上仅为摘要；以对应模板差异文档为准。
  - **仅 CMRT**：存在“金属 + 冶炼厂查找组合不在目录 → 触发提示”的组合合法性校验（条件格式）。
  - 填写路径与版本差异详见：`docs/prd/smelter-list-summary.md`。
- 若填写方为冶炼厂/精炼厂，模板建议在 Smelter List 填写本公司信息（提示，不强制）。
- CMRT/EMRT/CRT/AMRT：填写冶炼厂联系人姓名或电子邮件前，需确认已取得联系人同意（模板提示）。
- AMRT 1.1–1.3：填写矿厂联系人姓名或电子邮件前，需确认已取得联系人同意（模板提示）。
- 公司信息输入提示（模板 Instructions）：
  - 公司名称为 Legal Name，不使用缩写，可包含其他商业名称/DBA。
  - 授权人姓名需明确，不可填 `same` 等占位；可与联系人不同。
  - 联系人/授权人邮箱无可填 `not available`/`n/a`；空白可能导致模板错误。
  - Declaration DV 文案（非日期，提示/错误）：
    - **申报范围下拉**：errorTitle=“Required Field”；error=“Select from dropdown options to declare survey scope”（CMRT/EMRT/CRT/AMRT 全版本）。
    - **联系人姓名为空**：errorTitle=“Blank Field”；error=“Please enter your contact name.”（CMRT 6.22+；AMRT 1.1–1.3）。
    - **AMRT 1.1/1.2 矿产输入**：promptTitle=“Enter Minerals/Metals”；prompt=“Please enter up to 10 minerals or metals for the Declaration.”
    - **AMRT 1.3 矿产下拉**：promptTitle=“Select Minerals/Metals”；prompt=“Please select up to 10 minerals or metals for the Declaration... If mineral or metal doesn't appear on the list, select \"Other\".”
    - **AMRT 1.3 Other 自定义校验**：promptTitle=“Enter Other Minerals/Metals”；prompt=“If Other was selected in cell X, enter the mineral/metal here.”；error=“You must select Other in cell X to enter a mineral/metal in this cell.”
    - **AMRT Minerals Scope**：promptTitle=“Select Minerals/Metals in Scope”；prompt=“Select 1 of the entered minerals/metals in scope to provide reasons for inclusion on the AMRT.”（1.1 为 PRT 字样）。
    - **CMRT 6.31+ 额外输入提示**：Company Name / Contact Name / Contact Email / Contact Phone / Authorizer Name / Authorizer Email 等 prompt 文案（仅提示，不强制）。
  - 日期格式统一为 **DD-MMM-YYYY**；模板错误提示为“Invalid date / date entered must be in international format DD-MMM-YYYY...”。  
    - Excel 输入如 `2026-01-01` 会自动格式化为 `01-Jan-2026`（模板行为）。  
    - 模板 DV 范围：EMRT/CRT/AMRT 为 **31-Dec-2006 – 31-Mar-2026**；**CMRT 6.01–6.22 为 31-Dec-2006 – 31-Mar-2026，CMRT 6.31+ 为 >31-Dec-2006**；**产品层面仅提示不阻断**。
  - 文件名示例：companyname-date.xls / companyname-date.xlsx（date as YYYY-MM-DD，与日期字段格式不一致）。

## 10. 风险与待决策
- AMRT 1.1–1.3 地址字段：按模板文字要求必填（以 Instructions 为准），但 Checker 未标记且字段无 *（模板内部不一致）。
- AMRT 1.1/1.2 Smelter List：国家/地区为必填列，但条件格式未单独提示（模板内部不一致）。
- AMRT 1.1–1.3 的问题区/清单在 Checker 中未完全覆盖：以模板文字要求为准，Checker 仅作为辅助提示。
- 自动解析结果可能遗漏条件格式（openpyxl 对 Conditional Formatting 扩展支持有限）；涉及标红/必填提示需与模板逐页核对。
- CRT 2.2 Checker A57（Smelter List - Cobalt）存在 cfExt 规则，需人工核验其高亮表现。

## 11. 验收标准（摘要）
- 各模板版本可完整映射至 UI 表单与数据结构。
- 校验规则与模板一致（包含 Checker 与 Instructions 规则）。
- 对同一模板不同版本，输出差异可追溯（与 `docs/diffs/*.md` 一致）。

## 12. 统一规则清单（提炼版）

> 目的：把跨模板的“条件必填/联动规则”抽成可评审清单，便于产品评审与研发落地。

### 1. Mine List 条件必填（跨模板统一）
**规则 ML-1：当金属已选择时，Mine List 的关键字段必须填写**
- 适用模板：**EMRT 2.0+ / AMRT 1.1–1.3**（仅这两类包含 Mine List）
- 触发条件：**“金属”列有值**（该行被激活）
- 必填字段（同名不同表头）：
  - 从该矿厂采购的冶炼厂的名称（EMRT 2.1/AMRT 1.3 为下拉；EMRT 2.0/AMRT 1.1–1.2 为手填）
  - 矿厂所在国家或地区（国家列表）
- 依据：模板条件格式提示“金属已选时对应列为空 → 标红”；**矿厂(矿场)名称未见条件格式提示，建议填写但不做标红**。
- 字段名称差异与映射见 `docs/prd/field-dictionary.md`。
- 实现建议：行未激活不提示；行激活对关键列做必填提示。

### 2. 其他跨模板联动（摘要）
> 详见 `docs/diffs/checker-matrix.md`
- 申报范围=Product → Product List 必填（所有模板适用）。
- 申报范围=User defined → 范围描述必填（所有模板适用）。
- 动态矿种模板（EMRT 2.0+ / AMRT 1.3）：矿种选择驱动问题区行数与顺序。
- CMRT：Q3–Q8 仅在对应金属 Q1/Q2=Yes 时必答；公司层面 A–H 仅在任一金属 Q1/Q2=Yes 时必答。
- EMRT：Q3–Q7 仅在对应矿种 Q1=Yes 且 Q2=Yes 时必答；公司层面 A–G 仅在任一矿种 Q1/Q2=Yes 时必答。
- CRT：Q2–Q6 仅在 Q1=Yes 时必答；公司层面 A–I 仅在 Q1=Yes 时必答。
- URL/说明类注释：CMRT B=Yes → URL；CMRT E=“Using other format”→ 注释；EMRT B=Yes → URL；EMRT E=“Using Other Format”→ 注释；CRT A=Yes → URL；CRT G=“Using Other Format”→ 注释。
- Smelter not listed → 冶炼厂名称/国家必填（CMRT/EMRT/CRT/AMRT 1.3）。
- 输入内容不应以“=”或“#”开头（模板 Instructions 提示，产品层面建议提示）。
- **大小写容错**：模板内下拉值大小写混用（如 `Smelter Not Listed` / `Smelter not listed`、`Smelter Not Yet Identified` / `Smelter not yet identified`）；文档统一小写口径，解析与校验需大小写不敏感。
- Mine List：名称或国家包含 “!” → 触发提示（EMRT 2.0+ / AMRT 1.1–1.3）。
- Smelter List 条件格式细则见 `docs/diffs/conditional-format-matrix.md`。

## 13. 语言输入建议规范（非强制）

> 目的：对模板中“仅以英文作答”的要求形成统一提示口径，不做强制校验。

### 1. 总体原则
- **产品层面为“建议提示”**：不阻断提交，不强制校验。
- **字段值优先英文**：尤其是文本字段/备注/说明类输入。
- **UI 可中文展示**：界面提示与字段中文名保留中文，但提示用户“建议英文”。

### 2. 建议提示覆盖范围（按模板）
| 模板 | 建议英文作答区域 |
|---|---|
| CMRT | 公司信息 / 申报问题 Q1–Q8 / 公司层面 A–H / Smelter List |
| EMRT 2.0+ | 公司信息 / 申报问题 Q1–Q7 / 公司层面 A–G / Mine List |
| EMRT 1.1–1.3 | 公司信息 / 申报问题 Q1–Q7 / 公司层面 A–G |
| CRT | 公司信息 / 申报问题 Q1–Q6 / 公司层面 A–I / Smelter List |
| AMRT | 公司信息 / 申报问题 Q1–Q2 / Minerals Scope / Smelter List / Mine List（含 1.1） |

### 3. 推荐提示文案（中文）
- 通用提示：**“模板建议英文填写，系统不强制，请尽量使用英文。”**
- 矿产/问题区提示：**“问题区建议英文作答（模板要求）。”**
- 清单区提示：**“清单字段建议英文填写（模板要求）。”**

### 4. 非强制策略建议
- 仅提示，不阻断。
- 提交时可做软提示（Toast/Info），不影响保存。
- 若未来需强制，可在配置层按模板/版本打开强制校验开关。

## 附录 A. Definitions 精选术语摘要
- 参见：`docs/prd/definitions-summary.md`

## 附录 B. Definitions 统一附录
- 参见：`docs/prd/appendix-definitions.md`

## 附录 C. 术语统一主表
- 参见：`docs/prd/definitions-master.md`
