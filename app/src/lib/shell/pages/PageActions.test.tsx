/**
 * @file shell/pages/PageActions.test.tsx
 * @description 底部翻页操作展示测试。
 */

import type { PageDef } from '@core/registry/types'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test, vi } from 'vitest'

import { PageActions } from './PageActions'

vi.mock('@shell/store', () => ({
  useTemplateState: () => ({
    meta: {
      versionDef: {
        pages: [
          { key: 'declaration', labelKey: 'tabs.declaration', available: true },
          { key: 'checker', labelKey: 'tabs.checker', available: true },
        ] as PageDef[],
      },
    },
  }),
}))

vi.mock('@ui/i18n/useT', () => ({
  useT: () => ({
    t: (key: string) => key,
  }),
}))

describe('PageActions', () => {
  test('shows prev/next only on checker page', () => {
    const html = renderToStaticMarkup(
      <PageActions
        currentPageKey="checker"
        onNavigatePage={() => undefined}
        pageOrder={[
          { key: 'declaration', labelKey: 'tabs.declaration', available: true },
          { key: 'checker', labelKey: 'tabs.checker', available: true },
        ]}
      />,
    )

    expect(html).toContain('actions.prev')
    expect(html).toContain('actions.next')
    expect(html).not.toContain('actions.submit')
  })

  test('returns null when no previous and next page', () => {
    const html = renderToStaticMarkup(
      <PageActions
        currentPageKey="declaration"
        onNavigatePage={() => undefined}
        pageOrder={[{ key: 'declaration', labelKey: 'tabs.declaration', available: true }]}
      />,
    )

    expect(html).toBe('')
  })
})
