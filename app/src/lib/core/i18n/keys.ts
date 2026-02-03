/**
 * @file core/i18n/keys.ts
 * @description 模块实现。
 */

// 说明：模块实现
import enUS from './locales/en-US.json'

type DotNestedKeys<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends Array<unknown>
        ? `${K}`
        : T[K] extends object
          ? `${K}` | `${K}.${DotNestedKeys<T[K]>}`
          : `${K}`
    }[keyof T & string]
  : never

/**
 * 导出类型：I18nKey。
 */
export type I18nKey = DotNestedKeys<typeof enUS>
