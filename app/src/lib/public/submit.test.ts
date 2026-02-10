/**
 * @file public/submit.test.ts
 * @description 保存/提交公共逻辑测试。
 */

import { describe, expect, test, vi } from 'vitest'

import type { ReportSnapshotV1 } from './snapshot'
import { submitReport } from './submit'

const snapshot: ReportSnapshotV1 = {
  schemaVersion: 1,
  templateType: 'cmrt',
  versionId: '6.5',
  locale: 'zh-CN',
  data: {
    companyInfo: {},
    selectedMinerals: [],
    customMinerals: [],
    questions: {},
    questionComments: {},
    companyQuestions: {},
    mineralsScope: [],
    smelterList: [],
    mineList: [],
    productList: [],
  },
}

describe('submitReport', () => {
  test('returns snapshot directly when validate passed', async () => {
    const navigate = vi.fn()

    const result = await submitReport({
      templateType: 'cmrt',
      versionId: '6.5',
      validate: async () => true,
      getSnapshot: () => snapshot,
      navigation: {
        state: { pathname: '/cmrt/6.5/declaration', params: {}, searchParams: new URLSearchParams() },
        actions: { navigate },
      },
    })

    expect(result).toBe(snapshot)
    expect(navigate).not.toHaveBeenCalled()
  })

  test('returns null and navigate to checker when validate failed', async () => {
    const navigate = vi.fn()

    const result = await submitReport({
      templateType: 'cmrt',
      versionId: '6.5',
      validate: async () => false,
      getSnapshot: () => snapshot,
      navigation: {
        state: { pathname: '/cmrt/6.5/declaration', params: {}, searchParams: new URLSearchParams() },
        actions: { navigate },
      },
    })

    expect(result).toBeNull()
    expect(navigate).toHaveBeenCalledWith('/cmrt/6.5/checker')
  })

  test('returns null when validate failed without navigation context', async () => {
    const result = await submitReport({
      templateType: 'cmrt',
      versionId: '6.5',
      validate: async () => false,
      getSnapshot: () => snapshot,
      navigation: null,
    })

    expect(result).toBeNull()
  })
})
