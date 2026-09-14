/**
 * @file ui/tables/SmelterListTable.lookup.test.tsx
 * @description SmelterListTable lookup 列展示回归测试。
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { SMELTER_LOOKUP_META } from '@core/data/lookups'
import { getVersionDef } from '@core/registry'
import type { SmelterRow } from '@core/types/tableRows'
import { ConfigProvider } from 'antd'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test, vi } from 'vitest'

import { SmelterListTable } from './SmelterListTable'

vi.mock('@ui/i18n/useT', () => ({
  useT: () => ({
    t: (key: string) => key,
    locale: 'zh-CN',
    i18n: { t: (key: string) => key, isInitialized: true },
  }),
}))

function countText(html: string, text: string): number {
  return html.split(text).length - 1
}

function renderNotListedSmelterListTable(): string {
  const versionDef = getVersionDef('emrt', '2.11')
  const lithium = versionDef.mineralScope.minerals.find((mineral) => mineral.key === 'lithium')
  const rows: SmelterRow[] = [
    {
      id: 'manual-row-1',
      metal: lithium?.key ?? '',
      smelterLookup: SMELTER_LOOKUP_META.notListed,
      smelterName: '自定义0611',
      smelterCountry: 'UNITED STATES OF AMERICA',
      smelterNumber: '',
      smelterIdentification: '',
      sourceId: '',
      smelterStreet: '',
      smelterCity: '',
      smelterState: '',
    },
  ]

  return renderToStaticMarkup(
    <ConfigProvider componentDisabled={false}>
      <SmelterListTable
        templateType="emrt"
        versionId="2.11"
        versionDef={versionDef}
        config={versionDef.smelterList}
        availableMetals={versionDef.mineralScope.minerals}
        rows={rows}
        onChange={() => undefined}
        countryOptions={[{ value: 'UNITED STATES OF AMERICA', label: 'UNITED STATES OF AMERICA' }]}
        smelterLookupMeta={SMELTER_LOOKUP_META}
      />
    </ConfigProvider>,
  )
}

describe('SmelterListTable lookup column display', () => {
  test('uses library-scoped theme variables for custom smelter colors', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/lib/form-overrides.css'), 'utf8')

    expect(css).toContain('color: var(--app-error)')
    expect(css).toContain('color: var(--app-error-text)')
    expect(css).not.toContain('var(--ant-color-error)')
  })

  test('manual smelter rows show custom smelter name only in the name column', () => {
    const html = renderNotListedSmelterListTable()

    expect(html).toContain(SMELTER_LOOKUP_META.notListed)
    expect(countText(html, '自定义0611')).toBe(1)
    expect(html).toContain('cm-smelter-row-custom')
  })

  test('keeps the host row class on a custom smelter row', () => {
    const versionDef = getVersionDef('emrt', '2.11')
    const html = renderToStaticMarkup(
      <ConfigProvider componentDisabled={false}>
        <SmelterListTable
          templateType="emrt"
          versionId="2.11"
          versionDef={versionDef}
          config={versionDef.smelterList}
          availableMetals={versionDef.mineralScope.minerals}
          rows={[
            {
              id: 'custom-row-1',
              metal: 'lithium',
              smelterLookup: SMELTER_LOOKUP_META.notListed,
              smelterName: '自定义冶炼厂',
              smelterCountry: 'CHINA',
            },
          ]}
          onChange={() => undefined}
          smelterLookupMeta={SMELTER_LOOKUP_META}
          integration={{ rowClassName: () => 'host-row-class' }}
        />
      </ConfigProvider>,
    )

    expect(html).toContain('cm-smelter-row-custom host-row-class')
  })
})
