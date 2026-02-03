/**
 * @file core/i18n/index.ts
 * @description i18n 模块导出入口。
 */

import i18n from 'i18next'

/**
 * 支持的语言类型。
 */
export type Locale = 'en-US' | 'zh-CN'

/**
 * i18n key 类型。
 */
export type { I18nKey } from './keys'

/**
 * 初始化函数。
 */
export { initI18n, isI18nInitialized } from './initI18n'

/**
 * i18n 实例（需先调用 initI18n 初始化）。
 */
export default i18n
