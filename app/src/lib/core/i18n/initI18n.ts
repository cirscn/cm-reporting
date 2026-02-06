/**
 * @file core/i18n/initI18n.ts
 * @description i18n 延迟初始化函数，供 CMReportingProvider 使用。
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enUS from './locales/en-US.json'
import zhCN from './locales/zh-CN.json'

import type { Locale } from './index'

const resources = {
  'en-US': { translation: enUS },
  'zh-CN': { translation: zhCN },
}

const ensureReactI18nextBound = () => {
  i18n.use(initReactI18next)
  initReactI18next.init(i18n)
}

/**
 * 初始化 i18n 实例。
 * 如果已初始化，则补齐 react-i18next 绑定、资源并切换语言。
 */
export function initI18n(locale: Locale = 'en-US') {
  // HMR/StrictMode 下避免用模块内变量作为真值来源：以 i18next 实例状态为准。
  if (i18n.isInitialized) {
    ensureReactI18nextBound()
    Object.entries(resources).forEach(([language, value]) => {
      i18n.addResourceBundle(language, 'translation', value.translation, true, false)
    })
    if (i18n.language !== locale) i18n.changeLanguage(locale)
    return i18n
  }

  i18n.use(initReactI18next).init({
    resources,
    lng: locale,
    fallbackLng: 'en-US',
    // 同步初始化，避免首次渲染时 i18n 实例尚未注入 react-i18next
    initImmediate: false,
    interpolation: {
      escapeValue: false,
    },
  })

  return i18n
}

/**
 * 检查 i18n 是否已初始化。
 */
export function isI18nInitialized(): boolean {
  return i18n.isInitialized
}
