import { assertVersion, createVersionMap } from '../../common/helpers'
import type { TemplateDefinition, TemplateVersionDef } from '../../types'

import { buildEmrtVersionDef } from './base'
import type { EmrtVersionOverride } from './base'
import {
  EMRT_DEFAULT_VERSION,
  EMRT_VERSION_ENTRIES,
  EMRT_VERSION_IDS,
} from './manifest'
import { emrt_1_1 } from './versions/1.1'
import { emrt_1_11 } from './versions/1.11'
import { emrt_1_2 } from './versions/1.2'
import { emrt_1_3 } from './versions/1.3'
import { emrt_2_0 } from './versions/2.0'
import { emrt_2_1 } from './versions/2.1'

const EMRT_VERSION_OVERRIDES = {
  '1.1': emrt_1_1,
  '1.11': emrt_1_11,
  '1.2': emrt_1_2,
  '1.3': emrt_1_3,
  '2.0': emrt_2_0,
  '2.1': emrt_2_1,
} satisfies Record<(typeof EMRT_VERSION_IDS)[number], EmrtVersionOverride>

const EMRT_VERSION_MAP = createVersionMap(Object.values(EMRT_VERSION_OVERRIDES))

export const emrtDefinition: TemplateDefinition = {
  type: 'emrt',
  name: 'EMRT',
  fullNameKey: 'templates.emrt_full',
  versions: EMRT_VERSION_ENTRIES,
  defaultVersion: EMRT_DEFAULT_VERSION,
}

export function getEmrtVersionDef(versionId: string): TemplateVersionDef {
  assertVersion(EMRT_VERSION_IDS, versionId, 'EMRT')
  const override = EMRT_VERSION_MAP.get(versionId)
  if (!override) {
    throw new Error(`Missing EMRT version config: ${versionId}`)
  }
  return buildEmrtVersionDef(override)
}
