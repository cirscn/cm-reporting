import type {
  CompanyQuestionDef,
  FieldDef,
  MineralDef,
  PageDef,
  QuestionDef,
  QuestionOption,
  TemplateVersionDef,
} from '../../types'

import type { CrtVersionId } from './manifest'

// ---------------------------------------------------------------------------
// CRT Minerals
// ---------------------------------------------------------------------------

const CRT_MINERALS: MineralDef[] = [{ key: 'cobalt', labelKey: 'minerals.cobalt' }]

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

const YES_NO: QuestionOption[] = [
  { value: 'Yes', labelKey: 'options.yes' },
  { value: 'No', labelKey: 'options.no' },
]

export const CRT_YES_NO_OPTIONS: QuestionOption[] = YES_NO

const YES_NO_UNKNOWN: QuestionOption[] = [
  ...YES_NO,
  { value: 'Unknown', labelKey: 'options.unknown' },
]

export const CRT_Q2_OPTIONS_DEFAULT: QuestionOption[] = YES_NO_UNKNOWN

export const CRT_Q2_OPTIONS_221: QuestionOption[] = [
  { value: 'Yes', labelKey: 'options.yes' },
  { value: 'No', labelKey: 'options.no' },
  { value: 'Unknown', labelKey: 'options.unknown' },
  { value: 'DRC or adjoining countries only', labelKey: 'options.drcOrAdjoiningOnly' },
]

// ---------------------------------------------------------------------------
// CRT Questions (Q1-Q6)
// ---------------------------------------------------------------------------

function buildCrtQuestions(q2Options: QuestionOption[]): QuestionDef[] {
  const percentageOptions: QuestionOption[] = [
    { value: '1', labelKey: 'options.percentageOne' },
    { value: 'Greater than 90%', labelKey: 'options.percentageAbove90' },
    { value: 'Greater than 75%', labelKey: 'options.percentageAbove75' },
    { value: 'Greater than 50%', labelKey: 'options.percentageAbove50' },
    { value: '50% or less', labelKey: 'options.percentage50OrLess' },
    { value: 'None', labelKey: 'options.none' },
  ]

  return [
    { key: 'Q1', labelKey: 'questions.crt.q1', options: YES_NO_UNKNOWN, perMineral: false },
    { key: 'Q2', labelKey: 'questions.crt.q2', options: q2Options, perMineral: false },
    { key: 'Q3', labelKey: 'questions.crt.q3', options: YES_NO_UNKNOWN, perMineral: false },
    { key: 'Q4', labelKey: 'questions.crt.q4', options: percentageOptions, perMineral: false },
    { key: 'Q5', labelKey: 'questions.crt.q5', options: YES_NO_UNKNOWN, perMineral: false },
    { key: 'Q6', labelKey: 'questions.crt.q6', options: YES_NO_UNKNOWN, perMineral: false },
  ]
}

// ---------------------------------------------------------------------------
// CRT Company Questions (A-I)
// ---------------------------------------------------------------------------

function buildCrtCompanyQuestions(override: CrtVersionOverride): CompanyQuestionDef[] {
  return [
    {
      key: 'A',
      labelKey: 'companyQuestions.crt.a',
      options: YES_NO,
      hasCommentField: true,
      commentLabelKey: 'companyQuestions.crt.a_comment',
      commentRequiredWhen: ['Yes'],
    },
    { key: 'B', labelKey: 'companyQuestions.crt.b', options: YES_NO, hasCommentField: true },
    { key: 'C', labelKey: 'companyQuestions.crt.c', options: YES_NO, hasCommentField: true },
    { key: 'D', labelKey: 'companyQuestions.crt.d', options: YES_NO, hasCommentField: true },
    { key: 'E', labelKey: 'companyQuestions.crt.e', options: YES_NO, hasCommentField: true },
    { key: 'F', labelKey: 'companyQuestions.crt.f', options: YES_NO, hasCommentField: true },
    {
      key: 'G',
      labelKey: 'companyQuestions.crt.g',
      options: override.companyQuestionsGOptions,
      hasCommentField: true,
      commentLabelKey: 'companyQuestions.crt.g_comment',
      commentRequiredWhen: override.companyQuestionsGCommentRequiredWhen,
    },
    { key: 'H', labelKey: 'companyQuestions.crt.h', options: YES_NO, hasCommentField: true },
    { key: 'I', labelKey: 'companyQuestions.crt.i', options: YES_NO, hasCommentField: true },
  ]
}

// ---------------------------------------------------------------------------
// Company Info Fields
// ---------------------------------------------------------------------------

const CRT_COMPANY_FIELDS: FieldDef[] = [
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
// Pages
// ---------------------------------------------------------------------------

const CRT_PAGES: PageDef[] = [
  { key: 'instructions', labelKey: 'tabs.instructions', available: true },
  { key: 'revision', labelKey: 'tabs.revision', available: true },
  { key: 'definitions', labelKey: 'tabs.definitions', available: true },
  { key: 'declaration', labelKey: 'tabs.declaration', available: true },
  { key: 'smelter-list', labelKey: 'tabs.smelterList', available: true },
  { key: 'product-list', labelKey: 'tabs.productList', available: true },
  { key: 'smelter-lookup', labelKey: 'tabs.smelterLookup', available: true },
  { key: 'checker', labelKey: 'tabs.checker', available: true },
]

// ---------------------------------------------------------------------------
// Version Override
// ---------------------------------------------------------------------------

export interface CrtVersionOverride {
  id: CrtVersionId
  q2Options: QuestionOption[]
  companyQuestionsGOptions: QuestionOption[]
  companyQuestionsGCommentRequiredWhen: string[]
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

export function buildCrtVersionDef(override: CrtVersionOverride): TemplateVersionDef {
  return {
    templateType: 'crt',
    version: { id: override.id, label: override.id },
    pages: CRT_PAGES,
    mineralScope: {
      mode: 'fixed',
      minerals: CRT_MINERALS,
    },
    companyInfoFields: CRT_COMPANY_FIELDS,
    questions: buildCrtQuestions(override.q2Options),
    companyQuestions: buildCrtCompanyQuestions(override),
    gating: {
      q2Gating: { type: 'q1-not-negatives', negatives: ['No', 'Unknown'] },
      laterQuestionsGating: { type: 'q1-not-negatives', negatives: ['No', 'Unknown'] },
      companyQuestionsGating: { type: 'q1-not-negatives', negatives: ['No', 'Unknown'] },
      smelterListGating: { type: 'q1-not-negatives', negatives: ['No', 'Unknown'] },
    },
    smelterList: {
      metalDropdownSource: { type: 'fixed', metals: CRT_MINERALS },
      hasIdColumn: true,
      hasLookup: true,
      hasCombinedColumn: false,
      notListedRequireNameCountry: true,
      notYetIdentifiedCountryDefault: 'Unknown',
    },
    mineList: { available: false },
    productList: {
      hasRequesterColumns: false,
      productNumberLabelKey: 'productList.crt.manufacturerNumber',
      productNameLabelKey: 'productList.crt.manufacturerName',
      commentLabelKey: 'productList.crt.comment',
    },
    dateConfig: {
      minDate: '2006-12-31',
      maxDate: '2026-03-31',
    },
  }
}
