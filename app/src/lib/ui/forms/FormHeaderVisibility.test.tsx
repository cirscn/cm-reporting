import { getVersionDef } from '@core/registry'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test, vi } from 'vitest'

import { CompanyInfoForm } from './CompanyInfoForm'
import { CompanyQuestionsForm } from './CompanyQuestionsForm'
import { MineralScopeForm } from './MineralScopeForm'
import { QuestionMatrixForm } from './QuestionMatrixForm'

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
      if (key === 'badges.questionRange') {
        return `${options?.from}-${options?.to}`
      }
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

function getQuestionVersionDef() {
  const candidates = [
    ['cmrt', '6.5'],
    ['cmrt', '6.31'],
    ['emrt', '2.1'],
    ['amrt', '1.3'],
  ] as const

  for (const [templateType, versionId] of candidates) {
    const versionDef = getVersionDef(templateType, versionId)
    if (versionDef.questions.length > 0 && versionDef.companyQuestions.length > 0) {
      return versionDef
    }
  }

  throw new Error('No template version with question matrix and company questions found')
}

describe('form header visibility', () => {
  test('replaces company info card title with inline section label when showTitle=false', () => {
    const versionDef = getVersionDef('cmrt', '6.5')
    const html = renderToStaticMarkup(
      <CompanyInfoForm versionDef={versionDef} values={{}} onChange={() => undefined} showTitle={false} />
    )

    expect(html).not.toContain('ant-card-head')
    expect(html).toContain('sections.companyInfo')
    expect(html).toContain(versionDef.companyInfoFields[0]?.labelKey ?? '')
  })

  test('renders company info fields in single-column horizontal layout when configured', () => {
    const versionDef = getVersionDef('cmrt', '6.5')
    const html = renderToStaticMarkup(
      <CompanyInfoForm
        versionDef={versionDef}
        values={{}}
        onChange={() => undefined}
        fieldLayout="horizontal"
        fieldSpan={24}
        labelWidth={220}
      />
    )

    expect(html).toContain('ant-col-md-24')
    expect(html).toContain('ant-form-item-horizontal')
    expect(html).toContain('flex:0 0 220px')
  })

  test('hides mineral scope card title when showTitle=false and keeps scope content rendered', () => {
    const versionDef = getVersionDef('amrt', '1.3')
    const html = renderToStaticMarkup(
      <MineralScopeForm
        versionDef={versionDef}
        selectedMinerals={['cobalt']}
        onMineralsChange={() => undefined}
        customMinerals={[]}
        onCustomMineralsChange={() => undefined}
        showTitle={false}
      />
    )

    expect(html).not.toContain('sections.mineralsScope')
    expect(html).toContain(versionDef.mineralScope.minerals[0]?.labelKey ?? '')
  })

  test('hides company questions card title when showTitle=false and keeps questions rendered', () => {
    const versionDef = getQuestionVersionDef()
    const html = renderToStaticMarkup(
      <CompanyQuestionsForm
        questions={versionDef.companyQuestions}
        questionDefs={versionDef.questions}
        values={{}}
        onChange={() => undefined}
        minerals={versionDef.mineralScope.minerals}
        gatingCondition={versionDef.gating.companyQuestionsGating}
        requiredByQuestion={new Map([[versionDef.companyQuestions[0]?.key ?? '', true]])}
        showTitle={false}
      />
    )

    expect(html).not.toContain('sections.companyQuestions')
    expect(html).toContain(versionDef.companyQuestions[0]?.labelKey ?? '')
  })

  test('renders question matrix with lightweight section header when headerMode=section', () => {
    const versionDef = getQuestionVersionDef()
    const html = renderToStaticMarkup(
      <QuestionMatrixForm
        versionDef={versionDef}
        values={{}}
        commentValues={{}}
        onChange={() => undefined}
        onCommentChange={() => undefined}
        headerMode="section"
      />
    )

    expect(html).toContain('sections.questionMatrix')
    expect(html).toContain('sections.questionMatrixHint')
    expect(html).toContain(versionDef.questions[0]?.labelKey ?? '')
    expect(html).not.toContain('ant-card-head')
  })
})
