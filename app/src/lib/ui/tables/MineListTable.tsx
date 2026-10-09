/** 矿山清单表格：各版本共用名称与后台 ID 的行编辑逻辑。 */
import type { MineSmelterOption } from '@core/viewmodels/mineSmelterOptions'
import { Card, ConfigProvider, Table } from 'antd'

import { MineTableTitle } from './MineTableTitle'
import type { MineListTableProps } from './mineTableTypes'
import { useMineTableColumns } from './useMineTableColumns'
import { useMineTableRows } from './useMineTableRows'

const EMPTY_SMELTER_OPTIONS: MineSmelterOption[] = []
const EMPTY_SMELTER_OPTIONS_BY_METAL: Record<string, MineSmelterOption[]> = {}

export function MineListTable({
  config,
  availableMetals,
  rows,
  onChange,
  smelterOptions = EMPTY_SMELTER_OPTIONS,
  smelterOptionsByMetal = EMPTY_SMELTER_OPTIONS_BY_METAL,
}: MineListTableProps) {
  const { componentDisabled } = ConfigProvider.useConfig()
  const disabled = Boolean(componentDisabled)
  const actions = useMineTableRows({ rows, onChange, disabled })
  const columns = useMineTableColumns({ config, availableMetals, rows, disabled, actions,
    smelterOptions, smelterOptionsByMetal })
  if (!config.available) return null
  return (
    <Card title={<MineTableTitle count={rows.length} disabled={disabled} onAddRow={actions.onAddRow} />}>
      <Table columns={columns} dataSource={rows} rowKey="id" pagination={false}
        scroll={{ x: 'max-content' }} bordered />
    </Card>
  )
}
