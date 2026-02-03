# 差异清单复核汇总（建议改写一句话）

> 口径：改写保持原语气/术语，最小必要改写；执行以模板规则为准。

## CMRT（6.01–6.5）
- 路径：`docs/diffs/cmrt.md` `docs/prd/field-dictionary.md`；需修正要点：生效日期 DV 口径按版本区分（6.01–6.22 vs 6.31+），产品仅提示不阻断；建议改写一句话：生效日期仅提示校验：6.01–6.22 为 31-Dec-2006–31-Mar-2026，6.31+ 仅下限 >31-Dec-2006。
- 路径：`docs/diffs/cmrt.md` `docs/prd/field-dictionary.md`；需修正要点：Product List 表头语义随版本变化（6.01 无注释列；6.4 及以下为“制造商”；6.5 起为“回复方”）；建议改写一句话：Product List 表头按版本区分：6.01 无注释列；6.4 及以下为“制造商”，6.5 起为“回复方”。
- 路径：`docs/prd/smelter-list-summary.md` `docs/diffs/cmrt.md`；需修正要点：Smelter not yet identified 回填差异（Standard Smelter Name=Unknown，Country 多为 Unknown；6.5 Tungsten 行为空）；建议改写一句话：Smelter not yet identified 仅回填 Standard Smelter Name/Country（6.5 Tungsten 行为空），冶炼厂名称仍需手填。
- 路径：`docs/diffs/acceptance-checklist.md`；需修正要点：仅 CMRT 存在“金属+冶炼厂查找组合合法性”提示；建议改写一句话：“金属+冶炼厂查找”组合合法性提示仅适用于 CMRT。

## EMRT（1.1–2.1）
- 路径：`docs/diffs/emrt.md` `docs/prd/field-dictionary.md`；需修正要点：1.x 无 Mine List；2.0+ 新增 Mine List，且“!” 触发提示；建议改写一句话：EMRT 1.x 无 Mine List；2.0+ 新增且“!” 触发提示。
- 路径：`docs/diffs/emrt.md`；需修正要点：矿产申报范围与问题区联动（2.0+ 动态矿种、字母序输出；Delete [Mineral] 不自动重排）；建议改写一句话：2.0+ 问题区矿种由申报范围动态生成并按字母序输出，Delete [Mineral] 后需人工校对。
- 路径：`docs/diffs/emrt.md`；需修正要点：公司层面问题 A/B/D 与 C/E 的版本差异（1.1→1.11 文案更新；2.0+ C/E 改为“指定矿产”）；建议改写一句话：公司层面问题文案按版本区分：1.1→1.11 更新 A/B/D；2.0+ C/E 改为“指定矿产”。
- 路径：`docs/diffs/emrt.md`；需修正要点：Smelter List 表头误标与版本字段差异（1.x “金属 l (*)”“冶炼厂名称 (1)”；2.0+ 修正并新增 Combined 列）；建议改写一句话：Smelter List 表头按版本区分：1.x 存在“金属 l (*)/冶炼厂名称 (1)”误标，2.0+ 修正并新增 Combined 列（2.1）。
- 路径：`docs/diffs/emrt.md`；需修正要点：Smelter not yet identified 行为与 L 页说明不一致（国家空、触发提示）；建议改写一句话：以 Look‑up+条件格式为准：Smelter not yet identified 的国家为空并触发提示，L 页说明不一致。
- 路径：`docs/diffs/emrt.md`；需修正要点：Product List 2.1 新增“请求方产品编号/名称”；建议改写一句话：EMRT 2.1 的 Product List 新增请求方产品编号/名称。

## CRT（2.2–2.21）
- 路径：`docs/diffs/crt.md`；需修正要点：2.21 版本新增选项（Q2 “DRC or adjoining countries only”；G 题 “Yes, Using Other Format (Describe)”）；建议改写一句话：CRT 2.21 新增 Q2“DRC or adjoining countries only”与 G 题“Using Other Format”。
- 路径：`docs/diffs/crt.md`；需修正要点：Smelter List 表头误标（“金属 l (*)”）；建议改写一句话：CRT Smelter List 的“金属 l (*)”为模板误标。
- 路径：`docs/diffs/crt.md`；需修正要点：Smelter not yet identified 回填规则（Standard Smelter Name/Country=Unknown，名称不自动回填）；建议改写一句话：Smelter not yet identified 仅回填 Standard Smelter Name/Country=Unknown，冶炼厂名称仍需手填。
- 路径：`docs/diffs/crt.md` `docs/diffs/acceptance-checklist.md`；需修正要点：Checker cfExt（A57）规则需人工核验表现；建议改写一句话：A57（Smelter List - Cobalt）为 cfExt 规则，需人工核验高亮表现。

## AMRT（1.1–1.3）
- 路径：`docs/diffs/amrt.md` `docs/prd/field-dictionary.md`；需修正要点：矿产申报范围输入方式随版本变化（1.1/1.2 自由输入≤10，预填但可改；1.3 下拉+Other）；建议改写一句话：AMRT 1.1/1.2 为自由输入（≤10，预填可改），1.3 改为下拉并支持 Other。
- 路径：`docs/diffs/amrt.md`；需修正要点：矿种问题区排序与 Other 映射（1.3 公式字母序；Other 用 D15:I16 替换并参与排序）；建议改写一句话：1.3 按字母序输出所选矿种，Other 由 D15:I16 替换后参与排序。
- 路径：`docs/diffs/amrt.md`；需修正要点：Smelter Look‑up 仅 1.3 存在，表头/列位移与双列名称差异；建议改写一句话：AMRT 仅 1.3 有 Smelter Look‑up，冶炼厂名称分为下拉/手填两列且列位右移。
- 路径：`docs/diffs/amrt.md`；需修正要点：Mine List 1.3 有 Smelter 下拉，1.1/1.2 手填；“!” 触发提示；建议改写一句话：AMRT 1.3 Mine List 连接 Smelter 下拉，1.1/1.2 为手填且“!” 触发提示。
- 路径：`docs/diffs/amrt.md`；需修正要点：Instructions 排除矿种口径（不含 3TG/钴/铜/石墨/锂/云母/镍），产品仅通过下拉/Other 控制不做阻断；建议改写一句话：AMRT 排除矿种仅通过下拉/Other 控制范围，不额外阻断。
- 路径：`docs/diffs/amrt.md`；需修正要点：地址字段 Instructions 要求必填，但 Declaration 未标星、Checker 未列（模板内部不一致）；建议改写一句话：地址以 Instructions 为准必填，但模板内部标星/Checker 不一致需说明。
