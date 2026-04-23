import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test, vi } from 'vitest'

import { DeclarationPage } from './DeclarationPage'

const {
  collapseMock,
  companyInfoFormMock,
  mineralScopeFormMock,
  questionMatrixFormMock,
  companyQuestionsFormMock,
} = vi.hoisted(() => ({
  collapseMock: vi.fn(
    ({
      items = [],
    }: {
      items?: Array<{ key: string; label?: ReactNode; children?: ReactNode }>
    }) => (
      <div data-kind="collapse">
        {items.map((item) => (
          <section key={item.key} data-key={item.key}>
            <header>{item.label}</header>
            <div>{item.children}</div>
          </section>
        ))}
      </div>
    )
  ),
  companyInfoFormMock: vi.fn(() => <div>CompanyInfoForm</div>),
  mineralScopeFormMock: vi.fn(() => <div>MineralScopeForm</div>),
  questionMatrixFormMock: vi.fn(() => <div>QuestionMatrixForm</div>),
  companyQuestionsFormMock: vi.fn(() => <div>CompanyQuestionsForm</div>),
}))

vi.mock('antd', () => ({
  Collapse: collapseMock,
  Flex: ({ children }: { children?: ReactNode }) => <div data-kind="flex">{children}</div>,
  Tag: ({ children }: { children?: ReactNode }) => <span data-kind="tag">{children}</span>,
  Typography: {
    Text: ({
      children,
    }: {
      children?: ReactNode
      strong?: boolean
      type?: string
    }) => <span data-kind="text">{children}</span>,
  },
}))

vi.mock('@shell/store', () => ({
  useTemplateState: () => ({
    meta: {
      versionDef: {
        companyInfoFields: [
          { key: 'companyName', required: true },
          { key: 'contactName', required: true },
        ],
        mineralScope: {
          mode: 'dynamic-dropdown',
          maxCount: 3,
        },
        companyQuestions: [{ key: 'CQ1' }],
        questions: [{ key: 'Q1' }],
        gating: {
          companyQuestionsGating: { type: 'always' },
        },
      },
    },
    form: {
      companyInfo: {
        companyName: 'Test Company',
        contactName: '',
      },
      selectedMinerals: ['tin'],
      customMinerals: [],
      questions: {},
      questionComments: {},
      companyQuestions: {},
    },
  }),
  useTemplateErrors: () => ({
    companyInfo: {},
    mineralsScope: undefined,
    customMinerals: {},
    questions: {},
    companyQuestions: {},
  }),
  useTemplateActions: () => ({
    setCompanyInfoField: vi.fn(),
    setSelectedMinerals: vi.fn(),
    setCustomMinerals: vi.fn(),
    setQuestionValue: vi.fn(),
    setQuestionComment: vi.fn(),
    setCompanyQuestionValue: vi.fn(),
  }),
  useTemplateDerived: () => ({
    gatingByMineral: new Map(),
    requiredFields: {
      companyInfo: new Map([
        ['companyName', true],
        ['contactName', true],
      ]),
      questions: new Map(),
      companyQuestions: new Map([['CQ1', true]]),
    },
    checkerErrors: derivedState.checkerErrors,
    viewModels: {
      declaration: {
        displayMinerals: [{ key: 'tin', labelKey: 'minerals.tin', label: 'Tin' }],
      },
    },
  }),
}))

vi.mock('@ui/i18n/useT', () => ({
  useT: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (key === 'badges.requiredCompleted') {
        return `${options?.done}/${options?.total}`
      }
      if (key === 'badges.companyQuestionsRequired') {
        return `required:${String(options?.condition ?? '')}`
      }
      if (key === 'conditions.always') {
        return 'always'
      }
      return key
    },
  }),
}))

vi.mock('./useFieldFocus', () => ({
  useFieldFocus: () => undefined,
}))

const navigationState = vi.hoisted(() => ({
  searchParams: new URLSearchParams(),
}))

const derivedState = vi.hoisted(() => ({
  checkerErrors: [
    {
      code: 'E001',
      messageKey: 'checker.requiredField',
      fieldPath: 'questions.Q1.tin',
      severity: 'error' as const,
    },
  ],
}))

vi.mock('@shell/navigation/useNavigation', () => ({
  useOptionalNavigation: () => ({
    state: {
      searchParams: navigationState.searchParams,
    },
  }),
}))

vi.mock('@ui/forms/CompanyInfoForm', () => ({
  CompanyInfoForm: companyInfoFormMock,
}))

vi.mock('@ui/forms/MineralScopeForm', () => ({
  MineralScopeForm: mineralScopeFormMock,
}))

vi.mock('@ui/forms/QuestionMatrixForm', () => ({
  QuestionMatrixForm: questionMatrixFormMock,
}))

vi.mock('@ui/forms/CompanyQuestionsForm', () => ({
  CompanyQuestionsForm: companyQuestionsFormMock,
}))

vi.mock('@ui/forms/companyQuestionsRequiredHint', () => ({
  buildCompanyQuestionsRequiredHint: (t: (key: string, options?: Record<string, unknown>) => string) =>
    t('badges.companyQuestionsRequired', { condition: t('conditions.always') }),
}))

