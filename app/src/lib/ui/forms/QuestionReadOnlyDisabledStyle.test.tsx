import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { getVersionDef } from '@core/registry'
import { ConfigProvider } from 'antd'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test, vi } from 'vitest'

import { CompanyInfoForm } from './CompanyInfoForm'
import { CompanyQuestionsForm } from './CompanyQuestionsForm'
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
    t: (key: string) => key,
    locale: 'zh-CN',
    i18n: { t: (key: string) => key },
  }),
}))

describe('ReadOnly disabled style', () => {
  test('keeps disabled controls in readOnly forms', () => {
    const versionDef = getVersionDef('cmrt', '6.6')
    const html = renderToStaticMarkup(
      <ConfigProvider componentDisabled>
        <>
          <CompanyInfoForm
            versionDef={versionDef}
            values={{
              companyName: 'Readable company',
              declarationScope: 'A',
              contactName: 'Readable contact',
              authorizationDate: '2026-01-01',
            }}
            onChange={() => undefined}
            showTitle={false}
            fieldLayout="horizontal"
            fieldSpan={24}
          />
          <QuestionMatrixForm
            versionDef={versionDef}
            minerals={[{ key: 'tantalum', labelKey: 'minerals.tantalum' }]}
            values={{ Q1: { tantalum: 'Yes' } }}
            commentValues={{ Q1: { tantalum: 'Readable matrix note' } }}
            onChange={() => undefined}
            onCommentChange={() => undefined}
            headerMode="section"
          />
          <CompanyQuestionsForm
            questions={[
              {
                key: 'A',
                labelKey: 'companyQuestions.cmrt.a',
                options: [{ value: 'Yes', labelKey: 'options.yes' }],
                hasCommentField: true,
              },
            ]}
            values={{ A: 'Yes', A_comment: 'Readable company note' }}
            onChange={() => undefined}
            showTitle={false}
          />
        </>
      </ConfigProvider>
    )

    expect(html).toContain('ant-select-disabled')
    expect(html).toContain('ant-input-disabled')
    expect(html).toContain('ant-picker-disabled')
    expect(html).toContain('options.yes')
    expect(html).toContain('Readable company')
    expect(html).toContain('Readable contact')
    expect(html).toContain('Readable matrix note')
    expect(html).toContain('Readable company note')
  })

  test('styles disabled controls without border or faded text', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/lib/form-overrides.css'), 'utf8')

    expect(css).toContain('ReadOnly Disabled Controls')
    expect(css).toContain('background-color: #eeeeee')
    expect(css).toContain('border-color: transparent')
    expect(css).toContain('color: var(--ant-color-text)')
    expect(css).toContain('-webkit-text-fill-color: var(--ant-color-text)')
  })

  test('hides placeholders for empty disabled question matrix cells', () => {
    const versionDef = getVersionDef('cmrt', '6.6')
    const q2OnlyVersionDef = {
      ...versionDef,
      questions: versionDef.questions.filter((question) => question.key === 'Q2'),
    }
    const gatingByMineral = new Map([
      [
        'tantalum',
        {
          q2Enabled: false,
          laterQuestionsEnabled: false,
          companyQuestionsEnabled: false,
          smelterListRequired: false,
        },
      ],
    ])

    const html = renderToStaticMarkup(
      <QuestionMatrixForm
        versionDef={q2OnlyVersionDef}
        minerals={[{ key: 'tantalum', labelKey: 'minerals.tantalum' }]}
        values={{}}
        commentValues={{}}
        onChange={() => undefined}
        onCommentChange={() => undefined}
        gatingByMineral={gatingByMineral}
        headerMode="section"
      />
    )

    expect(html).toContain('ant-select-disabled')
    expect(html).toContain('ant-input-disabled')
    expect(html).not.toContain('placeholders.select')
    expect(html).not.toContain('placeholder="placeholders.comments"')
  })
})
