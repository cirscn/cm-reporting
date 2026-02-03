/**
 * @file core/data/lookups.ts
 * @description 模块实现。
 */

// 说明：模块实现
import type { TemplateType } from '@core/registry/types'

/**
 * 常量：SMELTER_LOOKUP_META。
 */
export const SMELTER_LOOKUP_META = {
  placeholder: 'Select from list…',
  notListed: 'Smelter not listed',
  notYetIdentified: 'Smelter not yet identified',
  separator: '---',
}

const BASE_SMELTER_LOOKUP = [
  SMELTER_LOOKUP_META.placeholder,
  SMELTER_LOOKUP_META.notListed,
  SMELTER_LOOKUP_META.notYetIdentified,
  SMELTER_LOOKUP_META.separator,
  'Ningxia Orient Tantalum Industry Co., Ltd.',
  'Malaysia Smelting Corporation',
  'Xiamen Tungsten Co., Ltd.',
  'Metalor Technologies SA',
]

const AMRT_SMELTER_LOOKUP = [
  SMELTER_LOOKUP_META.placeholder,
  SMELTER_LOOKUP_META.notListed,
  SMELTER_LOOKUP_META.notYetIdentified,
  SMELTER_LOOKUP_META.separator,
  'Example Smelter A',
  'Example Smelter B',
  'Example Smelter C',
]

const SMELTER_LOOKUP_BY_TEMPLATE: Record<TemplateType, string[]> = {
  cmrt: BASE_SMELTER_LOOKUP,
  emrt: BASE_SMELTER_LOOKUP,
  crt: BASE_SMELTER_LOOKUP,
  amrt: AMRT_SMELTER_LOOKUP,
}

/**
 * 导出接口类型：SmelterLookupRecord。
 */
export interface SmelterLookupRecord {
  smelterId: string
  sourceId: string
  country: string
  street: string
  city: string
  state: string
}

/**
 * 常量：SMELTER_LOOKUP_DATA。
 */
export const SMELTER_LOOKUP_DATA: Record<string, SmelterLookupRecord> = {
  'Ningxia Orient Tantalum Industry Co., Ltd.': {
    smelterId: 'CID001277',
    sourceId: 'RMI-Ta-001',
    country: 'China',
    street: '123 Industrial Road',
    city: 'Shizuishan',
    state: 'Ningxia',
  },
  'Malaysia Smelting Corporation': {
    smelterId: 'CID001105',
    sourceId: 'RMI-Sn-002',
    country: 'Malaysia',
    street: '88 Smelter Ave',
    city: 'Butterworth',
    state: 'Penang',
  },
  'Xiamen Tungsten Co., Ltd.': {
    smelterId: 'CID002082',
    sourceId: 'RMI-W-003',
    country: 'China',
    street: '56 Tungsten Blvd',
    city: 'Xiamen',
    state: 'Fujian',
  },
  'Metalor Technologies SA': {
    smelterId: 'CID001149',
    sourceId: 'RMI-Au-004',
    country: 'Switzerland',
    street: '2 Metalor Strasse',
    city: 'Marin-Epagnier',
    state: 'Neuchatel',
  },
}

/**
 * 导出函数：getSmelterLookupOptions。
 */
export function getSmelterLookupOptions(templateType: TemplateType): string[] {
  return SMELTER_LOOKUP_BY_TEMPLATE[templateType] ?? BASE_SMELTER_LOOKUP
}
