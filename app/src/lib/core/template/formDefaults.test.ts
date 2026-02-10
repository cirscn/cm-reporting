/**
 * @file core/template/formDefaults.test.ts
 * @description createEmptyFormData 默认矿产选择回归测试。
 */

import { getVersionDef } from '@core/registry'
import { describe, expect, test } from 'vitest'

import { createEmptyFormData } from './formDefaults'

describe('createEmptyFormData', () => {
  test('EMRT dynamic-dropdown 默认选中全部申报范围', () => {
    const versionDef = getVersionDef('emrt', '2.1')
    const data = createEmptyFormData(versionDef)

    const expected = versionDef.mineralScope.minerals.map((mineral) => mineral.key)
    expect(data.selectedMinerals).toEqual(expected)
  })

  test('AMRT dynamic-dropdown 仍保持默认不预选', () => {
    const versionDef = getVersionDef('amrt', '1.3')
    const data = createEmptyFormData(versionDef)

    expect(data.selectedMinerals).toEqual([])
  })
})

