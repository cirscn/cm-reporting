import { getVersionDef, getVersions } from '@core/registry'
import { createEmptyFormData } from '@core/template/formDefaults'
import type { MineRow, SmelterRow } from '@core/types/tableRows'
import { useContext } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test } from 'vitest'

import { cirsGpmLegacyAdapter } from '../../public/adapters/cirsGpmLegacyAdapter'
import { parseSnapshot, stringifySnapshot } from '../../public/snapshot'

import { TemplateProvider } from './templateStore'
import { TemplateStoreContext, type TemplateStore } from './templateStoreContext'

type MineVersion = { templateType: 'emrt' | 'amrt'; versionId: string }
const MINE_VERSIONS = (['emrt', 'amrt'] as const).flatMap((templateType) =>
  getVersions(templateType)
    .filter((versionId) => getVersionDef(templateType, versionId).mineList.available)
    .map((versionId) => ({ templateType, versionId })),
)
const SELECTED_ID = 'smelter-selected'
const SAME_NAME_ID = 'smelter-same-name'
const SMELTER_NAME = '同名冶炼厂'

function CaptureStore({ onReady }: { onReady: (store: TemplateStore) => void }) {
  const store = useContext(TemplateStoreContext)
  if (!store) throw new Error('TemplateStoreContext 不可用')
  onReady(store)
  return null
}

function createStore(version: MineVersion, readOnly = false): TemplateStore {
  let captured: TemplateStore | null = null
  renderToStaticMarkup(
    <TemplateProvider {...version} readOnly={readOnly}>
      <CaptureStore onReady={(store) => { captured = store }} />
    </TemplateProvider>,
  )
  if (!captured) throw new Error('获取 TemplateStore 失败')
  return captured
}

function smelterRow(id: string, metal: string): SmelterRow {
  return { id, metal, smelterLookup: SMELTER_NAME, smelterName: SMELTER_NAME, smelterCountry: 'CN' }
}

function mineRow(options: { id: string; metal: string; smelterId?: string }): MineRow {
  return {
    ...options,
    smelterName: SMELTER_NAME,
    mineName: `矿场-${options.id}`,
    mineCountry: 'CN',
    mineProvince: '浙江',
    mineDistrict: '杭州',
    mineStreet: '矿区路',
    mineContactName: '联系人',
    comments: '已填写的备注',
  }
}

function seedStore(version: MineVersion, readOnly = false) {
  const store = createStore(version, readOnly)
  const form = createEmptyFormData(getVersionDef(version.templateType, version.versionId))
  const metal = version.templateType === 'emrt' ? 'cobalt' : 'silver'
  const keptMetal = version.templateType === 'emrt' ? 'mica' : 'aluminum'
  form.selectedMinerals = [metal, keptMetal]
  form.questions.Q1 = { [metal]: 'Yes', [keptMetal]: 'Yes' }
  const q2 = version.templateType === 'emrt' ? 'Yes' : 'None'
  form.questions.Q2 = { [metal]: q2, [keptMetal]: q2 }
  form.smelterList = [
    smelterRow(SELECTED_ID, metal), smelterRow(SAME_NAME_ID, metal),
    smelterRow('smelter-kept', keptMetal),
  ]
  form.mineList = [
    mineRow({ id: 'mine-a', metal, smelterId: SELECTED_ID }),
    mineRow({ id: 'mine-b', metal, smelterId: SELECTED_ID }),
    mineRow({ id: 'mine-same-name', metal, smelterId: SAME_NAME_ID }),
    mineRow({ id: 'mine-manual', metal }),
    mineRow({ id: 'mine-historical', metal, smelterId: 'historical-missing-id' }),
    mineRow({ id: 'mine-kept', metal: keptMetal, smelterId: 'smelter-kept' }),
  ]
  store.getState().setFormData(form)
  return { store, form, metal, keptMetal }
}

function expectCleared(rows: MineRow[], before: MineRow[], clearMetal: boolean) {
  expect(rows).toEqual(before.map((row) => ({
    ...row, metal: clearMetal ? '' : row.metal, smelterName: '', smelterId: '',
  })))
}

describe.each(MINE_VERSIONS)('$templateType $versionId 矿场金属门控', (version) => {
  const gatingQuestions = version.templateType === 'emrt' ? ['Q1', 'Q2'] : ['Q1']

  test.each(gatingQuestions)('%s 改 No 清空失效金属及关联，保留矿场信息且不会自动恢复', (question) => {
    const { store, form, metal } = seedStore(version)
    store.getState().setQuestionValue(question, metal, 'No')

    expectCleared(store.getState().mineList.slice(0, -1), form.mineList.slice(0, -1), true)
    expect(store.getState().mineList.at(-1)).toEqual(form.mineList.at(-1))
    expect(store.getState().smelterList).toEqual([form.smelterList.at(-1)])

    store.getState().setQuestionValue('Q1', metal, 'Yes')
    store.getState().setQuestionValue('Q2', metal, version.templateType === 'emrt' ? 'Yes' : 'None')
    store.getState().setSmelterList(form.smelterList)
    expectCleared(store.getState().mineList.slice(0, -1), form.mineList.slice(0, -1), true)
  })
})

