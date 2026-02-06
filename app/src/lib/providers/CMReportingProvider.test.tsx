/**
 * @file lib/providers/CMReportingProvider.test.tsx
 * @description CMReportingProvider 语言初始化时序测试。
 */

import { initI18n } from '@core/i18n'
import { useT } from '@ui/i18n/useT'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test } from 'vitest'

import { CMReportingProvider } from './CMReportingProvider'

function LocalizedLanguageText() {
  const { t } = useT()
  return <span>{t('common.language')}</span>
}

describe('CMReportingProvider', () => {
  test('applies input locale before first render in SSR', () => {
    initI18n('en-US')

    const html = renderToStaticMarkup(
      <CMReportingProvider locale="zh-CN">
        <LocalizedLanguageText />
      </CMReportingProvider>
    )

    expect(html).toContain('语言')
  })
})
