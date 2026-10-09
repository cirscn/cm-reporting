import type { MineRow } from '@core/types/tableRows'
import { useHandlerMap } from '@ui/hooks/useHandlerMap'
import { useCreation, useLatest, useMemoizedFn } from 'ahooks'
import type { ChangeEvent } from 'react'

import { MINE_INPUT_COLUMNS } from './mineTableFields'
import type { PatchMineRow } from './mineTableTypes'

const REMOVE_ROW_COUNT = 1

function createEmptyMineRow(): MineRow {
  return {
    id: `mine-${Date.now()}`,
    metal: '', smelterName: '', smelterId: '', mineName: '', mineCountry: '',
    mineId: '', mineIdSource: '', mineStreet: '', mineCity: '', mineProvince: '',
    mineDistrict: '', mineContactName: '', mineContactEmail: '',
    proposedNextSteps: '', comments: '',
  }
}

function createInputHandlers(options: { rows: MineRow[]; onPatchRow: PatchMineRow }) {
  const handlers = new Map<string, (event: ChangeEvent<HTMLInputElement>) => void>()
  for (const row of options.rows) {
    for (const { field } of MINE_INPUT_COLUMNS) {
      handlers.set(`${row.id}:${field}`, (event) =>
        options.onPatchRow(row.id, { [field]: event.target.value }),
      )
    }
  }
  return handlers
}

function createMetalHandlers(options: { rows: MineRow[]; onPatchRow: PatchMineRow }) {
  return new Map(options.rows.map((row) => [row.id, (value: string) => {
    options.onPatchRow(row.id, { metal: value, smelterName: '', smelterId: '' })
  }]))
}

function createRowState(rows: MineRow[]) {
  return { rows, indexMap: new Map(rows.map((row, index) => [row.id, index])) }
}

/** 名称与后台关联 ID 通过同一次行更新保持一致。 */
export function useMineTableRows(options: {
  rows: MineRow[]
  onChange: (rows: MineRow[]) => void
  disabled: boolean
}) {
  const { rows, onChange, disabled } = options
  // 同一次建议选择会先触发文本更新、再触发选中，第二次必须读取第一次提交的数据。
  const rowStateRef = useLatest(useCreation(() => createRowState(rows), [rows]))
  const onPatchRow = useMemoizedFn((id: string, patch: Partial<MineRow>) => {
    if (disabled) return
    const index = rowStateRef.current.indexMap.get(id)
    if (index === undefined) return
    const row = rowStateRef.current.rows[index]
    if (patch.metal !== undefined && row.metal === patch.metal) return
    if (!Object.entries(patch).some(([field, value]) => row[field] !== value)) return
    const next = rowStateRef.current.rows.slice()
    next[index] = { ...row, ...patch }
    rowStateRef.current = { rows: next, indexMap: rowStateRef.current.indexMap }
    onChange(next)
  })
  const onAddRow = useMemoizedFn(() => {
    if (disabled) return
    rowStateRef.current = createRowState([...rowStateRef.current.rows, createEmptyMineRow()])
    onChange(rowStateRef.current.rows)
  })
  const onRemoveRow = useMemoizedFn((id: string) => {
    if (disabled) return
    const index = rowStateRef.current.indexMap.get(id)
    if (index === undefined) return
    const next = rowStateRef.current.rows.slice()
    next.splice(index, REMOVE_ROW_COUNT)
    rowStateRef.current = createRowState(next)
    onChange(next)
  })
  const getInputHandler = useHandlerMap(
    () => createInputHandlers({ rows, onPatchRow }), [rows, onPatchRow],
  )
  const getMetalHandler = useHandlerMap(
    () => createMetalHandlers({ rows, onPatchRow }), [rows, onPatchRow],
  )
  const getRemoveHandler = useHandlerMap(
    () => new Map(rows.map((row) => [row.id, () => onRemoveRow(row.id)])),
    [rows, onRemoveRow],
  )
  return { onAddRow, onPatchRow, getInputHandler, getMetalHandler, getRemoveHandler }
}
