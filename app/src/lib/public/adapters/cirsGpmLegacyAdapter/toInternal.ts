import { REPORT_SNAPSHOT_SCHEMA_VERSION, type ReportSnapshotV1 } from '../../snapshot'

import { importCompanyInfo } from './importCompany'
import { createImportContext } from './importContext'
import { importMineralScope } from './importMinerals'
import { importMines } from './importMines'
import { importProducts } from './importProducts'
import { importCompanyQuestions, importRangeQuestions } from './importQuestions'
import { importAmrtReasons } from './importReasons'
import { importSmelters } from './importSmelters'
import { parseCirsGpmLegacyReport } from './parse'
import type { CirsGpmLegacyRoundtripContext } from './types'

export function cirsGpmLegacyToInternal(input: unknown): {
  snapshot: ReportSnapshotV1
  ctx: CirsGpmLegacyRoundtripContext
} {
  const context = createImportContext(parseCirsGpmLegacyReport(input))
  importCompanyInfo(context)
  importMineralScope(context)
  importRangeQuestions(context)
  importCompanyQuestions(context)
  importSmelters(context)
  importMines(context)
  importProducts(context)
  importAmrtReasons(context)
  return {
    snapshot: {
      schemaVersion: REPORT_SNAPSHOT_SCHEMA_VERSION,
      templateType: context.ctx.templateType,
      versionId: context.ctx.versionId,
      data: context.data,
    },
    ctx: context.ctx,
  }
}
