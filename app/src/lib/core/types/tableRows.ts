/**
 * @file core/types/tableRows.ts
 * @description 模块实现。
 */

// 说明：模块实现
/**
 * 导出接口类型：SmelterRow。
 */
export interface SmelterRow {
  /** 行主键；外部选择时为宿主主键，也是矿场 smelterId 的关联值。 */
  id: string
  metal: string
  smelterLookup: string
  smelterName: string
  smelterCountry: string
  combinedMetal?: string
  combinedSmelter?: string
  smelterNumber?: string
  /**
   * 兼容字段：仅用于内部兼容承载，不参与任何业务判定或展示。
   */
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
  /** 矿场行的独立主键；多行可关联同一个 smelterId，不能用该关联值代替行主键。 */
  id: string
  metal: string
  smelterName: string
  /** 所选冶炼厂行的 ID；外部选择时为宿主主键，与 CID 展示号码无关。 */
  smelterId?: string
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
  partNumber: string
  partName: string
  requestPartNumber?: string
  requestPartName?: string
  remark: string
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
