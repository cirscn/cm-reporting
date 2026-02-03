/**
 * @file core/data/index.ts
 * @description 模块导出入口。
 */

// 说明：模块导出入口
export { getCountryOptions } from './countries'
/**
 * 导出类型：成员。
 */
export type { CountryOption } from './countries'
export {
  SMELTER_LOOKUP_DATA,
  SMELTER_LOOKUP_META,
  getSmelterLookupOptions,
} from './lookups'
/**
 * 导出类型：成员。
 */
export type { SmelterLookupRecord } from './lookups'
