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
})
