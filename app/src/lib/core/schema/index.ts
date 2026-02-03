/**
 * @file core/schema/index.ts
 * @description 模块导出入口。
 */

// 说明：模块导出入口
import type { FieldDef, TemplateVersionDef } from '@core/registry/types'
import type { MineRow, MineralsScopeRow, ProductRow, SmelterRow } from '@core/types/tableRows'
import { emailSchema } from '@core/validation/email'
import { ERROR_KEYS } from '@core/validation/errorKeys'
import { z } from 'zod/v4'


// ---------------------------------------------------------------------------
// Primitive field schemas
// ---------------------------------------------------------------------------

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, ERROR_KEYS.dateInvalid)

// ---------------------------------------------------------------------------
// Build field schema from FieldDef
// ---------------------------------------------------------------------------

function buildFieldSchema(field: FieldDef): z.ZodType {
  let base: z.ZodType

  switch (field.type) {
    case 'email':
      base = emailSchema
      break
    case 'date':
      base = dateSchema
      break
    case 'text':
    case 'textarea':
    case 'select':
    default:
      base = z.string()
      break
  }

  // Required fields must be non-empty; optional fields can be empty string or missing
  if (field.required === true) {
    if (field.type === 'email') return emailSchema.min(1, ERROR_KEYS.required)
    if (field.type === 'date') return dateSchema.min(1, ERROR_KEYS.required)
    return z.string().min(1, ERROR_KEYS.required)
  }
  return base.optional()
}

// ---------------------------------------------------------------------------
// Company Info schema
// ---------------------------------------------------------------------------

/**
 * 导出函数：buildCompanyInfoSchema。
 */
export function buildCompanyInfoSchema(versionDef: TemplateVersionDef) {
  const shape: Record<string, z.ZodType> = {}
  for (const field of versionDef.companyInfoFields) {
    shape[field.key] = buildFieldSchema(field)
  }
  return z.object(shape)
}

// ---------------------------------------------------------------------------
// Question Matrix schema
// ---------------------------------------------------------------------------

/**
 * 导出函数：buildQuestionMatrixSchema。
 */
export function buildQuestionMatrixSchema(versionDef: TemplateVersionDef) {
  const shape: Record<string, z.ZodType> = {}

  for (const question of versionDef.questions) {
    if (question.perMineral) {
      // Per mineral: Q1.tantalum, Q1.tin, etc.
      const mineralShape: Record<string, z.ZodType> = {}
      for (const mineral of versionDef.mineralScope.minerals) {
        mineralShape[mineral.key] = z.string().optional()
      }
      shape[question.key] = z.object(mineralShape)
    } else {
      // Single question (CRT: not per mineral)
      shape[question.key] = z.string().optional()
    }
  }

  return z.object(shape)
}

// ---------------------------------------------------------------------------
// Question Matrix comment schema
// ---------------------------------------------------------------------------

/**
 * 导出函数：buildQuestionMatrixCommentSchema。
 */
export function buildQuestionMatrixCommentSchema(versionDef: TemplateVersionDef) {
  const shape: Record<string, z.ZodType> = {}

  for (const question of versionDef.questions) {
    if (question.perMineral) {
      const mineralShape: Record<string, z.ZodType> = {}
      for (const mineral of versionDef.mineralScope.minerals) {
        mineralShape[mineral.key] = z.string().optional()
      }
      shape[question.key] = z.object(mineralShape)
    } else {
      shape[question.key] = z.string().optional()
    }
  }

  return z.object(shape)
}

// ---------------------------------------------------------------------------
// Company Questions schema
// ---------------------------------------------------------------------------

/**
 * 导出函数：buildCompanyQuestionsSchema。
 */
