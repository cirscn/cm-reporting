/**
 * @file core/rules/checker.test.ts
 * @description 测试用例。
 */

// 说明：测试用例
import { getVersionDef } from '@core/registry'
import { runChecker, type FormDataForChecker } from '@core/rules/checker'
import type { FormStateForRequired } from '@core/rules/required'
import { ERROR_KEYS } from '@core/validation/errorKeys'
import { describe, expect, it } from 'vitest'

function buildMineralAnswerMap(versionDef: ReturnType<typeof getVersionDef>, value: string) {
  return Object.fromEntries(versionDef.mineralScope.minerals.map((mineral) => [mineral.key, value]))
}

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

function buildQuestionValues(
  versionDef: ReturnType<typeof getVersionDef>,
  value: string
): Record<string, Record<string, string> | string> {
  const result: Record<string, Record<string, string> | string> = {}
  for (const question of versionDef.questions) {
    if (question.perMineral) {
      result[question.key] = buildMineralAnswerMap(versionDef, value)
    } else {
      result[question.key] = value
    }
  }
  return result
}

describe('runChecker', () => {
  const cmrt = getVersionDef('cmrt', '6.5')

  it('flags missing required company fields', () => {
    const formState: FormStateForRequired = {
      scopeType: 'A',
      questionAnswers: {
        Q1: buildMineralAnswerMap(cmrt, 'No'),
        Q2: buildMineralAnswerMap(cmrt, 'No'),
      },
    }
    const formData = buildFormData({
      companyInfo: {},
      questions: {
        Q1: buildMineralAnswerMap(cmrt, 'No'),
        Q2: buildMineralAnswerMap(cmrt, 'No'),
      },
    })

    const errors = runChecker(cmrt, formState, formData)

    expect(
      errors.some(
        (error) =>
          error.fieldPath === 'companyInfo.companyName' &&
          error.messageKey === ERROR_KEYS.checker.requiredField
      )
    ).toBe(true)
  })

  it('requires product list when scope is B', () => {
    const formState: FormStateForRequired = {
      scopeType: 'B',
      questionAnswers: {
        Q1: buildMineralAnswerMap(cmrt, 'No'),
        Q2: buildMineralAnswerMap(cmrt, 'No'),
      },
    }
    const formData = buildFormData({
      questions: {
        Q1: buildMineralAnswerMap(cmrt, 'No'),
        Q2: buildMineralAnswerMap(cmrt, 'No'),
      },
      productList: [],
    })

    const errors = runChecker(cmrt, formState, formData)

    expect(
      errors.some(
        (error) =>
          error.fieldPath === 'productList' &&
          error.messageKey === ERROR_KEYS.checker.requiredProductList
      )
    ).toBe(true)
  })

  it('flags missing product number when product list has rows', () => {
    const formState: FormStateForRequired = {
      scopeType: 'B',
      questionAnswers: {
        Q1: buildMineralAnswerMap(cmrt, 'No'),
        Q2: buildMineralAnswerMap(cmrt, 'No'),
      },
    }
    const formData = buildFormData({
      companyInfo: buildCompanyInfo(cmrt),
      questions: buildQuestionValues(cmrt, 'No'),
      productList: [{ id: 'row-1', productNumber: '' }],
    })

    const errors = runChecker(cmrt, formState, formData)

    expect(
      errors.some(
        (error) =>
          error.fieldPath === 'productList.0.productNumber' &&
          error.messageKey === ERROR_KEYS.checker.requiredField
      )
    ).toBe(true)
  })

  it('flags missing smelter list entries for required minerals', () => {
    const formState: FormStateForRequired = {
      scopeType: 'A',
      questionAnswers: {
        Q1: buildMineralAnswerMap(cmrt, 'Yes'),
        Q2: buildMineralAnswerMap(cmrt, 'Yes'),
      },
    }
    const formData = buildFormData({
      companyInfo: buildCompanyInfo(cmrt),
      questions: buildQuestionValues(cmrt, 'Yes'),
      smelterList: [{ metal: 'gold' }],
    })

    const errors = runChecker(cmrt, formState, formData)

    expect(
      errors.some(
        (error) =>
          error.fieldPath === 'smelterList.tantalum' &&
          error.messageKey === ERROR_KEYS.checker.requiredSmelterList
      )
    ).toBe(true)
  })

  it('flags invalid email format', () => {
    const formState: FormStateForRequired = {
      scopeType: 'A',
      questionAnswers: {
        Q1: buildMineralAnswerMap(cmrt, 'No'),
        Q2: buildMineralAnswerMap(cmrt, 'No'),
      },
    }
    const formData = buildFormData({
      companyInfo: buildCompanyInfo(cmrt, {
        contactEmail: 'invalid-email',
        authorizerEmail: 'authorizer@example.com',
      }),
      questions: {
        Q1: buildMineralAnswerMap(cmrt, 'No'),
        Q2: buildMineralAnswerMap(cmrt, 'No'),
      },
    })

    const errors = runChecker(cmrt, formState, formData)

    expect(
      errors.some(
        (error) =>
          error.fieldPath === 'companyInfo.contactEmail' &&
          error.messageKey === ERROR_KEYS.checker.invalidEmail
      )
    ).toBe(true)
  })

  it('accepts "not available" as email placeholder', () => {
    const formState: FormStateForRequired = {
      scopeType: 'A',
      questionAnswers: {
        Q1: buildMineralAnswerMap(cmrt, 'No'),
        Q2: buildMineralAnswerMap(cmrt, 'No'),
      },
    }
    const formData = buildFormData({
      companyInfo: buildCompanyInfo(cmrt, {
        contactEmail: 'not available',
        authorizerEmail: 'not available',
      }),
      questions: {
        Q1: buildMineralAnswerMap(cmrt, 'No'),
        Q2: buildMineralAnswerMap(cmrt, 'No'),
      },
    })

    const errors = runChecker(cmrt, formState, formData)

    expect(
      errors.some((error) => error.messageKey === ERROR_KEYS.checker.invalidEmail)
    ).toBe(false)
  })

  it('requires comment when company question requires one', () => {
    const formState: FormStateForRequired = {
      scopeType: 'A',
      questionAnswers: {
        Q1: buildMineralAnswerMap(cmrt, 'Yes'),
        Q2: buildMineralAnswerMap(cmrt, 'Yes'),
      },
    }
    const formData = buildFormData({
      companyInfo: buildCompanyInfo(cmrt, {
        contactEmail: 'contact@example.com',
        authorizerEmail: 'authorizer@example.com',
      }),
      questions: {
        Q1: buildMineralAnswerMap(cmrt, 'Yes'),
        Q2: buildMineralAnswerMap(cmrt, 'Yes'),
      },
      companyQuestions: {
        B: 'Yes',
      },
    })

    const errors = runChecker(cmrt, formState, formData)

    expect(
      errors.some(
        (error) =>
          error.fieldPath === 'companyQuestions.B_comment' &&
          error.messageKey === ERROR_KEYS.checker.requiredCompanyQuestionComment
      )
    ).toBe(true)
  })

  it('does not require EMRT Q2 when Q1 is a negative value', () => {
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
    })

    const errors = runChecker(emrt, formState, formData)

    expect(
      errors.some(
        (error) =>
          error.fieldPath === `questions.Q2.${mineralKey}` &&
          error.messageKey === ERROR_KEYS.checker.requiredField
      )
    ).toBe(false)
  })

  it('does not require CRT Q2 when Q1 is No', () => {
    const crt = getVersionDef('crt', '2.21')
    const formState: FormStateForRequired = {
      scopeType: 'A',
      questionAnswers: {
        Q1: 'No',
        Q2: '',
      },
    }
    const formData = buildFormData({
      companyInfo: buildCompanyInfo(crt),
      questions: {
        Q1: 'No',
        Q2: '',
      },
    })

    const errors = runChecker(crt, formState, formData)

    expect(
      errors.some(
        (error) =>
          error.fieldPath === 'questions.Q2' &&
          error.messageKey === ERROR_KEYS.checker.requiredField
      )
    ).toBe(false)
  })

  it('requires AMRT smelter list when Q1 is Yes for a selected mineral', () => {
    const amrt = getVersionDef('amrt', '1.3')
    const mineralKey = 'aluminum'
    const formState: FormStateForRequired = {
      scopeType: 'A',
      selectedMinerals: [mineralKey],
      questionAnswers: {
        Q1: { [mineralKey]: 'Yes' },
        Q2: { [mineralKey]: '' },
      },
    }
    const formData = buildFormData({
      companyInfo: buildCompanyInfo(amrt),
      questions: {
        Q1: { [mineralKey]: 'Yes' },
        Q2: { [mineralKey]: '' },
      },
      smelterList: [],
    })

    const errors = runChecker(amrt, formState, formData)

    expect(
      errors.some(
        (error) =>
          error.fieldPath === `smelterList.${mineralKey}` &&
          error.messageKey === ERROR_KEYS.checker.requiredSmelterList
      )
    ).toBe(true)

    expect(
      errors.some(
        (error) =>
          error.fieldPath === `questions.Q2.${mineralKey}` &&
          error.messageKey === ERROR_KEYS.checker.requiredField
      )
    ).toBe(false)
  })

  it.todo('requires mine list row fields when mine list rules are enabled')
  it.todo('requires smelter list row fields when smelter list row-level rules are enabled')
})
