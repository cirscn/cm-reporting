/**
 * @file core/validation/email.ts
 * @description 模块实现。
 */

// 说明：模块实现
import { z } from 'zod/v4'

import { ERROR_KEYS } from './errorKeys'

const NOT_AVAILABLE_EMAIL = 'not available'
const EMAIL_FORMAT_SCHEMA = z.string().refine(
  (value) => value.includes('@'),
  ERROR_KEYS.emailInvalid
)

/**
 * 判断是否为“无邮箱”占位值（PRD 允许）。
 */
function isNotAvailableEmail(value: string) {
  return value.trim().toLowerCase() === NOT_AVAILABLE_EMAIL
}

/**
 * 导出常量：emailSchema。
 */
export const emailSchema = z.string().refine(
  (value) => isNotAvailableEmail(value) || EMAIL_FORMAT_SCHEMA.safeParse(value).success,
  ERROR_KEYS.emailInvalid
)

/**
 * 导出函数：isValidEmail。
 */
export function isValidEmail(value: string) {
  return emailSchema.safeParse(value).success
}
