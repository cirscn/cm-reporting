/**
 * @file lib/providers/CMReportingProvider.test.tsx
 * @description CMReportingProvider 语言初始化时序测试。
 */

import { initI18n } from '@core/i18n'
import { useT } from '@ui/i18n/useT'
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test, vi } from 'vitest'

import { CMReportingProvider } from './CMReportingProvider'

const mockConfigProvider = vi.fn()
const mockAntApp = vi.fn()

vi.mock('antd', async () => {
  const actual = await vi.importActual<typeof import('antd')>('antd')

  return {
    ...actual,
    ConfigProvider: (props: {
      children?: ReactNode
      getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement
    }) => {
      mockConfigProvider(props)
      return <div data-config-provider>{props.children}</div>
    },
    App: (props: { children?: ReactNode; style?: React.CSSProperties }) => {
      mockAntApp(props)
      return <div style={props.style}>{props.children}</div>
    },
  }
})

function LocalizedLanguageText() {
  const { t } = useT()
  return <span>{t('common.language')}</span>
}

describe('CMReportingProvider', () => {
  test('renders the scoped style root internally', () => {
    const html = renderToStaticMarkup(
      <CMReportingProvider locale="en-US">
        <span>content</span>
      </CMReportingProvider>
    )

    expect(html).toContain('class="cm-reporting-scope"')
  })

  test('keeps full-height layout through provider wrappers', () => {
    mockAntApp.mockClear()

    const html = renderToStaticMarkup(
      <CMReportingProvider locale="en-US">
        <span>content</span>
      </CMReportingProvider>
    )

    const antAppProps = mockAntApp.mock.calls[0]?.[0]
    expect(html).toContain('style="height:100%;min-height:100%"')
    expect(antAppProps?.style).toEqual({ height: '100%', minHeight: '100%' })
  })

  test('puts theme variables on the popup container root', () => {
    const html = renderToStaticMarkup(
      <CMReportingProvider
        locale="en-US"
        cssVariables={{
          fieldRequired: {
            background: '#fff8e1',
            border: '#ffa000',
          },
        }}
      >
        <span>content</span>
      </CMReportingProvider>
    )

    expect(html).toContain('class="cm-reporting-scope"')
    expect(html).toContain('--app-bg-layout:')
    expect(html).toContain('--cm-field-required-bg:#fff8e1')
    expect(html).toContain('--cm-field-required-border:#ffa000')
  })

  test('renders the popup container root inside ConfigProvider token context', () => {
    const html = renderToStaticMarkup(
      <CMReportingProvider locale="en-US">
        <span>content</span>
      </CMReportingProvider>
    )

    expect(html.indexOf('data-config-provider')).toBeLessThan(
      html.indexOf('class="cm-reporting-scope"'),
    )
  })

  test('routes Ant Design popups into the reporting scope root', () => {
    mockConfigProvider.mockClear()

    renderToStaticMarkup(
      <CMReportingProvider locale="en-US">
        <span>content</span>
      </CMReportingProvider>
    )

    const providerProps = mockConfigProvider.mock.calls
      .map((call) => call[0])
      .find((props) => props.getPopupContainer)
    expect(providerProps?.getPopupContainer).toBeTypeOf('function')
  })

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
