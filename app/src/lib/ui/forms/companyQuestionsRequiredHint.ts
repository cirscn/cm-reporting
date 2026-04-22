import type { I18nKey } from '@core/i18n'
import type { GatingCondition } from '@core/registry/types'

export function buildCompanyQuestionsRequiredHint(
  t: (key: I18nKey, options?: Record<string, unknown>) => string,
  gatingCondition?: GatingCondition,
  optionLabelsByQuestion?: Map<string, Map<string, string>>
): string {
  const condition = gatingCondition
    ? resolveGatingConditionLabel(t, gatingCondition, optionLabelsByQuestion)
    : t('conditions.always')
  return t('badges.companyQuestionsRequired', { condition })
}

function resolveGatingConditionLabel(
  t: (key: I18nKey, options?: Record<string, unknown>) => string,
  condition: GatingCondition,
  optionLabelsByQuestion?: Map<string, Map<string, string>>
): string {
  const resolveOptionLabel = (questionKey: 'Q1' | 'Q2', value: string) =>
    optionLabelsByQuestion?.get(questionKey)?.get(value) ?? value
  const formatLabels = (labels: string[]) => labels.filter(Boolean).join(' / ')

  switch (condition.type) {
    case 'always':
      return t('conditions.always')
    case 'q1-not-no':
      return t('conditions.q1NotNo', { no: resolveOptionLabel('Q1', 'No') })
    case 'q1-yes':
      return t('conditions.q1Yes', { yes: resolveOptionLabel('Q1', 'Yes') })
    case 'q1q2-not-no':
      return t('conditions.q1q2NotNo', {
        no: resolveOptionLabel('Q1', 'No'),
        noQ2: resolveOptionLabel('Q2', 'No'),
      })
    case 'q1q2-yes':
      return t('conditions.q1q2Yes', {
        yes: resolveOptionLabel('Q1', 'Yes'),
        yesQ2: resolveOptionLabel('Q2', 'Yes'),
      })
    case 'q1-not-negatives':
      return t('conditions.q1NotNegatives', {
        negatives: formatLabels(
          condition.negatives.map((value) => resolveOptionLabel('Q1', value))
        ),
      })
    case 'q1-not-negatives-and-q2-not-negatives':
      return t('conditions.q1NotNegativesAndQ2NotNegatives', {
        q1Negatives: formatLabels(
          condition.q1Negatives.map((value) => resolveOptionLabel('Q1', value))
        ),
        q2Negatives: formatLabels(
          condition.q2Negatives.map((value) => resolveOptionLabel('Q2', value))
        ),
      })
    default:
      return t('conditions.always')
  }
}
