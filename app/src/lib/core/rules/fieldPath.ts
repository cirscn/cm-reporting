/**
 * @file core/rules/fieldPath.ts
 * @description 字段路径与页面映射规则。
 */

// 说明：将字段路径到 PageKey 的映射下沉至 core，保证规则集中维护。
import type { PageKey } from '@core/registry/types'

const PREFIX_TO_PAGE: Array<{ prefix: string; page: PageKey }> = [
  { prefix: 'companyInfo', page: 'declaration' },
  { prefix: 'questions', page: 'declaration' },
  { prefix: 'questionComments', page: 'declaration' },
  { prefix: 'companyQuestions', page: 'declaration' },
  { prefix: 'smelterList', page: 'smelter-list' },
  { prefix: 'mineList', page: 'mine-list' },
  { prefix: 'productList', page: 'product-list' },
]

/**
 * 导出函数：getPageKeyForFieldPath。
 */
export function getPageKeyForFieldPath(fieldPath: string): PageKey {
  const prefix = fieldPath.split('.')[0]
  const matched = PREFIX_TO_PAGE.find((item) => item.prefix === prefix)
  return matched?.page ?? 'declaration'
}
