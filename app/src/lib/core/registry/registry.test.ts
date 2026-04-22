/**
 * @file core/registry/registry.test.ts
 * @description 校验 registry 版本清单与 getVersionDef 覆盖性。
 */

import { describe, expect, it } from 'vitest'

import {
  getTemplateTypes,
  getTemplateDefinition,
  getVersionDef,
} from './index'

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
})
