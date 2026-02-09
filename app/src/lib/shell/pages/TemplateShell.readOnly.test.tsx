/**
 * @file shell/pages/TemplateShell.readOnly.test.tsx
 * @description TemplateShell 只读模式页面行为测试。
 */

import { getVersionDef } from '@core/registry'
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { TemplateShell } from './TemplateShell'

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return {
    ...actual,
    useEffect: (effect: () => void) => {
      effect()
    },
  }
})

const mockAppLayout = vi.fn()
const mockPageActions = vi.fn()
const mockRequiredHintBanner = vi.fn()
const mockInnerConfigProvider = vi.fn()

const checkerSummaryStub = {
  sections: {
    companyInfo: { total: 1, completed: 1 },
    questionMatrix: { total: 1, completed: 1 },
    companyQuestions: { total: 1, completed: 1 },
    smelterList: { total: 1, completed: 1 },
    productList: { total: 1, completed: 1 },
  },
}

vi.mock('@shell/store', () => ({
  TemplateProvider: ({ children }: { children?: ReactNode }) => <>{children}</>,
  useTemplateState: () => ({
    meta: {
      versionDef: getVersionDef('cmrt', '6.5'),
    },
  }),
  useTemplateDerived: () => ({
    checkerErrors: [{ type: 'required', page: 'checker' }],
    checkerSummary: checkerSummaryStub,
  }),
}))

vi.mock('@ui/i18n/useT', () => ({
  useT: () => ({
    t: (key: string) => key,
    locale: 'zh-CN',
    i18n: { isInitialized: true },
  }),
}))

const mockUseConfig = vi.fn(() => ({ componentDisabled: false }))

vi.mock('@ui/layout/AppLayout', () => ({
  AppLayout: (props: {
    children?: ReactNode
    bottomSlot?: ReactNode
  }) => {
    mockAppLayout(props)
    return (
      <>
        {props.children}
        {props.bottomSlot}
      </>
    )
  },
}))

vi.mock('antd', () => {
  const MockConfigProvider = Object.assign(
    ({ children, componentDisabled }: { children?: ReactNode; componentDisabled?: boolean }) => {
      mockInnerConfigProvider(componentDisabled)
      return <>{children}</>
    },
    {
      useConfig: () => mockUseConfig(),
    },
  )
  return {
    ConfigProvider: MockConfigProvider,
  }
})

vi.mock('@ui/layout/RequiredHintBanner', () => ({
  RequiredHintBanner: (props: Record<string, unknown>) => {
    mockRequiredHintBanner(props)
    return <div data-testid="required-hint-banner" />
  },
}))

vi.mock('./PageActions', () => ({
  PageActions: (props: Record<string, unknown>) => {
    mockPageActions(props)
    return <div data-testid="page-actions" />
  },
}))

describe('TemplateShell readOnly', () => {
  beforeEach(() => {
    mockAppLayout.mockClear()
    mockPageActions.mockClear()
    mockRequiredHintBanner.mockClear()
    mockInnerConfigProvider.mockClear()
    mockUseConfig.mockReturnValue({ componentDisabled: false })
  })

  test('hides checker page and required banner when readOnly=true', () => {
    const renderPage = vi.fn((pageKey: string) => <div>{pageKey}</div>)

    renderToStaticMarkup(
      <TemplateShell
        templateType="cmrt"
        versionId="6.5"
        readOnly
        pageKey="checker"
        onNavigatePage={() => undefined}
        renderPage={renderPage}
      />,
    )

    expect(renderPage).toHaveBeenCalledWith('declaration')

    const appLayoutProps = mockAppLayout.mock.calls[0]?.[0] as {
      steps?: Array<{ key: string }>
      currentStepKey?: string
    }
    expect(appLayoutProps.currentStepKey).toBe('declaration')
    expect(appLayoutProps.steps?.some((step) => step.key === 'checker')).toBe(false)

    const pageActionsProps = mockPageActions.mock.calls[0]?.[0] as {
      currentPageKey?: string
      pageOrder?: Array<{ key: string }>
    }
    expect(pageActionsProps).toBeUndefined()

    expect(mockRequiredHintBanner).not.toHaveBeenCalled()
    expect(mockInnerConfigProvider).toHaveBeenCalledWith(true)
  })

  test('syncs controlled pageKey via onNavigatePage when readOnly checker is hidden', () => {
    const onNavigatePage = vi.fn()

    renderToStaticMarkup(
      <TemplateShell
        templateType="cmrt"
        versionId="6.5"
        readOnly
        pageKey="checker"
        onNavigatePage={onNavigatePage}
        renderPage={() => <div>content</div>}
      />,
    )

    expect(onNavigatePage).toHaveBeenCalledWith('declaration')
  })

  test('keeps checker page available when readOnly=false', () => {
    const renderPage = vi.fn((pageKey: string) => <div>{pageKey}</div>)

    renderToStaticMarkup(
      <TemplateShell
        templateType="cmrt"
        versionId="6.5"
        readOnly={false}
        pageKey="declaration"
        onNavigatePage={() => undefined}
        renderPage={renderPage}
      />,
    )

    const appLayoutProps = mockAppLayout.mock.calls[0]?.[0] as {
      steps?: Array<{ key: string }>
      currentStepKey?: string
    }
    expect(appLayoutProps.currentStepKey).toBe('declaration')
    expect(appLayoutProps.steps?.some((step) => step.key === 'checker')).toBe(true)
    expect(mockRequiredHintBanner).toHaveBeenCalled()
    expect(mockInnerConfigProvider).toHaveBeenCalledWith(false)
  })

  test('preserves parent componentDisabled=true when readOnly=false', () => {
    mockUseConfig.mockReturnValue({ componentDisabled: true })
    const renderPage = vi.fn((pageKey: string) => <div>{pageKey}</div>)

    renderToStaticMarkup(
      <TemplateShell
        templateType="cmrt"
        versionId="6.5"
        readOnly={false}
        pageKey="declaration"
        onNavigatePage={() => undefined}
        renderPage={renderPage}
      />,
    )

    expect(renderPage).toHaveBeenCalledWith('declaration')
    expect(mockInnerConfigProvider).toHaveBeenCalledWith(true)
  })
})
