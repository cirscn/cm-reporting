import { getVersionDef } from '@core/registry'
import { describe, expect, test } from 'vitest'

import { buildMineRowSchema } from './index'

type ParseResult = {
  success: boolean
  error?: { issues: Array<{ path: PropertyKey[] }> }
}

function getIssuePaths(result: ParseResult) {
  if (result.success) return []
  return result.error?.issues.map((issue) => issue.path.join('.')) ?? []
}

describe('schema - mine row', () => {
  test.each([
    ['emrt', '2.1'],
    ['amrt', '1.3'],
  ] as const)(
    'requires smelter, mine name and country after a metal is selected for %s %s',
    (templateType, versionId) => {
      const versionDef = getVersionDef(templateType, versionId)
      const schema = buildMineRowSchema(versionDef)
      if (!schema) throw new Error('mine row schema is not available')

      const result = schema.safeParse({
        metal: versionDef.mineralScope.minerals[0]?.key ?? 'metal',
        smelterName: '',
        mineName: '',
        mineCountry: '',
      })

      expect(getIssuePaths(result)).toEqual([
        'smelterName',
        'mineName',
        'mineCountry',
      ])
    },
  )
})
