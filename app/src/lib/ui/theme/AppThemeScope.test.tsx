/**
 * @file lib/ui/theme/AppThemeScope.test.tsx
 * @description AppThemeScope 主题变量兼容性测试。
 */

import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { AppThemeScope } from './AppThemeScope'

const mockUseToken = vi.fn<() => { token: Record<string, string>; cssVar?: Record<string, string> }>()

vi.mock('antd', () => ({
  theme: {
    useToken: () => mockUseToken(),
  },
}))

describe('AppThemeScope', () => {
  beforeEach(() => {
    mockUseToken.mockReset()
  })

  test('falls back to token values when cssVar is unavailable', () => {
    mockUseToken.mockReturnValue({
      token: {
        colorBgLayout: '#101010',
      },
    })

    const html = renderToStaticMarkup(
      <AppThemeScope>
        <span>content</span>
      </AppThemeScope>
    )

    expect(html).toContain('--app-bg-layout:#101010')
  })

  test('prefers cssVar values when available', () => {
    mockUseToken.mockReturnValue({
      token: {
        colorBgLayout: '#101010',
      },
      cssVar: {
        colorBgLayout: '--ant-colorBgLayout',
      },
    })

    const html = renderToStaticMarkup(
      <AppThemeScope>
        <span>content</span>
      </AppThemeScope>
    )

    expect(html).toContain('--app-bg-layout:var(--ant-colorBgLayout)')
  })
})
