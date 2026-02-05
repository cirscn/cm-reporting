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

  test('roundtrip (AMRT other minerals) keeps legacy JSON exactly', () => {
    const legacy = loadFixture('amrt_other.json')
    const { snapshot, ctx } = cirsGpmLegacyAdapter.toInternal(legacy)
    const out = cirsGpmLegacyAdapter.toExternal(snapshot, ctx)
    expect(out).toEqual(legacy)
  })

  test('renaming other mineral label is written back to legacy (AMRT)', () => {
    const legacy = loadFixture('amrt_other.json')
    const { snapshot, ctx } = cirsGpmLegacyAdapter.toInternal(legacy)

    snapshot.data.customMinerals[0] = 'Renamed Metal'

    const out = cirsGpmLegacyAdapter.toExternal(snapshot, ctx)
    const range = asArray(asRecord(out).cmtRangeQuestions).map(asRecord)
    expect(range.some((x) => x.type === 1 && x.question === 'Renamed Metal')).toBe(true)

    const smelters = asArray(asRecord(out).cmtSmelters).map(asRecord)
    expect(smelters.some((x) => x.id === 'AMRT-S-OTHER' && x.metal === 'Renamed Metal')).toBe(true)

    const reasons = asArray(asRecord(out).amrtReasonList).map(asRecord)
    expect(reasons.some((x) => x.id === 'R-CUSTOM' && x.metal === 'Renamed Metal')).toBe(true)
  })

  test('clearing other mineral label prunes legacy perMineral rows (AMRT)', () => {
    const legacy = loadFixture('amrt_other.json')
    const { snapshot, ctx } = cirsGpmLegacyAdapter.toInternal(legacy)

    snapshot.data.customMinerals[0] = ''

    const out = cirsGpmLegacyAdapter.toExternal(snapshot, ctx)
    const range = asArray(asRecord(out).cmtRangeQuestions).map(asRecord)
    expect(range.some((x) => x.question === 'My Custom Metal')).toBe(false)
  })

	  test('reads legacy product list aliases (CMRT: partNumber/partName/remark)', () => {
	    const legacy = loadFixture('cmrt_parts_alt.json')
	    const { snapshot, ctx } = cirsGpmLegacyAdapter.toInternal(legacy)

	    expect(snapshot.data.productList[0]?.productNumber).toBe('物料号1')
	    expect(snapshot.data.productList[0]?.productName).toBe('物料名称1')
	    expect(snapshot.data.productList[0]?.requesterNumber).toBeUndefined()
	    expect(snapshot.data.productList[0]?.requesterName).toBeUndefined()
	    expect(snapshot.data.productList[0]?.comments).toBe('备注1')

	    const out = cirsGpmLegacyAdapter.toExternal(snapshot, ctx)
	    expect(out).toEqual(legacy)
	  })

  test('writes back to legacy product list alias keys on edit (CMRT)', () => {
    const legacy = loadFixture('cmrt_parts_alt.json')
    const { snapshot, ctx } = cirsGpmLegacyAdapter.toInternal(legacy)

    snapshot.data.productList[0]!.productName = '新名称'
    snapshot.data.productList[0]!.comments = '新备注'

    const out = cirsGpmLegacyAdapter.toExternal(snapshot, ctx)
    const parts = asArray(asRecord(out).cmtParts).map(asRecord)
    expect(parts[0]?.partName).toBe('新名称')
    expect(parts[0]?.remark).toBe('新备注')
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
