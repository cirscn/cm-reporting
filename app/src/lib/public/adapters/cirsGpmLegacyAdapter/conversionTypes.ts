import type { FormData } from '@core/schema'

import type { CirsGpmLegacyPlan } from './planCache'
import type { CirsGpmLegacyReport, CirsGpmLegacyRoundtripContext } from './types'

export interface ImportContext {
  legacy: CirsGpmLegacyReport
  plan: CirsGpmLegacyPlan
  data: FormData
  ctx: CirsGpmLegacyRoundtripContext
  mineralLabelToKey: Map<string, string>
}

export interface ExportContext {
  out: CirsGpmLegacyReport
  plan: CirsGpmLegacyPlan
  data: FormData
  ctx: CirsGpmLegacyRoundtripContext
}

export type LegacySmelter = NonNullable<CirsGpmLegacyReport['cmtSmelters']>[number]
export type LegacyMine = NonNullable<CirsGpmLegacyReport['minList']>[number]
export type LegacyProduct = NonNullable<CirsGpmLegacyReport['cmtParts']>[number]
export type LegacyRangeQuestion = NonNullable<CirsGpmLegacyReport['cmtRangeQuestions']>[number]
export type LegacyCompanyQuestion = NonNullable<CirsGpmLegacyReport['cmtCompanyQuestions']>[number]
export type ProductFieldKey = 'partNumber' | 'partName' | 'requestPartNumber' | 'requestPartName' | 'remark'
export type ProductFieldMapping = Map<ProductFieldKey, string>
