# 冲突矿产模板验收清单总表（产品/测试可用）

> 覆盖版本：CMRT 6.01–6.5 / EMRT 1.1–2.1 / CRT 2.2–2.21 / AMRT 1.1–1.3  
> 规则来源：模板 Instructions / Checker / Smelter List 条件格式
> 差异复核清单：见 `docs/diffs/review-summary.md`（文案/表头/版本差异摘要，不作为验收项）
> 说明：各版本 CSV 可包含“版本新增字段/选项存在性”验收项（可测试行为）。
> 说明：模板内下拉值大小写混用（如 Smelter Not Listed / Smelter not listed、Smelter Not Yet Identified / Smelter not yet identified）；本表统一小写口径，验收需大小写不敏感。

## A. 通用验收（所有模板适用）
1. **申报范围 → 产品清单**
   - 申报范围=Product (or List of Products)：产品清单必须填写。
   - 申报范围=User defined：必须填写范围描述。

## A.1 仅含 Smelter Look‑up 模板适用（CMRT / EMRT / CRT / AMRT 1.3）
> 用例索引：`docs/diffs/acceptance/cases/common.csv`
2. **Smelter List 三种填写路径**
   - 选项 A：已知冶炼厂识别号码 → 输入号码后，其余列自动填充，名称列变灰。
   - 选项 B：已知金属 + 冶炼厂查找名称 → 先选金属，再选冶炼厂查找。
   - 选项 C：已知金属 + 冶炼厂名称 → 冶炼厂查找选择 “Smelter not listed”，再手工填写名称与国家。
3. **Smelter Look‑up 特殊选项**
   - “Smelter not listed / Smelter not yet identified”为下拉选项，不是独立输入字段。
4. **自动填充字段**
   - 来源于 Smelter Look‑up 的字段为系统自动填充，产品侧应视为只读（与模板一致）。

## B. CMRT 验收清单（6.01–6.5）
### B1. Declaration（公司信息必填）
- 公司名称、申报范围或种类、联系人姓名、电子邮件-联系人、电话-联系人、授权人、电子邮件-授权人、生效日期。
- 申报范围=User defined → 范围描述必填。
- 生效日期格式：DD-MMM-YYYY；**6.01–6.22：DV 范围 31-Dec-2006 – 31-Mar-2026；6.31+：DV 下限 >31-Dec-2006**（超出仅提示不阻断；Excel 可自动格式化 YYYY-MM-DD → DD-MMM-YYYY）。
- DV 文案（非日期）：申报范围下拉错误提示 Required Field / “Select from dropdown options to declare survey scope”（6.01+）。
- 6.22+：联系人姓名为空错误提示 Blank Field / “Please enter your contact name.”  
- 6.31+：公司/联系人/授权人字段包含提示性 prompt 文案（Company Name / Contact Name / Contact Email / Contact Phone / Authorizer Name / Authorizer Email）。

### B2. 申报问题（Q1–Q8）
- Q1/Q2：钽/锡/金/钨均必须回答。
- Q3–Q8：仅当该金属在 Q1/Q2 中回答为 Yes 时才要求填写。

### B3. 公司层面问题（A–H）
- 仅当任一金属在 Q1/Q2 中回答为 Yes 时才要求填写。
- E 题若回答 “Yes, using other format (describe)” → 注释必填。

### B4. Product List
- 申报范围=Product → “产品编号 (*)”必填（CMRT 6.4 及以下为“制造商的产品序号”，6.5 起为“回复方的产品编号”）。

