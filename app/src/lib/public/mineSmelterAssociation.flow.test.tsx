import fs from 'node:fs'

import { getVersionDef, getVersions } from '@core/registry'
import type { TemplateType } from '@core/registry/types'
import type { MineRow, SmelterRow } from '@core/types/tableRows'
import { buildMineListViewModel } from '@core/viewmodels/pages'
import { MineListTable } from '@ui/tables/MineListTable'
import type { ColumnsType } from 'antd/es/table'
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test, vi } from 'vitest'

import { cirsGpmLegacyAdapter } from './adapters/cirsGpmLegacyAdapter'
import type { CirsGpmLegacyReport } from './adapters/cirsGpmLegacyAdapter/types'
import { parseSnapshot, stringifySnapshot } from './snapshot'
import type { ReportSnapshotV1 } from './snapshot'

interface ControlProps {
  labelInValue?: boolean
  onChange?: (value: unknown) => void
  onSelect?: (value: string) => void
}

const captured = vi.hoisted(() => ({
  columns: [] as ColumnsType<MineRow>,
  control: undefined as ControlProps | undefined,
}))

vi.mock('@ui/i18n/useT', () => ({
  useT: () => ({ t: (key: string) => key, locale: 'zh-CN' }),
}))

vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>()
  const captureControl = (props: ControlProps) => {
    captured.control = props
    return null
  }
  return {
    ...actual,
    Table: (props: { columns: ColumnsType<MineRow> }) => {
      captured.columns = props.columns
      return null
    },
    Select: captureControl,
    AutoComplete: captureControl,
  }
})

const versions = (['amrt', 'emrt'] as const).flatMap((templateType) =>
  getVersions(templateType)
    .filter((versionId) => getVersionDef(templateType, versionId).mineList.available)
    .map((versionId) => ({ templateType, versionId })),
)
const NAME = '同名冶炼厂'
const FIRST_ID = 'backend-a'
const SECOND_ID = 'backend-b'

function loadLegacy(version: { templateType: TemplateType; versionId: string }) {
  const fixture = new URL(`./adapters/cirsGpmLegacyAdapter/__fixtures__/${version.templateType}.json`, import.meta.url)
  const legacy = JSON.parse(fs.readFileSync(fixture, 'utf8')) as CirsGpmLegacyReport
  legacy.name = `RMI_${version.templateType.toUpperCase()}_${version.versionId}`
  legacy.minList![0].smelterName = NAME
  legacy.minList![0].smelterId = FIRST_ID
  return legacy
}

function buildRows(metal: string): SmelterRow[] {
  return [FIRST_ID, SECOND_ID].map((id) => ({
    id,
    metal,
    smelterName: NAME,
    smelterLookup: NAME,
    smelterCountry: 'China',
    smelterNumber: `CID-${id}`,
  }))
}

function renderSmelterControl(snapshot: ReportSnapshotV1, row: MineRow): ControlProps {
  const versionDef = getVersionDef(snapshot.templateType, snapshot.versionId)
  const viewModel = buildMineListViewModel({
    versionDef,
    questionAnswers: snapshot.data.questions,
    selectedMinerals: snapshot.data.selectedMinerals,
    customMinerals: snapshot.data.customMinerals,
    smelterList: snapshot.data.smelterList,
  })
  renderToStaticMarkup(
    <MineListTable
      config={versionDef.mineList}
      availableMetals={versionDef.mineralScope.minerals}
      rows={snapshot.data.mineList}
      onChange={(rows) => { snapshot.data.mineList = rows }}
      smelterOptions={viewModel.smelterOptions}
      smelterOptionsByMetal={viewModel.smelterOptionsByMetal}
    />,
  )
  const column = captured.columns.find((candidate) => candidate.key === 'smelterName')
  if (!column || !('render' in column) || !column.render) throw new Error('没有冶炼厂选择列')
  captured.control = undefined
  renderToStaticMarkup(column.render(row.smelterName, row, 0) as ReactNode)
  if (!captured.control) throw new Error('没有冶炼厂选择控件')
  return captured.control
}

function pick(control: ControlProps, id: string) {
  const value = control.labelInValue ? { value: id, label: NAME } : id
  control.onChange?.(value)
  control.onSelect?.(id)
}

describe.each(versions)('$templateType $versionId 页面到回传数据的冶炼厂关联', (version) => {
  test('不同矿场行可以关联同一金属下的同一冶炼厂，行 ID 保持独立', () => {
    const { snapshot, ctx } = cirsGpmLegacyAdapter.toInternal(loadLegacy(version))
    const first = snapshot.data.mineList[0]
    const second = { ...first, id: 'second-mine', smelterName: '', smelterId: '' }
    snapshot.data.mineList.push(second)
    snapshot.data.smelterList = buildRows(first.metal)

    pick(renderSmelterControl(snapshot, second), FIRST_ID)

    const restored = parseSnapshot(JSON.parse(stringifySnapshot(snapshot)))
    expect(restored.data.mineList.map((row) => row.id)).toEqual([first.id, second.id])
    expect(restored.data.mineList.map((row) => row.smelterId)).toEqual([FIRST_ID, FIRST_ID])
    expect(restored.data.mineList.map((row) => row.metal)).toEqual([first.metal, first.metal])
    const output = cirsGpmLegacyAdapter.toExternal(restored, ctx)
    expect(output.minList).toHaveLength(2)
    expect(output.minList!.map((row) => row.smelterId)).toEqual([FIRST_ID, FIRST_ID])
  })

  test('同名改选另一个 ID，经过快照保存后回传新 ID', () => {
    const { snapshot, ctx } = cirsGpmLegacyAdapter.toInternal(loadLegacy(version))
    const row = snapshot.data.mineList[0]
    snapshot.data.smelterList = buildRows(row.metal)

    pick(renderSmelterControl(snapshot, row), SECOND_ID)

    const restored = parseSnapshot(JSON.parse(stringifySnapshot(snapshot)))
    expect(restored.data.mineList[0]).toMatchObject({ smelterName: NAME, smelterId: SECOND_ID })
    expect(cirsGpmLegacyAdapter.toExternal(restored, ctx).minList![0]).toMatchObject({
      smelterName: NAME,
      smelterId: SECOND_ID,
    })
  })

  test('新增行选择后，精确回传和独立导出都带所选 ID；清空不恢复旧 ID', () => {
    const { snapshot, ctx } = cirsGpmLegacyAdapter.toInternal(loadLegacy(version))
    const newRow = { ...snapshot.data.mineList[0], id: 'new-mine', smelterName: '', smelterId: undefined }
    snapshot.data.mineList.push(newRow)
    snapshot.data.smelterList = buildRows(newRow.metal)

    pick(renderSmelterControl(snapshot, newRow), SECOND_ID)

    const restored = parseSnapshot(JSON.parse(stringifySnapshot(snapshot)))
    for (const output of [
      cirsGpmLegacyAdapter.toExternal(restored, ctx),
      cirsGpmLegacyAdapter.toExternalLoose(restored),
    ]) {
      expect(output.minList![1]).toMatchObject({ smelterName: NAME, smelterId: SECOND_ID })
    }
    const control = renderSmelterControl(snapshot, snapshot.data.mineList[1])
    control.onChange?.(control.labelInValue ? undefined : '')
    expect(snapshot.data.mineList[1].smelterId).toBe('')
    expect(cirsGpmLegacyAdapter.toExternal(snapshot, ctx).minList![1]).not.toHaveProperty('smelterId')
  })
})
