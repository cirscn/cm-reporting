import { getVersionDef, getVersions } from '@core/registry'
import type { SmelterRow } from '@core/types/tableRows'
import { describe, expect, test } from 'vitest'

import { buildMineListViewModel } from './pages'

function smelter(overrides: Partial<SmelterRow> = {}): SmelterRow {
  return {
    id: 'backend-a',
    metal: 'zinc',
    smelterName: '同名冶炼厂',
    smelterLookup: '同名冶炼厂',
    smelterCountry: 'China',
    smelterNumber: 'CID-DISPLAY-A',
    ...overrides,
  }
}

function viewModel(options: {
  templateType?: 'amrt' | 'emrt'
  versionId?: string
  smelterList: SmelterRow[]
}) {
  return buildMineListViewModel({
    versionDef: getVersionDef(options.templateType ?? 'amrt', options.versionId ?? '1.3'),
    questionAnswers: {},
    selectedMinerals: ['zinc', 'cobalt'],
    customMinerals: [],
    smelterList: options.smelterList,
  })
}

const mineVersions = (['amrt', 'emrt'] as const).flatMap((templateType) =>
  getVersions(templateType)
    .filter((versionId) => getVersionDef(templateType, versionId).mineList.available)
    .map((versionId) => ({ templateType, versionId })),
)

describe('矿场冶炼厂选项关联', () => {
  test.each(mineVersions)('$templateType $versionId 以所选记录 ID 为值，名称为标签', (version) => {
    const result = viewModel({ ...version, smelterList: [smelter()] })

    expect(result.smelterOptions).toEqual([{ value: 'backend-a', label: '同名冶炼厂' }])
    expect(result.smelterOptionsByMetal.zinc).toEqual(result.smelterOptions)
  })

  test('同一金属下同名但 ID 不同的冶炼厂保留为独立选项', () => {
    const result = viewModel({
      smelterList: [smelter(), smelter({ id: 'backend-b', smelterNumber: 'CID-DISPLAY-B' })],
    })

    expect(result.smelterOptionsByMetal.zinc).toEqual([
      { value: 'backend-a', label: '同名冶炼厂' },
      { value: 'backend-b', label: '同名冶炼厂' },
    ])
  })

  test('按金属分组，并以 ID 去重，绝不使用 CID 作为关联值', () => {
    const result = viewModel({
      smelterList: [smelter(), smelter(), smelter({ id: 'backend-c', metal: 'cobalt' })],
    })

    expect(result.smelterOptions).toHaveLength(2)
    expect(result.smelterOptionsByMetal.zinc).toEqual([{ value: 'backend-a', label: '同名冶炼厂' }])
    expect(result.smelterOptionsByMetal.cobalt).toEqual([{ value: 'backend-c', label: '同名冶炼厂' }])
  })

  test('保留自定义名称和查找名称；没有实际名称的特殊选项不生成关联选项', () => {
    const result = viewModel({
      smelterList: [
        smelter({ id: 'custom-a', smelterLookup: 'Smelter not listed', smelterName: '自定义冶炼厂' }),
        smelter({ id: 'lookup-a', smelterName: '', smelterLookup: '查找名称' }),
        smelter({ id: 'empty-a', smelterName: '', smelterLookup: 'Smelter not listed' }),
      ],
    })

    expect(result.smelterOptions).toEqual([
      { value: 'custom-a', label: '自定义冶炼厂' },
      { value: 'lookup-a', label: '查找名称' },
    ])
  })
})