### B5. Smelter List 校验条款（条件格式）
- 金属为空 → 触发提示。
- 金属已填但冶炼厂查找为空 → 触发提示。
- 金属 + 冶炼厂查找 组合不在目录 → 触发提示（仅 CMRT）。
- 6.4+：选择金属为钽/锡/金/钨，但 Declaration 对应问题为空 → 金属/冶炼厂查找触发提示。
- 6.22+：冶炼厂查找已选且不为 Smelter not listed，但冶炼厂名称为空 → 触发提示。
- 冶炼厂查找=Smelter not listed 且冶炼厂名称为空 → 触发提示。
- 冶炼厂查找=Smelter not listed 且冶炼厂所在国家或地区为空 → 触发提示。
- 冶炼厂名称或国家/地区包含 “!” → 触发提示。
- 冶炼厂识别号码输入列不为空且与自动填充的冶炼厂识别不一致 → 触发提示。
- 冶炼厂出处识别号出现 “Enter smelter details” → 触发提示。

## C. EMRT 验收清单（1.1–2.1）
### C1. Declaration（公司信息必填）
- 公司名称、申报范围或种类、范围描述（当 申报范围=User defined）、联系人信息、授权人信息、授权日期。
- 2.0+：新增“矿产申报范围”下拉；1.x 为固定矿种（钴/云母），无该字段。
- 授权日期格式：DD-MMM-YYYY；DV 范围 31-Dec-2006 – 31-Mar-2026（超出仅提示不阻断；Excel 可自动格式化 YYYY-MM-DD → DD-MMM-YYYY）。
- DV 文案（非日期）：申报范围下拉错误提示 Required Field / “Select from dropdown options to declare survey scope”。
- 说明：模板填写说明要求英文作答；中文环境验证仍以英文选项值为准（产品仅提示不强制）。

### C2. 矿种选择联动
- 2.0+：选择矿种后，Questions 1–7 与 C 会按字母顺序生成矿种行。
- 2.0+：Delete [Mineral] 会移除该矿种行；答案位置不自动重排。

### C3. 申报问题（Q1–Q7）
- Q1/Q2：所选矿种均必须回答。
- Q3–Q7：仅当对应矿种 Q1=Yes 且 Q2=Yes 时才要求填写（Q1=No/Unknown/Not applicable/Not declaring 或 Q2=No/Unknown → 不要求）。

### C4. 公司层面问题（A–G）
- 仅当任一矿种在 Q1/Q2 中回答为 Yes 时才要求填写。
- E 题若回答 “Yes, Using Other Format (Describe)” → 注释必填。

### C5. Product List
- 申报范围=Product → 产品编号必填（1.x：制造商产品编号；2.0+：回复方的产品编号）。
- 2.1 起增加“请求方”字段（可选）。

### C6. Mine List（矿厂清单）
- 2.0+：新增；条件必填提示：金属已选 → 从该矿厂采购的冶炼厂的名称/矿厂所在国家或地区必填提示（条件格式）。
- 2.0+：“从该矿厂采购的冶炼厂的名称”或“矿厂所在国家或地区”包含 “!” → 触发提示（条件格式）。
- 2.1：新增“从该矿厂采购的冶炼厂的名称”下拉（Smelter List 过滤）；2.0 为手动填写。

### C7. Smelter List 校验条款（条件格式）
- 金属为空 → 触发提示。
- 金属已填但冶炼厂查找为空 → 触发提示。
- 1.3：若金属为 Cobalt/Mica 且 Q1/Q2 对应矿种回答为 No/Unknown/Not applicable for this declaration → 金属/查找/名称/国家列触发提示。
- 1.x：冶炼厂查找已选且不为 Smelter not listed，但冶炼厂名称为空 → 触发提示。
- 1.x：冶炼厂查找=Smelter not listed 且冶炼厂名称为空 → 触发提示。
- 冶炼厂查找=Smelter not listed 且冶炼工厂地址（国家）为空 → 触发提示。
- 2.1：冶炼厂查找=Smelter not yet identified → 标准冶炼厂名称=Unknown、国家为空；国家列触发提示（以 Look-up/公式/条件格式为准）。
- 2.0/1.x：Smelter not yet identified 无国家列提示（国家为空，且不自动回填）。
- 冶炼厂出处识别号出现 “Enter smelter details” → 触发提示。
- 1.x：存在“名称/国家包含 !”与“识别号不一致”提示；2.0+ 不再包含（以模板条件格式为准）。

