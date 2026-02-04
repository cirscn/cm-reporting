import type { TemplateType } from '@core/registry'

import { EXCEL_TEMPLATE_ANCHORS } from './excelMappings.generated'

export interface ExcelDeclarationAnchors {
  questionHeaderRowByNumber: Record<string, number>
  questionSpanByNumber: Record<string, number>
  companyHeaderRowByKey: Record<string, number>
  companySpanByKey: Record<string, number>
  amrtQ1Row: number | null
  amrtQ2Row: number | null
  amrtQ3Row: number | null
}

export function getExcelDeclarationAnchors(type: TemplateType, versionId: string): ExcelDeclarationAnchors {
  const byType = (EXCEL_TEMPLATE_ANCHORS as Record<TemplateType, Record<string, ExcelDeclarationAnchors> | undefined>)[type]
  const hit = byType?.[versionId]
  if (!hit) {
    // Fail-fast: for open-source consumers, missing mapping is a bug in our release pipeline.
    throw new Error(`Missing Excel anchor mapping for ${type}@${versionId}. Run pnpm generate:excel-mapping.`)
  }
  return hit
}
