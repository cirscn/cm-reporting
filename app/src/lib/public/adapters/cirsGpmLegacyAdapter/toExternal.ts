import { deepCloneJson } from '@core/template/strings'

import type { ReportSnapshotV1 } from '../../snapshot'

import type { ExportContext } from './conversionTypes'
import { patchCompanyInfo } from './exportCompany'
import { patchCompanyQuestions } from './exportCompanyQuestions'
import { patchMines } from './exportMines'
import { patchProducts } from './exportProducts'
import { patchRangeQuestions } from './exportRangeQuestions'
import { patchAmrtReasons } from './exportReasons'
import { patchSmelters } from './exportSmelters'
import { getCirsGpmLegacyPlan } from './planCache'
import type { CirsGpmLegacyReport, CirsGpmLegacyRoundtripContext } from './types'

export function internalToCirsGpmLegacy(
  snapshot: ReportSnapshotV1,
  ctx: CirsGpmLegacyRoundtripContext,
): CirsGpmLegacyReport {
  if (snapshot.templateType !== ctx.templateType || snapshot.versionId !== ctx.versionId) {
    throw new Error('snapshot does not match ctx templateType/versionId')
  }
  const context: ExportContext = {
    out: deepCloneJson(ctx.original),
    plan: getCirsGpmLegacyPlan(ctx.templateType, ctx.versionId),
    data: snapshot.data,
    ctx,
  }
  patchCompanyInfo(context)
  patchRangeQuestions(context)
  patchCompanyQuestions(context)
  patchSmelters(context)
  patchMines(context)
  patchProducts(context)
  patchAmrtReasons(context)
  return context.out
}
