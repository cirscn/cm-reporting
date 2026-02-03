/**
 * @file core/types/tableRows.ts
 * @description 模块实现。
 */

// 说明：模块实现
/**
 * 导出接口类型：SmelterRow。
 */
export interface SmelterRow {
  id: string
  metal: string
  smelterLookup: string
  smelterName: string
  smelterCountry: string
  combinedMetal?: string
  combinedSmelter?: string
  smelterId?: string
  smelterIdentification?: string
  sourceId?: string
  smelterStreet?: string
  smelterCity?: string
  smelterState?: string
  smelterContactName?: string
  smelterContactEmail?: string
  proposedNextSteps?: string
  mineName?: string
  mineCountry?: string
  recycledScrap?: string
  comments?: string
  [key: string]: string | undefined
}

/**
 * 导出接口类型：MineRow。
 */
export interface MineRow {
  id: string
  metal: string
  smelterName: string
  mineName: string
  mineCountry: string
  mineId?: string
  mineIdSource?: string
  mineStreet?: string
  mineCity?: string
  mineProvince: string
  mineDistrict: string
  mineContactName?: string
  mineContactEmail?: string
  proposedNextSteps?: string
  comments: string
  [key: string]: string | undefined
}

/**
 * 导出接口类型：ProductRow。
 */
export interface ProductRow {
  id: string
  productNumber: string
  productName: string
  requesterNumber?: string
  requesterName?: string
  comments: string
  [key: string]: string | undefined
}

/**
 * 导出接口类型：MineralsScopeRow。
 */
export interface MineralsScopeRow {
  id: string
  mineral: string
  reason: string
}
