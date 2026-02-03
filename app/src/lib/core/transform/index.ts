/**
 * @file core/transform/index.ts
 * @description 模块导出入口。
 */

// 说明：模块导出入口
// ---------------------------------------------------------------------------
// Date transformations
// ---------------------------------------------------------------------------

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/**
 * Convert ISO date (YYYY-MM-DD) to display format (DD-MMM-YYYY)
 */
export function toDisplayDate(isoDate: string): string {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-')
  if (!year || !month || !day) return isoDate
  const monthIndex = parseInt(month, 10) - 1
  if (monthIndex < 0 || monthIndex > 11) return isoDate
  return `${day}-${MONTH_NAMES[monthIndex]}-${year}`
}

/**
 * Convert display date (DD-MMM-YYYY) to ISO format (YYYY-MM-DD)
 */
export function toIsoDate(displayDate: string): string {
  if (!displayDate) return ''
  const parts = displayDate.split('-')
  if (parts.length !== 3) return displayDate
  const [day, monthStr, year] = parts
  const monthIndex = MONTH_NAMES.findIndex(
    (m) => m.toLowerCase() === monthStr?.toLowerCase()
  )
  if (monthIndex === -1) return displayDate
  const month = String(monthIndex + 1).padStart(2, '0')
  return `${year}-${month}-${day?.padStart(2, '0')}`
}

// ---------------------------------------------------------------------------
// Smelter lookup special values (case-insensitive normalization)
// ---------------------------------------------------------------------------

const SMELTER_NOT_LISTED_VARIANTS = [
  'smelter not listed',
  'Smelter not listed',
  'Smelter Not Listed',
]

const SMELTER_NOT_IDENTIFIED_VARIANTS = [
  'smelter not yet identified',
  'Smelter not yet identified',
  'Smelter Not Yet Identified',
]

/**
 * Normalize smelter lookup value to canonical form
 */
export function normalizeSmelterLookup(value: string): string {
  const lower = value.toLowerCase().trim()

  if (SMELTER_NOT_LISTED_VARIANTS.some((v) => v.toLowerCase() === lower)) {
    return 'Smelter not listed'
  }

  if (SMELTER_NOT_IDENTIFIED_VARIANTS.some((v) => v.toLowerCase() === lower)) {
    return 'Smelter not yet identified'
  }

  return value
}

/**
 * Check if value is "Smelter not listed"
 */
export function isSmelterNotListed(value: string): boolean {
  return SMELTER_NOT_LISTED_VARIANTS.some(
    (v) => v.toLowerCase() === value.toLowerCase().trim()
  )
}

/**
 * Check if value is "Smelter not yet identified"
 */
export function isSmelterNotIdentified(value: string): boolean {
  return SMELTER_NOT_IDENTIFIED_VARIANTS.some(
    (v) => v.toLowerCase() === value.toLowerCase().trim()
  )
}

// ---------------------------------------------------------------------------
// DV option value transformations
// ---------------------------------------------------------------------------

/**
 * 导出接口类型：OptionTransform。
 */
export interface OptionTransform {
  displayValue: string
  internalValue: string
}

/**
 * Create a lookup map from internal values to display values
 */
export function createDisplayValueMap(options: OptionTransform[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const opt of options) {
    map.set(opt.internalValue, opt.displayValue)
  }
  return map
}

/**
 * Create a lookup map from display values to internal values
 */
export function createInternalValueMap(options: OptionTransform[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const opt of options) {
    map.set(opt.displayValue, opt.internalValue)
  }
  return map
}
