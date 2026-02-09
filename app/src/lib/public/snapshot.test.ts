import { describe, expect, test } from 'vitest'

import { parseSnapshot } from './snapshot'

function baseSnapshotWithAuthDate(authorizationDate: string | number) {
  return {
    schemaVersion: 1,
    templateType: 'cmrt' as const,
    versionId: '6.5',
    locale: 'zh-CN' as const,
    data: {
      companyInfo: {
        companyName: 'Acme',
        authorizationDate,
      },
      selectedMinerals: [],
      customMinerals: [],
      questions: {},
      questionComments: {},
      companyQuestions: {},
      mineralsScope: [],
      smelterList: [],
      mineList: [],
      productList: [],
    },
  }
}

describe('parseSnapshot authorizationDate normalization', () => {
  test('keeps YYYY-MM-DD unchanged', () => {
    const parsed = parseSnapshot(baseSnapshotWithAuthDate('2026-02-09'))
    expect(parsed.data.companyInfo.authorizationDate).toBe('2026-02-09')
  })

  test('accepts millisecond timestamp number', () => {
    const parsed = parseSnapshot(baseSnapshotWithAuthDate(1770595200000))
    expect(parsed.data.companyInfo.authorizationDate).toBe('2026-02-09')
  })

  test('accepts second timestamp number', () => {
    const parsed = parseSnapshot(baseSnapshotWithAuthDate(1770595200))
    expect(parsed.data.companyInfo.authorizationDate).toBe('2026-02-09')
  })

  test('accepts older second/millisecond timestamps', () => {
    const parsedFromMs = parseSnapshot(baseSnapshotWithAuthDate(946684800000))
    expect(parsedFromMs.data.companyInfo.authorizationDate).toBe('2000-01-01')

    const parsedFromSec = parseSnapshot(baseSnapshotWithAuthDate(946684800))
    expect(parsedFromSec.data.companyInfo.authorizationDate).toBe('2000-01-01')
  })

  test('keeps invalid string for later schema validation', () => {
    const parsed = parseSnapshot(baseSnapshotWithAuthDate('2026/02/09'))
    expect(parsed.data.companyInfo.authorizationDate).toBe('2026/02/09')
  })

  test('rejects non-authorizationDate companyInfo number fields', () => {
    expect(() =>
      parseSnapshot({
        ...baseSnapshotWithAuthDate('2026-02-09'),
        data: {
          ...baseSnapshotWithAuthDate('2026-02-09').data,
          companyInfo: {
            companyName: 123,
            authorizationDate: '2026-02-09',
          },
        },
      })
    ).toThrowError(/公司信息字段必须为字符串/)
  })
})
