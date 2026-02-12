/**
 * @file lib/shell/store/templateStore.selectedMinerals.test.tsx
 * @description 申报范围取消矿种时的数据级联清理测试。
 */

import { getVersionDef } from '@core/registry'
import { createEmptyFormData } from '@core/template/formDefaults'
import type { MineRow, SmelterRow } from '@core/types/tableRows'
import { useContext } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test } from 'vitest'

import { TemplateProvider } from './templateStore'
import { TemplateStoreContext, type TemplateStore } from './templateStoreContext'

function CaptureStore({ onReady }: { onReady: (store: TemplateStore) => void }) {
  const store = useContext(TemplateStoreContext)
  if (!store) throw new Error('TemplateStoreContext 不可用')
  onReady(store)
  return null
}

function createTemplateStoreForTest(templateType: 'emrt' | 'amrt', versionId: string): TemplateStore {
  let captured: TemplateStore | null = null

  renderToStaticMarkup(
    <TemplateProvider templateType={templateType} versionId={versionId}>
      <CaptureStore
        onReady={(store) => {
          captured = store
        }}
      />
    </TemplateProvider>,
  )

  if (!captured) throw new Error('获取 TemplateStore 失败')
  return captured
}

function writePerMineralValue(
  target: Record<string, Record<string, string> | string>,
  key: string,
  mineralKey: string,
  value: string,
) {
  const current = target[key]
  if (!current || typeof current !== 'object') {
    throw new Error(`字段不是按矿种结构：${key}`)
  }
  current[mineralKey] = value
}

function readPerMineralValue(
  target: Record<string, Record<string, string> | string>,
  key: string,
  mineralKey: string,
) {
  const current = target[key]
  if (!current || typeof current !== 'object') {
    throw new Error(`字段不是按矿种结构：${key}`)
  }
  return current[mineralKey] ?? ''
}

function buildSmelterRow(id: string, metal: string): SmelterRow {
  return {
    id,
    metal,
    smelterLookup: `${metal}-lookup`,
    smelterName: `${metal}-name`,
    smelterCountry: 'CN',
  }
}

function buildMineRow(id: string, metal: string): MineRow {
  return {
    id,
    metal,
    smelterName: `${metal}-smelter`,
    mineName: `${metal}-mine`,
    mineCountry: 'CN',
    mineProvince: '',
    mineDistrict: '',
    comments: '',
  }
}

