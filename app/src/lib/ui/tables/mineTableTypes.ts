import type { MineralDef, MineListConfig } from '@core/registry/types'
import type { MineRow } from '@core/types/tableRows'
import type { MineSmelterOption } from '@core/viewmodels/mineSmelterOptions'

export interface MineListTableProps {
  config: MineListConfig
  availableMetals: Array<MineralDef & { label?: string }>
  rows: MineRow[]
  onChange: (rows: MineRow[]) => void
  smelterOptions?: MineSmelterOption[]
  smelterOptionsByMetal?: Record<string, MineSmelterOption[]>
}

export type PatchMineRow = (id: string, patch: Partial<MineRow>) => void
