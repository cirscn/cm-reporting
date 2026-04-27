/**
 * @file core/registry/registry.test.ts
 * @description 校验 registry 版本清单与 getVersionDef 覆盖性。
 */

import { describe, expect, it } from 'vitest'

import type { TemplateType } from './types'

import {
  getTemplateTypes,
  getTemplateDefinition,
  getVersionDef,
} from './index'

const DATE_CONFIG_CASES: Array<{
  type: TemplateType
  versionId: string
  dateConfig: {
    minDate: string
    minBoundary?: 'inclusive' | 'exclusive'
    maxDate?: string
  }
}> = [
  { type: 'cmrt', versionId: '6.01', dateConfig: { minDate: '2006-12-31', maxDate: '2026-03-31' } },
  { type: 'cmrt', versionId: '6.1', dateConfig: { minDate: '2006-12-31', maxDate: '2026-03-31' } },
  { type: 'cmrt', versionId: '6.22', dateConfig: { minDate: '2006-12-31', maxDate: '2026-03-31' } },
  { type: 'cmrt', versionId: '6.31', dateConfig: { minDate: '2006-12-31', minBoundary: 'exclusive' } },
  { type: 'cmrt', versionId: '6.4', dateConfig: { minDate: '2006-12-31', minBoundary: 'exclusive' } },
  { type: 'cmrt', versionId: '6.5', dateConfig: { minDate: '2006-12-31', minBoundary: 'exclusive' } },
  { type: 'cmrt', versionId: '6.6', dateConfig: { minDate: '2006-12-31', minBoundary: 'exclusive' } },
  { type: 'emrt', versionId: '1.1', dateConfig: { minDate: '2006-12-31', maxDate: '2026-03-31' } },
  { type: 'emrt', versionId: '1.11', dateConfig: { minDate: '2006-12-31', maxDate: '2026-03-31' } },
  { type: 'emrt', versionId: '1.2', dateConfig: { minDate: '2006-12-31', maxDate: '2026-03-31' } },
  { type: 'emrt', versionId: '1.3', dateConfig: { minDate: '2006-12-31', maxDate: '2026-03-31' } },
  { type: 'emrt', versionId: '2.0', dateConfig: { minDate: '2006-12-31', maxDate: '2026-03-31' } },
  { type: 'emrt', versionId: '2.1', dateConfig: { minDate: '2006-12-31', maxDate: '2026-03-31' } },
  { type: 'emrt', versionId: '2.11', dateConfig: { minDate: '2006-12-31', minBoundary: 'exclusive' } },
  { type: 'crt', versionId: '2.2', dateConfig: { minDate: '2006-12-31', maxDate: '2026-03-31' } },
  { type: 'crt', versionId: '2.21', dateConfig: { minDate: '2006-12-31', maxDate: '2026-03-31' } },
  { type: 'amrt', versionId: '1.1', dateConfig: { minDate: '2006-12-31', maxDate: '2026-03-31' } },
  { type: 'amrt', versionId: '1.2', dateConfig: { minDate: '2006-12-31', maxDate: '2026-03-31' } },
  { type: 'amrt', versionId: '1.3', dateConfig: { minDate: '2006-12-31', maxDate: '2026-03-31' } },
  { type: 'amrt', versionId: '1.31', dateConfig: { minDate: '2006-12-31', minBoundary: 'exclusive' } },
]

describe('registry versions', () => {
  it('covers every version in definition and resolves to a version def', () => {
    getTemplateTypes().forEach((type) => {
      const def = getTemplateDefinition(type)
      const versionIds = def.versions.map((v) => v.id)
      const unique = new Set(versionIds)

      expect(unique.size).toBe(versionIds.length)
      versionIds.forEach((versionId) => {
        const versionDef = getVersionDef(type, versionId)
        expect(versionDef.templateType).toBe(type)
        expect(versionDef.version.id).toBe(versionId)
      })
    })
  })

  it('supports CMRT 6.6 and EMRT 2.11 version definitions', () => {
    const cmrtDefinition = getTemplateDefinition('cmrt')
    const emrtDefinition = getTemplateDefinition('emrt')

    expect(cmrtDefinition.versions.some((version) => version.id === '6.6')).toBe(true)
    expect(emrtDefinition.versions.some((version) => version.id === '2.11')).toBe(true)

    expect(getVersionDef('cmrt', '6.6').version.id).toBe('6.6')
    expect(getVersionDef('emrt', '2.11').version.id).toBe('2.11')
  })

  it('defines authorization date range for every supported template version', () => {
    DATE_CONFIG_CASES.forEach(({ type, versionId, dateConfig }) => {
      expect(getVersionDef(type, versionId).dateConfig).toEqual(dateConfig)
    })
  })
})
