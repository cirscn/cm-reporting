/**
 * @file lib/providers/CMReportingProvider.tsx
 * @description 顶层 Provider，负责 i18n 初始化和 Ant Design 配置。
 */

import i18n, { initI18n, isI18nInitialized, type Locale } from '@core/i18n'
import { AppThemeScope } from '@ui/theme/AppThemeScope'
import type { CMCSSVariables } from '@ui/theme/index'
import { defaultAntdTheme } from '@ui/theme/index'
import { App as AntApp, ConfigProvider, Flex, Spin } from 'antd'
import type { ThemeConfig } from 'antd'
import enUS from 'antd/locale/en_US'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import type { ReactNode } from 'react'
import { Suspense, useEffect, useRef } from 'react'

// 确保 react-i18next 在任何组件渲染前就拿到已注册的 i18n 实例（避免在 render 阶段 init 导致订阅组件更新）。
if (!isI18nInitialized()) initI18n('en-US')

const ANT_LOCALE_BY_APP: Record<Locale, typeof enUS> = {
  'en-US': enUS,
  'zh-CN': zhCN,
}

const DAYJS_LOCALE_BY_APP: Record<Locale, string> = {
  'en-US': 'en',
  'zh-CN': 'zh-cn',
}

const applyLocale = (nextLocale: Locale) => {
  initI18n(nextLocale)
  dayjs.locale(DAYJS_LOCALE_BY_APP[nextLocale] ?? 'en')
}

/**
 * CMReportingProvider Props。
 */
export interface CMReportingProviderProps {
  /** 初始语言，默认 'en-US' */
  locale?: Locale
  /** 语言变化回调 */
  onLocaleChange?: (locale: Locale) => void
  /** 可选覆盖 Ant Design 主题 */
  theme?: ThemeConfig
  /** CM 自定义 CSS 变量配置 */
  cssVariables?: CMCSSVariables
  /** 子组件 */
  children: ReactNode
  /** 加载中显示的内容 */
  fallback?: ReactNode
}

/**
 * CMReportingProvider：顶层 Provider。
 * 负责 i18n 初始化、Ant Design 配置和 Suspense 边界。
 */
export function CMReportingProvider({
  locale = 'en-US',
  onLocaleChange,
  theme = defaultAntdTheme,
  cssVariables,
  children,
  fallback,
}: CMReportingProviderProps) {
  const notifiedLocaleRef = useRef<Locale>(locale)

  // 在首轮 render 前同步应用语言，确保 SSR 与首屏输出和传入 locale 一致。
  const expectedDayjsLocale = DAYJS_LOCALE_BY_APP[locale] ?? 'en'
  const missingResourceBundles =
    !i18n.hasResourceBundle('en-US', 'translation') ||
    !i18n.hasResourceBundle('zh-CN', 'translation')

  if (missingResourceBundles || i18n.language !== locale || dayjs.locale() !== expectedDayjsLocale) {
    applyLocale(locale)
  }

  useEffect(() => {
    if (notifiedLocaleRef.current !== locale) {
      notifiedLocaleRef.current = locale
      onLocaleChange?.(locale)
    }
  }, [locale, onLocaleChange])

  const loadingFallback = fallback ?? (
    <Flex justify="center" align="center" style={{ height: 256 }}>
      <Spin size="large" />
    </Flex>
  )

  return (
    <ConfigProvider theme={theme} locale={ANT_LOCALE_BY_APP[locale]}>
      <AntApp>
        <AppThemeScope cssVariables={cssVariables}>
          <Suspense fallback={loadingFallback}>{children}</Suspense>
        </AppThemeScope>
      </AntApp>
    </ConfigProvider>
  )
}

export default CMReportingProvider