## D. CRT 验收清单（2.2–2.21）
### D1. Declaration（公司信息必填）
- 公司名称、申报范围或种类、联系人姓名、联系人电邮地址、联系人电话、授权人姓名、授权人电邮地址、授权日期。
- 申报范围=User defined → 范围描述必填。
- 说明：公司资料填写说明建议英文作答（产品提示，不强制校验）。
- 授权日期格式：DD-MMM-YYYY；DV 范围 31-Dec-2006 – 31-Mar-2026（超出仅提示不阻断；Excel 可自动格式化 YYYY-MM-DD → DD-MMM-YYYY）。
- DV 文案（非日期）：申报范围下拉错误提示 Required Field / “Select from dropdown options to declare survey scope”。

### D2. 申报问题（Q1–Q6）
- 钴（Cobalt）均必须回答。
- 说明：六个申报问题建议英文作答（产品提示，不强制校验）。

### D3. 公司层面问题（A–I）
- 仅当 Q1 对钴回答为 Yes 时才要求填写（公司层面尽调问题）。
- G 题若回答 “Yes, Using Other Format (Describe)” → 注释必填。
- 说明：A–I 问题建议英文作答（产品提示，不强制校验）。

### D4. Product List
- 申报范围=Product → “制造商产品编号 (*)”必填。

### D5. Smelter List 校验条款（条件格式）
- 金属为空 → 触发提示。
- 金属已填但冶炼厂查找为空 → 触发提示。  
- 冶炼厂查找=Smelter not listed 且冶炼厂名称为空 → 触发提示。
- 冶炼厂查找=Smelter not listed 且冶炼工厂地址（国家）为空 → 触发提示。
- 冶炼厂名称或国家包含 “!” → 触发提示。
- 冶炼厂识别号码输入列不为空且与自动填充的冶炼厂识别不一致 → 触发提示。
- 冶炼厂出处识别号出现 “Enter smelter details” → 触发提示。

### D6. Checker（CRT 2.2 cfExt）
- Checker A57（Smelter List - Cobalt）：当 Smelter List 冶炼厂查找列非全空时触发高亮。  
  - 2.2：cfExt 规则，openpyxl 可能无法解析。  
  - 2.21：常规 conditionalFormatting，openpyxl 可解析。

