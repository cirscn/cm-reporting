import { assertVersion, createVersionMap } from '../../common/helpers'
import type { TemplateDefinition, TemplateVersionDef } from '../../types'

import { buildAmrtVersionDef } from './base'
import type { AmrtVersionOverride } from './base'
import {
  AMRT_DEFAULT_VERSION,
  AMRT_VERSION_ENTRIES,
  AMRT_VERSION_IDS,
} from './manifest'
import { amrt_1_1 } from './versions/1.1'
import { amrt_1_2 } from './versions/1.2'
import { amrt_1_3 } from './versions/1.3'

const AMRT_VERSION_OVERRIDES = {
  '1.1': amrt_1_1,
  '1.2': amrt_1_2,
  '1.3': amrt_1_3,
} satisfies Record<(typeof AMRT_VERSION_IDS)[number], AmrtVersionOverride>

const AMRT_VERSION_MAP = createVersionMap(Object.values(AMRT_VERSION_OVERRIDES))

export const amrtDefinition: TemplateDefinition = {
  type: 'amrt',
  name: 'AMRT',
  fullNameKey: 'templates.amrt_full',
  versions: AMRT_VERSION_ENTRIES,
  defaultVersion: AMRT_DEFAULT_VERSION,
}

export function getAmrtVersionDef(versionId: string): TemplateVersionDef {
  assertVersion(AMRT_VERSION_IDS, versionId, 'AMRT')
  const override = AMRT_VERSION_MAP.get(versionId)
  if (!override) {
    throw new Error(`Missing AMRT version config: ${versionId}`)
  }
  return buildAmrtVersionDef(override)
}
