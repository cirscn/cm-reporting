/**
 * @file lib/CMReportingApp.readOnly.test.tsx
 * @description CMReportingApp readOnly 与底部操作参数透传测试。
 */

import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test, vi } from 'vitest'

import { CMReportingApp } from './CMReportingApp'

const mockTemplateShell = vi.fn()

vi.mock('@shell/navigation/NavigationContext', () => ({
  NavigationProvider: ({ children }: { children?: ReactNode }) => <>{children}</>,
}))

vi.mock('@shell/pages/TemplateShell', () => ({
  TemplateShell: (props: {
    children?: ReactNode
    readOnly?: boolean
    showPageActions?: boolean
  }) => {
    mockTemplateShell(props)
    return <>{props.children}</>
  },
}))

vi.mock('@shell/pages/CheckerPage', () => ({ CheckerPage: () => null }))
vi.mock('@shell/pages/DeclarationPage', () => ({ DeclarationPage: () => null }))
vi.mock('@shell/pages/DocContent', () => ({ DocPage: () => null }))
vi.mock('@shell/pages/MineListPage', () => ({ MineListPage: () => null }))
vi.mock('@shell/pages/MineralsScopePage', () => ({ MineralsScopePage: () => null }))
vi.mock('@shell/pages/ProductListPage', () => ({ ProductListPage: () => null }))
vi.mock('@shell/pages/RevisionPage', () => ({ RevisionPage: () => null }))
vi.mock('@shell/pages/SmelterListPage', () => ({ SmelterListPage: () => null }))

describe('CMReportingApp readOnly', () => {
  test('forwards readOnly=true to TemplateShell', () => {
    mockTemplateShell.mockClear()

    renderToStaticMarkup(<CMReportingApp templateType="cmrt" versionId="6.5" readOnly />)

    expect(mockTemplateShell).toHaveBeenCalled()
    const props = mockTemplateShell.mock.calls[0]?.[0]
    expect(props?.readOnly).toBe(true)
  })

  test('defaults readOnly to false', () => {
    mockTemplateShell.mockClear()

    renderToStaticMarkup(<CMReportingApp templateType="cmrt" versionId="6.5" />)

    expect(mockTemplateShell).toHaveBeenCalled()
    const props = mockTemplateShell.mock.calls[0]?.[0]
    expect(props?.readOnly).toBe(false)
  })

  test('forwards showPageActions=false to TemplateShell', () => {
    mockTemplateShell.mockClear()

    renderToStaticMarkup(
      <CMReportingApp templateType="cmrt" versionId="6.5" showPageActions={false} />,
    )

    expect(mockTemplateShell).toHaveBeenCalled()
    const props = mockTemplateShell.mock.calls[0]?.[0]
    expect(props?.showPageActions).toBe(false)
  })

  test('defaults showPageActions to true', () => {
    mockTemplateShell.mockClear()

    renderToStaticMarkup(<CMReportingApp templateType="cmrt" versionId="6.5" />)

    expect(mockTemplateShell).toHaveBeenCalled()
    const props = mockTemplateShell.mock.calls[0]?.[0]
    expect(props?.showPageActions).toBe(true)
  })
})
