/**
 * @file ui/fields/error.ts
 * @description 模块实现。
 */

// 说明：模块实现
import type { I18nKey } from '@core/i18n'
import type { ErrorKey } from '@core/validation/errorKeys'

/**
 * 导出函数：resolveErrorMessage（将错误 key 转为 i18n 文案）。
 */
export function resolveErrorMessage(
  t: (key: I18nKey, options?: Record<string, unknown>) => string,
  error?: ErrorKey
): string | undefined {
  if (!error) return undefined
  return t(error as I18nKey)
}
