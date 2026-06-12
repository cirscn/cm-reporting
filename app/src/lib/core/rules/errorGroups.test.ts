import { getVersionDef } from '@core/registry'
import { ERROR_KEYS } from '@core/validation/errorKeys'
import { describe, expect, it } from 'vitest'

import type { CheckerError } from './checker'
import { groupCheckerErrors } from './errorGroups'

describe('groupCheckerErrors', () => {
  it('orders groups by workflow step order', () => {
    const versionDef = getVersionDef('cmrt', '6.5')
    const errors: CheckerError[] = [
      {
        code: 'R001',
        messageKey: ERROR_KEYS.checker.requiredProductList,
        fieldPath: 'productList',
        severity: 'error',
      },
      {
        code: 'R002',
        messageKey: ERROR_KEYS.checker.requiredField,
        fieldPath: 'questions.Q1.gold',
        fieldLabelKey: 'questions.cmrt.q1',
        severity: 'error',
      },
      {
        code: 'R003',
        messageKey: ERROR_KEYS.checker.requiredSmelterList,
        fieldPath: 'smelterList.gold',
        fieldLabelKey: 'minerals.gold',
        severity: 'error',
      },
      {
        code: 'R004',
        messageKey: ERROR_KEYS.checker.requiredField,
        fieldPath: 'companyInfo.companyName',
        fieldLabelKey: 'fields.companyName',
        severity: 'error',
      },
    ]

    expect(groupCheckerErrors(errors, versionDef).map((group) => group.key)).toEqual([
      'companyInfo',
      'smelter',
      'questionMatrix',
      'product',
    ])
  })

  it('places required and duplicate smelter errors before out-of-scope smelter metal errors', () => {
    const versionDef = getVersionDef('emrt', '2.1')
    const errors: CheckerError[] = [
      {
        code: 'R001',
        messageKey: ERROR_KEYS.checker.outOfScopeSmelterMetal,
        fieldPath: 'smelterList.0.metal',
        fieldLabelKey: 'minerals.lithium',
        severity: 'error',
      },
      {
        code: 'R002',
        messageKey: ERROR_KEYS.checker.requiredSmelterList,
        fieldPath: 'smelterList.cobalt',
        fieldLabelKey: 'minerals.cobalt',
        severity: 'error',
      },
      {
        code: 'R003',
        messageKey: ERROR_KEYS.checker.duplicateSmelterSelection,
        fieldPath: 'smelterList.1.id',
        messageValues: { field: 'cobalt' },
        severity: 'error',
      },
    ]

    const smelterGroup = groupCheckerErrors(errors, versionDef).find(
      (group) => group.key === 'smelter'
    )

    expect(smelterGroup?.items.map((error) => error.messageKey)).toEqual([
      ERROR_KEYS.checker.requiredSmelterList,
      ERROR_KEYS.checker.duplicateSmelterSelection,
      ERROR_KEYS.checker.outOfScopeSmelterMetal,
    ])
  })
})
