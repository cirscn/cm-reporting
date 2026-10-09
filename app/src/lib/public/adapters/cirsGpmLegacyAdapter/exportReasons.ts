import { deepCloneJson } from '@core/template/strings'

import { writeLegacyFields } from './adapterUtils'
import type { ExportContext } from './conversionTypes'
import { copyNonEmptyFields, resolveMineralLabel } from './exportUtils'
import type { CirsGpmLegacyReport } from './types'

export function patchAmrtReasons(context: ExportContext) {
  const original = context.out.amrtReasonList ?? []
  const next = context.data.mineralsScope.map((row) => {
    const index = context.ctx.amrtReasonIndexByInternalId.get(row.id)
    const values = { metal: resolveMineralLabel({ context, value: row.mineral }), reason: row.reason }
    if (index === undefined) {
      const item: Record<string, unknown> = { id: row.id }
      copyNonEmptyFields({ item, values })
      return item
    }
    const item = deepCloneJson(original[index] ?? {})
    writeLegacyFields({ item, values, states: context.ctx.amrtReasonFieldStatesByIndex.get(index) ?? new Map() })
    item.id = item.id ?? row.id
    return item
  })
  if (context.out.amrtReasonList || next.length > 0) {
    context.out.amrtReasonList = next as CirsGpmLegacyReport['amrtReasonList']
  }
}
