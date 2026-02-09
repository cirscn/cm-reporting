/**
 * @file core/transform/index.ts
 * @description 数据转换工具集：日期格式、冶炼厂 lookup 标准化、DV 选项映射。
 */

// ---------------------------------------------------------------------------
// 日期转换
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

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const INTEGER_PATTERN = /^-?\d+$/
const TIMESTAMP_SECONDS_DIGITS_MIN = 9
const TIMESTAMP_SECONDS_DIGITS_MAX = 10
const TIMESTAMP_MILLISECONDS_DIGITS_MIN = 11
const TIMESTAMP_MILLISECONDS_DIGITS_MAX = 13

/** 将 ISO 日期（YYYY-MM-DD）转为 Excel 展示格式（DD-MMM-YYYY）。 */
export function toDisplayDate(isoDate: string): string {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-')
  if (!year || !month || !day) return isoDate
  const monthIndex = parseInt(month, 10) - 1
  if (monthIndex < 0 || monthIndex > 11) return isoDate
  return `${day}-${MONTH_NAMES[monthIndex]}-${year}`
}

/** 将 Excel 展示日期（DD-MMM-YYYY）转为 ISO 格式（YYYY-MM-DD）。 */
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

function epochMsToIsoDate(epochMs: number): string | null {
  if (!Number.isFinite(epochMs)) return null
  const date = new Date(epochMs)
  if (Number.isNaN(date.getTime())) return null
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function countTimestampDigits(raw: number, rawText?: string): number {
  if (rawText) {
    const unsigned = rawText.replace(/^[+-]/, '')
    const withoutLeadingZeros = unsigned.replace(/^0+(?=\d)/, '')
    return withoutLeadingZeros.length > 0 ? withoutLeadingZeros.length : 1
  }
  const absInt = Math.trunc(Math.abs(raw))
  if (absInt === 0) return 1
  return String(absInt).length
}

function normalizeNumericTimestamp(raw: number, rawText?: string): string | null {
  if (!Number.isInteger(raw)) return null
  const digits = countTimestampDigits(raw, rawText)
  if (digits >= TIMESTAMP_MILLISECONDS_DIGITS_MIN && digits <= TIMESTAMP_MILLISECONDS_DIGITS_MAX) {
    return epochMsToIsoDate(raw)
  }
  if (digits >= TIMESTAMP_SECONDS_DIGITS_MIN && digits <= TIMESTAMP_SECONDS_DIGITS_MAX) {
    return epochMsToIsoDate(raw * 1000)
  }
  return null
}

/**
 * 将完成日期输入归一化为内部存储格式（YYYY-MM-DD）。
 *
 * 兼容输入：
 * - YYYY-MM-DD
 * - 秒级时间戳
 * - 毫秒级时间戳
 */
export function normalizeAuthorizationDateInput(value: unknown): string {
  if (value === null || value === undefined) return ''

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return String(value)
    return normalizeNumericTimestamp(value) ?? String(value)
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return ''
    if (ISO_DATE_PATTERN.test(trimmed)) return trimmed
    if (!INTEGER_PATTERN.test(trimmed)) return trimmed
    const num = Number(trimmed)
    if (!Number.isFinite(num)) return trimmed
    return normalizeNumericTimestamp(num, trimmed) ?? trimmed
  }

  return String(value)
}

// ---------------------------------------------------------------------------
// 冶炼厂 lookup 特殊值（大小写无关标准化）
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

/** 将冶炼厂 lookup 值标准化为规范形式。 */
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

/** 判断是否为"Smelter not listed"。 */
export function isSmelterNotListed(value: string): boolean {
  return SMELTER_NOT_LISTED_VARIANTS.some(
    (v) => v.toLowerCase() === value.toLowerCase().trim()
  )
}

/** 判断是否为"Smelter not yet identified"。 */
export function isSmelterNotIdentified(value: string): boolean {
  return SMELTER_NOT_IDENTIFIED_VARIANTS.some(
    (v) => v.toLowerCase() === value.toLowerCase().trim()
  )
}

// ---------------------------------------------------------------------------
// DV 选项值映射（internal ↔ display）
// ---------------------------------------------------------------------------

/**
 * 导出接口类型：OptionTransform。
 */
export interface OptionTransform {
  displayValue: string
  internalValue: string
}

/** 创建 内部值 → 展示值 的映射 Map。 */
export function createDisplayValueMap(options: OptionTransform[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const opt of options) {
    map.set(opt.internalValue, opt.displayValue)
  }
  return map
}

/** 创建 展示值 → 内部值 的映射 Map。 */
export function createInternalValueMap(options: OptionTransform[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const opt of options) {
    map.set(opt.displayValue, opt.internalValue)
  }
  return map
}
