import { DeleteOutlined } from '@ant-design/icons'
import type { MineRow } from '@core/types/tableRows'
import type { MineSmelterOption } from '@core/viewmodels/mineSmelterOptions'
import { renderRequiredHeaderLabel, wrapRequired } from '@ui/helpers/fieldRequired'
import { getReadonlyTextControlProps } from '@ui/helpers/readonlyDisplay'
import { useT } from '@ui/i18n/useT'
import { useCreation } from 'ahooks'
import { Button, Input, Select } from 'antd'
import type { ColumnsType } from 'antd/es/table'

import { getMineHeaderProfile, type MineColumnId } from './mineHeaderProfile'
import { MineSmelterCell } from './MineSmelterCell'
import { MINE_COLUMN_WIDTH, MINE_INPUT_COLUMNS, MINE_REQUIRED_AFTER_METAL } from './mineTableFields'
import type { MineListTableProps } from './mineTableTypes'
import type { useMineTableRows } from './useMineTableRows'

const EMPTY_SMELTER_OPTIONS: MineSmelterOption[] = []
type RowActions = ReturnType<typeof useMineTableRows>
type ColumnOptions = Required<Omit<MineListTableProps, 'onChange'>> & {
  disabled: boolean
  actions: RowActions
}
interface ColumnContext extends ColumnOptions {
  headerProfile: ReturnType<typeof getMineHeaderProfile>
  hasSelectedMetal: boolean
  metalOptions: Array<{ value: string; label: string }>
  t: ReturnType<typeof useT>['t']
}

function getTitle(context: ColumnContext, field: MineColumnId) {
  return renderRequiredHeaderLabel(context.headerProfile.labels[field],
    context.hasSelectedMetal && MINE_REQUIRED_AFTER_METAL.has(field))
}

function buildMetalColumn(context: ColumnContext): ColumnsType<MineRow>[number] {
  return {
    title: context.headerProfile.labels.metal, dataIndex: 'metal', key: 'metal',
    width: MINE_COLUMN_WIDTH.metal,
    render: (value: string, row: MineRow) => wrapRequired(true,
      <Select value={value || undefined} onChange={context.actions.getMetalHandler(row.id)}
        options={context.metalOptions} disabled={context.disabled}
        {...getReadonlyTextControlProps({ value, disabled: context.disabled,
          placeholder: context.t('placeholders.select'), className: 'w-full' })} />,
      context.disabled),
  }
}

function buildSmelterColumn(context: ColumnContext): ColumnsType<MineRow>[number] {
  return {
    title: getTitle(context, 'smelterName'), dataIndex: 'smelterName', key: 'smelterName',
    width: MINE_COLUMN_WIDTH.smelterName,
    render: (_: string, row: MineRow) => (
      <MineSmelterCell row={row} mode={context.config.smelterNameMode}
        options={row.metal ? context.smelterOptionsByMetal[row.metal] ?? EMPTY_SMELTER_OPTIONS
          : context.smelterOptions}
        disabled={context.disabled} onPatchRow={context.actions.onPatchRow} />
    ),
  }
}

function buildInputColumn(options: {
  context: ColumnContext
  column: typeof MINE_INPUT_COLUMNS[number]
}): ColumnsType<MineRow>[number] {
  const { context, column: { field, placeholder } } = options
  return {
    title: getTitle(context, field), dataIndex: field, key: field,
    width: MINE_COLUMN_WIDTH[field],
    render: (value: string, row: MineRow) => wrapRequired(
      Boolean(row.metal) && MINE_REQUIRED_AFTER_METAL.has(field),
      <Input value={value || undefined} disabled={context.disabled}
        onChange={context.actions.getInputHandler(`${row.id}:${field}`)}
        {...getReadonlyTextControlProps({ value, disabled: context.disabled,
          placeholder: context.t(placeholder) })} />,
      context.disabled,
    ),
  }
}

function buildColumns(context: ColumnContext): ColumnsType<MineRow> {
  const columns = [buildMetalColumn(context), buildSmelterColumn(context),
    ...MINE_INPUT_COLUMNS.map((column) => buildInputColumn({ context, column }))]
  if (context.disabled) return columns
  return [...columns, {
    title: '', key: 'actions', width: MINE_COLUMN_WIDTH.actions,
    render: (_: unknown, row: MineRow) => (
      <Button type="text" danger icon={<DeleteOutlined />}
        onClick={context.actions.getRemoveHandler(row.id)} />
    ),
  }]
}

export function useMineTableColumns(options: ColumnOptions) {
  const { t, locale } = useT()
  const { rows, availableMetals, config, disabled, smelterOptions, smelterOptionsByMetal } = options
  const { onPatchRow, getInputHandler, getMetalHandler, getRemoveHandler } = options.actions
  const headerProfile = useCreation(() => getMineHeaderProfile({ locale, t }), [locale, t])
  const hasSelectedMetal = rows.some((row) => row.metal.trim())
  const metalOptions = useCreation(() => availableMetals.map((metal) => ({
    value: metal.key, label: metal.label ?? t(metal.labelKey),
  })), [availableMetals, t])
  return useCreation(() => buildColumns({ ...options, headerProfile, hasSelectedMetal, metalOptions, t }),
    [disabled, config.smelterNameMode, getInputHandler, getMetalHandler, getRemoveHandler,
      onPatchRow, headerProfile, hasSelectedMetal, metalOptions, smelterOptions, smelterOptionsByMetal, t])
}
