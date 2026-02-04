import fs from 'node:fs'

import { describe, expect, test } from 'vitest'

import { cirsGpmLegacyAdapter } from '.'

function loadFixture(name: string) {
  const url = new URL(`./__fixtures__/${name}`, import.meta.url)
  const text = fs.readFileSync(url, 'utf8')
  return JSON.parse(text) as unknown
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object') return {}
  return value as Record<string, unknown>
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

describe('cirsGpmLegacyAdapter', () => {
  test('roundtrip (CMRT) keeps legacy JSON exactly', () => {
    const legacy = loadFixture('cmrt.json')
    const { snapshot, ctx } = cirsGpmLegacyAdapter.toInternal(legacy)
    const out = cirsGpmLegacyAdapter.toExternal(snapshot, ctx)
    expect(out).toEqual(legacy)
  })

  test('roundtrip (EMRT) keeps legacy JSON exactly', () => {
    const legacy = loadFixture('emrt.json')
    const { snapshot, ctx } = cirsGpmLegacyAdapter.toInternal(legacy)
    const out = cirsGpmLegacyAdapter.toExternal(snapshot, ctx)
    expect(out).toEqual(legacy)
  })

  test('roundtrip (CRT) keeps legacy JSON exactly', () => {
    const legacy = loadFixture('crt.json')
    const { snapshot, ctx } = cirsGpmLegacyAdapter.toInternal(legacy)
    const out = cirsGpmLegacyAdapter.toExternal(snapshot, ctx)
    expect(out).toEqual(legacy)
  })

  test('roundtrip (AMRT) keeps legacy JSON exactly', () => {
    const legacy = loadFixture('amrt.json')
    const { snapshot, ctx } = cirsGpmLegacyAdapter.toInternal(legacy)
    const out = cirsGpmLegacyAdapter.toExternal(snapshot, ctx)
    expect(out).toEqual(legacy)
  })

  test('patches company name + range question answer (CMRT)', () => {
    const legacy = loadFixture('cmrt.json')
    const { snapshot, ctx } = cirsGpmLegacyAdapter.toInternal(legacy)

    snapshot.data.companyInfo.companyName = 'NewCo'
    ;(snapshot.data.questions.Q1 as Record<string, string>).tin = 'No'
    ;(snapshot.data.questionComments.Q1 as Record<string, string>).tin = 'Changed'

    const out = cirsGpmLegacyAdapter.toExternal(snapshot, ctx)
    expect(asRecord(asRecord(out).cmtCompany).companyName).toBe('NewCo')
    const range = asArray(asRecord(out).cmtRangeQuestions).map(asRecord)
    const tinQ1 = range.find((x) => x.type === 1 && x.question === 'Tin')
    expect(asRecord(tinQ1).answer).toBe('No')
    expect(asRecord(tinQ1).remark).toBe('Changed')
    expect(asRecord(out).extraTopLevel).toEqual(asRecord(legacy).extraTopLevel)
  })

  test('patches EMRT perMineral company question C', () => {
    const legacy = loadFixture('emrt.json')
    const { snapshot, ctx } = cirsGpmLegacyAdapter.toInternal(legacy)

    ;(snapshot.data.companyQuestions.C as Record<string, string>).cobalt = 'No'
    ;(snapshot.data.companyQuestions.C_comment as Record<string, string>).cobalt = 'cmt'

    const out = cirsGpmLegacyAdapter.toExternal(snapshot, ctx)
    const companyQuestions = asArray(asRecord(out).cmtCompanyQuestions).map(asRecord)
    const cobaltC = companyQuestions.find((x) => x.question === 'C' && x.type === 'Cobalt')
    expect(asRecord(cobaltC).answer).toBe('No')
    expect(asRecord(cobaltC).remark).toBe('cmt')
  })

  test('adding a new smelter row appends legacy cmtSmelters', () => {
    const legacy = loadFixture('crt.json')
    const { snapshot, ctx } = cirsGpmLegacyAdapter.toInternal(legacy)

    snapshot.data.smelterList.push({
      id: 'S-NEW',
      metal: 'Cobalt',
      smelterLookup: 'L',
      smelterName: 'N',
      smelterCountry: 'CN',
      comments: '',
    })

    const out = cirsGpmLegacyAdapter.toExternal(snapshot, ctx)
    const smelters = asArray(asRecord(out).cmtSmelters).map(asRecord)
    expect(smelters.length).toBe(2)
    expect(smelters[1]?.id).toBe('S-NEW')
    expect(smelters[1]?.smelterName).toBe('N')
  })
})
