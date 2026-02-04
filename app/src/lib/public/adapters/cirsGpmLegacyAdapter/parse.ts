import { getVersionDef } from '@core/registry'
import type { TemplateType } from '@core/registry/types'

import { cirsGpmLegacyReportSchema, templateTypeSchema } from './types'
import type { CirsGpmLegacyReport } from './types'

export interface ParsedCirsGpmLegacyReport {
  legacy: CirsGpmLegacyReport
  templateType: TemplateType
  versionId: string
}

const VERSION_RE = /RMI_(CMRT|EMRT|CRT|AMRT)_([0-9.]+)/i

function normalizeTemplateType(value: string): TemplateType | null {
  const lower = value.toLowerCase()
  const parsed = templateTypeSchema.safeParse(lower)
  return parsed.success ? (parsed.data as TemplateType) : null
}

function parseFromNameOrVersion(value: string): { templateType: TemplateType; versionId: string } | null {
  const match = value.match(VERSION_RE)
  if (!match) return null
  const tt = normalizeTemplateType(match[1]!)
  if (!tt) return null
  return { templateType: tt, versionId: match[2]! }
}

export function parseCirsGpmLegacyReport(input: unknown): ParsedCirsGpmLegacyReport {
  const legacy = cirsGpmLegacyReportSchema.parse(input)

  const fromType = legacy.type ? normalizeTemplateType(legacy.type) : null
  const fromName = legacy.name ? parseFromNameOrVersion(legacy.name) : null
  const fromVersion = legacy.version ? parseFromNameOrVersion(legacy.version) : null

  const inferred = fromName ?? fromVersion
  const templateType = fromType ?? inferred?.templateType
  const versionId = inferred?.versionId

  if (!templateType || !versionId) {
    throw new Error('cannot infer templateType/versionId from legacy report')
  }
  if (fromType && inferred && fromType !== inferred.templateType) {
    throw new Error('legacy report templateType mismatch between type and name/version')
  }

  try {
    getVersionDef(templateType, versionId)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(`unsupported template/version: ${templateType}@${versionId} (${message})`)
  }

  return { legacy, templateType, versionId }
}