## E. AMRT 验收清单（1.1–1.3）
### E0. AMRT 1.1
- Declaration：公司名称、申报范围或种类、矿产申报范围（自由输入；**最多 10 种**）、联系人信息、授权人信息、生效日期。
- 地址：模板文字要求必填（以 Instructions 为准，模板内部不一致需标注）。
- 申报范围=User defined → 范围描述必填。
- 申报范围=Product → Product List 至少填写“制造商的产品序号”。
- 生效日期格式：DD-MMM-YYYY；DV 范围 31-Dec-2006 – 31-Mar-2026（超出仅提示不阻断；Excel 可自动格式化 YYYY-MM-DD → DD-MMM-YYYY）。
- 申报问题（Q1–Q2）：矿种来自 Declaration 申报范围输入（自由输入，无固定候选）；Q2=100% → 需列出该矿产全部冶炼厂；Q2=Did not survey → 注释需提供证据/说明。
- Minerals Scope：可选填写，但一旦填写需从已申报范围中选矿种且补充“纳入原因”。
- Mine List：条件必填提示（金属已选 → 从该矿厂采购的冶炼厂的名称/矿厂所在国家或地区必填提示）；金属下拉来源为 Declaration 申报范围已选矿种。
- Smelter List：金属/冶炼厂名称/国家或地区为必填列（模板标 *）；条件格式提示“金属为空/名称为空/名称含 !”；金属下拉来源为 Declaration 申报范围已选矿种。
### E1. Declaration（公司信息必填）
- 公司名称、申报范围或种类、矿产申报范围、联系人信息、授权人信息、生效日期。
- 矿产申报范围最多 10 种（模板文字要求）。
- 地址：模板文字要求必填（以 Instructions 为准，模板内部不一致需标注）。
- 申报范围=User defined → 范围描述必填。
- 申报范围=Product → Product List 至少填写“制造商的产品序号”。
- 1.3：选择 Other [specify below] → “其他矿产”必填；未选 Other 不得填写。
- 1.3：Other 选中槽位数量必须等于 D15:I16 填写数量（对应槽位一一匹配）。
- 生效日期格式：DD-MMM-YYYY；DV 范围 31-Dec-2006 – 31-Mar-2026（超出仅提示不阻断；Excel 可自动格式化 YYYY-MM-DD → DD-MMM-YYYY）。
- DV 文案（非日期）：申报范围下拉错误提示 Required Field / “Select from dropdown options to declare survey scope”。
- 1.1/1.2：矿产申报范围输入提示 Enter Minerals/Metals / “Please enter up to 10 minerals or metals for the Declaration.”
- 1.3：矿产下拉提示 Select Minerals/Metals / “Please select up to 10 minerals or metals... If mineral or metal doesn't appear on the list, select \"Other\".”
- 1.3：Other 自定义校验提示/错误文案（Enter Other Minerals/Metals / “You must select Other...”）。
- 1.1–1.3：联系人姓名为空错误提示 Blank Field / “Please enter your contact name.”

### E2. 申报问题（Q1–Q2）
- 所选矿产均必须回答。
- 问题区矿种按模板排序输出（1.3 文案明确字母序；1.1/1.2 公式排序）。
- 1.3：Other 由 D15:I16 替换并参与问题区排序（对应槽位映射）。
- Q2=100% → 需列出该矿产全部冶炼厂（Smelter List）。
- Q2=Did not survey → 注释需提供证据/说明（模板文字要求）。

### E3. Minerals Scope（可选）
- 说明：可选补充信息；但一旦填写：矿种必须从已申报范围中选择，且填写了矿种必须补充对应“纳入原因”。
- DV 文案（非日期）：Select Minerals/Metals in Scope / “Select 1 of the entered minerals/metals in scope to provide reasons for inclusion...” （1.1 为 PRT 字样）。

### E4. Mine List（矿厂清单）
- 条件必填提示：金属已选 → 从该矿厂采购的冶炼厂的名称/矿厂所在国家或地区必填提示（条件格式）。
- “从该矿厂采购的冶炼厂的名称”或“矿厂所在国家或地区”包含 “!” → 触发提示（1.1–1.3）。

### E5. Smelter List 校验条款（条件格式）
- 1.2：金属为空 → 触发提示。
- 1.2：金属已选但冶炼厂名称为空 → 触发提示。
- 1.2：冶炼厂名称包含 “!” → 触发提示。
- 1.3：金属为空 → 触发提示。
- 1.3：金属已选但冶炼厂下拉为空 → 触发提示。
- 1.3：冶炼厂下拉=Smelter not listed → 冶炼厂名称/国家必填提示。
- 1.3：冶炼厂下拉=Smelter not yet identified → 国家列提示（且不自动回填）。
- 1.3：冶炼厂出处识别号出现 “Enter smelter details” → 触发提示。

## F. Smelter not yet identified 取值核对（避免误读）
- CMRT：标准冶炼厂名称=Unknown；国家由 Look‑up 回填，多数为 Unknown，**6.5 的 Tungsten 行为空**。
- EMRT：标准冶炼厂名称=Unknown；国家为空（不自动回填，触发提示）。
- CRT：标准冶炼厂名称=Unknown；国家=Unknown。
- AMRT：标准冶炼厂名称=Unknown；国家为空（不自动回填，触发提示）。
