import { getVersionDef } from '@core/registry'
import { describe, expect, test } from 'vitest'

import { getDisplayMinerals, getMetalsForSource } from './minerals'

describe('template minerals', () => {
  test('getDisplayMinerals keeps template mineral order (EMRT 2.1)', () => {
    const versionDef = getVersionDef('emrt', '2.1')
    const selectedMinerals = ['lithium', 'cobalt', 'nickel', 'graphite', 'copper', 'mica']

    const minerals = getDisplayMinerals(versionDef, selectedMinerals, [])
    const selectedSet = new Set(selectedMinerals)
    const expected = versionDef.mineralScope.minerals
      .map((m) => m.key)
      .filter((key) => selectedSet.has(key))
    expect(minerals.map((m) => m.key)).toEqual(expected)
  })

  test('AMRT 1.31 includes minerals added by the template in declaration order', () => {
    const versionDef = getVersionDef('amrt', '1.31')

    expect(versionDef.mineralScope.minerals.map((mineral) => mineral.key)).toEqual([
      'aluminum',
      'cadmium',
      'iridium',
      'lead',
      'lime',
      'manganese',
      'molybdenum',
      'palladium',
      'platinum',
      'rareEarthElements',
      'rhenium',
      'rhodium',
      'ruthenium',
      'selenium',
      'silver',
      'sodaAsh',
      'tellurium',
      'zinc',
      'other',
    ])
  })

  test('CMRT smelter metal dropdown only includes minerals with Q1 and Q2 both Yes', () => {
    const versionDef = getVersionDef('cmrt', '6.6')

    const minerals = getMetalsForSource(
      versionDef.smelterList.metalDropdownSource,
      versionDef,
      {
        Q1: {
          tantalum: 'Yes',
          tin: 'Yes',
          gold: 'No',
          tungsten: '',
        },
        Q2: {
          tantalum: 'Yes',
          tin: 'No',
          gold: 'Yes',
          tungsten: 'Yes',
        },
      },
    )

    expect(minerals.map((mineral) => mineral.key)).toEqual(['tantalum'])
  })
})
