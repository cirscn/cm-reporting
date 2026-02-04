import { parseCirsGpmLegacyReport } from './parse'
import { internalToCirsGpmLegacy } from './toExternal'
import { cirsGpmLegacyToInternal } from './toInternal'

export const cirsGpmLegacyAdapter = {
  parse: parseCirsGpmLegacyReport,
  toInternal: cirsGpmLegacyToInternal,
  toExternal: internalToCirsGpmLegacy,
} as const

export type { CirsGpmLegacyReport, CirsGpmLegacyRoundtripContext } from './types'
export type { ParsedCirsGpmLegacyReport } from './parse'
