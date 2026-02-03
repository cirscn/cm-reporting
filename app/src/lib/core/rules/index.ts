/**
 * @file core/rules/index.ts
 * @description 规则/校验统一入口。
 */

// 说明：统一入口便于阅读与索引；业务代码建议按需直引具体模块以减少 bundle。

/** 规则 gating 计算（问题/矿产的启用逻辑）。 */
export { calculateGating, calculateAllGating, type GatingResult, type QuestionAnswers } from './gating'
/** 必填字段与上下文计算。 */
export {
  calculateRequiredFields,
  calculateRequiredFieldsWithContext,
  buildRequiredContext,
  getActiveMineralKeys,
  type RequiredFieldsResult,
  type FormStateForRequired,
  type RequiredContext,
} from './required'
/** 文档状态计算（用于页面提示）。 */
export { getDocStatusData, type DocStatusData, type DocStatusBySection, type DocStatusType } from './docStatus'
/** 表单校验与错误集合。 */
export {
  runChecker,
  getErrorCount,
  type CheckerError,
  type FormDataForChecker,
} from './checker'
/** Checker 分组展示逻辑。 */
export { groupCheckerErrors, type ErrorGroup } from './errorGroups'
/** Checker 汇总统计与通过项。 */
export {
  buildCheckerSummary,
  type CheckerSummary,
  type PassedItem,
  type Translate,
} from './summary'
/** 字段路径到页面的映射。 */
export { getPageKeyForFieldPath } from './fieldPath'
