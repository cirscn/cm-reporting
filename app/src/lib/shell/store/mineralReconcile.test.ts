import { getVersionDef } from '@core/registry'
import { describe, expect, it } from 'vitest'

import { buildMineralReconcileNotice } from './mineralReconcile'

describe('buildMineralReconcileNotice', () => {
  it('creates notice for EMRT 2.1 when minerals are removed', () => {
    const versionDef = getVersionDef('emrt', '2.1')

    const notice = buildMineralReconcileNotice(
      versionDef,
      ['cobalt', 'copper'],
      ['copper'],
      null
    )

    expect(notice).not.toBeNull()
    expect(notice?.templateType).toBe('emrt')
    expect(notice?.versionId).toBe('2.1')
    expect(notice?.removedMinerals).toEqual(['cobalt'])
  })

  it('merges removed minerals into existing notice', () => {
    const versionDef = getVersionDef('emrt', '2.1')
    const existing = {
      templateType: 'emrt' as const,
      versionId: '2.1' as const,
      removedMinerals: ['cobalt'],
    }

    const notice = buildMineralReconcileNotice(
      versionDef,
      ['cobalt', 'copper'],
      ['cobalt'],
      existing
    )

    expect(notice?.removedMinerals).toEqual(['cobalt', 'copper'])
  })

  it('keeps notice unchanged for non-EMRT template', () => {
    const versionDef = getVersionDef('cmrt', '6.5')
    const existing = {
      templateType: 'emrt' as const,
      versionId: '2.1' as const,
      removedMinerals: ['cobalt'],
    }

    const notice = buildMineralReconcileNotice(
      versionDef,
      ['tantalum', 'tin'],
      ['tin'],
      existing
    )

    expect(notice).toBe(existing)
  })
})
