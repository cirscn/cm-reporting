/**
 * @file lib/shell/store/templateStore.validation.test.tsx
 * @description TemplateStore 提交校验（zod + checker）一致性测试。
 */

import { getVersionDef } from '@core/registry'
import { runChecker } from '@core/rules/checker'
import { buildFormSchema, type FormData } from '@core/schema'
import { createEmptyFormData } from '@core/template/formDefaults'
import { useContext } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test } from 'vitest'

import { buildDataInput, buildRuleInput } from './ruleContext'
import { TemplateProvider } from './templateStore'
import { TemplateStoreContext, type TemplateStore } from './templateStoreContext'

const EMRT_VERSION_ID = '2.1'
const REQUIRED_SMELTER_MINERAL = 'nickel'

function CaptureStore({ onReady }: { onReady: (store: TemplateStore) => void }) {
  const store = useContext(TemplateStoreContext)
  if (!store) throw new Error('TemplateStoreContext is not available')
  onReady(store)
  return null
}

function createStoreForEmrtValidation(): TemplateStore {
  let captured: TemplateStore | null = null

  renderToStaticMarkup(
    <TemplateProvider templateType="emrt" versionId={EMRT_VERSION_ID}>
      <CaptureStore
        onReady={(store) => {
          captured = store
        }}
      />
    </TemplateProvider>,
  )

  if (!captured) throw new Error('failed to capture template store')
  return captured
}

function buildFilledEmrtFormData(options: { includeRequiredSmelter: boolean }): FormData {
  const versionDef = getVersionDef('emrt', EMRT_VERSION_ID)
  const formData = createEmptyFormData(versionDef)

  formData.selectedMinerals = [REQUIRED_SMELTER_MINERAL]
  formData.companyInfo.declarationScope = 'A'

  for (const field of versionDef.companyInfoFields) {
    if (field.required !== true) continue
    if (field.type === 'email') {
      formData.companyInfo[field.key] = `${field.key}@example.com`
      continue
    }
    if (field.type === 'date') {
      formData.companyInfo[field.key] = '2026-02-10'
      continue
    }
    formData.companyInfo[field.key] = 'filled'
  }

  for (const question of versionDef.questions) {
    const answer = question.options[0]?.value ?? 'Yes'
    const current = formData.questions[question.key]
    if (question.perMineral && typeof current === 'object') {
      current[REQUIRED_SMELTER_MINERAL] = answer
      continue
    }
    if (!question.perMineral && typeof current === 'string') {
      formData.questions[question.key] = answer
    }
  }

  for (const question of versionDef.companyQuestions) {
    const answer = question.options[0]?.value ?? 'Yes'
    const current = formData.companyQuestions[question.key]
    if (question.perMineral && typeof current === 'object') {
      current[REQUIRED_SMELTER_MINERAL] = answer
    } else if (!question.perMineral && typeof current === 'string') {
      formData.companyQuestions[question.key] = answer
    }

    if (!question.hasCommentField) continue
    const commentRequired = (question.commentRequiredWhen ?? []).includes(answer)
    if (!commentRequired) continue
    const commentKey = `${question.key}_comment`
    const commentField = formData.companyQuestions[commentKey]
    if (question.perMineral && typeof commentField === 'object') {
      commentField[REQUIRED_SMELTER_MINERAL] = 'comment'
    } else if (!question.perMineral && typeof commentField === 'string') {
      formData.companyQuestions[commentKey] = 'comment'
    }
  }

  if (options.includeRequiredSmelter) {
    formData.smelterList = [
      {
        id: 'smelter-1',
        metal: REQUIRED_SMELTER_MINERAL,
        smelterLookup: 'Example Smelter',
        smelterName: '',
        smelterCountry: '',
        comments: '',
      },
    ]
  } else {
    formData.smelterList = []
  }

  return formData
}

describe('TemplateStore validateForm', () => {
  test('returns false when zod passes but checker fails', async () => {
    const versionDef = getVersionDef('emrt', EMRT_VERSION_ID)
    const formData = buildFilledEmrtFormData({ includeRequiredSmelter: false })
    const schema = buildFormSchema(versionDef)

    expect(schema.safeParse(formData).success).toBe(true)

    const checkerErrors = runChecker(versionDef, buildRuleInput(formData), buildDataInput(formData))
    expect(
      checkerErrors.some(
        (error) =>
          error.fieldPath === `smelterList.${REQUIRED_SMELTER_MINERAL}`,
      ),
    ).toBe(true)

    const store = createStoreForEmrtValidation()
    store.getState().setFormData(formData)

    const valid = await store.getState().validateForm()
    expect(valid).toBe(false)
  })

  test('returns true when zod and checker both pass', async () => {
    const versionDef = getVersionDef('emrt', EMRT_VERSION_ID)
    const formData = buildFilledEmrtFormData({ includeRequiredSmelter: true })
    const schema = buildFormSchema(versionDef)

    expect(schema.safeParse(formData).success).toBe(true)
    expect(runChecker(versionDef, buildRuleInput(formData), buildDataInput(formData))).toHaveLength(0)

    const store = createStoreForEmrtValidation()
    store.getState().setFormData(formData)

    const valid = await store.getState().validateForm()
    expect(valid).toBe(true)
  })
})
