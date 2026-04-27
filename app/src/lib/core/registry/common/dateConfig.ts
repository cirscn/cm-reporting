import type { DateConfig } from '../types'

export const AUTHORIZATION_DATE_MIN = '2006-12-31'
export const AUTHORIZATION_DATE_MAX = '2026-03-31'

export const LIMITED_AUTHORIZATION_DATE_CONFIG: DateConfig = Object.freeze({
  minDate: AUTHORIZATION_DATE_MIN,
  maxDate: AUTHORIZATION_DATE_MAX,
})

export const OPEN_AUTHORIZATION_DATE_CONFIG: DateConfig = Object.freeze({
  minDate: AUTHORIZATION_DATE_MIN,
  minBoundary: 'exclusive',
})
