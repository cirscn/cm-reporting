import type { MineListConfig } from '@core/registry/types'
import type { MineRow } from '@core/types/tableRows'
import type { MineSmelterOption } from '@core/viewmodels/mineSmelterOptions'
import { wrapRequired } from '@ui/helpers/fieldRequired'
import { getReadonlyTextControlProps } from '@ui/helpers/readonlyDisplay'
import { useT } from '@ui/i18n/useT'
import { useMemoizedFn } from 'ahooks'
import { AutoComplete, Select } from 'antd'

import type { PatchMineRow } from './mineTableTypes'

interface MineSmelterCellProps {
  row: MineRow
  mode: MineListConfig['smelterNameMode']
  options: MineSmelterOption[]
  disabled: boolean
  onPatchRow: PatchMineRow
}

function filterOptionByLabel(input: string, option?: MineSmelterOption) {
  return (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
}

function MineSmelterDropdown(props: MineSmelterCellProps) {
  const { t } = useT()
  const { row, options, disabled, onPatchRow } = props
  const onChange = useMemoizedFn((selection?: MineSmelterOption) => {
    if (disabled || !row.metal) return
    if (!selection) return onPatchRow(row.id, { smelterName: '', smelterId: '' })
    const option = options.find((candidate) => candidate.value === selection.value)
    if (!option) throw new Error(`未知的矿场冶炼厂关联：${selection.value}`)
    onPatchRow(row.id, { smelterName: option.label, smelterId: option.value })
  })
  const value = row.smelterName
    ? { value: row.smelterId || row.smelterName, label: row.smelterName }
    : undefined
  return (
    <Select<MineSmelterOption, MineSmelterOption> value={value} labelInValue onChange={onChange}
      options={options} disabled={disabled || !row.metal} showSearch allowClear
      filterOption={filterOptionByLabel}
      {...getReadonlyTextControlProps({ value: row.smelterName, disabled,
        placeholder: t('placeholders.mineSmelterSelect'), className: 'w-full' })} />
  )
}

function MineSmelterManual(props: MineSmelterCellProps) {
  const { t } = useT()
  const { row, options, disabled, onPatchRow } = props
  const onChange = useMemoizedFn((value: string) => {
    if (disabled || !row.metal) return
    onPatchRow(row.id, { smelterName: value, smelterId: '' })
  })
  const onSelect = useMemoizedFn((value: string) => {
    if (disabled || !row.metal) return
    const option = options.find((candidate) => candidate.value === value)
    if (!option) throw new Error(`未知的矿场冶炼厂关联：${value}`)
    onPatchRow(row.id, { smelterName: option.label, smelterId: option.value })
  })
  return (
    <AutoComplete<string, MineSmelterOption> value={row.smelterName || undefined}
      onChange={onChange} onSelect={onSelect}
      options={options} disabled={disabled || !row.metal} allowClear
      filterOption={filterOptionByLabel}
      {...getReadonlyTextControlProps({ value: row.smelterName, disabled,
        placeholder: t('placeholders.mineSmelterInput'), className: 'w-full' })} />
  )
}

/** 下拉使用后台 ID，手输名称仅在选择建议时建立关联。 */
export function MineSmelterCell(props: MineSmelterCellProps) {
  return wrapRequired(Boolean(props.row.metal), props.mode === 'dropdown'
    ? <MineSmelterDropdown {...props} />
    : <MineSmelterManual {...props} />, props.disabled)
}
