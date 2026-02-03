# CRT 2.2 验收清单（版本化）

> 基于本地模板解析，结构稳定；2.21 相比 2.2 新增少量答案选项（见 2.21 验收清单）。

## 1. Declaration（公司信息必填）
- 公司名称、申报范围或种类、联系人姓名、联系人电邮地址、联系人电话、授权人姓名、授权人电邮地址、授权日期。
- 授权日期格式：DD-MMM-YYYY；DV 范围 31-Dec-2006 – 31-Mar-2026（超出仅提示不阻断；Excel 可自动格式化 YYYY-MM-DD → DD-MMM-YYYY）。
- 申报范围=User defined → 范围描述必填。
- 说明：公司资料填写说明建议英文作答（产品提示，不强制校验）。

## 2. 申报问题（Q1–Q6）
- 钴（Cobalt）均必须回答。
- 说明：六个申报问题建议英文作答（产品提示，不强制校验）。

## 3. 公司层面问题（A–I）
- 仅当 Q1 对钴回答为 Yes 时才要求填写（公司层面尽调问题）。
- G 题若回答 “Yes, Using Other Format (Describe)” → 注释必填。
- 说明：A–I 问题建议英文作答（产品提示，不强制校验）。

## 4. Product List
- 申报范围=Product → “制造商产品编号 (*)”必填。

## 5. Smelter List 校验条款（条件格式）
- 金属为空 → 触发提示。
- 金属已填但冶炼厂查找为空 → 触发提示。
- 冶炼厂查找=Smelter not listed 且冶炼厂名称为空 → 触发提示。
- 冶炼厂查找=Smelter not listed 且冶炼工厂地址（国家）为空 → 触发提示。
- 冶炼厂名称或国家包含 “!” → 触发提示。
- 冶炼厂识别号码输入列不为空且与自动填充的冶炼厂识别不一致 → 触发提示。
- 冶炼厂出处识别号出现 “Enter smelter details” → 触发提示。

## 6. Smelter not yet identified 取值核对
- 标准冶炼厂名称=Unknown，国家=Unknown。

## 7. Checker（cfExt）
- A57（Smelter List - Cobalt）：当 Smelter List 冶炼厂查找列非全空时触发高亮（cfExt 规则，openpyxl 可能无法解析）。
