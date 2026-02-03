# 版本策略与升级影响

## 版本策略（基于 PRD）
- 版本为“模板 + 规则”一体：每个版本独立 schema + 规则集。
- 同模板内仅向后兼容显示/导出，不强行兼容填写逻辑。
- 规则冲突以版本为单位判定，不做跨版本自动推断。

## 升级影响面
- 字段层：表头/字段名/必填条件变化（如 Product List 表头、Smelter List 列位移）。
- 规则层：问题选项、条件必填变化（如 CRT 2.21 新增选项）。
- 列表层：Mine List 的引入或字段形态变化（EMRT 2.0+，AMRT 1.3）。

## 版本升级检查清单（建议）
- 是否新增/删除页面（Tab）
- 是否新增字段或系统列
- 是否修改选项文本或候选集
- 是否更改条件必填/校验规则
- 是否调整导出列位与列名

## 已知差异索引
- CMRT 6.01–6.5：`docs/diffs/cmrt.md`
- EMRT 1.1–2.1：`docs/diffs/emrt.md`
- CRT 2.2–2.21：`docs/diffs/crt.md`
- AMRT 1.1–1.3：`docs/diffs/amrt.md`
- 验收包：`docs/diffs/acceptance/README.md`
