/**
 * @file core/validation/errorKeys.ts
 * @description 模块实现。
 */

// 说明：模块实现
/**
 * 常量：ERROR_KEYS。
 */
export const ERROR_KEYS = {
  required: 'errors.required',
  emailInvalid: 'errors.email.invalid',
  dateInvalid: 'errors.date.invalid',
  companyQuestions: {
    commentRequired: 'errors.companyQuestions.commentRequired',
  },
  checker: {
    requiredField: 'checker.requiredField',
    requiredCompanyQuestionComment: 'checker.requiredCompanyQuestionComment',
    requiredProductList: 'checker.requiredProductList',
    requiredSmelterList: 'checker.requiredSmelterList',
    invalidEmail: 'checker.invalidEmail',
  },
  minerals: {
    tooManySelected: 'errors.minerals.tooManySelected',
    selectAtLeastOne: 'errors.minerals.selectAtLeastOne',
    enterAtLeastOne: 'errors.minerals.enterAtLeastOne',
    otherRequired: 'errors.minerals.otherRequired',
    otherNotAllowed: 'errors.minerals.otherNotAllowed',
    tooMany: 'errors.minerals.tooMany',
  },
} as const

type NestedValue<T> = T extends string
  ? T
  : { [K in keyof T]: NestedValue<T[K]> }[keyof T]

/**
 * 导出类型：ErrorKey。
 */
export type ErrorKey = NestedValue<typeof ERROR_KEYS>
