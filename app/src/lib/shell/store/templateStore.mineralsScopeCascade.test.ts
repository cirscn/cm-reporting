import { getVersionDef, getVersions } from '@core/registry'
import { createEmptyFormData } from '@core/template/formDefaults'
import type { MineRow, SmelterRow } from '@core/types/tableRows'
import { describe, expect, test } from 'vitest'

import { createTemplateStore } from './templateStoreFactory'

const REMOVED_MINERAL = 'aluminum'
const KEPT_MINERAL = 'silver'
const DYNAMIC_VERSIONS = getVersions('amrt').filter(
  (versionId) => getVersionDef('amrt', versionId).mineralScope.mode === 'dynamic-dropdown',
)
const FREE_TEXT_VERSIONS = getVersions('amrt').filter(
  (versionId) => getVersionDef('amrt', versionId).mineralScope.mode === 'free-text',
)

function smelterRow(metal: string): SmelterRow {
  return { id: `smelter-${metal}`, metal, smelterName: `厂-${metal}`, smelterLookup: `厂-${metal}`, smelterCountry: 'CN' }
}

function mineRow(metal: string): MineRow {
  return {
    id: `mine-${metal}`, metal, smelterName: `厂-${metal}`, smelterId: `smelter-${metal}`,
    mineName: `矿-${metal}`, mineCountry: 'CN', mineProvince: '浙江', mineDistrict: '杭州', comments: '保留详情',
  }
}

function seedStore(options: { versionId: string; readOnly?: boolean }) {
  const versionDef = getVersionDef('amrt', options.versionId)
  const store = createTemplateStore({ templateType: 'amrt', versionId: options.versionId, readOnly: options.readOnly ?? false })
  const data = createEmptyFormData(versionDef)
  if (versionDef.mineralScope.mode === 'dynamic-dropdown') data.selectedMinerals = [REMOVED_MINERAL, KEPT_MINERAL]
  data.questions.Q1 = { [REMOVED_MINERAL]: 'Yes', [KEPT_MINERAL]: 'Yes' }
  data.questions.Q2 = { [REMOVED_MINERAL]: 'None', [KEPT_MINERAL]: 'None' }
  data.questionComments.Q1 = { [REMOVED_MINERAL]: '移除备注', [KEPT_MINERAL]: '保留备注' }
  data.mineralsScope = [
    { id: 'scope-removed', mineral: REMOVED_MINERAL, reason: '原材料使用' },
    { id: 'scope-kept', mineral: KEPT_MINERAL, reason: '保留原因' },
    { id: 'scope-blank', mineral: '', reason: '' },
    { id: 'scope-historical', mineral: 'historical-metal', reason: '不受本次操作影响' },
  ]
  data.smelterList = [smelterRow(REMOVED_MINERAL), smelterRow(KEPT_MINERAL)]
  data.mineList = [mineRow(REMOVED_MINERAL), mineRow(KEPT_MINERAL)]
  data.productList = [{ id: 'product-kept', partNumber: 'P1', partName: '产品', remark: '保留产品' }]
  store.getState().setFormData(data)
  return { store, data, versionDef }
}

describe.each(DYNAMIC_VERSIONS)('AMRT %s 取消申报矿种', (versionId) => {
  test('同时删除矿种及纳入原因行，保留其他行与产品', () => {
    const { store, data } = seedStore({ versionId })
    store.getState().setSelectedMinerals([KEPT_MINERAL])
    const next = store.getState()
    expect(next.mineralsScope).toEqual(data.mineralsScope.filter((row) => row.mineral !== REMOVED_MINERAL))
    expect(next.smelterList).toEqual([data.smelterList.at(-1)])
    expect(next.mineList).toEqual([data.mineList.at(-1)])
    expect(next.productList).toEqual(data.productList)
  })

  test.each(['uncheck', 'clear-slot'] as const)('%s 删除失效的其他矿种及原因', (action) => {
    const { store, data } = seedStore({ versionId })
    data.selectedMinerals = [KEPT_MINERAL, 'other']
    data.customMinerals = ['自定义 A', '自定义 B']
    data.mineralsScope = [
      { id: 'scope-a', mineral: 'other-0', reason: '原因 A' },
      { id: 'scope-b', mineral: 'other-1', reason: '原因 B' },
      { id: 'scope-kept', mineral: KEPT_MINERAL, reason: '保留原因' },
    ]
    store.getState().setFormData(data)
    if (action === 'uncheck') store.getState().setSelectedMinerals([KEPT_MINERAL])
    else store.getState().setCustomMinerals(['自定义 A', ''])
    expect(store.getState().mineralsScope).toEqual(data.mineralsScope.filter(
      (row) => row.mineral === KEPT_MINERAL || (action === 'clear-slot' && row.mineral === 'other-0'),
    ))
  })

  test('只读时保留矿种及原因行', () => {
    const { store, data } = seedStore({ versionId, readOnly: true })
    store.getState().setSelectedMinerals([KEPT_MINERAL])
    expect(store.getState().mineralsScope).toEqual(data.mineralsScope)
  })
})

describe.each(FREE_TEXT_VERSIONS)('AMRT %s 手填矿种', (versionId) => {
  test('清空矿种名称时清除对应答案、原因、冶炼厂和矿场', () => {
    const { store, data, versionDef } = seedStore({ versionId })
    const index = versionDef.mineralScope.minerals.findIndex((mineral) => mineral.key === REMOVED_MINERAL)
    const names = [...data.customMinerals]
    names[index] = ' '
    store.getState().setCustomMinerals(names)
    const next = store.getState()
    expect(next.mineralsScope).toEqual(data.mineralsScope.filter((row) => row.mineral !== REMOVED_MINERAL))
    expect(next.questions.Q1).toEqual({ [REMOVED_MINERAL]: '', [KEPT_MINERAL]: 'Yes' })
    expect(next.questions.Q2).toEqual({ [REMOVED_MINERAL]: '', [KEPT_MINERAL]: 'None' })
    expect(next.questionComments.Q1).toEqual({ [REMOVED_MINERAL]: '', [KEPT_MINERAL]: '保留备注' })
    expect(next.smelterList).toEqual([data.smelterList.at(-1)])
    expect(next.mineList).toEqual([data.mineList.at(-1)])
    expect(next.productList).toEqual(data.productList)
  })

  test('修改为另一个非空名称时保留同一槽位的数据', () => {
    const { store, data, versionDef } = seedStore({ versionId })
    const index = versionDef.mineralScope.minerals.findIndex((mineral) => mineral.key === REMOVED_MINERAL)
    const names = [...data.customMinerals]
    names[index] = '新的矿种名称'
    store.getState().setCustomMinerals(names)
    expect(store.getState().mineralsScope).toEqual(data.mineralsScope)
    expect(store.getState().smelterList).toEqual(data.smelterList)
    expect(store.getState().mineList).toEqual(data.mineList)
  })
})
