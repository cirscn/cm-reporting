# 规则与校验优先级

## 规则来源与优先级
- **优先级**：Instructions 文字要求 > Checker/条件格式 > 产品实现约束。
- **直接必填**：Checker 标记 F=1 视为必填（若与 Instructions 冲突，以 Instructions 为准）。
- **条件必填**：根据问题答案/申报范围/矿种选择触发。

## 规则摘要（跨模板）
- 问题矩阵与矿种/金属强绑定：CMRT/CRT 固定矿种，EMRT/AMRT 依申报范围动态生成。
- Company-level Questions：仅 CMRT/EMRT/CRT 存在，AMRT 无此区。
- Smelter List 与 Mine List：随版本存在列差异与必填差异。

## 关键差异提醒（摘自 PRD 与差异文档）
- CMRT：Q3–Q8 条件必填（Q1/Q2=Yes）；A–H 条件必填；Smelter List 依金属必填。
- EMRT：Q3–Q7 条件必填（Q1=Yes 且 Q2=Yes）；公司层面 A/B/D–G 条件必填；2.0+ 新增 Mine List。
- CRT：Q1=Yes 时 Q2–Q6 与 A–I 必答。
- AMRT：Checker 覆盖不足，Instructions 明确要求的字段需补齐规则。

## 规则矩阵入口
- 统一矩阵：`docs/diffs/checker-matrix.md`
- 差异摘要：`docs/diffs/review-summary.md`
- 模板差异主表：`docs/diffs/*.md`
- 验收用例：`docs/diffs/acceptance/README.md`

## 规则冲突处理
- 以模板版本为边界处理冲突，不跨版本推断。
- 文档中必须标注“来源冲突”并指向具体文件与段落。
