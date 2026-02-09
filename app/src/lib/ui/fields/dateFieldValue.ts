import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import localeData from 'dayjs/plugin/localeData'
import weekday from 'dayjs/plugin/weekday'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import weekYear from 'dayjs/plugin/weekYear'

export const DATE_FIELD_DISPLAY_FORMAT = 'DD-MMM-YYYY'
export const DATE_FIELD_STORAGE_FORMAT = 'YYYY-MM-DD'

const STORAGE_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const DISPLAY_DATE_PATTERN = /^\d{2}-[A-Za-z]{3}-\d{4}$/

dayjs.extend(customParseFormat)
dayjs.extend(localeData)
dayjs.extend(weekOfYear)
dayjs.extend(weekYear)
dayjs.extend(weekday)

export function resolveDateFieldValue(value?: string): dayjs.Dayjs | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined

  if (STORAGE_DATE_PATTERN.test(trimmed)) {
    const storageValue = dayjs(trimmed, DATE_FIELD_STORAGE_FORMAT, true)
    if (storageValue.isValid()) return storageValue
  }

  if (!DISPLAY_DATE_PATTERN.test(trimmed)) return undefined

  const displayValue = dayjs(trimmed, DATE_FIELD_DISPLAY_FORMAT, true)
  return displayValue.isValid() ? displayValue : undefined
}
