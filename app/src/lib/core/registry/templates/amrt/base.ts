import type {
  FieldDef,
  MineralDef,
  PageDef,
  QuestionDef,
  QuestionOption,
  TemplateVersionDef,
} from '../../types'

import type { AmrtVersionId } from './manifest'

// ---------------------------------------------------------------------------
// AMRT Minerals
// ---------------------------------------------------------------------------

export const AMRT_MINERALS_V11_PREFILL: MineralDef[] = [
  { key: 'aluminum', labelKey: 'minerals.aluminum' },
  { key: 'copper', labelKey: 'minerals.copper' },
  { key: 'lithium', labelKey: 'minerals.lithium' },
  { key: 'nickel', labelKey: 'minerals.nickel' },
  { key: 'silver', labelKey: 'minerals.silver' },
  { key: 'chromium', labelKey: 'minerals.chromium' },
  { key: 'zinc', labelKey: 'minerals.zinc' },
]

export const AMRT_V12_PREFILL_LABELS = ['铝', '铬', '铜', '锂', '镍', '银', '锌']

export const AMRT_V11_PREFILL_LABELS = [
  'Aluminium',
  'Copper',
  'Lithium',
  'Nickel',
  'Silver',
  'Chromium',
  'Zinc',
]

export const AMRT_MINERALS_V12_PREFILL: MineralDef[] = [
  { key: 'aluminum', labelKey: 'minerals.aluminum' },
  { key: 'chromium', labelKey: 'minerals.chromium' },
  { key: 'copper', labelKey: 'minerals.copper' },
  { key: 'lithium', labelKey: 'minerals.lithium' },
  { key: 'nickel', labelKey: 'minerals.nickel' },
  { key: 'silver', labelKey: 'minerals.silver' },
  { key: 'zinc', labelKey: 'minerals.zinc' },
]

export const AMRT_MINERALS_V13: MineralDef[] = [
  { key: 'aluminum', labelKey: 'minerals.aluminum' },
  { key: 'iridium', labelKey: 'minerals.iridium' },
  { key: 'lime', labelKey: 'minerals.lime' },
  { key: 'manganese', labelKey: 'minerals.manganese' },
  { key: 'palladium', labelKey: 'minerals.palladium' },
  { key: 'platinum', labelKey: 'minerals.platinum' },
  { key: 'rareEarthElements', labelKey: 'minerals.rareEarthElements' },
  { key: 'rhodium', labelKey: 'minerals.rhodium' },
  { key: 'ruthenium', labelKey: 'minerals.ruthenium' },
  { key: 'silver', labelKey: 'minerals.silver' },
  { key: 'sodaAsh', labelKey: 'minerals.sodaAsh' },
  { key: 'zinc', labelKey: 'minerals.zinc' },
  { key: 'other', labelKey: 'minerals.other' },
]

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

const YES_NO: QuestionOption[] = [
  { value: 'Yes', labelKey: 'options.yes' },
  { value: 'No', labelKey: 'options.no' },
]

const AMRT_Q1_OPTIONS: QuestionOption[] = [
  ...YES_NO,
  { value: 'Unknown', labelKey: 'options.unknown' },
  { value: 'Not declaring', labelKey: 'options.notDeclaring' },
]

const AMRT_Q2_OPTIONS: QuestionOption[] = [
  { value: '1', labelKey: 'options.percentageOne' },
  { value: 'Greater than 90%', labelKey: 'options.percentageAbove90' },
  { value: 'Greater than 75%', labelKey: 'options.percentageAbove75' },
  { value: 'Greater than 50%', labelKey: 'options.percentageAbove50' },
  { value: '50% or less', labelKey: 'options.percentage50OrLess' },
  { value: 'None', labelKey: 'options.none' },
  { value: 'Unknown', labelKey: 'options.unknown' },
  { value: 'Did not survey', labelKey: 'options.didNotSurvey' },
]

// ---------------------------------------------------------------------------
// AMRT Questions (Q1-Q2 only)
// ---------------------------------------------------------------------------

