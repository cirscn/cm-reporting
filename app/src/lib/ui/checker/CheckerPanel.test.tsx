import { getVersionDef } from '@core/registry'
import { ERROR_KEYS, type ErrorKey } from '@core/validation/errorKeys'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test, vi } from 'vitest'

import { CheckerPanel } from './CheckerPanel'

vi.mock('@ui/i18n', () => ({
  useT: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      const values = options ?? {}
      switch (key as ErrorKey | string) {
        case 'tabs.checker':
        case 'checker.subtitle':
        case 'checker.errorsTitle':
        case 'checker.passedToggleShow':
        case 'checker.passedToggleHide':
        case 'checker.passedEmpty':
        case 'checker.noErrors':
        case 'checker.goToField':
          return key
        case 'checker.errorBadge':
          return `错误 ${String(values.count ?? '')}`
        case 'checker.groupCount':
          return `共 ${String(values.count ?? '')} 条`
        case 'checker.passedSummary':
          return `${String(values.count ?? '')}/${String(values.total ?? '')}`
        case 'errorGroups.companyQuestions':
          return '公司层面问题'
        case ERROR_KEYS.checker.requiredCompanyQuestionComment:
          return `需要填写备注：${String(values.field ?? '')}。`
        case 'companyQuestions.emrt.b_comment':
          return '请填写网址'
        case 'companyQuestions.emrt.e_comment':
          return '请描述其他格式'
        case 'companyQuestions.labels.B':
          return '问题 B'
        case 'companyQuestions.labels.E':
          return '问题 E'
        default:
          return key
      }
    },
  }),
}))

describe('CheckerPanel', () => {
  test('shows company question number for required comment errors', () => {
    const versionDef = getVersionDef('emrt', '2.1')
    const html = renderToStaticMarkup(
      <CheckerPanel
        versionDef={versionDef}
        errors={[
          {
            code: 'E001',
            messageKey: ERROR_KEYS.checker.requiredCompanyQuestionComment,
            fieldPath: 'companyQuestions.B_comment',
            fieldLabelKey: 'companyQuestions.emrt.b_comment',
            severity: 'error',
          },
          {
            code: 'E002',
            messageKey: ERROR_KEYS.checker.requiredCompanyQuestionComment,
            fieldPath: 'companyQuestions.E_comment',
            fieldLabelKey: 'companyQuestions.emrt.e_comment',
            severity: 'error',
          },
        ]}
        passedItems={[]}
      />
    )

    expect(html).toContain('问题 B')
    expect(html).toContain('问题 E')
    expect(html).toContain('需要填写备注：请填写网址。')
    expect(html).toContain('需要填写备注：请描述其他格式。')
  })
})
