# 规则与 Schema 体系

## Zod 作为唯一验证层
- 所有字段类型、默认值、必填性由 Zod schema 表达
- 规则引擎只处理“动态规则”（gating、条件必填、DV 选项）
- Schema 生成器接受 `TemplateDefinition`，输出模板特定 schema

## 规则分层
1. **Static schema**：类型、必填、格式（email/url/date）
2. **Gating rules**：Q1/Q2 控制后续问题/表格启用
3. **DV options**：选项列表与显示值映射
4. **Checker rules**：基于 Excel Checker 的错误输出

## 规则来源优先级
- Excel Checker（规则快照）优先级最高
- PRD 作为产品语义补充（不得与 Checker 冲突）
- Instructions-only 规则记录为提示，不进入错误阻断

## 显示值与内部值分离
- 支持 “100% 显示 / 1 内部值” 等差异
- 统一在 `core/transform` 映射，避免散落在 UI

## 错误模型
- `code`：规则编号（E/C/A/R）
- `message`：用户提示
- `fieldPath`：定位锚点
- `severity`：error/pass（不引入 warning）

## 版本差异落点
- DV 列表、题干选项、gating 触发条件均进入 registry
- Rule engine 只消费 registry，不做版本判断
