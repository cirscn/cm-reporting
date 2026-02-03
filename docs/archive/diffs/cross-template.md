# CMRT / EMRT / CRT / AMRT 模板差异总览（中文模板）

## 1. 页面/Tab 结构
- CMRT：Revision / Instructions / Definitions / Declaration / Smelter List / Checker / Product List / Smelter Look-up
- EMRT：Revision / Instructions / Definitions / Declaration / Smelter List / Checker / Product List / Smelter Look-up（2.0+ 追加 Mine List）
- CRT：Instructions / Revision / Definitions / Declaration / Smelter List / Checker / Product List / Smelter Look-up
- AMRT：Revision / Instructions / Definitions / Declaration / Minerals Scope / Smelter List / Checker / Mine List / Product List / Smelter Look-up
- AMRT 1.1：与 AMRT 同页签结构，无独立入口
> 注：模板内部还包含支撑表（下拉/校验数据），不作为 UI 页面展示。

## 2. Product List 表头差异
- CMRT：回复方的产品编号 (*) / 回复方的产品名称 / 注释
- EMRT：回复方的产品编号 (*) / 回复方的产品名称 / 备注（2.1 追加“请求方的产品编号 / 请求方的产品名称”）
- CRT：制造商产品编号 (*) / 制造商产品名称 / 备注
- AMRT：制造商的产品序号 (*) / 制造商的产品名称 / 请求方的产品编号 / 请求方的产品名称 / 注释
- AMRT 1.1：制造商的产品序号 (*) / 制造商的产品名称 / 注释
> 注：上述为“基线版本”口径；**CMRT 6.4 及以下为“制造商的产品序号/名称”，6.5 起为“回复方”字段**；**CMRT 6.01 第三列表头为 0/空值，6.1 起修复为“注释”**；**EMRT 1.x 为制造商、2.0+ 为回复方（2.1 新增请求方字段）**；**AMRT 1.2 无请求方字段、1.3 新增请求方字段**。

## 3. Smelter List 表头差异（前五列）
- CMRT：冶炼厂识别号码输入列 / 金属 (*) / 冶炼厂查找 (*) / 冶炼厂名称 / 冶炼厂所在国家或地区 (*)
- EMRT：冶炼厂识别号码输入列 / 金属 (*) / 冶炼厂查找 (*) / 冶炼厂名称 (*) / 冶炼工厂地址（国家） (*)
- CRT：冶炼厂识别号码输入列 / 金属 (*) / 冶炼厂查找 (*) / 冶炼厂名称 / 冶炼工厂地址（国家） (*)
> 注：部分模板表头原文含“(1)”，UI 可忽略括号。
- AMRT 1.3：冶炼厂识别号码输入列 / 金属 (*) / 冶炼厂名称（下拉） / 冶炼厂名称（手填） / 冶炼厂所在国家或地区 (*)（无“冶炼厂查找”列）
- AMRT 1.1/1.2：金属 (*) / 冶炼厂名称 (*) / 冶炼厂所在国家或地区 (*) / 冶炼厂识别 / 冶炼厂出处识别号（无“冶炼厂查找”列）

## 4. Mine List / Minerals Scope
- EMRT 2.0+ Mine List：金属 / 从该矿厂采购的冶炼厂的名称 / 矿厂(矿场)名称 / 矿厂识别（例如《CID》） / 冶炼厂出处识别号 / 矿厂所在国家或地区  
  - 2.1 新增“从该矿厂采购的冶炼厂的名称”下拉（Smelter List 过滤），2.0 为手动填写
- AMRT Mine List：金属 / 从该矿厂采购的冶炼厂的名称 / 矿厂(矿场)名称 / 矿厂识别（例如《CID》） / 冶炼厂出处识别号 / 矿厂所在国家或地区  
  - 1.3：从该矿厂采购的冶炼厂的名称为下拉（Smelter List 过滤）；1.1/1.2 为手填
- AMRT Minerals Scope：Select Minerals/Metals in Scope / Reasons for inclusion on the AMRT
- AMRT 1.1 Mine List：金属 / 从该矿厂采购的冶炼厂的名称 / 矿厂(矿场)名称 / 矿厂识别（例如《CID》） / 冶炼厂出处识别号 / 矿厂所在国家或地区
- AMRT 1.1 Minerals Scope：Select Minerals/Metals in Scope / Reasons for inclusion on the PRT（模板原文沿用 PRT 字样）

## 5. 关键结构差异（影响实现）
- AMRT 1.1–1.3 含 Minerals Scope（矿物范围）页签；CMRT/CRT/EMRT 无该页签。
- EMRT 2.0+ / AMRT 1.1–1.3 含 Mine List 页签；CMRT/CRT 无该页签。
- AMRT 1.3 才新增 Smelter Look-up；EMRT/CRT/CMRT 默认包含。
- AMRT Smelter List 表头不含“冶炼厂查找”列（与 CMRT/EMRT/CRT 不同）；AMRT 1.3 通过“冶炼厂名称下拉”连接 Smelter Look-up。
- AMRT 1.1/1.2 Declaration 问题区矿种为模板预填默认列表（1.1 为英文、1.2 为中文；矿种同 Aluminium/Chromium/Copper/Lithium/Nickel/Silver/Zinc；可编辑且无下拉校验）；AMRT 1.3 由下拉生成。
- EMRT 1.x Smelter List 表头“金属 l (*)”为模板误标（2.0 起修正为“金属 (*)”）。
- CRT 2.2/2.21 Smelter List 表头“金属 l (*)”为模板误标（未修正）。

## 6. 日期字段口径（跨模板）
- 日期格式统一为 **DD-MMM-YYYY**（模板错误提示为 “Invalid date / date entered must be in international format DD-MMM-YYYY...”）。  
- Excel 可将 `YYYY-MM-DD` 自动格式化为 `DD-MMM-YYYY`。  
- 模板 DV 范围：  
  - EMRT/CRT/AMRT：**31-Dec-2006 – 31-Mar-2026**  
  - CMRT 6.01–6.22：**31-Dec-2006 – 31-Mar-2026**  
  - CMRT 6.31+：**>31-Dec-2006**  
- 口径：**产品层面仅提示不阻断**。
