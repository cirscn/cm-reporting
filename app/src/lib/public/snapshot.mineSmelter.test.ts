import { getVersionDef, getVersions } from '@core/registry'
import type { MineRow } from '@core/types/tableRows'
import { describe, expect, test } from 'vitest'

import { parseSnapshot, stringifySnapshot } from './snapshot'

const versions = (['amrt', 'emrt'] as const).flatMap((templateType) =>
  getVersions(templateType)
    .filter((versionId) => getVersionDef(templateType, versionId).mineList.available)
    .map((versionId) => ({ templateType, versionId })),
)

function snapshot(options: {
  templateType: 'amrt' | 'emrt'
  versionId: string
  mineRow: MineRow
}) {
  return {
    schemaVersion: 1,
    templateType: options.templateType,
    versionId: options.versionId,
    locale: 'zh-CN',
    data: {
      companyInfo: {},
      selectedMinerals: [],
      customMinerals: [],
      questions: {},
      questionComments: {},
      companyQuestions: {},
      mineralsScope: [],
      smelterList: [],
      mineList: [options.mineRow],
      productList: [],
    },
  }
}

function mineRow(overrides: Partial<MineRow> = {}): MineRow {
  return {
    id: 'mine-a',
    metal: 'zinc',
    smelterName: '所选冶炼厂',
    mineName: '矿场',
    mineCountry: 'China',
    mineProvince: '',
    mineDistrict: '',
    comments: '',
    ...overrides,
  }
}

describe('矿场冶炼厂关联快照', () => {
  test.each(versions)('$templateType $versionId 的 JSON 读写保留所选 ID', (version) => {
    const parsed = parseSnapshot(snapshot({ ...version, mineRow: mineRow({ smelterId: 'backend-id' }) }))
    const restored = parseSnapshot(JSON.parse(stringifySnapshot(parsed)))

    expect(restored.data.mineList[0]).toMatchObject({
      smelterName: '所选冶炼厂',
      smelterId: 'backend-id',
    })
  })

  test('没有关联 ID 的历史快照不会凭名称生成 ID', () => {
    const parsed = parseSnapshot(snapshot({ templateType: 'amrt', versionId: '1.3', mineRow: mineRow() }))

    expect(parsed.data.mineList[0].smelterId).toBeUndefined()
  })

  test('清空关联后 JSON 保存不会恢复旧 ID', () => {
    const parsed = parseSnapshot(snapshot({
      templateType: 'emrt',
      versionId: '2.11.1',
      mineRow: mineRow({ smelterName: '', smelterId: undefined }),
    }))
    const restored = parseSnapshot(JSON.parse(stringifySnapshot(parsed)))

    expect(restored.data.mineList[0].smelterName).toBe('')
    expect(restored.data.mineList[0].smelterId).toBeUndefined()
  })
})
