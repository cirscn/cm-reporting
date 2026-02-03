# Smelter List 规则统一摘要（产品可读版）

> 目标：给产品/研发统一理解 Smelter List 的填写路径、必填规则与版本差异。  
> 口径优先级：模板文字（Instructions/表内说明） > 条件格式/Checker > 实现约束。

## 1. 填写路径（通用）
**适用模板：CMRT / EMRT / CRT / AMRT 1.3（含 Smelter Look‑up）**
1. 选项 A：已知冶炼厂识别号码 → 输入识别号码，其余字段自动回填（名称列灰化）。
2. 选项 B：已知金属 + 目录冶炼厂 → 先选金属，再从下拉选择冶炼厂。
3. 选项 C：已知金属 + 冶炼厂名称 → 下拉选择 “Smelter not listed”，再手填名称与国家。

**适用模板：AMRT 1.2 / AMRT 1.1（无 Smelter Look‑up）**  
仅手工填写：选金属 → 填冶炼厂名称 → 选国家/地区 → 补充其他信息。

## 2. 关键字段与来源（按模板）
| 模板 | Smelter Look‑up | 金属来源 | 必填字段（模板标 *） | 备注 |
|---|---|---|---|---|
| CMRT | 有 | 固定 3TG（钽/锡/金/钨） | 金属、冶炼厂查找、冶炼厂所在国家/地区 | Not listed / not yet identified 为下拉选项 |
| EMRT | 有 | Declaration 申报矿种 | 金属、冶炼厂查找、冶炼工厂地址（国家） | 2.0+ 动态矿种 |
| CRT | 有 | 固定钴 | 金属、冶炼厂查找、冶炼工厂地址（国家） | 2.2/2.21 条件格式一致 |
| AMRT 1.3 | 有（名称下拉+手填列） | Declaration 申报矿种 | 金属、冶炼厂名称、冶炼厂所在国家/地区 | “冶炼厂名称”分下拉/手填两列 |
| AMRT 1.2 | 无 | Declaration 申报矿种 | 金属、冶炼厂名称、冶炼厂所在国家/地区 | 全手工填写 |
| AMRT 1.1 | 无 | Declaration 申报矿种 | 金属、冶炼厂名称、冶炼厂所在国家/地区 | 全手工填写 |

## 3. 特殊选项规则（Look‑up 模板）
- **Smelter not listed**：必须手工填写冶炼厂名称 + 国家/地区。  
- **Smelter not yet identified**：标准冶炼厂名称=Unknown；国家回填口径：EMRT/AMRT 为空，CMRT/CRT 一般为 Unknown（**CMRT 6.5 的 Tungsten 行为空**）；该选项不会自动回填到“冶炼厂名称”手填列。
- **大小写容错**：模板内下拉值大小写混用（如 `Smelter Not Listed` / `Smelter not listed`），实现需大小写不敏感；文档统一小写口径。

## 4. 条件提示（条件格式摘要）
**CMRT（6.01–6.5）**
- 金属为空、冶炼厂查找为空、名称/国家为空（not listed）会触发提示。  
- 6.4+：Declaration 对应金属问题未作答 → 金属/查找提示。  
- 名称或国家包含 “!”、识别号不一致、出现 “Enter smelter details” → 提示。  

**EMRT**
- 1.x：包含 “名称/国家含 !” 与 “识别号不一致” 提示。  
- 1.3：Q1/Q2 对应矿种回答为 No/Unknown/Not applicable for this declaration → 金属/查找/名称/国家提示。  
- 2.0：上述两类提示不再出现；保留 not listed / Enter smelter details 提示。  
- 2.1：在 2.0 基础上新增 not yet identified → 国家提示。  
- 未发现整行非空高亮规则（仅列级提示）。  

**CRT（2.2 / 2.21）**
- 条件格式一致：包含 “名称/国家含 !” 与 “识别号不一致” 提示；not listed / Enter smelter details 提示。  
- 未发现整行非空高亮规则（仅列级提示）。  

**AMRT**
- 1.2：无 Look‑up；仅提示 金属为空 / 金属已选但名称为空 / 名称含 “!”。  
- 1.3：有 Look‑up；提示 not listed / not yet identified / Enter smelter details。  

**AMRT 1.1**
- 无 Look‑up；提示 金属为空 / 金属已选但名称为空 / 名称含 “!”（国家为必填列，但条件格式未单独提示）。  

## 5. 其他执行口径
- 联系人信息：填写冶炼厂联系人姓名/电子邮件前需确认已获同意（模板提示）。  
- 输入字符：模板多处提示避免以 “=” 或 “#” 开头（产品提示，不强制校验）。
