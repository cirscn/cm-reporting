import type { NullableFieldState } from './types'

export function readFieldState(obj: Record<string, unknown> | undefined, key: string): NullableFieldState {
  const exists = !!obj && Object.prototype.hasOwnProperty.call(obj, key)
  const value = obj?.[key]
  return {
    exists,
    wasNull: exists && value === null,
    wasString: exists && typeof value === 'string',
    wasNumber: exists && typeof value === 'number',
  }
}

export function readFieldStates(obj: Record<string, unknown>, keys: string[]) {
  return new Map(keys.map((key) => [key, readFieldState(obj, key)]))
}

export function toNullableString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export function toAnyString(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return ''
}

export function coerceId(value: unknown, fallback: string): string {
  if (typeof value === 'string' && value.trim()) return value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return fallback
}

export function ensureObjectRecord(value: Record<string, Record<string, string> | string>, key: string) {
  const current = value[key]
  if (typeof current === 'object' && current !== null) return current
  const next: Record<string, string> = {}
  value[key] = next
  return next
}

export function readOptionalLegacyFields(options: {
  item: Record<string, unknown>
  mapping: Record<string, string>
}): Record<string, string | undefined> {
  return Object.fromEntries(Object.entries(options.mapping).map(([key, legacyKey]) => {
    const value = options.item[legacyKey]
    return [key, typeof value === 'string' ? value : undefined]
  }))
}
