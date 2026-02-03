import type { EmrtVersionOverride } from '../base'
import {
  EMRT_COMPANY_QUESTION_E_OPTIONS,
  EMRT_MINERALS_V1,
  EMRT_Q1_OPTIONS_V1,
  EMRT_Q2_OPTIONS,
  EMRT_Q3_OPTIONS_V1_COBALT,
  EMRT_Q3_OPTIONS_V1_MICA,
  EMRT_Q5_OPTIONS_V1,
  EMRT_V1_COMPANY_LABELS,
  EMRT_V1_QUESTION_LABELS,
  EMRT_YES_NO_OPTIONS,
} from '../base'

export const emrt_1_2: EmrtVersionOverride = {
  id: '1.2',
  minerals: EMRT_MINERALS_V1,
  mineralScopeMode: 'fixed',
  questionLabelKeys: EMRT_V1_QUESTION_LABELS,
  questionOptions: {
    q1: EMRT_Q1_OPTIONS_V1,
    q2: EMRT_Q2_OPTIONS,
    q3: EMRT_Q2_OPTIONS,
    q3ByMineral: {
      cobalt: EMRT_Q3_OPTIONS_V1_COBALT,
      mica: EMRT_Q3_OPTIONS_V1_MICA,
    },
    q4: EMRT_Q2_OPTIONS,
    q5: EMRT_Q5_OPTIONS_V1,
    q6: EMRT_Q2_OPTIONS,
    q7: EMRT_Q2_OPTIONS,
  },
  companyLabelKeys: EMRT_V1_COMPANY_LABELS,
  companyOptions: {
    A: EMRT_YES_NO_OPTIONS,
    B: EMRT_YES_NO_OPTIONS,
    BCommentLabelKey: 'companyQuestions.emrt.b_comment',
    BCommentRequiredWhen: ['Yes'],
    C: EMRT_YES_NO_OPTIONS,
    D: EMRT_YES_NO_OPTIONS,
    E: EMRT_COMPANY_QUESTION_E_OPTIONS,
    F: EMRT_YES_NO_OPTIONS,
    G: EMRT_YES_NO_OPTIONS,
  },
  gating: {
    q1Negatives: ['No', 'Unknown', 'Not applicable for this declaration'],
  },
  pages: {
    instructionsFirst: true,
    hasMineList: false,
  },
  smelterList: {
    metalDropdownSource: { type: 'fixed', metals: EMRT_MINERALS_V1 },
    hasCombinedColumn: false,
  },
  mineList: {
    available: false,
    smelterNameMode: 'manual',
  },
  productList: {
    hasRequesterColumns: false,
  },
}
