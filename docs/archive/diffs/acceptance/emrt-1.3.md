# EMRT 1.3 验收清单（版本化）

> 适用 1.x：固定矿种（钴 + 天然云母），无矿种多选字段。

## 1. Declaration（公司信息必填）
- 公司名称、申报范围或种类、联系人姓名、联系人电邮地址、联系人电话、授权人姓名、授权人电邮地址、授权日期。
- 授权日期格式：DD-MMM-YYYY；DV 范围 31-Dec-2006 – 31-Mar-2026（超出仅提示不阻断；Excel 可自动格式化 YYYY-MM-DD → DD-MMM-YYYY）。
- 申报范围=User defined → 范围描述必填。
- 说明：模板填写说明要求英文作答；中文环境验证仍以英文选项值为准（产品仅提示不强制）。

## 2. 申报问题（问题 1–7）
- 矿种固定为钴 + 天然云母；每题需分别回答。
- Q1/Q2：每矿种必填。
- Q3–Q7：仅当对应矿种 Q1=Yes 且 Q2=Yes 时必填（Q1=No/Unknown/Not applicable 或 Q2=No/Unknown → 不要求）。

## 3. 公司层面问题（A–G）
- A–G 为公司层面尽调问题；仅当申报问题要求时填写（与模板一致）。
- E 题若回答 “Yes, Using Other Format (Describe)” → 注释必填。

## 4. Product List
- 申报范围=Product → “制造商产品编号 (*)”必填。

## 5. Smelter List 校验条款（条件格式）
- 金属为空 → 触发提示。
- 金属已填但冶炼厂查找为空 → 触发提示。
- 1.3：若金属为 Cobalt/Mica 且 Q1/Q2 对应矿种回答为 No/Unknown/Not applicable for this declaration → 金属/冶炼厂查找/冶炼厂名称/国家列触发提示。
- 冶炼厂查找已选且不为 Smelter not listed，但冶炼厂名称为空 → 触发提示。
- 冶炼厂查找=Smelter not listed 且冶炼厂名称为空 → 触发提示。
- 冶炼厂查找=Smelter not listed 且冶炼工厂地址（国家）为空 → 触发提示。
- 冶炼厂名称或国家包含 “!” → 触发提示。
- 冶炼厂识别号码输入列不为空且与自动填充的冶炼厂识别不一致 → 触发提示。
- 冶炼厂出处识别号出现 “Enter smelter details” → 触发提示。

## 6. Smelter not yet identified 取值核对
- 标准冶炼厂名称=Unknown，国家为空。
