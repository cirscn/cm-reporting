# CMRT 6.31 验收清单（版本化）

> 基于本地模板解析，结构整体一致，但 Product List 与 6.5 存在字段命名差异（6.31 仍为“制造商”）。

## 1. Declaration（公司信息必填）
- 公司名称、申报范围或种类、联系人姓名、电子邮件-联系人、电话-联系人、授权人、电子邮件-授权人、生效日期。
- 申报范围=User defined → 范围描述必填。
- 生效日期格式：DD-MMM-YYYY；DV 下限 >31-Dec-2006（超出仅提示不阻断；Excel 可自动格式化 YYYY-MM-DD → DD-MMM-YYYY）。

## 2. 申报问题（Q1–Q8）
- Q1/Q2：钽/锡/金/钨均必须回答。
- Q3–Q8：仅当该金属在 Q1/Q2 中回答为 Yes 时才要求填写。

## 3. 公司层面问题（A–H）
- 仅当任一金属在 Q1/Q2 中回答为 Yes 时才要求填写。
- E 题若回答 “Yes, using other format (describe)” → 注释必填。

## 4. Product List
- 申报范围=Product → “制造商的产品序号 (*)”必填。

## 5. Smelter List 校验条款（条件格式）
- 金属为空 → 触发提示。
- 金属已填但冶炼厂查找为空 → 触发提示。
- 金属 + 冶炼厂查找 组合不在目录 → 触发提示。
- 选择金属为钽/锡/金/钨，但 Declaration 对应问题为空 → 金属/冶炼厂查找触发提示。
- 冶炼厂查找已选且不为 Smelter not listed，但冶炼厂名称为空 → 触发提示。
- 冶炼厂查找=Smelter not listed 且冶炼厂名称为空 → 触发提示。
- 冶炼厂查找=Smelter not listed 且冶炼厂所在国家或地区为空 → 触发提示。
- 冶炼厂名称或国家/地区包含 “!” → 触发提示。
- 冶炼厂识别号码输入列不为空且与自动填充的冶炼厂识别不一致 → 触发提示。
- 冶炼厂出处识别号出现 “Enter smelter details” → 触发提示。

## 6. Smelter not yet identified 取值核对
- 标准冶炼厂名称=Unknown，国家=Unknown。
