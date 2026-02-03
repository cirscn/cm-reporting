# 冲突矿产模板校验矩阵（基于 Checker + Instructions，中文模板）

> 说明：表 1 仅统计 **Checker 明确标记为必填（F=1）** 的项目；表 2 为 **条件联动**（来自 Instructions/Declaration/Smelter List 说明）。

## 1. Checker 明确必填项（F=1）
| 模板 | 公司信息 | 申报范围/矿物范围 | 申报问题矩阵 | 公司层面问题 | Smelter List | Mine List | Product List |
|---|---|---|---|---|---|---|---|
| CMRT | 8 项 | 申报范围必填 | Q1–Q8 × 3TG（钽/锡/金/钨） | A–H | 4 金属 | — | F=0（条件） |
| EMRT | 9 项 | 申报范围必填（2.0+ 追加矿产申报范围） | Q1–Q7 × 矿种（2.0+ 申报矿种；1.1–1.3 固定 Cobalt/Mica） | A/B/D–G + C×矿种 | 申报矿种 | — | F=0（条件） |
| CRT | 8 项 | 申报范围必填 | Q1–Q6 × 钴 | A–I | 钴 | — | F=0（条件） |
| AMRT 1.2/1.3 | 8 项 | 申报范围 + 矿产申报范围必填 | Checker 未标 Q1/Q2 为必填 | — | Checker 未标 | — | F=0（条件） |
| AMRT 1.1 | 8 项 | 申报范围 + 矿产申报范围必填 | Q1 × 申报矿种（预填默认列表，可编辑；Checker；Q2 见条件规则） | — | 申报矿种（可编辑） | — | F=0（条件） |

## 2. 条件必填与联动规则
| 规则 | CMRT | EMRT | CRT | AMRT 1.2/1.3 | AMRT 1.1 |
|---|---|---|---|---|---|
| 申报范围=Product (or List of Products) → Product List 必填 | 适用 | 适用 | 适用 | 适用 | 适用 |
| 申报范围=User defined → 范围描述必填 | 适用 | 适用 | 适用 | 适用 | 适用 |
| 申报范围/矿种选择驱动问题区行数 | 固定 3TG | 2.0+ 动态矿种（1.1–1.3 固定 Cobalt/Mica） | 固定钴 | 动态矿种（1.2 自由输入 / 1.3 下拉） | 申报范围内矿种（预填默认列表，当前 7 种，可编辑） |
| Q1/Q2=Yes → 需回答后续问题 | Q3–Q8 | Q3–Q7（仅当 Q1=Yes 且 Q2=Yes） | Q2–Q6 + A–I | — | — |
| 任一金属/矿种 Q1/Q2=Yes → 公司层面问题必答 | 适用 | 适用 | 适用 | — | — |
| Q2(或同类百分比题)=100% → 需列出全部冶炼厂 | — | — | — | 适用 | 适用 |
| Q2=Did not survey → 注释需提供证据/说明 | — | — | — | 适用 | 适用 |
| A/B 类问题若答 Yes → 注释需提供 URL | 适用 | 适用 | 适用 | — | — |
| Smelter not listed → 冶炼厂名称/国家必填 | 适用 | 适用 | 适用 | 仅 1.3 | 不适用 |
| Mine List：金属已选 → 从该矿厂采购的冶炼厂的名称/矿厂所在国家或地区必填（条件格式提示） | — | 2.0+ 适用 | — | 适用 | 适用 |

> 注：AMRT 1.1–1.3 的问题区与 Smelter/Mine List 仍在模板说明中被要求填写，但 **Checker 未全部标为必填**；以 Instructions/Sheet 规则为准。
> 另：AMRT 1.1–1.3 的“地址”字段按模板文字要求必填（以 Instructions 为准），但 Declaration 未标星且 Checker 未列（模板内部不一致，需在实现说明注明）。
> 另：模板多处写“仅以英文作答”，产品执行口径为**建议提示**（不做强制校验）。
> 另：模板内下拉值大小写混用（如 Smelter Not Listed / Smelter not listed、Smelter Not Yet Identified / Smelter not yet identified）；文档统一小写口径，需大小写不敏感。
