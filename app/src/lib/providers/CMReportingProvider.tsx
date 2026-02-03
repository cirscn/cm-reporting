/**
 * @file lib/providers/CMReportingProvider.tsx
 * @description 顶层 Provider，负责 i18n 初始化和 Ant Design 配置。
 */

import type { Locale } from '@core/i18n'
import { initI18n } from '@core/i18n'
import { AppThemeScope } from '@ui/theme/AppThemeScope'
import type { CMCSSVariables } from '@ui/theme/index'
import { App as AntApp, ConfigProvider, Flex, Spin } from 'antd'
import type { ThemeConfig } from 'antd'
import enUS from 'antd/locale/en_US'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import type { ReactNode } from 'react'
import { Suspense, useLayoutEffect, useRef, useState } from 'react'

/**
 * 默认 Ant Design 主题配置。
 */
const defaultTheme: ThemeConfig = {
  cssVar: { prefix: 'ant' },
  token: {
    // 主色系统 - 与原型设计对齐
    colorPrimary: '#1565c0',
    colorPrimaryHover: '#1976d2',
    colorPrimaryActive: '#0d47a1',
    colorPrimaryBg: '#e3f2fd',
    colorPrimaryBorder: '#90caf9',

    // 状态颜色
    colorSuccess: '#2e7d32',
    colorSuccessBg: '#e8f5e9',
    colorSuccessBorder: '#4caf50',
    colorWarning: '#f57c00',
    colorWarningBg: '#fff3e0',
    colorWarningBorder: '#ff9800',
    colorError: '#c62828',
    colorErrorBg: '#ffebee',
    colorErrorBorder: '#ef5350',
    colorInfo: '#0288d1',
    colorInfoBg: '#e1f5fe',
    colorInfoBorder: '#03a9f4',

    // 文本颜色
    colorText: '#212121',
    colorTextSecondary: '#757575',
    colorTextTertiary: '#9e9e9e',
    colorTextHeading: '#212121',
    colorTextDescription: '#757575',

    // 背景颜色
    colorBgLayout: '#f5f5f5',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',

    // 边框颜色
    colorBorder: '#e0e0e0',
    colorBorderSecondary: '#eeeeee',

    // 填充颜色
    colorFillSecondary: '#eeeeee',
    colorFillTertiary: '#f5f5f5',
    colorFillQuaternary: '#fafafa',

    // 圆角
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 4,
    borderRadiusXS: 2,

    // 字体
    fontFamily: "'IBM Plex Sans', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontFamilyCode: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
    fontSize: 14,

    // 阴影
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    boxShadowSecondary: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
}

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
  theme = defaultTheme,
  cssVariables,
  children,
  fallback,
}: CMReportingProviderProps) {
  useState(() => {
    applyLocale(locale)
    return true
  })
  const lastLocaleRef = useRef<Locale>(locale)

  // 在首帧绘制前完成初始化，避免 useTranslation 无实例或 key 闪烁
  useLayoutEffect(() => {
    if (lastLocaleRef.current === locale) return
    applyLocale(locale)
    lastLocaleRef.current = locale
    onLocaleChange?.(locale)
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
