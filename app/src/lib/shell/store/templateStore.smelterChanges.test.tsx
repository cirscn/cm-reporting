import { getVersionDef, getVersions } from '@core/registry'
import { createEmptyFormData } from '@core/template/formDefaults'
import type { MineRow } from '@core/types/tableRows'
import { useContext } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test } from 'vitest'

import { parseSnapshot, stringifySnapshot } from '../../public/snapshot'

import { TemplateProvider } from './templateStore'
import { TemplateStoreContext, type TemplateStore } from './templateStoreContext'

type MineVersion = { templateType: 'amrt' | 'emrt'; versionId: string }
const VERSIONS = (['amrt', 'emrt'] as const).flatMap((templateType) =>
  getVersions(templateType).filter((versionId) => getVersionDef(templateType, versionId).mineList.available)
    .map((versionId) => ({ templateType, versionId })),
)
const SMELTER_ID = 'selected-smelter'
const METAL = 'silver'
const NAME = '选中的冶炼厂'

function Capture({ onReady }: { onReady: (store: TemplateStore) => void }) {
  const store = useContext(TemplateStoreContext)
  if (!store) throw new Error('未取得表单状态')
  onReady(store)
  return null
}

function seed(options: { version: MineVersion; withoutId?: boolean; readOnly?: boolean }) {
  const { version, withoutId, readOnly = false } = options
  let captured: TemplateStore | null = null
  renderToStaticMarkup(<TemplateProvider {...version} readOnly={readOnly}>
    <Capture onReady={(store) => { captured = store }} />
  </TemplateProvider>)
  if (!captured) throw new Error('未取得表单状态')
  const store: TemplateStore = captured
  const versionDef = getVersionDef(version.templateType, version.versionId)
  const form = createEmptyFormData(versionDef)
  form.smelterList = [{
    id: SMELTER_ID, metal: METAL, smelterLookup: NAME, smelterName: NAME,
    smelterCountry: 'China', smelterNumber: 'CID-selected', smelterIdentification: 'CID-selected',
    sourceId: 'source-selected', smelterStreet: '厂区路', smelterCity: '杭州', smelterState: '浙江',
  }]
  form.mineList = [{
    id: 'mine-independent', metal: METAL, smelterName: NAME,
    smelterId: withoutId ? undefined : SMELTER_ID,
    mineName: '已经填写的矿场', mineCountry: 'China', mineProvince: '浙江', mineDistrict: '杭州',
    mineStreet: '矿区路', comments: '已有备注',
  }]
  store.getState().setFormData(form)
  return { store, form, versionDef }
}

function expectCleared(actual: MineRow, before: MineRow) {
  expect(actual).toEqual({ ...before, smelterName: '', smelterId: '' })
}

