import { getVersionDef } from '@core/registry'
import type { MineRow } from '@core/types/tableRows'
import type { MineSmelterOption } from '@core/viewmodels/mineSmelterOptions'
import { ConfigProvider } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { MineListTable } from './MineListTable'

interface ControlProps {
  value?: string | { value: string; label: string }
  labelInValue?: boolean
  placeholder?: string
  disabled?: boolean
  allowClear?: boolean
  options?: MineSmelterOption[]
  onChange?: (value: unknown) => void
  onSelect?: (value: string) => void
}

const controls = vi.hoisted(() => new Map<string, ControlProps>())
const buttons = vi.hoisted(() => ({ add: undefined as (() => void) | undefined,
  remove: [] as Array<() => void> }))

vi.mock('@ui/i18n/useT', () => ({
  useT: () => ({ t: (key: string) => key, locale: 'zh-CN' }),
}))

vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>()
  const React = await import('react')
  const capture = (props: ControlProps) => {
    if (props.placeholder) controls.set(props.placeholder, props)
    return React.createElement('span')
  }
  return {
    ...actual,
    Select: capture,
    AutoComplete: capture,
    Button: (props: { children?: ReactNode; danger?: boolean; onClick?: () => void }) => {
      if (props.children === 'actions.addRow') buttons.add = props.onClick
      if (props.danger && props.onClick) buttons.remove.push(props.onClick)
      return React.createElement('span')
    },
    Table: (props: { columns: ColumnsType<MineRow>; dataSource: MineRow[] }) =>
      React.createElement(React.Fragment, null, props.dataSource.flatMap((row) =>
        props.columns.map((column) => {
          const field = 'dataIndex' in column ? String(column.dataIndex) : ''
          return React.createElement(React.Fragment, { key: `${row.id}:${String(column.key)}` },
            column.render?.(row[field], row, 0) as ReactNode)
        }),
      )),
  }
})

const OPTIONS: MineSmelterOption[] = [
  { value: 'backend-1', label: '同名冶炼厂' },
  { value: 'backend-2', label: '同名冶炼厂' },
]
const METAL = 'cobalt'

function makeRow(patch: Partial<MineRow> = {}): MineRow {
  return {
    id: 'mine-1', metal: METAL, smelterName: '', mineName: '', mineCountry: '',
    mineProvince: '', mineDistrict: '', comments: '', ...patch,
  }
}

function renderTable(options: {
  row?: MineRow
  rows?: MineRow[]
  versionId?: string
  disabled?: boolean
  smelterOptions?: MineSmelterOption[]
} = {}) {
  const onChange = vi.fn<(rows: MineRow[]) => void>()
  const version = getVersionDef('emrt', options.versionId ?? '2.1')
  renderToStaticMarkup(
    <ConfigProvider componentDisabled={options.disabled ?? false}>
      <MineListTable config={version.mineList} availableMetals={version.mineralScope.minerals}
        rows={options.rows ?? [options.row ?? makeRow()]} onChange={onChange} smelterOptions={OPTIONS}
        smelterOptionsByMetal={{ [METAL]: options.smelterOptions ?? OPTIONS }} />
    </ConfigProvider>,
  )
  return onChange
}

function getSmelterControl(mode = 'Select') {
  const control = controls.get(`placeholders.mineSmelter${mode}`)
  expect(control).toBeDefined()
  return control!
}

function selectSmelter(control: ControlProps, option: MineSmelterOption) {
  control.onChange?.(control.labelInValue ? option : option.value)
}

