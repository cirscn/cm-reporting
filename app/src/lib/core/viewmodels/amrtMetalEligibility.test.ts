import { getVersionDef, getVersions } from '@core/registry'
import type { QuestionAnswers } from '@core/rules/gating'
import { createEmptyFormData } from '@core/template/formDefaults'
import { describe, expect, test } from 'vitest'

import { buildMineListViewModel, buildSmelterListViewModel } from './pages'

const DECLARED_MINERAL = 'aluminum'
const OTHER_MINERAL = 'silver'
const NON_DISCLOSURE_ANSWERS = ['No', 'Unknown', 'Not declaring', '']

function buildViewModels(options: {
  versionId: string; questions: QuestionAnswers; selectedMinerals?: string[]; customMinerals?: string[]
}) {
  const versionDef = getVersionDef('amrt', options.versionId)
  const defaults = createEmptyFormData(versionDef)
  const input = {
    versionDef, questionAnswers: options.questions,
    selectedMinerals: options.selectedMinerals ?? [DECLARED_MINERAL, OTHER_MINERAL],
    customMinerals: options.customMinerals ?? defaults.customMinerals,
  }
  return [
    buildSmelterListViewModel({ ...input, templateType: 'amrt' }),
    buildMineListViewModel({ ...input, smelterList: [] }),
  ]
}

describe.each(getVersions('amrt'))('AMRT %s 冶炼厂与矿场金属范围', (versionId) => {
  test.each(NON_DISCLOSURE_ANSWERS)('Q1=%s 的矿种不出现在下拉中', (answer) => {
    const views = buildViewModels({ versionId, questions: { Q1: { [DECLARED_MINERAL]: 'Yes', [OTHER_MINERAL]: answer } } })
    views.forEach((view) => expect(view.availableMetals.map((mineral) => mineral.key)).toEqual([DECLARED_MINERAL]))
  })

  test('Q2 调查比例为 None 不影响 Q1=Yes 的矿种', () => {
    const views = buildViewModels({
      versionId, questions: { Q1: { [DECLARED_MINERAL]: 'Yes' }, Q2: { [DECLARED_MINERAL]: 'None' } },
    })
    views.forEach((view) => expect(view.availableMetals.map((mineral) => mineral.key)).toEqual([DECLARED_MINERAL]))
  })

  test('所有 Q1 未回答时没有可选金属', () => {
    const views = buildViewModels({ versionId, questions: {} })
    views.forEach((view) => expect(view.availableMetals).toEqual([]))
  })

  test('只有申报中的矿种能在 Q1=Yes 时出现在下拉', () => {
    const versionDef = getVersionDef('amrt', versionId)
    const customMinerals = createEmptyFormData(versionDef).customMinerals.map((name, index) =>
      versionDef.mineralScope.minerals[index].key === OTHER_MINERAL ? '' : name,
    )
    const views = buildViewModels({
      versionId, selectedMinerals: [DECLARED_MINERAL], customMinerals,
      questions: { Q1: { [DECLARED_MINERAL]: 'Yes', [OTHER_MINERAL]: 'Yes' } },
    })
    views.forEach((view) => expect(view.availableMetals.map((mineral) => mineral.key)).toEqual([DECLARED_MINERAL]))
  })
})
