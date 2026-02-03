import type { I18nKey } from '@core/i18n'

import type {
  CompanyQuestionDef,
  FieldDef,
  MineralDef,
  PageDef,
  QuestionDef,
  QuestionOption,
  TemplateVersionDef,
  MetalDropdownSource,
} from '../../types'

import type { EmrtVersionId } from './manifest'

// ---------------------------------------------------------------------------
// EMRT Minerals
// ---------------------------------------------------------------------------

export const EMRT_MINERALS_V1: MineralDef[] = [
  { key: 'cobalt', labelKey: 'minerals.cobalt' },
  { key: 'mica', labelKey: 'minerals.mica' },
]

export const EMRT_MINERALS_V2: MineralDef[] = [
  { key: 'cobalt', labelKey: 'minerals.cobalt' },
  { key: 'copper', labelKey: 'minerals.copper' },
  { key: 'graphite', labelKey: 'minerals.graphite' },
  { key: 'lithium', labelKey: 'minerals.lithium' },
  { key: 'mica', labelKey: 'minerals.mica' },
  { key: 'nickel', labelKey: 'minerals.nickel' },
]

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

const YES_NO: QuestionOption[] = [
  { value: 'Yes', labelKey: 'options.yes' },
  { value: 'No', labelKey: 'options.no' },
]

export const EMRT_YES_NO_OPTIONS: QuestionOption[] = YES_NO

const YES_NO_UNKNOWN: QuestionOption[] = [
  ...YES_NO,
  { value: 'Unknown', labelKey: 'options.unknown' },
]

export const EMRT_YES_NO_UNKNOWN_OPTIONS: QuestionOption[] = YES_NO_UNKNOWN

export const EMRT_Q1_OPTIONS_V1: QuestionOption[] = [
  ...YES_NO_UNKNOWN,
  { value: 'Not applicable for this declaration', labelKey: 'options.notApplicableForDeclaration' },
]

export const EMRT_Q1_OPTIONS_V2: QuestionOption[] = [
  ...YES_NO_UNKNOWN,
  { value: 'Not declaring', labelKey: 'options.notDeclaring' },
]

export const EMRT_Q2_OPTIONS: QuestionOption[] = YES_NO_UNKNOWN

export const EMRT_Q3_OPTIONS_V1_COBALT: QuestionOption[] = [
  ...YES_NO_UNKNOWN,
  { value: 'DRC only', labelKey: 'options.drcOnly' },
]

export const EMRT_Q3_OPTIONS_V1_MICA: QuestionOption[] = [
  ...YES_NO_UNKNOWN,
  { value: 'India and/or Madagascar only', labelKey: 'options.indiaMadagascarOnly' },
]

export const EMRT_Q5_OPTIONS_V1: QuestionOption[] = [
  { value: '1', labelKey: 'options.percentageOne' },
  { value: 'Greater than 90%', labelKey: 'options.percentageAbove90' },
  { value: 'Greater than 75%', labelKey: 'options.percentageAbove75' },
  { value: 'Greater than 50%', labelKey: 'options.percentageAbove50' },
  { value: '50% or less', labelKey: 'options.percentage50OrLess' },
  { value: 'None', labelKey: 'options.none' },
]

export const EMRT_Q5_OPTIONS_V2: QuestionOption[] = [
  { value: '100%', labelKey: 'options.percentage100' },
  { value: 'Greater than 90%', labelKey: 'options.percentageAbove90' },
  { value: 'Greater than 75%', labelKey: 'options.percentageAbove75' },
  { value: 'Greater than 50%', labelKey: 'options.percentageAbove50' },
  { value: '50% or less', labelKey: 'options.percentage50OrLess' },
  { value: 'None', labelKey: 'options.none' },
  { value: 'Did not survey', labelKey: 'options.didNotSurvey' },
]