export function buildCompanyQuestionsSchema(versionDef: TemplateVersionDef) {
  const shape: Record<string, z.ZodType> = {}

  for (const cq of versionDef.companyQuestions) {
    if (cq.perMineral) {
      const mineralShape: Record<string, z.ZodType> = {}
      for (const mineral of versionDef.mineralScope.minerals) {
        mineralShape[mineral.key] = z.string().optional()
      }
      shape[cq.key] = z.object(mineralShape)
    } else {
      shape[cq.key] = z.string().optional()
    }
    if (cq.hasCommentField) {
      if (cq.perMineral) {
        const mineralShape: Record<string, z.ZodType> = {}
        for (const mineral of versionDef.mineralScope.minerals) {
          mineralShape[mineral.key] = z.string().optional()
        }
        shape[`${cq.key}_comment`] = z.object(mineralShape)
      } else {
        shape[`${cq.key}_comment`] = z.string().optional()
      }
    }
  }

  return z.object(shape).superRefine((data, ctx) => {
    const record = data as Record<string, unknown>
    for (const cq of versionDef.companyQuestions) {
      if (!cq.hasCommentField) continue
      const requiredWhen = cq.commentRequiredWhen ?? []
      const commentKey = `${cq.key}_comment`

      if (cq.perMineral) {
        const valueRecord =
          record[cq.key] && typeof record[cq.key] === 'object'
            ? (record[cq.key] as Record<string, unknown>)
            : {}
        const commentRecord =
          record[commentKey] && typeof record[commentKey] === 'object'
            ? (record[commentKey] as Record<string, unknown>)
            : {}
        if (requiredWhen.length === 0) continue
        for (const mineral of versionDef.mineralScope.minerals) {
          const value = typeof valueRecord[mineral.key] === 'string'
            ? (valueRecord[mineral.key] as string)
            : ''
          if (!value || !requiredWhen.includes(value)) continue
          const commentValue = typeof commentRecord[mineral.key] === 'string'
            ? (commentRecord[mineral.key] as string)
            : ''
          if (commentValue.trim()) continue
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [commentKey, mineral.key],
            message: ERROR_KEYS.companyQuestions.commentRequired,
          })
        }
        continue
      }

      const value =
        typeof record[cq.key] === 'string' ? (record[cq.key] as string) : ''
      if (!value) continue
      if (!requiredWhen.includes(value)) continue
      const commentValue = record[commentKey]
      if (typeof commentValue === 'string' && commentValue.trim()) continue
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [commentKey],
        message: ERROR_KEYS.companyQuestions.commentRequired,
      })
    }
  })
}

// ---------------------------------------------------------------------------
// Smelter List row schema
// ---------------------------------------------------------------------------

/**
 * 导出函数：buildSmelterRowSchema。
 */
export function buildSmelterRowSchema(versionDef: TemplateVersionDef) {
  const shape: Record<string, z.ZodType> = {
    metal: z.string().min(1),
    smelterLookup: z.string().optional(),
    smelterName: z.string().optional(),
    smelterCountry: z.string().optional(),
    smelterIdentification: z.string().optional(),
    sourceId: z.string().optional(),
    smelterStreet: z.string().optional(),
    smelterCity: z.string().optional(),
    smelterState: z.string().optional(),
    smelterContactName: z.string().optional(),
    smelterContactEmail: z.string().optional(),
    proposedNextSteps: z.string().optional(),
    mineName: z.string().optional(),
    mineCountry: z.string().optional(),
    recycledScrap: z.string().optional(),
    comments: z.string().optional(),
  }

  if (versionDef.smelterList.hasCombinedColumn) {
    shape.combinedMetal = z.string().optional()
    shape.combinedSmelter = z.string().optional()
  }

  if (versionDef.smelterList.hasIdColumn) {
    shape.smelterId = z.string().optional()
  }

  return z.object(shape)
}

// ---------------------------------------------------------------------------
// Mine List row schema
// ---------------------------------------------------------------------------

/**
 * 导出函数：buildMineRowSchema。
 */
export function buildMineRowSchema(versionDef: TemplateVersionDef) {
  if (!versionDef.mineList.available) return null

  return z.object({
    metal: z.string().min(1),
    mineName: z.string().optional(),
    mineCountry: z.string().optional(),
    mineId: z.string().optional(),
    mineIdSource: z.string().optional(),
    mineStreet: z.string().optional(),
    mineCity: z.string().optional(),
    mineProvince: z.string().optional(),
    mineDistrict: z.string().optional(),
    mineContactName: z.string().optional(),
    mineContactEmail: z.string().optional(),
    proposedNextSteps: z.string().optional(),
    smelterName: z.string().optional(),
    comments: z.string().optional(),
  })
}

// ---------------------------------------------------------------------------
// Product List row schema
// ---------------------------------------------------------------------------

/**
 * 导出函数：buildProductRowSchema。
 */
