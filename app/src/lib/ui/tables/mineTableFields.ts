import type { I18nKey } from '@core/i18n'

import type { MineColumnId } from './mineHeaderProfile'

type MineInputField = Exclude<MineColumnId, 'metal' | 'smelterName'>

export const MINE_COLUMN_WIDTH = {
  metal: 150,
  smelterName: 220,
  mineName: 180,
  mineId: 160,
  mineIdSource: 180,
  mineCountry: 160,
  mineStreet: 200,
  mineCity: 160,
  mineProvince: 170,
  mineContactName: 180,
  mineContactEmail: 200,
  proposedNextSteps: 200,
  comments: 180,
  actions: 60,
} as const

export const MINE_INPUT_COLUMNS: Array<{ field: MineInputField; placeholder: I18nKey }> = [
  { field: 'mineName', placeholder: 'placeholders.mineName' },
  { field: 'mineId', placeholder: 'placeholders.mineId' },
  { field: 'mineIdSource', placeholder: 'placeholders.mineSourceId' },
  { field: 'mineCountry', placeholder: 'placeholders.mineCountry' },
  { field: 'mineStreet', placeholder: 'placeholders.mineStreet' },
  { field: 'mineCity', placeholder: 'placeholders.mineCity' },
  { field: 'mineProvince', placeholder: 'placeholders.mineState' },
  { field: 'mineContactName', placeholder: 'placeholders.mineContactName' },
  { field: 'mineContactEmail', placeholder: 'placeholders.mineContactEmail' },
  { field: 'proposedNextSteps', placeholder: 'placeholders.mineNextSteps' },
  { field: 'comments', placeholder: 'placeholders.mineComments' },
]

export const MINE_REQUIRED_AFTER_METAL = new Set<MineColumnId>([
  'smelterName', 'mineName', 'mineCountry',
])