export const EMRT_COMPANY_QUESTION_C_OPTIONS_V2: QuestionOption[] = [
  { value: 'Yes', labelKey: 'options.yes' },
  { value: 'Yes, when more processors are validated', labelKey: 'options.yesWhenMoreValidated' },
  { value: 'No', labelKey: 'options.no' },
]

export const EMRT_COMPANY_QUESTION_E_OPTIONS: QuestionOption[] = [
  { value: 'Yes, in conformance with IPC1755 (e.g. EMRT)', labelKey: 'options.yesIpc1755Emrt' },
  { value: 'Yes, Using Other Format (Describe)', labelKey: 'options.yesOtherFormatTitle' },
  { value: 'No', labelKey: 'options.no' },
]

// ---------------------------------------------------------------------------
// Label helpers (Excel text alignment)
// ---------------------------------------------------------------------------

export const EMRT_V1_QUESTION_LABELS: Record<string, I18nKey> = {
  Q1: 'questions.emrt.v1.q1',
  Q2: 'questions.emrt.v1.q2',
  Q3: 'questions.emrt.v1.q3',
  Q4: 'questions.emrt.v1.q4',
  Q5: 'questions.emrt.v1.q5',
  Q6: 'questions.emrt.v1.q6',
  Q7: 'questions.emrt.v1.q7',
}

export const EMRT_V2_QUESTION_LABELS: Record<string, I18nKey> = {
  Q1: 'questions.emrt.q1',
  Q2: 'questions.emrt.q2',
  Q3: 'questions.emrt.q3',
  Q4: 'questions.emrt.q4',
  Q5: 'questions.emrt.q5',
  Q6: 'questions.emrt.q6',
  Q7: 'questions.emrt.q7',
}

export const EMRT_V11_COMPANY_LABELS: Record<string, I18nKey> = {
  A: 'companyQuestions.emrt.v11.a',
  B: 'companyQuestions.emrt.v11.b',
  C: 'companyQuestions.emrt.v11.c',
  D: 'companyQuestions.emrt.v11.d',
  E: 'companyQuestions.emrt.v11.e',
  F: 'companyQuestions.emrt.v11.f',
  G: 'companyQuestions.emrt.v11.g',
}

export const EMRT_V1_COMPANY_LABELS: Record<string, I18nKey> = {
  A: 'companyQuestions.emrt.a',
  B: 'companyQuestions.emrt.b',
  C: 'companyQuestions.emrt.v1.c',
  D: 'companyQuestions.emrt.d',
  E: 'companyQuestions.emrt.v1.e',
  F: 'companyQuestions.emrt.f',
  G: 'companyQuestions.emrt.g',
}

export const EMRT_V2_COMPANY_LABELS: Record<string, I18nKey> = {
  A: 'companyQuestions.emrt.a',
  B: 'companyQuestions.emrt.b',
  C: 'companyQuestions.emrt.c',
  D: 'companyQuestions.emrt.d',
  E: 'companyQuestions.emrt.e',
  F: 'companyQuestions.emrt.f',
  G: 'companyQuestions.emrt.g',
}

// ---------------------------------------------------------------------------
// Company Info Fields
// ---------------------------------------------------------------------------

const EMRT_COMPANY_FIELDS: FieldDef[] = [
  { key: 'companyName', labelKey: 'fields.companyName', type: 'text', required: true },
  { key: 'declarationScope', labelKey: 'fields.reportingScope', type: 'select', required: true },
  {
    key: 'scopeDescription',
    labelKey: 'fields.scopeDescription',
    type: 'textarea',
    required: 'conditional',
  },
  { key: 'companyId', labelKey: 'fields.companyId', type: 'text', required: false },
  { key: 'companyAuthId', labelKey: 'fields.companyAuthId', type: 'text', required: false },
  { key: 'address', labelKey: 'fields.address', type: 'text', required: false },
  { key: 'contactName', labelKey: 'fields.contactName', type: 'text', required: true },
  { key: 'contactEmail', labelKey: 'fields.contactEmail', type: 'email', required: true },
  { key: 'contactPhone', labelKey: 'fields.contactPhone', type: 'text', required: true },
  { key: 'authorizerName', labelKey: 'fields.authorizerName', type: 'text', required: true },
  { key: 'authorizerTitle', labelKey: 'fields.authorizerTitle', type: 'text', required: false },
  { key: 'authorizerEmail', labelKey: 'fields.authorizerEmail', type: 'email', required: true },
  { key: 'authorizerPhone', labelKey: 'fields.authorizerPhone', type: 'text', required: false },
  { key: 'authorizationDate', labelKey: 'fields.authorizationDate', type: 'date', required: true },
]

