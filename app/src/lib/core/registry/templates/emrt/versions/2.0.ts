import type { EmrtVersionOverride } from '../base'
import {
  EMRT_COMPANY_QUESTION_C_OPTIONS_V2,
  EMRT_COMPANY_QUESTION_E_OPTIONS,
  EMRT_MINERALS_V2,
  EMRT_Q1_OPTIONS_V2,
  EMRT_Q2_OPTIONS,
  EMRT_Q5_OPTIONS_V2,
  EMRT_V2_COMPANY_LABELS,
  EMRT_V2_QUESTION_LABELS,
  EMRT_YES_NO_OPTIONS,
} from '../base'

export const emrt_2_0: EmrtVersionOverride = {
  id: '2.0',
  minerals: EMRT_MINERALS_V2,
  mineralScopeMode: 'dynamic-dropdown',
  questionLabelKeys: EMRT_V2_QUESTION_LABELS,
  questionOptions: {
    q1: EMRT_Q1_OPTIONS_V2,
    q2: EMRT_Q2_OPTIONS,
    q3: EMRT_Q2_OPTIONS,
    q4: EMRT_Q2_OPTIONS,
    q5: EMRT_Q5_OPTIONS_V2,
    q6: EMRT_Q2_OPTIONS,
    q7: EMRT_Q2_OPTIONS,
  },
  companyLabelKeys: EMRT_V2_COMPANY_LABELS,
  companyOptions: {
    A: EMRT_YES_NO_OPTIONS,
    B: EMRT_YES_NO_OPTIONS,
    BCommentLabelKey: 'companyQuestions.emrt.b_comment',
    BCommentRequiredWhen: ['Yes'],
    C: EMRT_COMPANY_QUESTION_C_OPTIONS_V2,
    D: EMRT_YES_NO_OPTIONS,
    E: EMRT_COMPANY_QUESTION_E_OPTIONS,
    F: EMRT_YES_NO_OPTIONS,
    G: EMRT_YES_NO_OPTIONS,
  },
  gating: {
    q1Negatives: ['No', 'Unknown', 'Not declaring'],
  },
  pages: {
    instructionsFirst: true,
    hasMineList: true,
  },
  smelterList: {
    metalDropdownSource: { type: 'dynamic-q2-yes' },
    hasCombinedColumn: false,
  },
  mineList: {
    available: true,
    metalDropdownSource: { type: 'dynamic-q2-yes' },
    smelterNameMode: 'manual',
  },
  productList: {
    hasRequesterColumns: false,
  },
}