describe('TemplateStore 取消矿种级联清理', () => {
  test('EMRT 2.1 取消矿种后清空按矿种题目并删除关联列表行', () => {
    const removedMineral = 'nickel'
    const keptMineral = 'cobalt'
    const versionDef = getVersionDef('emrt', '2.1')
    const formData = createEmptyFormData(versionDef)
    formData.selectedMinerals = [removedMineral, keptMineral]

    versionDef.questions.forEach((question) => {
      if (!question.perMineral) return
      writePerMineralValue(
        formData.questions,
        question.key,
        removedMineral,
        `removed-${question.key}`,
      )
      writePerMineralValue(formData.questions, question.key, keptMineral, `kept-${question.key}`)
      writePerMineralValue(
        formData.questionComments,
        question.key,
        removedMineral,
        `removed-comment-${question.key}`,
      )
      writePerMineralValue(
        formData.questionComments,
        question.key,
        keptMineral,
        `kept-comment-${question.key}`,
      )
    })

    versionDef.companyQuestions.forEach((question) => {
      if (!question.perMineral) return
      writePerMineralValue(
        formData.companyQuestions,
        question.key,
        removedMineral,
        `removed-${question.key}`,
      )
      writePerMineralValue(
        formData.companyQuestions,
        question.key,
        keptMineral,
        `kept-${question.key}`,
      )
      if (!question.hasCommentField) return
      const commentKey = `${question.key}_comment`
      writePerMineralValue(
        formData.companyQuestions,
        commentKey,
        removedMineral,
        `removed-comment-${question.key}`,
      )
      writePerMineralValue(
        formData.companyQuestions,
        commentKey,
        keptMineral,
        `kept-comment-${question.key}`,
      )
    })

    formData.smelterList = [
      buildSmelterRow('smelter-removed', removedMineral),
      buildSmelterRow('smelter-kept', keptMineral),
    ]
    formData.mineList = [
      buildMineRow('mine-removed', removedMineral),
      buildMineRow('mine-kept', keptMineral),
    ]

    const store = createTemplateStoreForTest('emrt', '2.1')
    store.getState().setFormData(formData)
    store.getState().setSelectedMinerals([keptMineral])
    const next = store.getState()

    expect(next.selectedMinerals).toEqual([keptMineral])
    versionDef.questions.forEach((question) => {
      if (!question.perMineral) return
      expect(readPerMineralValue(next.questions, question.key, removedMineral)).toBe('')
      expect(readPerMineralValue(next.questions, question.key, keptMineral)).toBe(
        `kept-${question.key}`,
      )
      expect(readPerMineralValue(next.questionComments, question.key, removedMineral)).toBe('')
      expect(readPerMineralValue(next.questionComments, question.key, keptMineral)).toBe(
        `kept-comment-${question.key}`,
      )
    })

    versionDef.companyQuestions.forEach((question) => {
      if (!question.perMineral) return
      expect(readPerMineralValue(next.companyQuestions, question.key, removedMineral)).toBe('')
      expect(readPerMineralValue(next.companyQuestions, question.key, keptMineral)).toBe(
        `kept-${question.key}`,
      )
      if (!question.hasCommentField) return
      const commentKey = `${question.key}_comment`
      expect(readPerMineralValue(next.companyQuestions, commentKey, removedMineral)).toBe('')
      expect(readPerMineralValue(next.companyQuestions, commentKey, keptMineral)).toBe(
        `kept-comment-${question.key}`,
      )
    })

    expect(next.smelterList).toHaveLength(1)
    expect(next.smelterList[0]?.metal).toBe(keptMineral)
    expect(next.mineList).toHaveLength(1)
    expect(next.mineList[0]?.metal).toBe(keptMineral)
  })

  test('AMRT 1.3 取消矿种后清空按矿种题目并删除关联列表行', () => {
    const removedMineral = 'silver'
    const keptMineral = 'aluminum'
    const versionDef = getVersionDef('amrt', '1.3')
    const formData = createEmptyFormData(versionDef)
    formData.selectedMinerals = [removedMineral, keptMineral]

    versionDef.questions.forEach((question) => {
      if (!question.perMineral) return
      writePerMineralValue(
        formData.questions,
        question.key,
        removedMineral,
        `removed-${question.key}`,
      )
      writePerMineralValue(formData.questions, question.key, keptMineral, `kept-${question.key}`)
      writePerMineralValue(
        formData.questionComments,
        question.key,
        removedMineral,
        `removed-comment-${question.key}`,
      )
      writePerMineralValue(
        formData.questionComments,
        question.key,
        keptMineral,
        `kept-comment-${question.key}`,
      )
    })

    formData.smelterList = [
      buildSmelterRow('smelter-removed', removedMineral),
      buildSmelterRow('smelter-kept', keptMineral),
    ]
    formData.mineList = [
      buildMineRow('mine-removed', removedMineral),
      buildMineRow('mine-kept', keptMineral),
    ]

    const store = createTemplateStoreForTest('amrt', '1.3')
    store.getState().setFormData(formData)
    store.getState().setSelectedMinerals([keptMineral])
    const next = store.getState()

    expect(next.selectedMinerals).toEqual([keptMineral])
    versionDef.questions.forEach((question) => {
      if (!question.perMineral) return
      expect(readPerMineralValue(next.questions, question.key, removedMineral)).toBe('')
      expect(readPerMineralValue(next.questions, question.key, keptMineral)).toBe(
        `kept-${question.key}`,
      )
      expect(readPerMineralValue(next.questionComments, question.key, removedMineral)).toBe('')
      expect(readPerMineralValue(next.questionComments, question.key, keptMineral)).toBe(
        `kept-comment-${question.key}`,
      )
    })

    expect(next.smelterList).toHaveLength(1)
    expect(next.smelterList[0]?.metal).toBe(keptMineral)
    expect(next.mineList).toHaveLength(1)
    expect(next.mineList[0]?.metal).toBe(keptMineral)
  })

  test('AMRT 1.3 取消 other 时会清理 other-* 的题目与列表数据', () => {
    const versionDef = getVersionDef('amrt', '1.3')
    const formData = createEmptyFormData(versionDef)
    formData.selectedMinerals = ['aluminum', 'other']
    formData.customMinerals = ['Custom Metal A', 'Custom Metal B']

    versionDef.questions.forEach((question) => {
      if (!question.perMineral) return
      writePerMineralValue(formData.questions, question.key, 'other-0', `kept-${question.key}-0`)
      writePerMineralValue(formData.questions, question.key, 'other-1', `removed-${question.key}-1`)
      writePerMineralValue(formData.questions, question.key, 'aluminum', `kept-${question.key}-base`)
      writePerMineralValue(
        formData.questionComments,
        question.key,
        'other-0',
        `kept-comment-${question.key}-0`,
      )
      writePerMineralValue(
        formData.questionComments,
        question.key,
        'other-1',
        `removed-comment-${question.key}-1`,
      )
      writePerMineralValue(
        formData.questionComments,
        question.key,
        'aluminum',
        `kept-comment-${question.key}-base`,
      )
    })

    formData.smelterList = [
      buildSmelterRow('smelter-other-0', 'other-0'),
      buildSmelterRow('smelter-other-1', 'other-1'),
      buildSmelterRow('smelter-aluminum', 'aluminum'),
    ]
    formData.mineList = [
      buildMineRow('mine-other-0', 'other-0'),
      buildMineRow('mine-other-1', 'other-1'),
      buildMineRow('mine-aluminum', 'aluminum'),
    ]

    const store = createTemplateStoreForTest('amrt', '1.3')
    store.getState().setFormData(formData)
    store.getState().setSelectedMinerals(['aluminum'])
    const next = store.getState()

    expect(next.selectedMinerals).toEqual(['aluminum'])
    versionDef.questions.forEach((question) => {
      if (!question.perMineral) return
      expect(readPerMineralValue(next.questions, question.key, 'other-0')).toBe('')
      expect(readPerMineralValue(next.questions, question.key, 'other-1')).toBe('')
      expect(readPerMineralValue(next.questions, question.key, 'aluminum')).toBe(
        `kept-${question.key}-base`,
      )
      expect(readPerMineralValue(next.questionComments, question.key, 'other-0')).toBe('')
      expect(readPerMineralValue(next.questionComments, question.key, 'other-1')).toBe('')
      expect(readPerMineralValue(next.questionComments, question.key, 'aluminum')).toBe(
        `kept-comment-${question.key}-base`,
      )
    })

    expect(next.smelterList.map((row) => row.metal)).toEqual(['aluminum'])
    expect(next.mineList.map((row) => row.metal)).toEqual(['aluminum'])
  })

  test('AMRT 1.3 在 other 保持勾选时清空自定义槽位会清理对应 other-* 数据', () => {
    const versionDef = getVersionDef('amrt', '1.3')
    const formData = createEmptyFormData(versionDef)
    formData.selectedMinerals = ['aluminum', 'other']
    formData.customMinerals = ['Custom Metal A', 'Custom Metal B']

    versionDef.questions.forEach((question) => {
      if (!question.perMineral) return
      writePerMineralValue(formData.questions, question.key, 'other-0', `kept-${question.key}-0`)
      writePerMineralValue(formData.questions, question.key, 'other-1', `removed-${question.key}-1`)
      writePerMineralValue(formData.questions, question.key, 'aluminum', `kept-${question.key}-base`)
      writePerMineralValue(
        formData.questionComments,
        question.key,
        'other-0',
        `kept-comment-${question.key}-0`,
      )
      writePerMineralValue(
        formData.questionComments,
        question.key,
        'other-1',
        `removed-comment-${question.key}-1`,
      )
      writePerMineralValue(
        formData.questionComments,
        question.key,
        'aluminum',
        `kept-comment-${question.key}-base`,
      )
    })

    formData.smelterList = [
      buildSmelterRow('smelter-other-0', 'other-0'),
      buildSmelterRow('smelter-other-1', 'other-1'),
      buildSmelterRow('smelter-aluminum', 'aluminum'),
    ]
    formData.mineList = [
      buildMineRow('mine-other-0', 'other-0'),
      buildMineRow('mine-other-1', 'other-1'),
      buildMineRow('mine-aluminum', 'aluminum'),
    ]

    const store = createTemplateStoreForTest('amrt', '1.3')
    store.getState().setFormData(formData)
    store.getState().setCustomMinerals(['Custom Metal A', ''])
    const next = store.getState()

    expect(next.selectedMinerals).toEqual(['aluminum', 'other'])
    expect(next.customMinerals).toEqual(['Custom Metal A', ''])
    versionDef.questions.forEach((question) => {
      if (!question.perMineral) return
      expect(readPerMineralValue(next.questions, question.key, 'other-0')).toBe(
        `kept-${question.key}-0`,
      )
      expect(readPerMineralValue(next.questions, question.key, 'other-1')).toBe('')
      expect(readPerMineralValue(next.questions, question.key, 'aluminum')).toBe(
        `kept-${question.key}-base`,
      )
      expect(readPerMineralValue(next.questionComments, question.key, 'other-0')).toBe(
        `kept-comment-${question.key}-0`,
      )
      expect(readPerMineralValue(next.questionComments, question.key, 'other-1')).toBe('')
      expect(readPerMineralValue(next.questionComments, question.key, 'aluminum')).toBe(
        `kept-comment-${question.key}-base`,
      )
    })

    expect(next.smelterList.map((row) => row.metal)).toEqual(['other-0', 'aluminum'])
    expect(next.mineList.map((row) => row.metal)).toEqual(['other-0', 'aluminum'])
  })
})
