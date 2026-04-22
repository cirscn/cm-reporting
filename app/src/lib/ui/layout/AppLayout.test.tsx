import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test, vi } from 'vitest'

import { AppLayout } from './AppLayout'

const { layoutMock, contentMock } = vi.hoisted(() => ({
  layoutMock: vi.fn(
    ({
      children,
      className,
      style,
    }: {
      children?: ReactNode
      className?: string
      style?: React.CSSProperties
    }) => (
      <div data-kind="layout" className={className} style={style}>
        {children}
      </div>
    ),
  ),
  contentMock: vi.fn(
    ({
      children,
      style,
    }: {
      children?: ReactNode
      style?: React.CSSProperties
    }) => (
      <main data-kind="content" style={style}>
        {children}
      </main>
    ),
  ),
}))

vi.mock('ahooks', () => ({
  useMemoizedFn: <T extends (...args: never[]) => unknown>(fn: T) => fn,
}))

vi.mock('antd', () => {
  const Layout = Object.assign(layoutMock, {
    Content: contentMock,
  })

  return {
    Layout,
    Card: ({ children }: { children?: ReactNode }) => <div data-kind="card">{children}</div>,
    Flex: ({
      children,
      className,
      style,
    }: {
      children?: ReactNode
      className?: string
      style?: React.CSSProperties
    }) => (
      <div data-kind="flex" className={className} style={style}>
        {children}
      </div>
    ),
  }
})

vi.mock('./Sidebar', () => ({
  Sidebar: () => <aside data-kind="sidebar" />,
}))

vi.mock('./StepNav', () => ({
  StepNav: () => <nav data-kind="step-nav" />,
}))

describe('AppLayout', () => {
  test('keeps root overflow visible so sticky step nav can follow modal body scroll', () => {
    layoutMock.mockClear()
    contentMock.mockClear()

    renderToStaticMarkup(
      <AppLayout steps={[{ key: 'declaration', label: '申报' }]}>
        <div>content</div>
      </AppLayout>,
    )

    expect(layoutMock).toHaveBeenCalled()
    expect(contentMock).toHaveBeenCalled()

    const rootLayoutStyle = layoutMock.mock.calls[0]?.[0]?.style as React.CSSProperties | undefined
    const contentShellStyle = layoutMock.mock.calls[2]?.[0]?.style as React.CSSProperties | undefined
    const contentStyle = contentMock.mock.calls[0]?.[0]?.style as React.CSSProperties | undefined

    expect(rootLayoutStyle?.overflow).toBeUndefined()
    expect(contentShellStyle?.overflow).toBe('hidden')
    expect(contentStyle?.overflow).toBe('auto')
    expect(contentStyle?.minHeight).toBe(0)
  })
})
