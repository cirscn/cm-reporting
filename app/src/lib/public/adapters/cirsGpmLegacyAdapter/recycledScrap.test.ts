import { getTemplateTypes, getVersions } from '@core/registry'
import type { TemplateType } from '@core/registry/types'
import { describe, expect, test } from 'vitest'

import type { CirsGpmLegacyReport } from './types'

import { cirsGpmLegacyAdapter } from '.'

const AMRT_VERSIONS = getVersions('amrt')
const OTHER_VERSIONS = getTemplateTypes()
  .filter((templateType) => templateType !== 'amrt')
  .flatMap((templateType) => getVersions(templateType).map((versionId) => ({ templateType, versionId })))

function buildLegacy(options: {
  templateType: TemplateType
  versionId: string
  isRecycle?: string | null
}): CirsGpmLegacyReport {
  return {
    name: `RMI_${options.templateType.toUpperCase()}_${options.versionId}`,
    cmtCompany: {},
    cmtSmelters: [{
      id: 'smelter-existing',
      metal: 'Zinc',
      smelterName: 'Existing Smelter',
      smelterCountry: 'CN',
      ...(options.isRecycle === undefined ? {} : { isRecycle: options.isRecycle }),
    }],
  }
}

describe.each(AMRT_VERSIONS)('AMRT %s 冶炼厂回收料答案', (versionId) => {
  test.each(['2', 'Unknown'] as const)('导入 %s 后内部答案为 Unknown，提交为字符串 2', (isRecycle) => {
    const legacy = buildLegacy({ templateType: 'amrt', versionId, isRecycle })

    const { snapshot, ctx } = cirsGpmLegacyAdapter.toInternal(legacy)

    expect(snapshot.data.smelterList[0]?.recycledScrap).toBe('Unknown')
    expect(cirsGpmLegacyAdapter.toExternal(snapshot, ctx)).toEqual({
      ...legacy,
      cmtSmelters: [{ ...legacy.cmtSmelters![0], isRecycle: '2' }],
    })
    expect(cirsGpmLegacyAdapter.toExternalLoose(snapshot).cmtSmelters?.[0]?.isRecycle).toBe('2')
  })

  test('已有冶炼厂改选未知后提交字符串 2', () => {
    const legacy = buildLegacy({ templateType: 'amrt', versionId, isRecycle: '1' })
    const { snapshot, ctx } = cirsGpmLegacyAdapter.toInternal(legacy)
    snapshot.data.smelterList[0]!.recycledScrap = 'Unknown'

    expect(cirsGpmLegacyAdapter.toExternal(snapshot, ctx).cmtSmelters?.[0]?.isRecycle).toBe('2')
  })

  test('新增冶炼厂选择未知后，两种导出都提交字符串 2', () => {
    const legacy = buildLegacy({ templateType: 'amrt', versionId })
    const { snapshot, ctx } = cirsGpmLegacyAdapter.toInternal(legacy)
    snapshot.data.smelterList.push({
      id: 'smelter-new',
      metal: 'zinc',
      smelterLookup: 'New Smelter',
      smelterName: 'New Smelter',
      smelterCountry: 'CN',
      recycledScrap: 'Unknown',
    })

    expect(cirsGpmLegacyAdapter.toExternal(snapshot, ctx).cmtSmelters?.[1]?.isRecycle).toBe('2')
    expect(cirsGpmLegacyAdapter.toExternalLoose(snapshot).cmtSmelters?.[1]?.isRecycle).toBe('2')
  })

  test.each([
    { internal: 'Yes', external: '1' },
    { internal: 'No', external: '0' },
  ])('$internal 仍按 $external 提交', ({ internal, external }) => {
    const legacy = buildLegacy({ templateType: 'amrt', versionId, isRecycle: '2' })
    const { snapshot, ctx } = cirsGpmLegacyAdapter.toInternal(legacy)
    snapshot.data.smelterList[0]!.recycledScrap = internal

    expect(cirsGpmLegacyAdapter.toExternal(snapshot, ctx).cmtSmelters?.[0]?.isRecycle).toBe(external)
    expect(cirsGpmLegacyAdapter.toExternalLoose(snapshot).cmtSmelters?.[0]?.isRecycle).toBe(external)
  })

  test.each([undefined, null, ''] as const)('未填写时保留原字段状态：%s', (isRecycle) => {
    const legacy = buildLegacy({ templateType: 'amrt', versionId, isRecycle })
    const { snapshot, ctx } = cirsGpmLegacyAdapter.toInternal(legacy)

    expect(snapshot.data.smelterList[0]?.recycledScrap).toBeUndefined()
    expect(cirsGpmLegacyAdapter.toExternal(snapshot, ctx)).toEqual(legacy)
  })
})

describe.each(OTHER_VERSIONS)('$templateType $versionId 原有未知编码', (version) => {
  test('改选未知和新增未知行仍提交 Unknown', () => {
    const legacy = buildLegacy({ ...version, isRecycle: '1' })
    const { snapshot, ctx } = cirsGpmLegacyAdapter.toInternal(legacy)
    const row = snapshot.data.smelterList[0]!
    row.recycledScrap = 'Unknown'
    snapshot.data.smelterList.push({ ...row, id: 'smelter-new' })

    const output = cirsGpmLegacyAdapter.toExternal(snapshot, ctx)
    const loose = cirsGpmLegacyAdapter.toExternalLoose(snapshot)

    expect(output.cmtSmelters?.map((item) => item.isRecycle)).toEqual(['Unknown', 'Unknown'])
    expect(loose.cmtSmelters?.map((item) => item.isRecycle)).toEqual(['Unknown', 'Unknown'])
  })
})
