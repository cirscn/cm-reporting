import type { CompanyQuestionDef } from '@core/registry/types'

export type CompanyQuestionValues = Record<string, Record<string, string> | string>

export function getCompanyQuestionAnswerValue(
  values: CompanyQuestionValues,
  questionKey: string,
  mineralKey?: string
): string {
  const value = values[questionKey]
  if (mineralKey && value && typeof value === 'object') {
    return value[mineralKey] ?? ''
  }
  if (!mineralKey && typeof value === 'string') {
    return value
  }
  return ''
}

export function isCompanyQuestionCommentRequired(
  question: CompanyQuestionDef,
  answerValue: string
): boolean {
  if (!question.hasCommentField) return false
  return (question.commentRequiredWhen ?? []).includes(answerValue)
}

export function hasRequiredCompanyQuestionComment({
  questions,
  values,
  mineralKeys,
}: {
  questions: readonly CompanyQuestionDef[]
  values: CompanyQuestionValues
  mineralKeys: readonly string[]
}): boolean {
  return questions.some((question) => {
    if (question.perMineral) {
      return mineralKeys.some((mineralKey) =>
        isCompanyQuestionCommentRequired(
          question,
          getCompanyQuestionAnswerValue(values, question.key, mineralKey)
        )
      )
    }
    return isCompanyQuestionCommentRequired(
      question,
      getCompanyQuestionAnswerValue(values, question.key)
    )
  })
}
