/**
 * @file public/snapshot.ts
 * @description 对外稳定的数据快照（全量 JSON）契约。
 */

import type { Locale } from '@core/i18n'
import type { TemplateType } from '@core/registry/types'
import type { FormData } from '@core/schema'
import { z } from 'zod/v4'

export const REPORT_SNAPSHOT_SCHEMA_VERSION = 1 as const

export interface ReportSnapshotV1 {
  schemaVersion: typeof REPORT_SNAPSHOT_SCHEMA_VERSION
  templateType: TemplateType
  versionId: string
  locale?: Locale
  /** 全量表单数据（与 UI 内部状态一致）。 */
  data: FormData
}

const templateTypeSchema = z.enum(['cmrt', 'emrt', 'crt', 'amrt'])
const localeSchema = z.enum(['en-US', 'zh-CN'])

const mineralsScopeRowSchema = z.object({ id: z.string(), mineral: z.string(), reason: z.string() })

const smelterRowSchema = z.object({
  id: z.string(),
  metal: z.string(),
  smelterLookup: z.string(),
  smelterName: z.string(),
  smelterCountry: z.string(),
  combinedMetal: z.string().optional(),
  combinedSmelter: z.string().optional(),
  smelterId: z.string().optional(),
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
}).catchall(z.string().optional())

const mineRowSchema = z.object({
  id: z.string(),
  metal: z.string(),
  smelterName: z.string(),
  mineName: z.string(),
  mineCountry: z.string(),
  mineId: z.string().optional(),
  mineIdSource: z.string().optional(),
  mineStreet: z.string().optional(),
  mineCity: z.string().optional(),
  mineProvince: z.string(),
  mineDistrict: z.string(),
  mineContactName: z.string().optional(),
  mineContactEmail: z.string().optional(),
  proposedNextSteps: z.string().optional(),
  comments: z.string(),
}).catchall(z.string().optional())

const productRowSchema = z.object({
  id: z.string(),
  productNumber: z.string(),
  productName: z.string(),
  requesterNumber: z.string().optional(),
  requesterName: z.string().optional(),
  comments: z.string(),
}).catchall(z.string().optional())

// 注意：这里做“结构级”校验（顶层 keys/类型），不做“按模板版本”细粒度校验。
const snapshotV1Schema: z.ZodType<ReportSnapshotV1> = z.object({
  schemaVersion: z.literal(REPORT_SNAPSHOT_SCHEMA_VERSION),
  templateType: templateTypeSchema,
  versionId: z.string().min(1),
  locale: localeSchema.optional(),
  data: z.object({
    companyInfo: z.record(z.string(), z.string()),
    selectedMinerals: z.array(z.string()),
    customMinerals: z.array(z.string()),
    questions: z.record(z.string(), z.union([z.string(), z.record(z.string(), z.string())])),
    questionComments: z.record(z.string(), z.union([z.string(), z.record(z.string(), z.string())])),
    companyQuestions: z.record(z.string(), z.union([z.string(), z.record(z.string(), z.string())])),
    mineralsScope: z.array(mineralsScopeRowSchema),
    smelterList: z.array(smelterRowSchema),
    mineList: z.array(mineRowSchema),
    productList: z.array(productRowSchema),
  }),
})

export function parseSnapshot(input: unknown): ReportSnapshotV1 {
  return snapshotV1Schema.parse(input)
}

export function stringifySnapshot(snapshot: ReportSnapshotV1): string {
  // 预留：未来若要 canonical JSON（稳定 key 顺序）可在这里实现。
  return JSON.stringify(snapshot)
}
