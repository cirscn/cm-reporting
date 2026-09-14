import { ConfigProvider } from 'antd'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test } from 'vitest'

import { AppThemeScope } from './AppThemeScope'

describe('AppThemeScope custom CSS variable prefix', () => {
  test('bridges error colors from the active Ant Design prefix', () => {
    const html = renderToStaticMarkup(
      <ConfigProvider
        theme={{
          cssVar: { prefix: 'host' },
          token: {
            colorError: '#d32029',
            colorErrorText: '#a8071a',
          },
        }}
      >
        <AppThemeScope>
          <span>content</span>
        </AppThemeScope>
      </ConfigProvider>,
    )

    expect(html).toContain('--app-error:var(--host-color-error)')
    expect(html).toContain('--app-error-text:var(--host-color-error-text)')
  })
})
