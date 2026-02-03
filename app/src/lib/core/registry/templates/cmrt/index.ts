import { assertVersion, createVersionMap } from '../../common/helpers'
import type { TemplateDefinition, TemplateVersionDef } from '../../types'

import { buildCmrtVersionDef } from './base'
import type { CmrtVersionOverride } from './base'
import {
  CMRT_DEFAULT_VERSION,
  CMRT_VERSION_ENTRIES,
  CMRT_VERSION_IDS,
} from './manifest'
import { cmrt_6_01 } from './versions/6.01'
import { cmrt_6_1 } from './versions/6.1'
import { cmrt_6_22 } from './versions/6.22'
import { cmrt_6_31 } from './versions/6.31'
import { cmrt_6_4 } from './versions/6.4'
import { cmrt_6_5 } from './versions/6.5'

const CMRT_VERSION_OVERRIDES = {
  '6.01': cmrt_6_01,
  '6.1': cmrt_6_1,
  '6.22': cmrt_6_22,
  '6.31': cmrt_6_31,
  '6.4': cmrt_6_4,
  '6.5': cmrt_6_5,
} satisfies Record<(typeof CMRT_VERSION_IDS)[number], CmrtVersionOverride>

const CMRT_VERSION_MAP = createVersionMap(Object.values(CMRT_VERSION_OVERRIDES))

export const cmrtDefinition: TemplateDefinition = {
  type: 'cmrt',
  name: 'CMRT',
  fullNameKey: 'templates.cmrt_full',
  versions: CMRT_VERSION_ENTRIES,
  defaultVersion: CMRT_DEFAULT_VERSION,
}

export function getCmrtVersionDef(versionId: string): TemplateVersionDef {
  assertVersion(CMRT_VERSION_IDS, versionId, 'CMRT')
  const override = CMRT_VERSION_MAP.get(versionId)
  if (!override) {
    throw new Error(`Missing CMRT version config: ${versionId}`)
  }
  return buildCmrtVersionDef(override)
}
