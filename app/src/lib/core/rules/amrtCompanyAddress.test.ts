import { getVersionDef, getVersions } from '@core/registry'
import { runChecker, type FormDataForChecker } from '@core/rules/checker'
import { calculateRequiredFields, type FormStateForRequired } from '@core/rules/required'
import { ERROR_KEYS } from '@core/validation/errorKeys'
import { describe, expect, it } from 'vitest'

const FORM_STATE: FormStateForRequired = {
  scopeType: 'A',
  questionAnswers: {},
}

const COMPANY_INFO = {
  companyName: '示例企业',
  declarationScope: 'A',
  contactName: '联系人',
  contactEmail: 'contact@example.com',
  contactPhone: '010-12345678',
  authorizerName: '授权人',
  authorizerEmail: 'authorizer@example.com',
  authorizationDate: '2024-01-01',
}

const EMPTY_ADDRESS_CASES: Record<string, string>[] = [
  {},
  { address: '' },
  { address: '   ' },
]

function buildFormData(companyInfo: Record<string, string>): FormDataForChecker {
  return {
    companyInfo,
    questions: {},
    companyQuestions: {},
    mineralsScope: [],
    smelterList: [],
    productList: [],
  }
}

describe.each(getVersions('amrt'))('AMRT %s 企业地址', (versionId) => {
  const versionDef = getVersionDef('amrt', versionId)

  it('不要求地址，同时保留公司名称的必填规则', () => {
    const required = calculateRequiredFields(versionDef, FORM_STATE)

    expect(required.companyInfo.get('address')).toBe(false)
    expect(required.companyInfo.get('companyName')).toBe(true)
  })

  it.each(EMPTY_ADDRESS_CASES)(
    '地址缺失或留空时，公司信息检查通过：%j',
    (address) => {
      const errors = runChecker(
        versionDef,
        FORM_STATE,
        buildFormData({ ...COMPANY_INFO, ...address })
      )

      expect(errors.filter((error) => error.fieldPath.startsWith('companyInfo.'))).toEqual([])
    }
  )

  it('地址选填不会放宽公司名称的必填检查', () => {
    const errors = runChecker(
      versionDef,
      FORM_STATE,
      buildFormData({ ...COMPANY_INFO, companyName: '' })
    )

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fieldPath: 'companyInfo.companyName',
          messageKey: ERROR_KEYS.checker.requiredField,
        }),
      ])
    )
  })
})
