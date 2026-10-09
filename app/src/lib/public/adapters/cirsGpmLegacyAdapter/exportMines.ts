import { deepCloneJson } from '@core/template/strings'
import type { MineRow } from '@core/types/tableRows'

import { readMappedRowFields, writeLegacyFields } from './adapterUtils'
import type { ExportContext } from './conversionTypes'
import { copyNonEmptyFields, resolveMineralLabel } from './exportUtils'
import type { CirsGpmLegacyReport } from './types'

const MINE_FIELDS = {
  smelterId: 'smelterId', smelterName: 'smelterName', mineName: 'mineFacilityName',
  mineCountry: 'mineFacilityCountry', mineStreet: 'mineFacilityStreet', mineCity: 'mineFacilityCity',
  mineProvince: 'mineFacilityProvince', mineId: 'mineIdentificationNumber', mineIdSource: 'mineIdentification',
  mineContactName: 'mineFacilityContact', mineContactEmail: 'mineFacilityEmail',
  proposedNextSteps: 'proposedNextSteps', comments: 'comments',
}
const NEW_MINE_FIELDS = {
  smelterId: 'smelterId', smelterName: 'smelterName', mineName: 'mineFacilityName',
  mineCountry: 'mineFacilityCountry', comments: 'comments',
}

function createMine(context: ExportContext, row: MineRow) {
  const item: Record<string, unknown> = {}
  copyNonEmptyFields({
    item, values: {
      ...readMappedRowFields({ row, mapping: NEW_MINE_FIELDS }),
      metal: resolveMineralLabel({ context, value: row.metal }),
    },
  })
  return item
}

function patchExistingMine(options: { context: ExportContext; row: MineRow; index: number }) {
  const { context, row, index } = options
  const item = deepCloneJson(context.out.minList?.[index] ?? {})
  writeLegacyFields({
    item,
    states: context.ctx.mineFieldStatesByIndex.get(index) ?? new Map(),
    values: {
      ...readMappedRowFields({ row, mapping: MINE_FIELDS }),
      metal: resolveMineralLabel({ context, value: row.metal }),
    },
  })
  return item
}

export function patchMines(context: ExportContext) {
  const next = context.data.mineList.map((row) => {
    const index = context.ctx.mineLegacyIndexByInternalId.get(row.id)
    return index === undefined ? createMine(context, row) : patchExistingMine({ context, row, index })
  })
  if (context.out.minList || next.length > 0) context.out.minList = next as CirsGpmLegacyReport['minList']
}
