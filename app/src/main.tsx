/**
 * @file main.tsx
 * @description 应用入口。
 */

import type { Locale } from '@core/i18n'
import { CMReportingProvider } from '@lib/providers/CMReportingProvider'
import 'antd/dist/reset.css'
import { StrictMode, useCallback, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { DevApp } from './demo/DevApp'
import './index.css'
import './lib/styles.css'
import './demo/demo.css'

export function Root() {
  const [locale, setLocale] = useState<Locale>('zh-CN')
  const handleLocaleChange = useCallback((nextLocale: Locale) => {
    setLocale(nextLocale)
  }, [])

  return (
    <CMReportingProvider locale={locale}>
      <DevApp locale={locale} onLocaleChange={handleLocaleChange} />
    </CMReportingProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
