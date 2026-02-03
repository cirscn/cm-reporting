/**
 * @file core/template/workflow.ts
 * @description 模板工作流页面序列。
 */

// 说明：根据 PRD 定义工作流步骤（用于 stepper 与上下页）。
import type { PageDef, TemplateVersionDef } from '@core/registry/types'

const WORKFLOW_KEYS_BY_TEMPLATE: Record<
  TemplateVersionDef['templateType'],
  Array<PageDef['key']>
> = {
  cmrt: ['declaration', 'smelter-list', 'product-list', 'checker'],
  crt: ['declaration', 'smelter-list', 'product-list', 'checker'],
  emrt: ['declaration', 'smelter-list', 'mine-list', 'product-list', 'checker'],
  amrt: ['declaration', 'minerals-scope', 'smelter-list', 'mine-list', 'product-list', 'checker'],
}

/**
 * 导出函数：getWorkflowPages（按 PRD 获取步骤页顺序）。
 */
export function getWorkflowPages(versionDef: TemplateVersionDef): PageDef[] {
  const pageMap = new Map(versionDef.pages.map((page) => [page.key, page]))
  const baseKeys = WORKFLOW_KEYS_BY_TEMPLATE[versionDef.templateType] ?? []

  return baseKeys
    .map((key) => pageMap.get(key))
    .filter((page): page is PageDef => Boolean(page && page.available))
}
