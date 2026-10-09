import type { MineRow } from '@core/types/tableRows'

import type { ImportContext, LegacyMine } from './conversionTypes'
import { resolveImportedMineral } from './importMinerals'
import { readFieldStates, readOptionalLegacyFields } from './importUtils'

const MINE_STATE_KEYS = [
  'smelterId', 'mineFacilityName', 'mineFacilityCountry', 'mineFacilityProvince', 'comments',
]
const OPTIONAL_FIELDS = {
  smelterId: 'smelterId', mineId: 'mineIdentificationNumber', mineIdSource: 'mineIdentification',
  mineStreet: 'mineFacilityStreet', mineCity: 'mineFacilityCity',
  mineContactName: 'mineFacilityContact', mineContactEmail: 'mineFacilityEmail', proposedNextSteps: 'proposedNextSteps',
}

function buildMineRow(options: { context: ImportContext; item: LegacyMine; id: string }): MineRow {
  const { context, item, id } = options
  return {
    ...readOptionalLegacyFields({ item, mapping: OPTIONAL_FIELDS }),
    id,
    metal: resolveImportedMineral(context, item.metal),
    smelterName: item.smelterName ?? '',
    mineName: item.mineFacilityName ?? '',
    mineCountry: item.mineFacilityCountry ?? '',
    mineProvince: item.mineFacilityProvince ?? '',
    mineDistrict: '',
    comments: item.comments ?? '',
  }
}

export function importMines(context: ImportContext) {
  context.data.mineList = (context.legacy.minList ?? []).map((item, index) => {
    const id = `mine-${index}`
    context.ctx.mineLegacyIndexByInternalId.set(id, index)
    context.ctx.mineFieldStatesByIndex.set(index, readFieldStates(item, MINE_STATE_KEYS))
    return buildMineRow({ context, item, id })
  })
}
