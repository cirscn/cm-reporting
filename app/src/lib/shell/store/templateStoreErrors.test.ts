import { describe, expect, test } from 'vitest'

import { mapZodErrors } from './templateStoreErrors'

describe('表单错误映射保持按矿种结构', () => {
  test('多个矿种的公司问题错误独立保留，并可与普通公司问题同时显示', () => {
    const errors = mapZodErrors([
      { path: ['companyQuestions', 'C', 'cobalt'], message: 'errors.required' },
      { path: ['companyQuestions', 'C', 'mica'], message: 'errors.required' },
      { path: ['companyQuestions', 'E_comment'], message: 'errors.companyQuestions.commentRequired' },
    ])
    expect(errors.companyQuestions).toEqual({
      C: { cobalt: 'errors.required', mica: 'errors.required' },
      E_comment: 'errors.companyQuestions.commentRequired',
    })
  })
})
