/**
 * @file core/validation/email.ts
 * @description 模块实现。
 */

// 说明：模块实现
import { z } from 'zod/v4'

import { ERROR_KEYS } from './errorKeys'

const EMAIL_PLACEHOLDERS = new Set(['not available', 'n/a', '无', '不适用', '不可用'])
const EMAIL_FORMAT_SCHEMA = z.email({ pattern: z.regexes.html5Email })

/** 在浏览器邮箱规则的基础上，检查域名和用户名的点号。 */
function hasValidEmailFormat(value: string) {
  if (!EMAIL_FORMAT_SCHEMA.safeParse(value).success) return false

  const [localPart, domain] = value.split('@')
  return domain.includes('.') &&
    !localPart.startsWith('.') &&
    !localPart.endsWith('.') &&
    !localPart.includes('..')
}

/**
 * 导出常量：emailSchema。
 */
export const emailSchema = z.string().refine(
  (value) => EMAIL_PLACEHOLDERS.has(value.trim().toLowerCase()) || hasValidEmailFormat(value),
  ERROR_KEYS.emailInvalid
)

/**
 * 导出函数：isValidEmail。
 */
export function isValidEmail(value: string) {
  return emailSchema.safeParse(value).success
}
