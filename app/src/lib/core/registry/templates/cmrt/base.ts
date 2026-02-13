import type { I18nKey } from '@core/i18n'

import type {
  CompanyQuestionDef,
  FieldDef,
  MineralDef,
  PageDef,
  QuestionDef,
  QuestionOption,
  TemplateVersionDef,
} from '../../types'

import type { CmrtVersionId } from './manifest'

// ---------------------------------------------------------------------------
// CMRT Minerals
// ---------------------------------------------------------------------------

const CMRT_MINERALS: MineralDef[] = [
  { key: 'tantalum', labelKey: 'minerals.tantalum' },
  { key: 'tin', labelKey: 'minerals.tin' },
  { key: 'gold', labelKey: 'minerals.gold' },
  { key: 'tungsten', labelKey: 'minerals.tungsten' },
]

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

const YES_NO: QuestionOption[] = [
  { value: 'Yes', labelKey: 'options.yes' },
  { value: 'No', labelKey: 'options.no' },
]

const YES_NO_UNKNOWN: QuestionOption[] = [
  ...YES_NO,
  { value: 'Unknown', labelKey: 'options.unknown' },
]

const YES_IPC1755_OTHER_NO: QuestionOption[] = [
  { value: 'Yes, in conformance with IPC1755 (e.g., CMRT)', labelKey: 'options.yesIpc1755' },
  { value: 'Yes, using other format (describe)', labelKey: 'options.yesOtherFormat' },
  { value: 'No', labelKey: 'options.no' },
]

const YES_SEC_EU_NO: QuestionOption[] = [
  { value: 'Yes, with the SEC', labelKey: 'options.yesWithSec' },
  { value: 'Yes, with the EU', labelKey: 'options.yesWithEu' },
  { value: 'Yes, with the SEC and the EU', labelKey: 'options.yesWithSecAndEu' },
  { value: 'No', labelKey: 'options.no' },
]

export const CMRT_Q6_OPTIONS_V6_22_AND_BELOW: QuestionOption[] = [
  { value: '1', labelKey: 'options.percentageOne' },
  { value: 'Greater than 90%', labelKey: 'options.percentageAbove90' },
  { value: 'Greater than 75%', labelKey: 'options.percentageAbove75' },
  { value: 'Greater than 50%', labelKey: 'options.percentageAbove50' },
  { value: '50% or less', labelKey: 'options.percentage50OrLess' },
  { value: 'None', labelKey: 'options.none' },
]

export const CMRT_Q6_OPTIONS_V6_31_AND_ABOVE: QuestionOption[] = [
  { value: '100%', labelKey: 'options.percentage100' },
  { value: 'Greater than 90%', labelKey: 'options.percentageAbove90' },
  { value: 'Greater than 75%', labelKey: 'options.percentageAbove75' },
  { value: 'Greater than 50%', labelKey: 'options.percentageAbove50' },
  { value: '50% or less', labelKey: 'options.percentage50OrLess' },
  { value: 'None', labelKey: 'options.none' },
]

// ---------------------------------------------------------------------------
// CMRT Questions (Q1-Q8)
// ---------------------------------------------------------------------------

function buildCmrtQuestions(q6Options: QuestionOption[]): QuestionDef[] {
  return [
    {
      key: 'Q1',
      labelKey: 'questions.cmrt.q1',
      options: YES_NO,
      perMineral: true,
    },
    {
      key: 'Q2',
      labelKey: 'questions.cmrt.q2',
      options: YES_NO,
      perMineral: true,
    },
    {
      key: 'Q3',
      labelKey: 'questions.cmrt.q3',
      options: YES_NO_UNKNOWN,
      perMineral: true,
    },
    {
      key: 'Q4',
      labelKey: 'questions.cmrt.q4',
      options: YES_NO_UNKNOWN,
      perMineral: true,
    },
    {
      key: 'Q5',
      labelKey: 'questions.cmrt.q5',
      options: YES_NO_UNKNOWN,
      perMineral: true,
    },
    {
      key: 'Q6',
      labelKey: 'questions.cmrt.q6',
      options: q6Options,
      perMineral: true,
    },
    {
      key: 'Q7',
      labelKey: 'questions.cmrt.q7',
      options: YES_NO,
      perMineral: true,
    },
    {
      key: 'Q8',
      labelKey: 'questions.cmrt.q8',
      options: YES_NO,
      perMineral: true,
    },
  ]
}

