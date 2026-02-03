# 条件格式差异矩阵（按模板 × 版本）

> 适用范围：仅汇总 **Smelter List** 的条件格式（标红/提示）差异。  
> 口径优先级：模板文字（Instructions/表内说明） > 条件格式/Checker > 实现约束。  
> 说明：模板内下拉值大小写混用（Smelter Not Listed / Smelter not listed），实现需大小写不敏感。

## 1. CMRT（6.01–6.5）
| 版本 | Smelter Look‑up | 条件格式提示 | 差异 |
|---|---|---|---|
| 6.01–6.1 | 有 | 金属为空 / 查找为空 / 组合不合法 / not listed 名称或国家为空 / 名称或国家含 “!” / 识别号不一致 / “Enter smelter details” | 基线 |
| 6.22–6.31 | 有 | 以上全部 + **非 not listed 名称为空提示** | 6.22+ 新增 |
| 6.4–6.5 | 有 | 以上全部 + **Declaration 对应金属问题未作答 → 金属/查找提示** | 6.4+ 新增 |

## 2. EMRT（1.1–2.1）
| 版本 | Smelter Look‑up | 条件格式提示 | 差异 |
|---|---|---|---|
| 1.1–1.2 | 有 | 金属为空 / 查找为空 / 非 not listed 名称为空 / not listed 名称或国家为空 / 名称或国家含 “!” / 识别号不一致 / “Enter smelter details” | 1.1–1.2 基线 |
| 1.3 | 有 | 以上全部 + **Q1/Q2 对应矿种回答为 No/Unknown/Not applicable for this declaration → 金属/查找/名称/国家提示** | 1.3 新增 |
| 2.0 | 有 | 金属为空 / 查找为空 / not listed 国家为空 / “Enter smelter details” | **移除**“名称/国家含 !”“识别号不一致” |
| 2.1 | 有 | 金属为空 / 查找为空 / not listed 国家为空 / not yet identified → 国家提示 / “Enter smelter details” | 2.1 新增 not yet identified 提示 |

## 3. CRT（2.2 / 2.21）
| 版本 | Smelter Look‑up | 条件格式提示 | 差异 |
|---|---|---|---|
| 2.2 | 有 | 金属为空 / 查找为空 / not listed 名称或国家为空 / 名称或国家含 “!” / 识别号不一致 / “Enter smelter details” | 基线 |
| 2.21 | 有 | 与 2.2 一致 | 无差异 |

## 4. AMRT（1.2–1.3）
| 版本 | Smelter Look‑up | 条件格式提示 | 差异 |
|---|---|---|---|
| 1.2 | 无 | 金属为空 / 金属已选但名称为空 / 名称含 “!” | 无 Look‑up |
| 1.3 | 有（名称下拉 + 手填列） | 金属为空 / 查找为空 / not listed → 名称提示 / not yet identified → 国家提示 / “Enter smelter details” | 引入 Look‑up |

## 5. AMRT 1.1
| 版本 | Smelter Look‑up | 条件格式提示 | 差异 |
|---|---|---|---|
| 1.1 | 无 | 金属为空 / 金属已选但名称为空 / 名称含 “!” | 国家为必填列但 **条件格式未单独提示** |

## 6. 使用建议（产品/测试）
- 条件格式仅反映“提示/标红”，不等同于必填完整性；必填仍需参考模板文字与 * 标记。  
- 若需严格对齐 Excel 行为，建议以本矩阵为准补齐 UI 的“提示/标红”规则。  
