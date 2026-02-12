/**
 * @file ui/tables/SmelterListTable.readOnly.test.tsx
 * @description SmelterListTable 在只读/禁用态下的字段禁用回归测试。
 */

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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function hasInputDisabledByPlaceholder(html: string, placeholder: string): boolean {
  const escapedPlaceholder = escapeRegExp(placeholder)
  return new RegExp(
    `<input(?=[^>]*placeholder="${escapedPlaceholder}")(?=[^>]*disabled="")[^>]*>`,
  ).test(html)
}

function hasInputEnabledByPlaceholder(html: string, placeholder: string): boolean {
  const escapedPlaceholder = escapeRegExp(placeholder)
  return new RegExp(
    `<input(?=[^>]*placeholder="${escapedPlaceholder}")(?![^>]*disabled="")[^>]*>`,
  ).test(html)
}

function hasCountrySelectDisabled(html: string): boolean {
  return /<div class="[^"]*ant-select[^"]*ant-select-disabled[^"]*"><div class="ant-select-content"><div class="ant-select-placeholder"[^>]*>placeholders\.smelterCountry<\/div>/.test(
    html,
  )
}

function hasCountrySelectEnabled(html: string): boolean {
  return /<div class="[^"]*ant-select(?![^"]*ant-select-disabled)[^"]*"><div class="ant-select-content"><div class="ant-select-placeholder"[^>]*>placeholders\.smelterCountry<\/div>/.test(
    html,
  )
}

function renderSmelterListTable(componentDisabled: boolean): string {
  const versionDef = getVersionDef('cmrt', '6.5')
  const firstMetal = versionDef.mineralScope.minerals[0]
  const rows: SmelterRow[] = [
    {
      id: 'row-1',
      metal: firstMetal?.key ?? '',
      smelterLookup: '',
      smelterName: '',
      smelterCountry: '',
      smelterNumber: '',
      smelterIdentification: '',
      sourceId: '',
      smelterStreet: '',
      smelterCity: '',
      smelterState: '',
    },
  ]

  return renderToStaticMarkup(
    <ConfigProvider componentDisabled={componentDisabled}>
      <SmelterListTable
        templateType="cmrt"
        versionId="6.5"
        versionDef={versionDef}
        config={versionDef.smelterList}
        availableMetals={versionDef.mineralScope.minerals}
        rows={rows}
        onChange={() => undefined}
        countryOptions={[{ value: 'CN', label: 'China' }]}
        smelterLookupMeta={SMELTER_LOOKUP_META}
      />
    </ConfigProvider>,
  )
}

describe('SmelterListTable readOnly disabled behavior', () => {
  test('disables key smelter base fields when componentDisabled=true', () => {
    const html = renderSmelterListTable(true)

    expect(hasInputDisabledByPlaceholder(html, 'placeholders.smelterNumberInput')).toBe(true)
    expect(hasInputDisabledByPlaceholder(html, 'placeholders.smelterIdentification')).toBe(true)
    expect(hasInputDisabledByPlaceholder(html, 'placeholders.smelterSourceId')).toBe(true)
    expect(hasInputDisabledByPlaceholder(html, 'placeholders.smelterStreet')).toBe(true)
    expect(hasInputDisabledByPlaceholder(html, 'placeholders.smelterCity')).toBe(true)
    expect(hasInputDisabledByPlaceholder(html, 'placeholders.smelterState')).toBe(true)
    expect(hasCountrySelectDisabled(html)).toBe(true)
  })

  test('keeps fields editable when componentDisabled=false and no external lock', () => {
    const html = renderSmelterListTable(false)

    expect(hasInputEnabledByPlaceholder(html, 'placeholders.smelterNumberInput')).toBe(true)
    expect(hasInputEnabledByPlaceholder(html, 'placeholders.smelterIdentification')).toBe(true)
    expect(hasInputEnabledByPlaceholder(html, 'placeholders.smelterSourceId')).toBe(true)
    expect(hasInputEnabledByPlaceholder(html, 'placeholders.smelterStreet')).toBe(true)
    expect(hasInputEnabledByPlaceholder(html, 'placeholders.smelterCity')).toBe(true)
    expect(hasInputEnabledByPlaceholder(html, 'placeholders.smelterState')).toBe(true)
    expect(hasCountrySelectEnabled(html)).toBe(true)
  })
})