// ---------------------------------------------------------------------------
// Version Override
// ---------------------------------------------------------------------------

export interface EmrtVersionOverride {
  id: EmrtVersionId
  minerals: MineralDef[]
  mineralScopeMode: 'fixed' | 'dynamic-dropdown'
  questionLabelKeys: Record<'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5' | 'Q6' | 'Q7', I18nKey>
  questionOptions: {
    q1: QuestionOption[]
    q2: QuestionOption[]
    q3: QuestionOption[]
    q3ByMineral?: Record<string, QuestionOption[]>
    q4: QuestionOption[]
    q5: QuestionOption[]
    q6: QuestionOption[]
    q7: QuestionOption[]
  }
  companyLabelKeys: Record<'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G', I18nKey>
  companyOptions: {
    A: QuestionOption[]
    B: QuestionOption[]
    BCommentLabelKey?: I18nKey
    BCommentRequiredWhen?: string[]
    C: QuestionOption[]
    D: QuestionOption[]
    E: QuestionOption[]
    F: QuestionOption[]
    G: QuestionOption[]
  }
  gating: {
    q1Negatives: string[]
  }
  pages: {
    instructionsFirst: boolean
    hasMineList: boolean
  }
  smelterList: {
    metalDropdownSource: MetalDropdownSource
    hasCombinedColumn: boolean
  }
  mineList: {
    available: boolean
    metalDropdownSource?: MetalDropdownSource
    smelterNameMode: 'dropdown' | 'manual'
  }
  productList: {
    hasRequesterColumns: boolean
  }
}

// ---------------------------------------------------------------------------
// Builders
// ---------------------------------------------------------------------------

function buildEmrtQuestions(override: EmrtVersionOverride): QuestionDef[] {
  const q = override.questionOptions
  return [
    { key: 'Q1', labelKey: override.questionLabelKeys.Q1, options: q.q1, perMineral: true },
    { key: 'Q2', labelKey: override.questionLabelKeys.Q2, options: q.q2, perMineral: true },
    {
      key: 'Q3',
      labelKey: override.questionLabelKeys.Q3,
      options: q.q3,
      optionsByMineral: q.q3ByMineral,
      perMineral: true,
    },
    { key: 'Q4', labelKey: override.questionLabelKeys.Q4, options: q.q4, perMineral: true },
    { key: 'Q5', labelKey: override.questionLabelKeys.Q5, options: q.q5, perMineral: true },
    { key: 'Q6', labelKey: override.questionLabelKeys.Q6, options: q.q6, perMineral: true },
    { key: 'Q7', labelKey: override.questionLabelKeys.Q7, options: q.q7, perMineral: true },
  ]
}

