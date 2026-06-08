import { describe, expect, test } from 'vitest'

import * as publicApi from './index'

describe('public API exports', () => {
  test('exports documented provider and theme helpers', () => {
    expect(publicApi.CMReportingProvider).toBeTypeOf('function')
    expect(publicApi.CMReportingApp).toBeTypeOf('function')
    expect(publicApi.defaultAntdTheme.token?.colorPrimary).toBe('#1565c0')
    expect(publicApi.mergeThemeConfig({ token: { colorPrimary: '#1993ff' } }).token).toMatchObject({
      colorPrimary: '#1993ff',
    })
  })
})