describe('DeclarationPage', () => {
  test('shows declaration step sections as multi-expand collapse panels with header tags and de-duplicated inner titles', () => {
    navigationState.searchParams = new URLSearchParams()
    derivedState.checkerErrors = [
      {
        code: 'E001',
        messageKey: 'checker.requiredField',
        fieldPath: 'questions.Q1.tin',
        severity: 'error',
      },
    ]
    collapseMock.mockClear()
    companyInfoFormMock.mockClear()
    mineralScopeFormMock.mockClear()
    questionMatrixFormMock.mockClear()
    companyQuestionsFormMock.mockClear()

    renderToStaticMarkup(<DeclarationPage />)

    expect(collapseMock).toHaveBeenCalledTimes(1)

    const collapseProps = collapseMock.mock.calls[0]?.[0] as {
      accordion?: boolean
      activeKey?: string[]
      items?: Array<{ key: string; label?: ReactNode; children?: ReactNode }>
    }

    expect(collapseProps.accordion).not.toBe(true)
    expect(collapseProps.activeKey).toEqual(['companyInfo'])
    expect(collapseProps.items?.map((item) => item.key)).toEqual([
      'companyInfo',
      'mineralsScope',
      'companyQuestions',
    ])

    const companyInfoPanel = collapseProps.items?.find((item) => item.key === 'companyInfo')
    const scopePanel = collapseProps.items?.find((item) => item.key === 'mineralsScope')
    const companyQuestionsPanel = collapseProps.items?.find((item) => item.key === 'companyQuestions')
    const companyInfoLabelHtml = renderToStaticMarkup(<>{companyInfoPanel?.label}</>)
    const scopePanelHtml = renderToStaticMarkup(<>{scopePanel?.children}</>)
    const scopeLabelHtml = renderToStaticMarkup(<>{scopePanel?.label}</>)
    const companyQuestionsLabelHtml = renderToStaticMarkup(<>{companyQuestionsPanel?.label}</>)
    const companyInfoCalls = companyInfoFormMock.mock.calls as Array<
      Array<{ showTitle?: boolean; fieldLayout?: string; fieldSpan?: number; labelWidth?: number }>
    >
    const mineralScopeCalls = mineralScopeFormMock.mock.calls as Array<Array<{ showTitle?: boolean }>>
    const questionMatrixCalls = questionMatrixFormMock.mock.calls as Array<Array<{ headerMode?: string }>>
    const companyQuestionsCalls = companyQuestionsFormMock.mock.calls as Array<
      Array<{ showTitle?: boolean }>
    >
    const companyInfoProps = companyInfoCalls[0]?.[0]
    const mineralScopeProps = mineralScopeCalls[0]?.[0]
    const questionMatrixProps = questionMatrixCalls[0]?.[0]
    const companyQuestionsProps = companyQuestionsCalls[0]?.[0]

    expect(companyInfoLabelHtml).toContain('sections.companyInfo')
    expect(companyInfoLabelHtml).toContain('*')
    expect(companyInfoLabelHtml).toContain('1/2')
    expect(scopeLabelHtml).toContain('sections.mineralsScope')
    expect(scopeLabelHtml).toContain('1/3')
    expect(companyQuestionsLabelHtml).toContain('sections.companyQuestions')
    expect(companyQuestionsLabelHtml).toContain('required:always')
    expect(scopePanelHtml).toContain('MineralScopeForm')
    expect(scopePanelHtml).toContain('QuestionMatrixForm')
    expect(companyInfoProps?.showTitle).toBe(false)
    expect(companyInfoProps?.fieldLayout).toBe('horizontal')
    expect(companyInfoProps?.fieldSpan).toBe(24)
    expect(companyInfoProps?.labelWidth).toBe(220)
    expect(mineralScopeProps?.showTitle).toBe(false)
    expect(questionMatrixProps?.headerMode).toBe('section')
    expect(companyQuestionsProps?.showTitle).toBe(false)
  })

  test('shows required marker on company questions panel title when required validation fails', () => {
    navigationState.searchParams = new URLSearchParams()
    derivedState.checkerErrors = [
      {
        code: 'E002',
        messageKey: 'checker.requiredField',
        fieldPath: 'companyQuestions.CQ1',
        severity: 'error',
      },
    ]
    collapseMock.mockClear()

    renderToStaticMarkup(<DeclarationPage />)

    const collapseProps = collapseMock.mock.calls[0]?.[0] as {
      items?: Array<{ key: string; label?: ReactNode }>
    }
    const companyQuestionsPanel = collapseProps.items?.find((item) => item.key === 'companyQuestions')
    const companyQuestionsLabelHtml = renderToStaticMarkup(<>{companyQuestionsPanel?.label}</>)

    expect(companyQuestionsLabelHtml).toContain('*')
  })

  test('expands minerals scope panel when focus field is in declaration question matrix', () => {
    navigationState.searchParams = new URLSearchParams('focus=questions.Q1.tin')
    derivedState.checkerErrors = [
      {
        code: 'E001',
        messageKey: 'checker.requiredField',
        fieldPath: 'questions.Q1.tin',
        severity: 'error',
      },
    ]
    collapseMock.mockClear()

    renderToStaticMarkup(<DeclarationPage />)

    const collapseProps = collapseMock.mock.calls[0]?.[0] as {
      activeKey?: string[]
    }

    expect(collapseProps.activeKey).toEqual(['mineralsScope'])
  })

  test('expands company questions panel when focus field is in company questions', () => {
    navigationState.searchParams = new URLSearchParams('focus=companyQuestions.C.cobalt')
    derivedState.checkerErrors = [
      {
        code: 'E002',
        messageKey: 'checker.requiredField',
        fieldPath: 'companyQuestions.CQ1',
        severity: 'error',
      },
    ]
    collapseMock.mockClear()

    renderToStaticMarkup(<DeclarationPage />)

    const collapseProps = collapseMock.mock.calls[0]?.[0] as {
      activeKey?: string[]
    }

    expect(collapseProps.activeKey).toEqual(['companyQuestions'])
  })
})
