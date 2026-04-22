import { getVersionDef } from '@core/registry'
import { createEmptyFormData } from '@core/template/formDefaults'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test, vi } from 'vitest'

import { CompanyQuestionsForm } from './CompanyQuestionsForm'

vi.mock('@ui/i18n', () => ({
  useT: () => ({
    t: (key: string) => key,
    locale: 'zh-CN',
    i18n: { t: (key: string) => key },
  }),
}))

vi.mock('@ui/i18n/useT', () => ({
  useT: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (key === 'badges.companyQuestionsRequired') {
        return `required:${String(options?.condition ?? '')}`
      }
      if (key === 'conditions.always') {
        return 'always'
      }
      return key
    },
    locale: 'zh-CN',
    i18n: { t: (key: string) => key },
  }),
}))

describe('CompanyQuestionsForm required indicators', () => {
  test('shows required marker and highlight for required per-mineral company question', () => {
    const versionDef = getVersionDef('emrt', '2.1')
    const values = createEmptyFormData(versionDef).companyQuestions
    const questionC = versionDef.companyQuestions.find((question) => question.key === 'C')

    if (!questionC) {
      throw new Error('EMRT 2.1 question C is missing')
    }

    const html = renderToStaticMarkup(
      <CompanyQuestionsForm
        questions={[questionC]}
        questionDefs={versionDef.questions}
        values={values}
        onChange={() => undefined}
        minerals={[{ key: 'cobalt', labelKey: 'minerals.cobalt', label: 'Cobalt' }]}
        gatingByMineral={
          new Map([
            [
              'cobalt',
              {
                q2Enabled: true,
                laterQuestionsEnabled: true,
                companyQuestionsEnabled: true,
                smelterListRequired: true,
              },
            ],
          ])
        }
        showTitle={false}
      />
    )

    expect(html).toContain('company-question-required-mark')
    expect(html).toContain('field-required-empty')
  })

  test('does not show required marker for non-required per-mineral company question', () => {
    const versionDef = getVersionDef('emrt', '2.1')
    const values = createEmptyFormData(versionDef).companyQuestions
    const questionC = versionDef.companyQuestions.find((question) => question.key === 'C')

    if (!questionC) {
      throw new Error('EMRT 2.1 question C is missing')
    }

    const html = renderToStaticMarkup(
      <CompanyQuestionsForm
        questions={[questionC]}
        questionDefs={versionDef.questions}
        values={values}
        onChange={() => undefined}
        minerals={[{ key: 'cobalt', labelKey: 'minerals.cobalt', label: 'Cobalt' }]}
        gatingByMineral={
          new Map([
            [
              'cobalt',
              {
                q2Enabled: false,
                laterQuestionsEnabled: false,
                companyQuestionsEnabled: false,
                smelterListRequired: false,
              },
            ],
          ])
        }
        showTitle={false}
      />
    )

    expect(html).not.toContain('company-question-required-mark')
    expect(html).not.toContain('field-required-empty')
  })
})
