import { getVersionDef } from '@core/registry'
import { describe, expect, test } from 'vitest'

import { getSmelterHeaderProfile, type SmelterColumnId } from './smelterHeaderProfiles'

function getColumns(templateType: 'cmrt' | 'emrt' | 'crt' | 'amrt', versionId: string) {
  const versionDef = getVersionDef(templateType, versionId)
  return getSmelterHeaderProfile({
    templateType,
    versionId,
    locale: 'en-US',
    t: (key) => key,
    config: versionDef.smelterList,
  })
}

function expectStartsWith(columns: SmelterColumnId[], expected: SmelterColumnId[]) {
  expect(columns.slice(0, expected.length)).toEqual(expected)
}

describe('SmelterListTable header alignment', () => {
  test('keeps CMRT 6.5 lookup-capable columns in template order', () => {
    const profile = getColumns('cmrt', '6.5')

    expectStartsWith(profile.columns, [
      'smelterNumberInput',
      'metal',
      'smelterLookup',
      'smelterName',
      'smelterCountry',
    ])
    expect(profile.required).toMatchObject({
      metal: true,
      smelterLookup: true,
      smelterCountry: true,
    })
  })

  test('keeps EMRT 2.1 lookup and name columns separately', () => {
    const profile = getColumns('emrt', '2.1')

    expectStartsWith(profile.columns, [
      'smelterNumberInput',
      'metal',
      'smelterLookup',
      'smelterName',
      'smelterCountry',
    ])
    expect(profile.required).toMatchObject({
      metal: true,
      smelterLookup: true,
      smelterName: true,
      smelterCountry: true,
    })
  })

  test('keeps AMRT 1.1 without identification input or lookup columns', () => {
    const profile = getColumns('amrt', '1.1')

    expectStartsWith(profile.columns, [
      'metal',
      'smelterName',
      'smelterCountry',
      'smelterIdentification',
      'sourceId',
    ])
    expect(profile.columns).not.toContain('smelterNumberInput')
    expect(profile.columns).not.toContain('smelterLookup')
    expect(profile.required).toMatchObject({
      metal: true,
      smelterName: true,
      smelterCountry: true,
    })
  })

  test('keeps AMRT 1.3 lookup-capable columns in template order', () => {
    const profile = getColumns('amrt', '1.3')

    expectStartsWith(profile.columns, [
      'smelterNumberInput',
      'metal',
      'smelterLookup',
      'smelterName',
      'smelterCountry',
    ])
    expect(profile.required).toMatchObject({
      metal: true,
      smelterLookup: true,
      smelterName: true,
      smelterCountry: true,
    })
  })

  test('keeps AMRT 1.31 lookup-capable columns in template order', () => {
    const profile = getColumns('amrt', '1.31')

    expectStartsWith(profile.columns, [
      'smelterNumberInput',
      'metal',
      'smelterLookup',
      'smelterName',
      'smelterCountry',
    ])
    expect(profile.required).toMatchObject({
      metal: true,
      smelterLookup: true,
      smelterName: true,
      smelterCountry: true,
    })
  })
})
