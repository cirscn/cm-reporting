/**
 * @file app/store/index.ts
 * @description 模块导出入口。
 */

// 说明：模块导出入口
export { TemplateProvider } from './templateStore'
/** 读取模板状态（静态信息 + 表单主体 + 列表）。 */
export {
  useTemplateState,
  useTemplateErrors,
  useTemplateActions,
  useTemplateIntegrations,
  useMineralReconcileNotice,
} from './templateContext'
/** 读取模板派生数据（规则/校验/视图模型/状态）。 */
export { useTemplateDerived } from './useTemplateDerived'
/**
 * 导出类型：成员。
 */
export type { TemplateDerived, TemplateViewModels } from './useTemplateDerived'
