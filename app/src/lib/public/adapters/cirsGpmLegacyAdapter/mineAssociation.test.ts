import fs from 'node:fs'

import { getVersionDef, getVersions } from '@core/registry'
import type { TemplateType } from '@core/registry/types'
import { describe, expect, test } from 'vitest'

import type { CirsGpmLegacyReport } from './types'

import { cirsGpmLegacyAdapter } from '.'

const MINE_TEMPLATES: TemplateType[] = ['amrt', 'emrt']
const MINE_VERSIONS = MINE_TEMPLATES.flatMap((templateType) =>
  getVersions(templateType)
    .filter((versionId) => getVersionDef(templateType, versionId).mineList.available)
    .map((versionId) => ({ templateType, versionId })),
)
const SELECTED_SMELTER_ID = 'backend-selected-42'
const SELECTED_SMELTER_NAME = 'Selected Smelter'

function buildLegacy(input: { templateType: TemplateType; versionId: string }) {
  const url = new URL(`./__fixtures__/${input.templateType}.json`, import.meta.url)
  const legacy = JSON.parse(fs.readFileSync(url, 'utf8')) as CirsGpmLegacyReport
  return {
    name: `RMI_${input.templateType.toUpperCase()}_${input.versionId}`,
    cmtCompany: {},
    cmtRangeQuestions: [],
    cmtCompanyQuestions: [],
    cmtSmelters: [],
    minList: legacy.minList,
    cmtParts: [],
  } satisfies CirsGpmLegacyReport
}

function getMine(legacy: CirsGpmLegacyReport) {
  const mine = legacy.minList?.[0]
  if (!mine) throw new Error('测试报告必须包含矿场行')
  return mine
}

describe.each(MINE_VERSIONS)('$templateType $versionId 矿场冶炼厂关联', (version) => {
  test('导入明确的关联 ID，并原样回传', () => {
    const legacy = buildLegacy(version)
    getMine(legacy).smelterId = SELECTED_SMELTER_ID

    const { snapshot, ctx } = cirsGpmLegacyAdapter.toInternal(legacy)

    expect(snapshot.data.mineList[0]?.smelterId).toBe(SELECTED_SMELTER_ID)
    expect(cirsGpmLegacyAdapter.toExternal(snapshot, ctx)).toEqual(legacy)
  })

  test('新增矿场行回传所选后台 ID', () => {
    const legacy = buildLegacy(version)
    const { snapshot, ctx } = cirsGpmLegacyAdapter.toInternal(legacy)
    snapshot.data.mineList.push({
      ...snapshot.data.mineList[0]!,
      id: 'mine-new',
      smelterId: SELECTED_SMELTER_ID,
      smelterName: SELECTED_SMELTER_NAME,
    })

    const output = cirsGpmLegacyAdapter.toExternal(snapshot, ctx)

    expect(output.minList).toHaveLength(2)
    expect(output.minList?.[1]).toMatchObject({
      smelterId: SELECTED_SMELTER_ID,
      smelterName: SELECTED_SMELTER_NAME,
    })
  })

  test('已有矿场改选后同步更新名称和后台 ID', () => {
    const legacy = buildLegacy(version)
    const originalMine = getMine(legacy)
    const { snapshot, ctx } = cirsGpmLegacyAdapter.toInternal(legacy)
    snapshot.data.mineList[0]!.smelterId = SELECTED_SMELTER_ID
    snapshot.data.mineList[0]!.smelterName = SELECTED_SMELTER_NAME

    const output = cirsGpmLegacyAdapter.toExternal(snapshot, ctx)

    expect(getMine(output)).toEqual({
      ...originalMine,
      smelterId: SELECTED_SMELTER_ID,
      smelterName: SELECTED_SMELTER_NAME,
    })
  })

  test.each([undefined, ''] as const)('清空关联时不再携带旧 ID：%s', (clearedId) => {
    const legacy = buildLegacy(version)
    const { snapshot, ctx } = cirsGpmLegacyAdapter.toInternal(legacy)
    snapshot.data.mineList[0]!.smelterId = clearedId
    snapshot.data.mineList[0]!.smelterName = ''

    const output = cirsGpmLegacyAdapter.toExternal(snapshot, ctx)

    expect(getMine(output).smelterId).toBe('')
    expect(getMine(output).smelterName).toBe('')
  })

  test('只修改名称时沿用明确的 ID，不在转换器猜另一条记录', () => {
    const legacy = buildLegacy(version)
    const originalId = getMine(legacy).smelterId
    const { snapshot, ctx } = cirsGpmLegacyAdapter.toInternal(legacy)
    snapshot.data.mineList[0]!.smelterName = SELECTED_SMELTER_NAME

    const output = cirsGpmLegacyAdapter.toExternal(snapshot, ctx)

    expect(getMine(output).smelterId).toBe(originalId)
    expect(getMine(output).smelterName).toBe(SELECTED_SMELTER_NAME)
  })

  test.each(['missing', 'null', 'empty'] as const)(
    '未改数据保留关联字段原始状态：%s',
    (state) => {
      const legacy = buildLegacy(version)
      const mine = getMine(legacy)
      if (state === 'missing') delete mine.smelterId
      if (state === 'null') mine.smelterId = null
      if (state === 'empty') mine.smelterId = ''

      const { snapshot, ctx } = cirsGpmLegacyAdapter.toInternal(legacy)

      expect(snapshot.data.mineList[0]?.smelterId).toBe(state === 'empty' ? '' : undefined)
      expect(cirsGpmLegacyAdapter.toExternal(snapshot, ctx)).toEqual(legacy)
    },
  )

  test('宽松导出也回传明确的关联 ID', () => {
    const legacy = buildLegacy(version)
    const { snapshot } = cirsGpmLegacyAdapter.toInternal(legacy)
    snapshot.data.mineList[0]!.smelterId = SELECTED_SMELTER_ID
    snapshot.data.mineList[0]!.smelterName = SELECTED_SMELTER_NAME

    const output = cirsGpmLegacyAdapter.toExternalLoose(snapshot)

    expect(getMine(output)).toMatchObject({
      smelterId: SELECTED_SMELTER_ID,
      smelterName: SELECTED_SMELTER_NAME,
    })
  })

  test('缺少关联 ID 时不按名称或 CID 猜 ID', () => {
    const legacy = buildLegacy(version)
    delete getMine(legacy).smelterId
    const { snapshot } = cirsGpmLegacyAdapter.toInternal(legacy)
    snapshot.data.smelterList = [{
      id: SELECTED_SMELTER_ID,
      metal: snapshot.data.mineList[0]!.metal,
      smelterLookup: SELECTED_SMELTER_NAME,
      smelterName: SELECTED_SMELTER_NAME,
      smelterCountry: 'CN',
      smelterNumber: 'CID123456',
    }]
    snapshot.data.mineList[0]!.smelterName = SELECTED_SMELTER_NAME

    expect(getMine(cirsGpmLegacyAdapter.toExternalLoose(snapshot))).not.toHaveProperty('smelterId')
  })
})
