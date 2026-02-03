/**
 * @file ui/i18n/useT.ts
 * @description 模块实现。
 */

// 说明：模块实现
import type { I18nKey, Locale } from '@core/i18n'
import { useMemoizedFn } from 'ahooks'
import { useTranslation } from 'react-i18next'

type Translate = (key: I18nKey, options?: Record<string, unknown>) => string

/**
 * 自定义 Hook：useT。
 */
export function useT() {
  const { t: rawT, i18n } = useTranslation()
  /** 稳定翻译函数，避免依赖项频繁变化。 */
  const t = useMemoizedFn((key: I18nKey, options?: Record<string, unknown>) =>
    rawT(key, options)
  ) as Translate
  return {
    t,
    locale: i18n.language as Locale,
    i18n,
    changeLocale: (locale: Locale) => i18n.changeLanguage(locale),
  }
}
