/**
 * @file app/pages/docTypes.ts
 * @description 页面组件。
 */

// 说明：页面组件
/**
 * 导出类型：DocSectionKey（DocPage/DocNote 的章节 key，与 i18n docs.* 对应）。
 */
export type DocSectionKey =
  | 'instructions'
  | 'definitions'
  | 'smelterLookup'
  | 'smelterList'
  | 'mineList'
  | 'productList'
