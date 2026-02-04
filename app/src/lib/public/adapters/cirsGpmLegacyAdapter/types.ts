import { z } from 'zod/v4'

export const templateTypeSchema = z.enum(['cmrt', 'emrt', 'crt', 'amrt'])

const nullableString = z.string().nullable()

const cmtCompanySchema = z
  .object({
    companyName: nullableString.optional(),
    species: nullableString.optional(),
    rangeDescription: nullableString.optional(),
    identify: nullableString.optional(),
    authorization: nullableString.optional(),
    address: nullableString.optional(),
    contactName: nullableString.optional(),
    contactEmail: nullableString.optional(),
    contactPhone: nullableString.optional(),
    authorizerName: nullableString.optional(),
    authorizerJobTitle: nullableString.optional(),
    authorizerEmail: nullableString.optional(),
    authorizerPhone: nullableString.optional(),
    effectiveDate: z.union([z.string(), z.number()]).nullable().optional(),
  })
  .passthrough()

const cmtRangeQuestionSchema = z
  .object({
    type: z.number(),
    question: z.string(),
    answer: nullableString.optional(),
    remark: nullableString.optional(),
  })
  .passthrough()

const cmtCompanyQuestionSchema = z
  .object({
    question: z.string(),
    answer: nullableString.optional(),
    remark: nullableString.optional(),
    type: nullableString.optional(),
  })
  .passthrough()

const cmtSmelterSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    metal: nullableString.optional(),
    smelterLookUp: nullableString.optional(),
    standardSmelterName: nullableString.optional(),
    smelterNumber: nullableString.optional(),
    smelterName: nullableString.optional(),
    smelterCountry: nullableString.optional(),
    smelterProvince: nullableString.optional(),
    smelterCity: nullableString.optional(),
    smelterStreet: nullableString.optional(),
    smelterIdentification: nullableString.optional(),
    smelterContact: nullableString.optional(),
    smelterEmail: nullableString.optional(),
    suggest: nullableString.optional(),
    mineName: nullableString.optional(),
    mineCountry: nullableString.optional(),
    isRecycle: nullableString.optional(),
    remark: nullableString.optional(),
    smelterId: nullableString.optional(),
    sourceId: nullableString.optional(),
  })
  .passthrough()

const mineFacilitySchema = z
  .object({
    smelterId: nullableString.optional(),
    metal: nullableString.optional(),
    smelterName: nullableString.optional(),
    mineFacilityName: nullableString.optional(),
    mineIdentification: nullableString.optional(),
    mineIdentificationNumber: nullableString.optional(),
    mineFacilityCountry: nullableString.optional(),
    mineFacilityStreet: nullableString.optional(),
    mineFacilityCity: nullableString.optional(),
    mineFacilityProvince: nullableString.optional(),
    mineFacilityContact: nullableString.optional(),
    mineFacilityEmail: nullableString.optional(),
    proposedNextSteps: nullableString.optional(),
    comments: nullableString.optional(),
  })
  .passthrough()

const cmtPartSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    productNumber: nullableString.optional(),
    productName: nullableString.optional(),
    requesterNumber: nullableString.optional(),
    requesterName: nullableString.optional(),
    comments: nullableString.optional(),
  })
  .passthrough()

const amrtReasonSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    metal: nullableString.optional(),
    reason: nullableString.optional(),
  })
  .passthrough()

export const cirsGpmLegacyReportSchema = z
  .object({
    name: z.string().optional(),
    questionnaireType: z.number().optional(),
    type: z.string().optional(),
    version: z.string().optional(),

    cmtCompany: cmtCompanySchema.optional(),
    cmtRangeQuestions: z.array(cmtRangeQuestionSchema).optional(),
    cmtCompanyQuestions: z.array(cmtCompanyQuestionSchema).optional(),
    cmtSmelters: z.array(cmtSmelterSchema).optional(),
    minList: z.array(mineFacilitySchema).optional(),
    cmtParts: z.array(cmtPartSchema).optional(),
    amrtReasonList: z.array(amrtReasonSchema).optional(),
  })
  .passthrough()

export type CirsGpmLegacyReport = z.infer<typeof cirsGpmLegacyReportSchema>

export interface NullableFieldState {
  exists: boolean
  wasNull: boolean
  wasString: boolean
  wasNumber: boolean
}

export interface CirsGpmLegacyRoundtripContext {
  templateType: z.infer<typeof templateTypeSchema>
  versionId: string
  original: CirsGpmLegacyReport

  companyFieldStates: Map<string, NullableFieldState>
  effectiveDate: {
    exists: boolean
    originalValue: string | number | null | undefined
    originalType: 'string' | 'number' | 'null' | 'undefined' | 'missing' | 'other'
    derivedAuthorizationDate: string
  }

  rangeQuestionIndexByKey: Map<string, number>
  rangeQuestionFieldStatesByIndex: Map<number, { answer: NullableFieldState; remark: NullableFieldState }>

  companyQuestionIndexByKey: Map<string, number>
  companyQuestionFieldStatesByIndex: Map<number, { answer: NullableFieldState; remark: NullableFieldState }>

  mineralLabelByKey: Map<string, string>

  smelterLegacyIndexByInternalId: Map<string, number>
  smelterFieldStatesByIndex: Map<number, Map<string, NullableFieldState>>
  /** 当 legacy.smelterName 为 null 时，内部为满足必填使用的 fallback（如 standardSmelterName）。 */
  smelterNameFallbackByIndex: Map<number, string>

  mineLegacyIndexByInternalId: Map<string, number>
  mineFieldStatesByIndex: Map<number, Map<string, NullableFieldState>>

  productLegacyIndexByInternalId: Map<string, number>
  productFieldStatesByIndex: Map<number, Map<string, NullableFieldState>>

  amrtReasonIndexByInternalId: Map<string, number>
  amrtReasonFieldStatesByIndex: Map<number, Map<string, NullableFieldState>>
}
