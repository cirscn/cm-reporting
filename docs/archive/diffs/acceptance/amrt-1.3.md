# AMRT 1.3 验收清单（版本化）

## 1. Declaration（公司信息必填）
- 公司名称、申报范围或种类、矿产申报范围（至少选择 1 种；**最多 10 种**）、联系人信息、授权人信息、生效日期。
- 地址：模板文字要求必填（以 Instructions 为准，模板内部不一致需标注）。
- 申报范围=User defined → 范围描述必填。
- 申报范围=Product → Product List 至少填写“制造商的产品序号”。
- 选择 Other [specify below] → “其他矿产”必填；未选 Other 不得填写。
- Other 选中槽位数量必须等于 D15:I16 填写数量（对应槽位一一匹配）。
- 生效日期格式：DD-MMM-YYYY；DV 范围 31-Dec-2006 – 31-Mar-2026（超出仅提示不阻断；Excel 可自动格式化 YYYY-MM-DD → DD-MMM-YYYY）。

## 2. 申报问题（Q1–Q2）
- 所选矿产均必须回答（每矿种一列/一行）。
- 问题区矿种按模板排序输出（1.3 文案字母序 + 公式排序）。
- Q2=100% → 需列出该矿产全部冶炼厂（Smelter List）。
- Q2=Did not survey → 注释需提供证据/说明（模板文字要求）。

## 3. Minerals Scope（矿物范围）
- 可选填写，不影响 Declaration 必填；但一旦填写：矿种必须从已申报范围中选择，且填写了矿种必须补充对应“纳入原因”（首行与后续行同规则）。

## 4. Product List
- 申报范围=Product → “制造商的产品序号 (*)”必填。

## 5. Mine List
- 条件必填提示：金属已选 → 从该矿厂采购的冶炼厂的名称/矿厂所在国家或地区必填提示（条件格式）。
- “从该矿厂采购的冶炼厂的名称”或矿厂所在国家或地区含 “!” → 触发提示。

## 6. Smelter List
- 1.3 启用 Smelter Look-up（冶炼厂名称下拉 + 手填列）。
- 金属为空 → 触发提示。
- 金属已填但冶炼厂名称下拉为空 → 触发提示。
- 冶炼厂名称下拉=Smelter not listed 且名称/国家为空 → 触发提示。
- 冶炼厂名称下拉=Smelter not yet identified → 国家列提示（且不自动回填）。
- 冶炼厂出处识别号出现 “Enter smelter details” → 触发提示。

## 7. 版本差异要点
- 新增 Smelter Look-up
- Product List 增加“请求方”字段
