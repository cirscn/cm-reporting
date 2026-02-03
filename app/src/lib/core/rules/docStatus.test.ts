/**
 * @file core/rules/docStatus.test.ts
 * @description 测试用例。
 */


// 说明：测试用例
import { getVersionDef } from '@core/registry'
import { getDocStatusData } from '@core/rules/docStatus'
import { describe, expect, it } from 'vitest'

const versionDef = getVersionDef('cmrt', '6.5')
const mineralKeys = versionDef.mineralScope.minerals.map((mineral) => mineral.key)

const perMineral = (value: string) =>
  Object.fromEntries(mineralKeys.map((key) => [key, value]))
const perMineralFor = (def: typeof versionDef, value: string) =>
  Object.fromEntries(def.mineralScope.minerals.map((mineral) => [mineral.key, value]))

describe('getDocStatusData', () => {
  it('marks product list required when scope is B', () => {
    const status = getDocStatusData(versionDef, {
      scopeType: 'B',
      questionAnswers: { Q1: perMineral('No'), Q2: perMineral('No') },
    })

    expect(status.productList.type).toBe('productListRequired')
  })

  it('marks product list unknown when scope is unset', () => {
    const status = getDocStatusData(versionDef, {
      questionAnswers: { Q1: perMineral('No'), Q2: perMineral('No') },
    })

    expect(status.productList.type).toBe('productListUnknown')
  })

  it('marks smelter list pending when Q1/Q2 missing', () => {
    const status = getDocStatusData(versionDef, {
      scopeType: 'A',
      questionAnswers: { Q1: perMineral(''), Q2: perMineral('') },
    })

    expect(status.smelterList.type).toBe('smelterListPending')
    expect(status.smelterList.metals).toHaveLength(mineralKeys.length)
    expect(status.smelterList.questions).toBe('Q1/Q2')
  })

  it('ignores non-active minerals when determining smelter list required', () => {
    const emrtDef = getVersionDef('emrt', '2.1')
    const status = getDocStatusData(emrtDef, {
      scopeType: 'A',
      questionAnswers: { Q1: { cobalt: 'Yes' }, Q2: { cobalt: 'Yes' } },
      selectedMinerals: ['cobalt'],
    })

    expect(status.smelterList.type).toBe('smelterListRequired')
    expect(status.smelterList.metals).toEqual(['cobalt'])
  })

  it('marks smelter list required when gating passes', () => {
    const status = getDocStatusData(versionDef, {
      scopeType: 'A',
      questionAnswers: { Q1: perMineral('Yes'), Q2: perMineral('Yes') },
    })

    expect(status.smelterList.type).toBe('smelterListRequired')
    expect(status.smelterList.metals).toHaveLength(mineralKeys.length)
  })

  it('marks smelter list not required when gating fails', () => {
    const status = getDocStatusData(versionDef, {
      scopeType: 'A',
      questionAnswers: { Q1: perMineral('No'), Q2: perMineral('No') },
    })

    expect(status.smelterList.type).toBe('smelterListNotRequired')
  })

  it('supports free-text mineral scope (AMRT 1.1)', () => {
    const amrtDef = getVersionDef('amrt', '1.1')
    const status = getDocStatusData(amrtDef, {
      scopeType: 'A',
      questionAnswers: { Q1: perMineralFor(amrtDef, 'Yes') },
      customMinerals: ['Aluminum'],
    })

    expect(status.smelterList.type).toBe('smelterListRequired')
    expect(status.smelterList.metals).toEqual(['aluminum'])
  })

  it('supports dynamic-dropdown mineral scope (AMRT 1.3)', () => {
    const amrtDef = getVersionDef('amrt', '1.3')
    const status = getDocStatusData(amrtDef, {
      scopeType: 'A',
      questionAnswers: { Q1: perMineralFor(amrtDef, 'Yes') },
      selectedMinerals: ['aluminum'],
    })

    expect(status.smelterList.type).toBe('smelterListRequired')
    expect(status.smelterList.metals).toEqual(['aluminum'])
  })

  it('respects q1-not-negatives gating (CRT 2.21)', () => {
    const crtDef = getVersionDef('crt', '2.21')
    const status = getDocStatusData(crtDef, {
      scopeType: 'A',
      questionAnswers: {
        Q1: perMineralFor(crtDef, 'Unknown'),
        Q2: perMineralFor(crtDef, 'Yes'),
      },
    })

    expect(status.smelterList.type).toBe('smelterListNotRequired')
  })

  it('respects fixed mineral scope (EMRT 1.1)', () => {
    const emrtDef = getVersionDef('emrt', '1.1')
    const status = getDocStatusData(emrtDef, {
      scopeType: 'A',
      questionAnswers: {
        Q1: perMineralFor(emrtDef, 'Not applicable for this declaration'),
        Q2: perMineralFor(emrtDef, 'Unknown'),
      },
    })

    expect(status.smelterList.type).toBe('smelterListNotRequired')
  })

  it('marks mine list not available for CMRT 6.5', () => {
    const status = getDocStatusData(versionDef, {
      scopeType: 'A',
      questionAnswers: { Q1: perMineral('No'), Q2: perMineral('No') },
    })

    expect(status.mineList.type).toBe('mineListNotAvailable')
  })
})
