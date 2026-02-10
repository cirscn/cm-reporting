/**
 * @file lib/CMReporting.readOnly.test.tsx
 * @description CMReporting readOnly 与底部操作参数透传测试。
 */

import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test, vi } from 'vitest'

import { CMReporting } from './CMReporting'

const mockProvider = vi.fn()
const mockApp = vi.fn()

vi.mock('./providers/CMReportingProvider', () => ({
  CMReportingProvider: (props: { children?: ReactNode; readOnly?: boolean }) => {
    mockProvider(props)
    return <>{props.children}</>
  },
}))

vi.mock('./CMReportingApp', () => ({
  CMReportingApp: (props: {
    children?: ReactNode
    readOnly?: boolean
    showPageActions?: boolean
  }) => {
    mockApp(props)
    return <>{props.children}</>
  },
}))

vi.mock('./shell/store', () => ({
  useTemplateState: () => ({
    meta: { templateType: 'cmrt', versionId: '6.5' },
    form: {
      companyInfo: {},
      selectedMinerals: [],
      customMinerals: [],
      questions: {},
      questionComments: {},
      companyQuestions: {},
    },
    lists: {
      mineralsScope: [],
      smelterList: [],
      mineList: [],
      productList: [],
    },
  }),
  useTemplateActions: () => ({
    setFormData: vi.fn(),
    validateForm: vi.fn(async () => true),
  }),
}))

vi.mock('./shell/navigation/useNavigation', () => ({
  useOptionalNavigation: () => null,
}))

describe('CMReporting readOnly', () => {
  test('forwards readOnly=true to CMReportingApp', () => {
    mockProvider.mockClear()
    mockApp.mockClear()

    renderToStaticMarkup(<CMReporting templateType="cmrt" versionId="6.5" readOnly />)

    expect(mockApp).toHaveBeenCalled()
    const appProps = mockApp.mock.calls[0]?.[0]
    expect(appProps?.readOnly).toBe(true)
  })

  test('defaults readOnly to false', () => {
    mockProvider.mockClear()
    mockApp.mockClear()

    renderToStaticMarkup(<CMReporting templateType="cmrt" versionId="6.5" />)

    expect(mockApp).toHaveBeenCalled()
    const appProps = mockApp.mock.calls[0]?.[0]
    expect(appProps?.readOnly).toBe(false)
  })

  test('forwards showPageActions=false to CMReportingApp', () => {
    mockProvider.mockClear()
    mockApp.mockClear()

    renderToStaticMarkup(
      <CMReporting templateType="cmrt" versionId="6.5" showPageActions={false} />,
    )

    expect(mockApp).toHaveBeenCalled()
    const appProps = mockApp.mock.calls[0]?.[0]
    expect(appProps?.showPageActions).toBe(false)
  })

  test('defaults showPageActions to true', () => {
    mockProvider.mockClear()
    mockApp.mockClear()

    renderToStaticMarkup(<CMReporting templateType="cmrt" versionId="6.5" />)

    expect(mockApp).toHaveBeenCalled()
    const appProps = mockApp.mock.calls[0]?.[0]
    expect(appProps?.showPageActions).toBe(true)
  })
})
