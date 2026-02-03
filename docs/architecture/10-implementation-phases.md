# 实现阶段清单（里程碑与验收）

## Phase 0：规则与文档基线确认
- 产出：架构文档集 + i18n + Best Practices\n
- 验收：各文档可追溯来源且互相引用完整\n

## Phase 1：工程骨架与基础能力
- 目标：Vite + React + TS + Tailwind + Antd v6 工程骨架\n
- 产出：基础路由、布局、主题 Token、i18n 框架接入、完整 ESLint/Prettier\n
- 验收：本地 dev 可跑；i18n 可切换；基础布局组件可复用\n

## Phase 2：核心模型与规则引擎
- 目标：registry + schema + rule engine\n
- 产出：TemplateDefinition、Zod schema 生成、gating/required/checker 计算\n
- 验收：可用 mock 数据验证规则输出与定位\n

## Phase 3：复用组件库
- 目标：通用字段、表格、checker 组件\n
- 产出：CompanyInfo、QuestionMatrix、Smelter/Mine/Product 表格组件\n
- 验收：组件可用配置驱动，脱离模板分支\n

## Phase 4：垂直切片（建议 CMRT 6.5）
- 目标：端到端可用流程\n
- 产出：填写 → 校验 → 定位 → 进度统计\n
- 验收：与 PRD/规则快照一致；无 useEffect 滥用\n

## Phase 5：多模板扩展
- 目标：接入 EMRT/CRT/AMRT\n
- 产出：差异点配置化、文案切换、版本矩阵\n
- 验收：差异仅存在 registry；UI 组件不分支\n

## Phase 6：性能与稳定性
- 目标：遵循 Vercel 最佳实践\n
- 产出：长列表优化、bundle 拆分、重复渲染修复\n
- 验收：性能指标与交互流畅度达标\n

## Phase 7：上线准备
- 目标：测试覆盖、PR 模板强制检查\n
- 产出：检查清单通过、回滚路径明确\n
- 验收：稳定性与可维护性满足“商用要求”\n