export function buildProductRowSchema(versionDef: TemplateVersionDef) {
  const shape: Record<string, z.ZodType> = {
    productNumber: z.string().optional(),
    productName: z.string().optional(),
    comments: z.string().optional(),
  }

  if (versionDef.productList.hasRequesterColumns) {
    shape.requesterNumber = z.string().optional()
    shape.requesterName = z.string().optional()
  }

  return z.object(shape)
}

// ---------------------------------------------------------------------------
// Full form schema
// ---------------------------------------------------------------------------

/**
 * 导出接口类型：FormData。
 */
export interface FormData {
  companyInfo: Record<string, string>
  selectedMinerals: string[]
  customMinerals: string[]
  questions: Record<string, Record<string, string> | string>
  questionComments: Record<string, Record<string, string> | string>
  companyQuestions: Record<string, Record<string, string> | string>
  mineralsScope: MineralsScopeRow[]
  smelterList: SmelterRow[]
  mineList: MineRow[]
  productList: ProductRow[]
}

/**
 * 导出函数：buildFormSchema。
 */
export function buildFormSchema(versionDef: TemplateVersionDef): z.ZodType<FormData, FormData> {
  const mineRowSchema = buildMineRowSchema(versionDef) ?? z.object({})
  const mineralsScopeRowSchema = z.object({
    id: z.string(),
    mineral: z.string(),
    reason: z.string(),
  })
  const schema = z
    .object({
      companyInfo: buildCompanyInfoSchema(versionDef),
      selectedMinerals: z.array(z.string()),
      customMinerals: z.array(z.string()),
      questions: buildQuestionMatrixSchema(versionDef),
      questionComments: buildQuestionMatrixCommentSchema(versionDef),
      companyQuestions: buildCompanyQuestionsSchema(versionDef),
      mineralsScope: z.array(mineralsScopeRowSchema),
      smelterList: z.array(buildSmelterRowSchema(versionDef)),
      mineList: z.array(mineRowSchema),
      productList: z.array(buildProductRowSchema(versionDef)),
    })
    .superRefine((data, ctx) => {
      if (versionDef.mineralScope.mode === 'dynamic-dropdown') {
        const maxCount = versionDef.mineralScope.maxCount
        if (maxCount && data.selectedMinerals.length > maxCount) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['selectedMinerals'],
            message: ERROR_KEYS.minerals.tooManySelected,
          })
        }
        if (data.selectedMinerals.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['selectedMinerals'],
            message: ERROR_KEYS.minerals.selectAtLeastOne,
          })
        }
        if (versionDef.templateType === 'amrt') {
          const otherSelected = data.selectedMinerals.includes('other')
          const otherNames = data.customMinerals
            .map((value) => value.trim())
            .filter(Boolean)
          const baseCount = data.selectedMinerals.filter((key) => key !== 'other').length
          if (maxCount && baseCount + otherNames.length > maxCount) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['selectedMinerals'],
              message: ERROR_KEYS.minerals.tooManySelected,
            })
          }
          if (otherSelected && otherNames.length === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['customMinerals', 0],
              message: ERROR_KEYS.minerals.otherRequired,
            })
          }
          if (!otherSelected && otherNames.length > 0) {
            otherNames.forEach((_, index) => {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['customMinerals', index],
                message: ERROR_KEYS.minerals.otherNotAllowed,
              })
            })
          }
        }
      }

      if (versionDef.mineralScope.mode === 'free-text') {
        const maxCount = versionDef.mineralScope.maxCount ?? data.customMinerals.length
        const hasAny = data.customMinerals.some((value) => value.trim())
        if (!hasAny) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['customMinerals'],
            message: ERROR_KEYS.minerals.enterAtLeastOne,
          })
        }
        if (maxCount !== undefined && data.customMinerals.length > maxCount) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['customMinerals'],
            message: ERROR_KEYS.minerals.tooMany,
          })
        }
      }

      if (versionDef.templateType === 'amrt') {
        data.mineralsScope.forEach((row, index) => {
          const mineral = row.mineral?.trim()
          const reason = row.reason?.trim()
          if (mineral && !reason) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['mineralsScope', index, 'reason'],
              message: ERROR_KEYS.required,
            })
          }
          if (!mineral && reason) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['mineralsScope', index, 'mineral'],
              message: ERROR_KEYS.required,
            })
          }
        })
      }
    })

  return schema as unknown as z.ZodType<FormData, FormData>
}

/**
 * 导出类型：FormDataType。
 */
export type FormDataType = z.infer<ReturnType<typeof buildFormSchema>>
