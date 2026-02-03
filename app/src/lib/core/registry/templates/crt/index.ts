import { assertVersion, createVersionMap } from '../../common/helpers'
import type { TemplateDefinition, TemplateVersionDef } from '../../types'

import { buildCrtVersionDef } from './base'
import type { CrtVersionOverride } from './base'
import {
  CRT_DEFAULT_VERSION,
  CRT_VERSION_ENTRIES,
  CRT_VERSION_IDS,
} from './manifest'
import { crt_2_2 } from './versions/2.2'
import { crt_2_21 } from './versions/2.21'

const CRT_VERSION_OVERRIDES = {
  '2.2': crt_2_2,
  '2.21': crt_2_21,
} satisfies Record<(typeof CRT_VERSION_IDS)[number], CrtVersionOverride>

const CRT_VERSION_MAP = createVersionMap(Object.values(CRT_VERSION_OVERRIDES))

export const crtDefinition: TemplateDefinition = {
  type: 'crt',
  name: 'CRT',
  fullNameKey: 'templates.crt_full',
  versions: CRT_VERSION_ENTRIES,
  defaultVersion: CRT_DEFAULT_VERSION,
}

export function getCrtVersionDef(versionId: string): TemplateVersionDef {
  assertVersion(CRT_VERSION_IDS, versionId, 'CRT')
  const override = CRT_VERSION_MAP.get(versionId)
  if (!override) {
    throw new Error(`Missing CRT version config: ${versionId}`)
  }
  return buildCrtVersionDef(override)
}
