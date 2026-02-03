# EMRT 2.1 验收清单（版本化）

> 适用 2.1：2.0 基础上增加 Requester 字段与 Combined 列，新增 not yet identified 触发国家列提示规则。

## 1. Declaration（公司信息必填）
- 公司名称、申报范围或种类、范围描述（当 申报范围=User defined）、选择贵公司的矿产申报范围、联系人姓名、联系人电邮地址、联系人电话、授权人姓名、授权人电邮地址、授权日期。
- 授权日期格式：DD-MMM-YYYY；DV 范围 31-Dec-2006 – 31-Mar-2026（超出仅提示不阻断；Excel 可自动格式化 YYYY-MM-DD → DD-MMM-YYYY）。
- 说明：模板填写说明要求英文作答；中文环境验证仍以英文选项值为准（产品仅提示不强制）。

## 2. 矿种选择联动
- 选择矿种后，Questions 1–7 按字母顺序生成对应矿种行。
- Delete [Mineral] 会移除该矿种行；答案位置不自动重排。

## 3. 申报问题（Q1–Q7）
- Q1/Q2：所选矿种均必须回答。
- Q3–Q7：仅当对应矿种 Q1=Yes 且 Q2=Yes 时才要求填写（Q1=No/Unknown/Not declaring 或 Q2=No/Unknown → 不要求）。

## 4. 公司层面问题（A–G）
- 仅当任一矿种在 Q1/Q2 中回答为 Yes 时才要求填写。
- E 题若回答 “Yes, Using Other Format (Describe)” → 注释必填。

## 5. Product List
- 申报范围=Product → “回复方的产品编号 (*)”必填。
- 2.1 起增加“请求方”字段（可选）。

## 6. Mine List（矿厂清单）
- 2.0 起新增；条件必填提示：金属已选 → 从该矿厂采购的冶炼厂的名称/矿厂所在国家或地区必填提示（条件格式）。
- 从该矿厂采购的冶炼厂的名称或矿厂所在国家或地区包含 “!” → 触发提示（条件格式）。

## 7. Smelter List 校验条款（条件格式）
- 金属为空 → 触发提示。
- 金属已填但冶炼厂查找为空 → 触发提示。
- 冶炼厂查找=Smelter not listed 且冶炼工厂地址（国家）为空 → 触发提示。
- 冶炼厂查找=Smelter not yet identified → 冶炼工厂地址（国家）触发提示（且不自动回填）。
- 冶炼厂出处识别号出现 “Enter smelter details” → 触发提示。
- 2.0+：条件格式不再包含 1.x 的“名称/国家含 ! 提示”与“识别号不一致提示”（以模板条件格式为准）。

## 8. Smelter not yet identified 取值核对
- 标准冶炼厂名称=Unknown，国家为空（国家不自动回填）；L 页多语言说明称 D/E 自动 Unknown，但与 Look‑up/公式/条件格式不一致，实际以 Look‑up 口径为准。