const AMRT_QUESTIONS: QuestionDef[] = [
  { key: 'Q1', labelKey: 'questions.amrt.q1', options: AMRT_Q1_OPTIONS, perMineral: true },
  { key: 'Q2', labelKey: 'questions.amrt.q2', options: AMRT_Q2_OPTIONS, perMineral: true },
]

// ---------------------------------------------------------------------------
// Company Info Fields
// ---------------------------------------------------------------------------

const AMRT_COMPANY_FIELDS: FieldDef[] = [
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
  { key: 'address', labelKey: 'fields.address', type: 'text', required: true },
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

export interface AmrtVersionOverride {
  id: AmrtVersionId
  mineralScope: {
    mode: 'free-text' | 'dynamic-dropdown'
    minerals: MineralDef[]
    defaultCustomMinerals?: string[]
    otherSlotCount?: number
  }
  pages: {
    instructionsFirst: boolean
    hasLookup: boolean
  }
  smelterList: {
    hasIdColumn: boolean
    hasLookup: boolean
    hasCombinedColumn: boolean
    notYetIdentifiedCountryDefault: string
    recycledScrapOptions: 'yes-no' | 'yes-no-unknown'
  }
  mineList: {
    smelterNameMode: 'dropdown' | 'manual'
  }
  productList: {
    hasRequesterColumns: boolean
  }
}

// ---------------------------------------------------------------------------
// Builders
// ---------------------------------------------------------------------------

function buildAmrtPages(pages: AmrtVersionOverride['pages']): PageDef[] {
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
    { key: 'minerals-scope', labelKey: 'tabs.mineralsScope', available: true },
    { key: 'smelter-list', labelKey: 'tabs.smelterList', available: true },
    { key: 'mine-list', labelKey: 'tabs.mineList', available: true },
    { key: 'product-list', labelKey: 'tabs.productList', available: true },
    { key: 'smelter-lookup', labelKey: 'tabs.smelterLookup', available: pages.hasLookup },
    { key: 'checker', labelKey: 'tabs.checker', available: true },
  ]
}

export function buildAmrtVersionDef(override: AmrtVersionOverride): TemplateVersionDef {
  return {
    templateType: 'amrt',
    version: { id: override.id, label: override.id },
    pages: buildAmrtPages(override.pages),
    mineralScope: {
      mode: override.mineralScope.mode,
      minerals: override.mineralScope.minerals,
      maxCount: 10,
      defaultCustomMinerals: override.mineralScope.defaultCustomMinerals,
      otherSlotCount: override.mineralScope.otherSlotCount,
    },
    companyInfoFields: AMRT_COMPANY_FIELDS,
    questions: AMRT_QUESTIONS,
    companyQuestions: [],
    gating: {
      q2Gating: { type: 'q1-not-negatives', negatives: ['No', 'Unknown', 'Not declaring'] },
      laterQuestionsGating: { type: 'always' },
      companyQuestionsGating: { type: 'always' },
      smelterListGating: { type: 'q1-yes' },
    },
    smelterList: {
      metalDropdownSource: { type: 'dynamic-active' },
      hasIdColumn: override.smelterList.hasIdColumn,
      hasLookup: override.smelterList.hasLookup,
      hasCombinedColumn: override.smelterList.hasCombinedColumn,
      notListedRequireNameCountry: true,
      notYetIdentifiedCountryDefault: override.smelterList.notYetIdentifiedCountryDefault,
      recycledScrapOptions: override.smelterList.recycledScrapOptions,
    },
    mineList: {
      available: true,
      metalDropdownSource: { type: 'dynamic-active' },
      smelterNameMode: override.mineList.smelterNameMode,
    },
    productList: {
      hasRequesterColumns: override.productList.hasRequesterColumns,
      productNumberLabelKey: 'productList.amrt.manufacturerNumber',
      productNameLabelKey: 'productList.amrt.manufacturerName',
      commentLabelKey: 'productList.amrt.comment',
    },
    dateConfig: {
      minDate: '2006-12-31',
      maxDate: '2026-03-31',
    },
  }
}