function buildEmrtCompanyQuestions(override: EmrtVersionOverride): CompanyQuestionDef[] {
  const labelKey = (key: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G') =>
    override.companyLabelKeys[key]
  const options = override.companyOptions
  return [
    { key: 'A', labelKey: labelKey('A'), options: options.A, hasCommentField: true },
    {
      key: 'B',
      labelKey: labelKey('B'),
      options: options.B,
      hasCommentField: true,
      commentLabelKey: options.BCommentLabelKey,
      commentRequiredWhen: options.BCommentRequiredWhen ?? [],
    },
    {
      key: 'C',
      labelKey: labelKey('C'),
      options: options.C,
      perMineral: true,
      hasCommentField: true,
    },
    { key: 'D', labelKey: labelKey('D'), options: options.D, hasCommentField: true },
    {
      key: 'E',
      labelKey: labelKey('E'),
      options: options.E,
      hasCommentField: true,
      commentLabelKey: 'companyQuestions.emrt.e_comment',
      commentRequiredWhen: ['Yes, Using Other Format (Describe)'],
    },
    { key: 'F', labelKey: labelKey('F'), options: options.F, hasCommentField: true },
    { key: 'G', labelKey: labelKey('G'), options: options.G, hasCommentField: true },
  ]
}

function buildEmrtPages(pages: EmrtVersionOverride['pages']): PageDef[] {
  const leadingPages: PageDef[] = pages.instructionsFirst
    ? [
        { key: 'instructions', labelKey: 'tabs.instructions', available: true },
        { key: 'revision', labelKey: 'tabs.revision', available: true },
      ]
    : [
        { key: 'revision', labelKey: 'tabs.revision', available: true },
        { key: 'instructions', labelKey: 'tabs.instructions', available: true },
      ]
  return [
    ...leadingPages,
    { key: 'definitions', labelKey: 'tabs.definitions', available: true },
    { key: 'declaration', labelKey: 'tabs.declaration', available: true },
    { key: 'smelter-list', labelKey: 'tabs.smelterList', available: true },
    { key: 'mine-list', labelKey: 'tabs.mineList', available: pages.hasMineList },
    { key: 'product-list', labelKey: 'tabs.productList', available: true },
    { key: 'smelter-lookup', labelKey: 'tabs.smelterLookup', available: true },
    { key: 'checker', labelKey: 'tabs.checker', available: true },
  ]
}

export function buildEmrtVersionDef(override: EmrtVersionOverride): TemplateVersionDef {
  const q1Negatives = override.gating.q1Negatives
  return {
    templateType: 'emrt',
    version: { id: override.id, label: override.id },
    pages: buildEmrtPages(override.pages),
    mineralScope: {
      mode: override.mineralScopeMode,
      minerals: override.minerals,
    },
    companyInfoFields: EMRT_COMPANY_FIELDS,
    questions: buildEmrtQuestions(override),
    companyQuestions: buildEmrtCompanyQuestions(override),
    gating: {
      q2Gating: { type: 'q1-not-negatives', negatives: q1Negatives },
      laterQuestionsGating: {
        type: 'q1-not-negatives-and-q2-not-negatives',
        q1Negatives: q1Negatives,
        q2Negatives: ['No', 'Unknown'],
      },
      companyQuestionsGating: {
        type: 'q1-not-negatives-and-q2-not-negatives',
        q1Negatives: q1Negatives,
        q2Negatives: ['No', 'Unknown'],
      },
      smelterListGating: {
        type: 'q1-not-negatives-and-q2-not-negatives',
        q1Negatives: q1Negatives,
        q2Negatives: ['No', 'Unknown'],
      },
    },
    smelterList: {
      metalDropdownSource: override.smelterList.metalDropdownSource,
      hasIdColumn: true,
      hasLookup: true,
      hasCombinedColumn: override.smelterList.hasCombinedColumn,
      notListedRequireNameCountry: true,
      notYetIdentifiedCountryDefault: '',
    },
    mineList: {
      available: override.mineList.available,
      metalDropdownSource: override.mineList.metalDropdownSource,
      smelterNameMode: override.mineList.smelterNameMode,
    },
    productList: {
      hasRequesterColumns: override.productList.hasRequesterColumns,
      productNumberLabelKey: 'productList.emrt.respondentNumber',
      productNameLabelKey: 'productList.emrt.respondentName',
      commentLabelKey: 'productList.emrt.comment',
    },
    dateConfig: {
      minDate: '2006-12-31',
      maxDate: '2026-03-31',
    },
  }
}
