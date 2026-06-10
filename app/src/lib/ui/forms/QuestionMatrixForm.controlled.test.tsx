import { getVersionDef } from '@core/registry'
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { QuestionMatrixForm } from './QuestionMatrixForm'

const { textAreaProps } = vi.hoisted(() => ({
  textAreaProps: [] as Array<Record<string, unknown>>,
}))

vi.mock('@ui/i18n/useT', () => ({
  useT: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('antd', () => {
  const Typography = {
    Text: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
    Title: ({ children }: { children?: ReactNode }) => <h2>{children}</h2>,
  }

  return {
    Card: ({ children, title }: { children?: ReactNode; title?: ReactNode }) => (
      <section>
        {title}
        {children}
      </section>
    ),
    ConfigProvider: {
      useConfig: () => ({ componentDisabled: false }),
    },
    Flex: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    Input: {
      TextArea: (props: Record<string, unknown>) => {
        textAreaProps.push(props)
        return <textarea readOnly value={String(props.value ?? '')} />
      },
    },
    Select: () => <select />,
    Tag: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
    Typography,
  }
})

describe('QuestionMatrixForm controlled fields', () => {
  beforeEach(() => {
    textAreaProps.length = 0
  })

  test('keeps empty comment textarea controlled with an empty string value', () => {
    const versionDef = getVersionDef('cmrt', '6.5')
    const q2OnlyVersionDef = {
      ...versionDef,
      questions: versionDef.questions.filter((question) => question.key === 'Q2'),
    }
    const gatingByMineral = new Map([
      [
        'tantalum',
        {
          q2Enabled: true,
          laterQuestionsEnabled: false,
          companyQuestionsEnabled: false,
          smelterListRequired: false,
        },
      ],
    ])

    renderToStaticMarkup(
      <QuestionMatrixForm
        versionDef={q2OnlyVersionDef}
        minerals={[{ key: 'tantalum', labelKey: 'minerals.tantalum' }]}
        values={{ Q2: { tantalum: '' } }}
        commentValues={{ Q2: { tantalum: '' } }}
        onChange={() => undefined}
        onCommentChange={() => undefined}
        gatingByMineral={gatingByMineral}
        headerMode="section"
      />
    )

    const q2CommentProps = textAreaProps.find(
      (props) => props['data-field-path'] === 'questionComments.Q2.tantalum'
    )

    expect(q2CommentProps?.value).toBe('')
  })
})
