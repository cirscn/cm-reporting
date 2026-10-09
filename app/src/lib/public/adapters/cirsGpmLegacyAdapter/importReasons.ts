import type { ImportContext } from './conversionTypes'
import { resolveImportedMineral } from './importMinerals'
import { coerceId, readFieldStates } from './importUtils'

const REASON_STATE_KEYS = ['metal', 'reason']

export function importAmrtReasons(context: ImportContext) {
  context.data.mineralsScope = (context.legacy.amrtReasonList ?? []).map((item, index) => {
    const id = coerceId(item.id, `minerals-scope-${index}`)
    context.ctx.amrtReasonIndexByInternalId.set(id, index)
    context.ctx.amrtReasonFieldStatesByIndex.set(index, readFieldStates(item, REASON_STATE_KEYS))
    return { id, mineral: resolveImportedMineral(context, item.metal), reason: item.reason ?? '' }
  })
}
