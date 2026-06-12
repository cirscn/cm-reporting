/**
 * @file core/rules/summary.test.ts
 * @description 测试用例。
 */

// 说明：测试用例
import { getVersionDef } from '@core/registry'
import { runChecker, type FormDataForChecker } from '@core/rules/checker'
import type { FormStateForRequired } from '@core/rules/required'
import { buildCheckerSummary } from '@core/rules/summary'
import { ERROR_KEYS } from '@core/validation/errorKeys'
import { describe, expect, it } from 'vitest'

function buildCompanyInfo(
  versionDef: ReturnType<typeof getVersionDef>,
  overrides: Record<string, string> = {}
) {
  const info: Record<string, string> = {}
  for (const field of versionDef.companyInfoFields) {
    if (field.required === true) {
      if (field.type === 'email') {
        info[field.key] = `${field.key}@example.com`
      } else if (field.type === 'date') {
        info[field.key] = '2024-01-01'
      } else {
        info[field.key] = 'filled'
      }
    }
  }
  return { ...info, ...overrides }
}

function buildFormData(overrides: Partial<FormDataForChecker>): FormDataForChecker {
  return {
    companyInfo: {},
    questions: {},
    companyQuestions: {},
    mineralsScope: [],
    smelterList: [],
    productList: [],
    ...overrides,
  }
}

const t = (key: string) => key

describe('buildCheckerSummary', () => {
  it('does not count smelter lookup progress when smelter gating is disabled', () => {
    const emrt = getVersionDef('emrt', '2.1')
    const mineralKey = 'cobalt'
    const formState: FormStateForRequired = {
      scopeType: 'A',
      selectedMinerals: [mineralKey],
      questionAnswers: {
        Q1: { [mineralKey]: 'Not declaring' },
        Q2: { [mineralKey]: '' },
      },
    }
    const formData = buildFormData({
      companyInfo: buildCompanyInfo(emrt),
      questions: {
        Q1: { [mineralKey]: 'Not declaring' },
        Q2: { [mineralKey]: '' },
      },
      smelterList: [{ metal: mineralKey, smelterLookup: '' }],
    })

    const errors = runChecker(emrt, formState, formData)
    expect(
      errors.some(
        (error) =>
          error.fieldPath === 'smelterList.0.smelterLookup' &&
          error.messageKey === ERROR_KEYS.checker.requiredField
      )
    ).toBe(false)

    const { summary } = buildCheckerSummary(emrt, formState, formData, t)
    expect(summary.sections.smelterList.total).toBe(0)
    expect(summary.sections.smelterList.completed).toBe(0)
  })

  it('counts smelter lookup progress when smelter gating is enabled', () => {
    const emrt = getVersionDef('emrt', '2.1')
    const mineralKey = 'cobalt'
    const formState: FormStateForRequired = {
      scopeType: 'A',
      selectedMinerals: [mineralKey],
      questionAnswers: {
        Q1: { [mineralKey]: 'Yes' },
        Q2: { [mineralKey]: 'Yes' },
      },
    }
    const formData = buildFormData({
      companyInfo: buildCompanyInfo(emrt),
      questions: {
        Q1: { [mineralKey]: 'Yes' },
        Q2: { [mineralKey]: 'Yes' },
      },
      smelterList: [{ metal: mineralKey, smelterLookup: '' }],
    })

    const errors = runChecker(emrt, formState, formData)
    expect(
      errors.some(
        (error) =>
          error.fieldPath === 'smelterList.0.smelterLookup' &&
          error.messageKey === ERROR_KEYS.checker.requiredField
      )
    ).toBe(true)

    const { summary } = buildCheckerSummary(emrt, formState, formData, t)
    expect(summary.sections.smelterList.total).toBe(2)
    expect(summary.sections.smelterList.completed).toBe(1)
  })

  it('does not count requester number as required progress when requester columns are enabled', () => {
    const emrt = getVersionDef('emrt', '2.1')
    const formState: FormStateForRequired = {
      scopeType: 'B',
      selectedMinerals: ['cobalt'],
      questionAnswers: {
        Q1: { cobalt: 'No' },
        Q2: { cobalt: 'No' },
      },
    }
    const formData = buildFormData({
      companyInfo: buildCompanyInfo(emrt),
      questions: {
        Q1: { cobalt: 'No' },
        Q2: { cobalt: 'No' },
      },
      productList: [
        {
          id: 'row-1',
          productNumber: 'RESP-001',
          productName: 'Product A',
          requesterNumber: '',
          requesterName: 'Requester Product A',
        },
      ],
    })

    const { summary } = buildCheckerSummary(emrt, formState, formData, t)
    expect(summary.sections.productList.total).toBe(2)
    expect(summary.sections.productList.completed).toBe(2)
  })

  it('counts mine row smelter, mine name and country after a metal is selected', () => {
    const emrt = getVersionDef('emrt', '2.1')
    const mineralKey = 'cobalt'
    const formState: FormStateForRequired = {
      scopeType: 'A',
      selectedMinerals: [mineralKey],
      questionAnswers: {
        Q1: { [mineralKey]: 'Yes' },
        Q2: { [mineralKey]: 'Yes' },
      },
    }
    const formData = buildFormData({
      companyInfo: buildCompanyInfo(emrt),
      questions: {
        Q1: { [mineralKey]: 'Yes' },
        Q2: { [mineralKey]: 'Yes' },
      },
      mineList: [
        {
          id: 'mine-row-1',
          metal: mineralKey,
          smelterName: '',
          mineName: '',
          mineCountry: '',
        },
      ],
    })

    const errors = runChecker(emrt, formState, formData)
    expect(errors.map((error) => error.fieldPath)).toEqual(expect.arrayContaining([
      'mineList.0.smelterName',
      'mineList.0.mineName',
      'mineList.0.mineCountry',
    ]))

    const { summary } = buildCheckerSummary(emrt, formState, formData, t)
    expect(summary.sections.mineList.total).toBe(3)
    expect(summary.sections.mineList.completed).toBe(0)
  })
})
