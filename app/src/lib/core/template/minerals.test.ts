import { getVersionDef } from '@core/registry'
import { describe, expect, test } from 'vitest'

import { getDisplayMinerals } from './minerals'

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
})