describe.each(MINE_VERSIONS)('$templateType $versionId 冶炼厂关联清理', (version) => {
  test('删除冶炼厂按行 ID 清除多个矿场关联，同名其他厂、手输名称与无关行保留', () => {
    const { store, form } = seedStore(version)
    const remaining = form.smelterList.filter((row) => row.id !== SELECTED_ID)
    store.getState().setSmelterList(remaining)

    expectCleared(store.getState().mineList.slice(0, 2), form.mineList.slice(0, 2), false)
    expect(store.getState().mineList.slice(2)).toEqual(form.mineList.slice(2))

    store.getState().setSmelterList(form.smelterList)
    expectCleared(store.getState().mineList.slice(0, 2), form.mineList.slice(0, 2), false)
  })

  test('仅调整冶炼厂顺序时保留已有矿场关联', () => {
    const { store, form } = seedStore(version)
    store.getState().setSmelterList([...form.smelterList].reverse())
    expect(store.getState().mineList).toEqual(form.mineList)
  })

  test('同 ID 的冶炼厂改为另一金属时清除旧金属关联', () => {
    const { store, form, keptMetal } = seedStore(version)
    store.getState().setSmelterList(form.smelterList.map((row) =>
      row.id === SELECTED_ID ? { ...row, metal: keptMetal } : row,
    ))
    expectCleared(store.getState().mineList.slice(0, 2), form.mineList.slice(0, 2), false)
    expect(store.getState().mineList.slice(2)).toEqual(form.mineList.slice(2))
  })
})

describe.each(MINE_VERSIONS)('$templateType $versionId 既有矿场边界', (version) => {
  test('导入的历史失效矿种不因修改其他金属题目被顺带清理', () => {
    const { store, form, metal, keptMetal } = seedStore(version)
    form.questions.Q1 = { [metal]: 'No', [keptMetal]: 'Yes' }
    store.getState().setFormData(form)
    store.getState().setQuestionValue('Q1', keptMetal, 'Yes')
    expect(store.getState().mineList).toEqual(form.mineList)
  })

  test('只读模式下修改题目和删除冶炼厂均不改变矿场数据', () => {
    const { store, form, metal } = seedStore(version, true)
    store.getState().setQuestionValue('Q1', metal, 'No')
    store.getState().setSmelterList([])
    expect(store.getState().mineList).toEqual(form.mineList)
    expect(store.getState().smelterList).toEqual(form.smelterList)
    expect(store.getState().questions).toEqual(form.questions)
  })

  test('取消申报矿种仍删除该矿种的整行矿场', () => {
    const { store, form, keptMetal } = seedStore(version)
    store.getState().setSelectedMinerals([keptMetal])
    expect(store.getState().mineList).toEqual([form.mineList.at(-1)])
  })
})

describe.each(MINE_VERSIONS)('$templateType $versionId 矿场回传清理', (version) => {
  test.each(['question', 'smelter'] as const)('%s 清理后快照及 legacy 回传不带旧关联 ID', (action) => {
    const { store, metal } = seedStore(version)
    const before = parseSnapshot({ schemaVersion: 1, ...version, data: store.getState() })
    const legacy = cirsGpmLegacyAdapter.toExternalLoose(before)
    const { snapshot, ctx } = cirsGpmLegacyAdapter.toInternal(legacy)
    store.getState().setFormData(snapshot.data)

    if (action === 'question') store.getState().setQuestionValue('Q1', metal, 'No')
    else store.getState().setSmelterList(snapshot.data.smelterList.filter((row) => row.id !== SELECTED_ID))

    const cleaned = parseSnapshot({ schemaVersion: 1, ...version, data: store.getState() })
    const restored = parseSnapshot(JSON.parse(stringifySnapshot(cleaned)))
    expect(restored.data.mineList[0]?.smelterId).toBe('')
    expect(restored.data.mineList[0]?.smelterName).toBe('')
    const output = cirsGpmLegacyAdapter.toExternal(restored, ctx)
    expect(output.minList?.[0]?.smelterId).toBe('')
    expect(output.minList?.[0]?.smelterName).toBe('')
  })
})

describe.each(MINE_VERSIONS.filter((version) => version.templateType === 'amrt'))(
  'AMRT $versionId 保留本版本 Q2 规则',
  (version) => {
    test.each(['None', 'Unknown'])('Q2 改为 %s 不清理金属、冶炼厂和矿场', (answer) => {
      const { store, form, metal } = seedStore(version)
      store.getState().setQuestionValue('Q2', metal, answer)
      expect(store.getState().mineList).toEqual(form.mineList)
      expect(store.getState().smelterList).toEqual(form.smelterList)
    })
  },
)
