import { getVersionDef } from '@core/registry'
import { calculateRequiredFields } from '@core/rules/required'
import { describe, expect, test } from 'vitest'

function allMinerals(versionDef: ReturnType<typeof getVersionDef>, value: string) {
  return Object.fromEntries(versionDef.mineralScope.minerals.map((mineral) => [mineral.key, value]))
}

function hasRequiredCompanyQuestion(
  versionDef: ReturnType<typeof getVersionDef>,
  required: ReturnType<typeof calculateRequiredFields>,
) {
  return versionDef.companyQuestions.some(
    (question) => required.companyQuestions.get(question.key) === true,
  )
}

describe('company question required rules', () => {
  test('does not require CMRT company questions before Q1 and Q2 are answered', () => {
    const versionDef = getVersionDef('cmrt', '6.6')
    const required = calculateRequiredFields(versionDef, {
      scopeType: 'A',
      questionAnswers: { Q1: allMinerals(versionDef, ''), Q2: allMinerals(versionDef, '') },
    })

    expect(hasRequiredCompanyQuestion(versionDef, required)).toBe(false)
  })

  test('does not require CMRT company questions when all Q1 and Q2 answers are No', () => {
    const versionDef = getVersionDef('cmrt', '6.6')
    const required = calculateRequiredFields(versionDef, {
      scopeType: 'A',
      questionAnswers: { Q1: allMinerals(versionDef, 'No'), Q2: allMinerals(versionDef, 'No') },
    })

    expect(hasRequiredCompanyQuestion(versionDef, required)).toBe(false)
  })

  test('requires CMRT company questions when any mineral has Q1 and Q2 requiring disclosure', () => {
    const versionDef = getVersionDef('cmrt', '6.6')
    const required = calculateRequiredFields(versionDef, {
      scopeType: 'A',
      questionAnswers: { Q1: allMinerals(versionDef, 'Yes'), Q2: allMinerals(versionDef, 'Yes') },
    })

    expect(hasRequiredCompanyQuestion(versionDef, required)).toBe(true)
  })

  test('does not require EMRT company questions before selected minerals are answered', () => {
    const versionDef = getVersionDef('emrt', '2.11')
    const required = calculateRequiredFields(versionDef, {
      scopeType: 'A',
      selectedMinerals: ['cobalt'],
      questionAnswers: { Q1: { cobalt: '' }, Q2: { cobalt: '' } },
    })

    expect(hasRequiredCompanyQuestion(versionDef, required)).toBe(false)
  })

  test('does not require EMRT company questions when all selected minerals are negative or unknown', () => {
    const versionDef = getVersionDef('emrt', '2.11')
    const required = calculateRequiredFields(versionDef, {
      scopeType: 'A',
      selectedMinerals: ['cobalt', 'mica'],
      questionAnswers: {
        Q1: { cobalt: 'Unknown', mica: 'Not declaring' },
        Q2: { cobalt: 'Unknown', mica: 'No' },
      },
    })

    expect(hasRequiredCompanyQuestion(versionDef, required)).toBe(false)
  })

  test('requires EMRT company questions when any selected mineral requires disclosure', () => {
    const versionDef = getVersionDef('emrt', '2.11')
    const required = calculateRequiredFields(versionDef, {
      scopeType: 'A',
      selectedMinerals: ['cobalt'],
      questionAnswers: { Q1: { cobalt: 'Yes' }, Q2: { cobalt: 'Yes' } },
    })

    expect(hasRequiredCompanyQuestion(versionDef, required)).toBe(true)
  })
})
