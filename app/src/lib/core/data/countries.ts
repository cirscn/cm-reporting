/**
 * @file core/data/countries.ts
 * @description 模块实现。
 */

// 说明：模块实现
import type { TemplateType } from '@core/registry/types'

const BASE_COUNTRIES = [
  'China',
  'Malaysia',
  'Indonesia',
  'Japan',
  'USA',
  'Germany',
  'Switzerland',
  'Vietnam',
  'Thailand',
  'Philippines',
]

const CRT_COUNTRIES = [...BASE_COUNTRIES, 'Unknown']

const COUNTRIES_BY_TEMPLATE: Record<TemplateType, string[]> = {
  cmrt: BASE_COUNTRIES,
  emrt: BASE_COUNTRIES,
  crt: CRT_COUNTRIES,
  amrt: BASE_COUNTRIES,
}

/**
 * 导出接口类型：CountryOption。
 */
export interface CountryOption {
  value: string
  label: string
}

/**
 * 导出函数：getCountryOptions。
 */
export function getCountryOptions(templateType: TemplateType): CountryOption[] {
  const list = COUNTRIES_BY_TEMPLATE[templateType] ?? BASE_COUNTRIES
  return list.map((value) => ({ value, label: value }))
}