// ---------------------------------------------------------------------------
// CMRT Company Questions (A-H)
// ---------------------------------------------------------------------------

const CMRT_COMPANY_QUESTIONS: CompanyQuestionDef[] = [
  {
    key: 'A',
    labelKey: 'companyQuestions.cmrt.a',
    options: YES_NO,
    hasCommentField: true,
  },
  {
    key: 'B',
    labelKey: 'companyQuestions.cmrt.b',
    options: YES_NO,
    hasCommentField: true,
    commentLabelKey: 'companyQuestions.cmrt.b_comment',
    commentRequiredWhen: ['Yes'],
  },
  {
    key: 'C',
    labelKey: 'companyQuestions.cmrt.c',
    options: YES_NO,
    hasCommentField: true,
  },
  {
    key: 'D',
    labelKey: 'companyQuestions.cmrt.d',
    options: YES_NO,
    hasCommentField: true,
  },
  {
    key: 'E',
    labelKey: 'companyQuestions.cmrt.e',
    options: YES_IPC1755_OTHER_NO,
    hasCommentField: true,
    commentLabelKey: 'companyQuestions.cmrt.e_comment',
  },
  {
    key: 'F',
    labelKey: 'companyQuestions.cmrt.f',
    options: YES_NO,
    hasCommentField: true,
  },
  {
    key: 'G',
    labelKey: 'companyQuestions.cmrt.g',
    options: YES_NO,
    hasCommentField: true,
  },
  {
    key: 'H',
    labelKey: 'companyQuestions.cmrt.h',
    options: YES_SEC_EU_NO,
    hasCommentField: true,
  },
]

// ---------------------------------------------------------------------------
// Company Info Fields
// ---------------------------------------------------------------------------

const CMRT_COMPANY_FIELDS: FieldDef[] = [
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

const CMRT_PAGES: PageDef[] = [
  { key: 'revision', labelKey: 'tabs.revision', available: true },
  { key: 'instructions', labelKey: 'tabs.instructions', available: true },
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

export interface CmrtVersionOverride {
  id: CmrtVersionId
  q6Options: QuestionOption[]
  productList: {
    productNumberLabelKey: I18nKey
    productNameLabelKey: I18nKey
  }
  smelterList: {
    notListedRequireNameCountry: boolean
    notYetIdentifiedCountryByMetal?: Record<string, string>
  }
  dateConfig: {
    maxDate?: string
  }
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

export function buildCmrtVersionDef(override: CmrtVersionOverride): TemplateVersionDef {
  return {
    templateType: 'cmrt',
    version: { id: override.id, label: override.id },
    pages: CMRT_PAGES,
    mineralScope: {
      mode: 'fixed',
      minerals: CMRT_MINERALS,
    },
    companyInfoFields: CMRT_COMPANY_FIELDS,
    questions: buildCmrtQuestions(override.q6Options),
    companyQuestions: CMRT_COMPANY_QUESTIONS,
    gating: {
      q2Gating: { type: 'q1-not-no' },
      laterQuestionsGating: { type: 'q1q2-not-no' },
      companyQuestionsGating: { type: 'q1q2-not-no' },
      smelterListGating: { type: 'q1q2-not-no' },
    },
    smelterList: {
      metalDropdownSource: { type: 'fixed', metals: CMRT_MINERALS },
      hasIdColumn: true,
      hasLookup: true,
      hasCombinedColumn: false,
      notListedRequireNameCountry: override.smelterList.notListedRequireNameCountry,
      notYetIdentifiedCountryDefault: 'Unknown',
      notYetIdentifiedCountryByMetal: override.smelterList.notYetIdentifiedCountryByMetal,
    },
    mineList: { available: false },
    productList: {
      hasRequesterColumns: false,
      productNumberLabelKey: override.productList.productNumberLabelKey,
      productNameLabelKey: override.productList.productNameLabelKey,
      commentLabelKey: 'productList.cmrt.comment',
    },
    dateConfig: {
      minDate: '2006-12-31',
      maxDate: override.dateConfig.maxDate,
    },
  }
}