describe.each(VERSIONS)('$templateType $versionId 冶炼厂编辑联动', (version) => {
  test('有效名称清空后清除矿场关联，保存快照不会恢复旧值', () => {
    const { store, form } = seed({ version })
    store.getState().setSmelterList(form.smelterList.map((row) => ({
      ...row, smelterLookup: '', smelterName: '',
    })))
    expectCleared(store.getState().mineList[0], form.mineList[0])
    const snapshot = parseSnapshot({ schemaVersion: 1, ...version, data: store.getState() })
    const restored = parseSnapshot(JSON.parse(stringifySnapshot(snapshot)))
    expectCleared(restored.data.mineList[0], form.mineList[0])
    store.getState().setSmelterList(form.smelterList)
    expectCleared(store.getState().mineList[0], form.mineList[0])
  })

  test('同 ID 同金属改名同步矿场名称，保留关联和矿场详情', () => {
    const { store, form } = seed({ version })
    store.getState().setSmelterList(form.smelterList.map((row) => ({
      ...row, smelterLookup: '新厂名', smelterName: '新厂名',
    })))
    expect(store.getState().mineList[0]).toEqual({ ...form.mineList[0], smelterName: '新厂名' })
  })

  test('没有 ID 的旧名称仅在下拉模式且全部同名候选移除时清空', () => {
    const { store, form, versionDef } = seed({ version, withoutId: true })
    store.getState().setSmelterList([])
    if (versionDef.mineList.smelterNameMode === 'dropdown') {
      expectCleared(store.getState().mineList[0], form.mineList[0])
      return
    }
    expect(store.getState().mineList).toEqual(form.mineList)
  })

  test('同名另一厂仍在时保留没有 ID 的名称，不猜测或补关联 ID', () => {
    const { store, form } = seed({ version, withoutId: true })
    const other = { ...form.smelterList[0], id: 'same-name-other' }
    store.getState().setSmelterList([...form.smelterList, other])
    store.getState().setSmelterList([other])
    expect(store.getState().mineList).toEqual(form.mineList)
  })

  test('删除另一金属的同名厂不清理无关历史值', () => {
    const { store, form } = seed({ version, withoutId: true })
    const other = { ...form.smelterList[0], id: 'other-metal', metal: 'zinc' }
    form.mineList.push({ ...form.mineList[0], id: 'historical', smelterName: '历史名称' })
    form.smelterList.push(other)
    store.getState().setFormData(form)
    store.getState().setSmelterList([form.smelterList[0]])
    expect(store.getState().mineList).toEqual(form.mineList)
  })

  test.each(['无有效名称', '历史显示名称'])('仅修改另一厂的备注不修正未编辑厂的%s关联', (scenario) => {
    const { store, form } = seed({ version })
    if (scenario === '无有效名称') {
      form.smelterList[0].smelterLookup = ''
      form.smelterList[0].smelterName = ''
    }
    form.mineList[0].smelterName = '原始历史名称'
    const other = { ...form.smelterList[0], id: 'another-smelter', smelterLookup: '另一厂', smelterName: '另一厂' }
    form.smelterList.push(other)
    store.getState().setFormData(form)
    const originalMineList = store.getState().mineList
    store.getState().setSmelterList([form.smelterList[0], { ...other, comments: '只编辑此厂' }])
    expect(store.getState().mineList).toEqual(form.mineList)
    expect(store.getState().mineList).toBe(originalMineList)
    store.getState().setSmelterList([...store.getState().smelterList].reverse())
    expect(store.getState().mineList).toBe(originalMineList)
  })

  test('只读模式下清空和改名均不改变数据', () => {
    const { store, form } = seed({ version, readOnly: true })
    store.getState().setSmelterList([])
    store.getState().setSmelterList(form.smelterList.map((row) => ({ ...row, smelterName: '新厂名' })))
    expect(store.getState().smelterList).toEqual(form.smelterList)
    expect(store.getState().mineList).toEqual(form.mineList)
  })
})

describe.each(VERSIONS.filter((version) => !getVersionDef(version.templateType, version.versionId).smelterList.hasLookup))(
  '$templateType $versionId 手填名称清空',
  (version) => {
    test('只清空可见厂名时清除导入的隐藏查找名称和矿场关联', () => {
      const { store, form } = seed({ version })
      store.getState().setSmelterList(form.smelterList.map((row) => ({ ...row, smelterName: '' })))
      expect(store.getState().smelterList[0]).toEqual({ ...form.smelterList[0], smelterName: '', smelterLookup: '' })
      expectCleared(store.getState().mineList[0], form.mineList[0])
    })
  },
)

describe.each(VERSIONS.filter((version) => getVersionDef(version.templateType, version.versionId).smelterList.hasLookup))(
  '$templateType $versionId 查找列清空联动',
  (version) => {
    test('只清空查找列也清除旧自动字段和矿场关联', () => {
      const { store, form } = seed({ version })
      store.getState().setSmelterList(form.smelterList.map((row) => ({ ...row, smelterLookup: '' })))
      expect(store.getState().smelterList[0]).toMatchObject({
        id: SMELTER_ID, metal: METAL, smelterLookup: '', smelterName: '', smelterCountry: '',
        smelterNumber: '', smelterIdentification: '', sourceId: '', smelterStreet: '',
        smelterCity: '', smelterState: '',
      })
      expectCleared(store.getState().mineList[0], form.mineList[0])
    })

    test('清空未列出厂的自定义名称时不保留关联', () => {
      const { store, form } = seed({ version })
      form.smelterList[0].smelterLookup = 'Smelter not listed'
      store.getState().setFormData(form)
      store.getState().setSmelterList(form.smelterList.map((row) => ({ ...row, smelterName: '' })))
      expectCleared(store.getState().mineList[0], form.mineList[0])
    })

    test('仅有空格的厂名和查找名称不能保留为有效关联', () => {
      const { store, form } = seed({ version })
      store.getState().setSmelterList(form.smelterList.map((row) => ({
        ...row, smelterName: '   ', smelterLookup: '   ',
      })))
      expectCleared(store.getState().mineList[0], form.mineList[0])
    })
  },
)