describe('MineListTable 冶炼厂后台关联', () => {
  beforeEach(() => {
    controls.clear()
    buttons.add = undefined
    buttons.remove.length = 0
  })

  test('实际新增按钮保留已有数据且新行不携带旧关联', () => {
    const original = makeRow({ smelterName: '同名冶炼厂', smelterId: 'backend-1' })
    const changed = renderTable({ row: original })
    expect(buttons.add).toBeDefined()
    buttons.add?.()
    const rows = changed.mock.lastCall![0]
    expect(rows).toHaveLength(2)
    expect(rows[0]).toEqual(original)
    expect(rows[1]).toMatchObject({ metal: '', smelterName: '', smelterId: '' })
  })

  test('实际删除按钮按当前行定位，连续删除不会遗留数据', () => {
    const first = makeRow({ smelterName: '同名冶炼厂', smelterId: 'backend-1' })
    const second = makeRow({ id: 'mine-2', smelterName: '同名冶炼厂', smelterId: 'backend-2' })
    const changed = renderTable({ rows: [first, second] })
    expect(buttons.remove).toHaveLength(2)
    buttons.remove[1]()
    expect(changed.mock.lastCall![0]).toEqual([first])
    buttons.remove[0]()
    expect(changed.mock.lastCall![0]).toEqual([])
  })

  test('两行关联同一冶炼厂，编辑和删除第二行不影响第一行', () => {
    const first = makeRow({ smelterName: '同名冶炼厂', smelterId: 'backend-1', mineName: '矿场甲' })
    const second = makeRow({ id: 'mine-2', smelterName: '同名冶炼厂', smelterId: 'backend-1', mineName: '矿场乙' })
    const changed = renderTable({ rows: [first, second] })

    selectSmelter(getSmelterControl(), OPTIONS[1])

    expect(changed.mock.lastCall![0][0]).toEqual(first)
    expect(changed.mock.lastCall![0][1]).toMatchObject({
      id: 'mine-2', mineName: '矿场乙', smelterId: 'backend-2',
    })
    buttons.remove[1]()
    expect(changed.mock.lastCall![0]).toEqual([first])
  })

  test('新增矿场选择后一次保存名称和后台 ID', () => {
    const changed = renderTable()
    selectSmelter(getSmelterControl(), OPTIONS[0])
    expect(changed).toHaveBeenCalledTimes(1)
    expect(changed.mock.lastCall?.[0][0]).toMatchObject({
      smelterName: '同名冶炼厂', smelterId: 'backend-1',
    })
  })

  test('改选同名但不同 ID 的冶炼厂更新关联', () => {
    const changed = renderTable({ row: makeRow({ smelterName: '同名冶炼厂', smelterId: 'backend-1' }) })
    selectSmelter(getSmelterControl(), OPTIONS[1])
    expect(changed.mock.lastCall?.[0][0]).toMatchObject({
      smelterName: '同名冶炼厂', smelterId: 'backend-2',
    })
    expect(getSmelterControl().options).toEqual(OPTIONS)
  })

  test('清空同时清除名称和后台 ID', () => {
    const changed = renderTable({ row: makeRow({ smelterName: '同名冶炼厂', smelterId: 'backend-1' }) })
    const control = getSmelterControl()
    expect(control.allowClear).toBe(true)
    control.onChange?.(undefined)
    expect(changed.mock.lastCall?.[0][0]).toMatchObject({ smelterName: '', smelterId: '' })
  })

  test('切换金属清除原名称及后台关联', () => {
    const changed = renderTable({ row: makeRow({ smelterName: '同名冶炼厂', smelterId: 'backend-1' }) })
    controls.get('placeholders.select')?.onChange?.('copper')
    expect(changed.mock.lastCall?.[0][0]).toMatchObject({ metal: 'copper', smelterName: '', smelterId: '' })
  })

  test('历史名称及选项暂时消失时始终显示名称', () => {
    renderTable({ row: makeRow({ smelterName: '历史冶炼厂' }) })
    expect(getSmelterControl().value).toMatchObject({ label: '历史冶炼厂' })
    renderTable({ row: makeRow({ smelterName: '历史冶炼厂', smelterId: 'removed-id' }) })
    expect(getSmelterControl().value).toEqual({ label: '历史冶炼厂', value: 'removed-id' })
  })

  test('自由输入即使恰好等于后台 ID 也不猜关联', () => {
    const changed = renderTable({ versionId: '2.0', row: makeRow({ smelterName: '旧名称', smelterId: 'backend-2' }) })
    getSmelterControl('Input').onChange?.('backend-1')
    expect(changed.mock.lastCall?.[0][0]).toMatchObject({ smelterName: 'backend-1', smelterId: '' })
  })

  test('manual 建议选择按真实 onChange→onSelect 顺序写入名称及 ID', () => {
    const changed = renderTable({ versionId: '2.0' })
    const control = getSmelterControl('Input')
    control.onChange?.('backend-2')
    control.onSelect?.('backend-2')
    expect(changed.mock.lastCall?.[0][0]).toMatchObject({ smelterName: '同名冶炼厂', smelterId: 'backend-2' })
    const row = changed.mock.lastCall![0][0]
    renderTable({ versionId: '2.0', row })
    expect(getSmelterControl('Input').value).toBe('同名冶炼厂')
  })

  test('manual 重选当前建议不会留下中间输入值或丢失关联', () => {
    const changed = renderTable({ versionId: '2.0',
      row: makeRow({ smelterName: '同名冶炼厂', smelterId: 'backend-1' }) })
    const control = getSmelterControl('Input')
    control.onChange?.('backend-1')
    control.onSelect?.('backend-1')
    expect(changed.mock.lastCall?.[0][0]).toMatchObject({ smelterName: '同名冶炼厂', smelterId: 'backend-1' })
  })

  test('更新候选冶炼厂后使用新的选项与名称', () => {
    renderTable()
    const options = [{ value: 'new-id', label: '新冶炼厂' }]
    const changed = renderTable({ smelterOptions: options })
    const control = getSmelterControl()
    expect(control.options).toEqual(options)
    selectSmelter(control, options[0])
    expect(changed.mock.lastCall?.[0][0]).toMatchObject({ smelterName: '新冶炼厂', smelterId: 'new-id' })
  })

  test('只读保留名称且不会触发任何修改', () => {
    const changed = renderTable({ disabled: true, row: makeRow({ smelterName: '同名冶炼厂', smelterId: 'backend-1' }) })
    const control = getSmelterControl()
    expect(control.disabled).toBe(true)
    expect(control.value).toMatchObject({ label: '同名冶炼厂' })
    selectSmelter(control, OPTIONS[1])
    expect(changed).not.toHaveBeenCalled()
  })
})
