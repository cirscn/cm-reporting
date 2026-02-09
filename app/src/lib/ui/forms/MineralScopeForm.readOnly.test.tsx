/**
 * @file ui/forms/MineralScopeForm.readOnly.test.tsx
 * @description MineralScopeForm 只读模式交互元素可见性测试。
 */

import { getVersionDef } from '@core/registry'
import { ConfigProvider } from 'antd'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test, vi } from 'vitest'

import { MineralScopeForm } from './MineralScopeForm'

vi.mock('@ui/i18n', () => ({
  useT: () => ({
    t: (key: string) => key,
    locale: 'zh-CN',
    i18n: { t: (key: string) => key },
  }),
}))

describe('MineralScopeForm readOnly visibility', () => {
  test('hides checkbox controls when componentDisabled=true (dynamic-dropdown)', () => {
    const versionDef = getVersionDef('amrt', '1.3')
    const html = renderToStaticMarkup(
      <ConfigProvider componentDisabled>
        <MineralScopeForm
          versionDef={versionDef}
          selectedMinerals={['cobalt']}
          onMineralsChange={() => undefined}
          customMinerals={[]}
          onCustomMineralsChange={() => undefined}
        />
      </ConfigProvider>,
    )

    expect(html).not.toContain('ant-checkbox')
  })

  test('keeps checkbox controls when componentDisabled=false (dynamic-dropdown)', () => {
    const versionDef = getVersionDef('amrt', '1.3')
    const html = renderToStaticMarkup(
      <ConfigProvider componentDisabled={false}>
        <MineralScopeForm
          versionDef={versionDef}
          selectedMinerals={['cobalt']}
          onMineralsChange={() => undefined}
          customMinerals={[]}
          onCustomMineralsChange={() => undefined}
        />
      </ConfigProvider>,
    )

    expect(html).toContain('ant-checkbox')
  })
})
