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

function hasDisabledInput(html: string): boolean {
  return /<input(?=[^>]*disabled="")[^>]*>/.test(html)
}

function hasInputEnabledByPlaceholder(html: string, placeholder: string): boolean {
  const escapedPlaceholder = escapeRegExp(placeholder)
  return new RegExp(
    `<input(?=[^>]*placeholder="${escapedPlaceholder}")(?![^>]*disabled="")[^>]*>`,
  ).test(html)
}

function hasDisabledInputByValue(html: string, value: string): boolean {
  const escapedValue = escapeRegExp(value)
  return new RegExp(`<input(?=[^>]*value="${escapedValue}")(?=[^>]*disabled="")[^>]*>`).test(
    html,
  )
}

function hasCountrySelectDisabled(html: string): boolean {
  return /class="[^"]*ant-select-disabled[^"]*"/.test(html)
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

function renderExternallyLockedSmelterListTable(rowOverride: Partial<SmelterRow>): string {
  const versionDef = getVersionDef('emrt', '2.11')
  const firstMetal = versionDef.mineralScope.minerals[0]
  const rows: SmelterRow[] = [
    {
      id: 'external-row-1',
      metal: firstMetal?.key ?? '',
      smelterLookup: 'External Smelter',
      smelterName: 'External Smelter',
      smelterCountry: 'Morocco',
      smelterNumber: 'CID-EXT-1',
      smelterIdentification: 'CID-EXT-1',
      sourceId: '',
      smelterStreet: '',
      smelterCity: '',
      smelterState: '',
      ...rowOverride,
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
        countryOptions={[{ value: 'MA', label: 'Morocco' }]}
        smelterLookupMeta={SMELTER_LOOKUP_META}
        integration={{ lookupMode: 'external', onPickSmelterForRow: async () => null }}
      />
    </ConfigProvider>,
  )
}

describe('SmelterListTable readOnly disabled behavior', () => {
  test('disables key smelter base fields when componentDisabled=true', () => {
    const html = renderSmelterListTable(true)

    expect(hasDisabledInput(html)).toBe(true)
    expect(html).not.toContain('placeholder="placeholders.smelterNumberInput"')
    expect(html).not.toContain('placeholder="placeholders.smelterIdentification"')
    expect(html).not.toContain('placeholder="placeholders.smelterSourceId"')
    expect(html).not.toContain('placeholder="placeholders.smelterStreet"')
    expect(html).not.toContain('placeholder="placeholders.smelterCity"')
    expect(html).not.toContain('placeholder="placeholders.smelterState"')
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

  test('does not show placeholder text for empty fields locked by external pick', () => {
    const html = renderExternallyLockedSmelterListTable({})

    expect(html).not.toContain('placeholder="placeholders.smelterSourceId"')
    expect(html).not.toContain('placeholder="placeholders.smelterStreet"')
    expect(html).not.toContain('placeholder="placeholders.smelterCity"')
  })

  test('locks custom not listed smelter fields selected from external picker', () => {
    const html = renderExternallyLockedSmelterListTable({
      id: 'custom-not-listed-1',
      smelterLookup: SMELTER_LOOKUP_META.notListed,
      smelterName: 'Custom Smelter',
      smelterCountry: 'Morocco',
      smelterNumber: 'CID-CUSTOM-1',
      smelterIdentification: 'CID-CUSTOM-1',
      sourceId: 'RMI',
      smelterStreet: '12 Custom Street',
      smelterCity: 'Rabat',
      smelterState: 'Rabat-Sale-Kenitra',
    })

    expect(hasDisabledInputByValue(html, 'Custom Smelter')).toBe(true)
    expect(hasDisabledInputByValue(html, 'CID-CUSTOM-1')).toBe(true)
    expect(hasDisabledInputByValue(html, 'RMI')).toBe(true)
    expect(hasDisabledInputByValue(html, '12 Custom Street')).toBe(true)
    expect(hasDisabledInputByValue(html, 'Rabat')).toBe(true)
    expect(hasCountrySelectDisabled(html)).toBe(true)
  })

  test('adds full text title for locked text fields so ellipsis can reveal content', () => {
    const state = 'Marrakech, Marrakech-Safi, Morocco'
    const html = renderExternallyLockedSmelterListTable({ smelterState: state })

    expect(html).toContain(`title="${state}"`)
  })
})
