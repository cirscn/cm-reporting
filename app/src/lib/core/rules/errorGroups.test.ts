import { getVersionDef } from '@core/registry'
import { ERROR_KEYS } from '@core/validation/errorKeys'
import { describe, expect, it } from 'vitest'

import type { CheckerError } from './checker'
import { groupCheckerErrors } from './errorGroups'

describe('groupCheckerErrors', () => {
  it('places required smelter list errors before out-of-scope smelter metal errors', () => {
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
    ]

    const smelterGroup = groupCheckerErrors(errors, versionDef).find(
      (group) => group.key === 'smelter'
    )

    expect(smelterGroup?.items.map((error) => error.messageKey)).toEqual([
      ERROR_KEYS.checker.requiredSmelterList,
      ERROR_KEYS.checker.outOfScopeSmelterMetal,
    ])
  })
})
