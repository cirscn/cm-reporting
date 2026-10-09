import { normalizeAuthorizationDateInput } from '@core/transform'

import type { TemplateStoreState } from './templateStoreTypes'
import type { TemplateFormState } from './templateTypes'

export function getFormData(state: TemplateStoreState): TemplateFormState {
  return {
    companyInfo: state.companyInfo,
    selectedMinerals: state.selectedMinerals,
    customMinerals: state.customMinerals,
    questions: state.questions,
    questionComments: state.questionComments,
    companyQuestions: state.companyQuestions,
    mineralsScope: state.mineralsScope,
    smelterList: state.smelterList,
    mineList: state.mineList,
    productList: state.productList,
  }
}

export function normalizeFormData(data: TemplateFormState): TemplateFormState {
  return {
    ...data,
    companyInfo: {
      ...data.companyInfo,
      authorizationDate: normalizeAuthorizationDateInput(data.companyInfo.authorizationDate),
    },
  }
}
