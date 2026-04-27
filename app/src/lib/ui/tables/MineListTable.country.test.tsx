import zhCN from '@core/i18n/locales/zh-CN.json'
import { getVersionDef } from '@core/registry'
import type { MineRow } from '@core/types/tableRows'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test, vi } from 'vitest'

function resolveMessage(key: string): string {
  const value = key
    .split('.')
    .reduce<unknown>((current, segment) => (
      current && typeof current === 'object'
        ? (current as Record<string, unknown>)[segment]
        : undefined
    ), zhCN)

  return typeof value === 'string' ? value : key
}

vi.mock('@ui/i18n/useT', () => ({
  useT: () => ({
    t: resolveMessage,
    locale: 'zh-CN',
    i18n: { t: resolveMessage, isInitialized: true },
  }),
}))

vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>()
  const React = await import('react')

  return {
    ...actual,
    Input: (props: { placeholder?: string; value?: string }) =>
      React.createElement('input', {
        'data-input-placeholder': props.placeholder,
        value: props.value ?? '',
        readOnly: true,
      }),
    Select: (props: { placeholder?: string; value?: string; disabled?: boolean }) =>
      React.createElement('select', {
        'data-select-placeholder': props.placeholder,
        'data-disabled': String(Boolean(props.disabled)),
        value: props.value ?? '',
        onChange: () => undefined,
      }),
    AutoComplete: (props: { placeholder?: string; value?: string; disabled?: boolean }) =>
      React.createElement('input', {
        'data-autocomplete-placeholder': props.placeholder,
        'data-disabled': String(Boolean(props.disabled)),
        value: props.value ?? '',
        readOnly: true,
      }),
  }
})

import { MineListTable } from './MineListTable'

function renderMineTable(
  options: {
    templateType?: 'emrt' | 'amrt'
    versionId?: string
    withMetal?: boolean
  } = {},
): string {
  const templateType = options.templateType ?? 'emrt'
  const versionId = options.versionId ?? '2.1'
  const versionDef = getVersionDef(templateType, versionId)
  const firstMetal = versionDef.mineralScope.minerals[0]
  const metal = options.withMetal === false ? '' : firstMetal?.key ?? ''
  const rows: MineRow[] = [
    {
      id: 'mine-row-1',
      metal,
      smelterName: '',
      mineName: '',
      mineCountry: '',
      mineId: '',
      mineIdSource: '',
      mineStreet: '',
      mineCity: '',
      mineProvince: '',
      mineDistrict: '',
      mineContactName: '',
      mineContactEmail: '',
      proposedNextSteps: '',
      comments: '',
    },
  ]

  return renderToStaticMarkup(
    <MineListTable
      config={versionDef.mineList}
      availableMetals={versionDef.mineralScope.minerals}
      rows={rows}
      onChange={() => undefined}
      smelterOptions={[{ value: 'smelter-1', label: 'Smelter A' }]}
      smelterOptionsByMetal={{ [firstMetal?.key ?? '']: [{ value: 'smelter-1', label: 'Smelter A' }] }}
    />,
  )
}

describe('MineListTable country input', () => {
  test('renders mine country as a text input instead of a dropdown', () => {
    const html = renderMineTable()
    const placeholder = resolveMessage('placeholders.mineCountry')

    expect(placeholder).toBe('国家/地区')
    expect(html).toContain(`data-input-placeholder="${placeholder}"`)
    expect(html).not.toContain(`data-select-placeholder="${placeholder}"`)
  })

  test('disables dropdown smelter selection before metal is selected', () => {
    const html = renderMineTable({ templateType: 'emrt', versionId: '2.1', withMetal: false })
    const placeholder = resolveMessage('placeholders.mineSmelterSelect')

    expect(html).toContain(`data-select-placeholder="${placeholder}" data-disabled="true"`)
  })

  test('enables dropdown smelter selection after metal is selected', () => {
    const html = renderMineTable({ templateType: 'emrt', versionId: '2.1', withMetal: true })
    const placeholder = resolveMessage('placeholders.mineSmelterSelect')

    expect(html).toContain(`data-select-placeholder="${placeholder}" data-disabled="false"`)
  })

  test('disables manual smelter input before metal is selected', () => {
    const html = renderMineTable({ templateType: 'emrt', versionId: '2.0', withMetal: false })
    const placeholder = resolveMessage('placeholders.mineSmelterInput')

    expect(html).toContain(`data-autocomplete-placeholder="${placeholder}" data-disabled="true"`)
  })
})
