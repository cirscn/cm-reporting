/**
 * @file lib/index.ts
 * @description NPM 包公共 API 入口。
 */

import './styles.css'

// ---------------------------------------------------------------------------
// Stable Public API（开箱即用 + 数据/导出契约）
// ---------------------------------------------------------------------------

export { CMReporting } from './CMReporting'
export type { CMReportingProps, CMReportingRef } from './CMReporting'

export type { Locale } from './core/i18n'
export type { TemplateType } from './core/registry/types'
export type { SmelterRow, ProductRow, MineRow, MineralsScopeRow } from './core/types/tableRows'

// 全量 JSON 快照契约
export type { ReportSnapshotV1 } from './public/snapshot'
export {
  REPORT_SNAPSHOT_SCHEMA_VERSION,
  parseSnapshot,
  stringifySnapshot,
} from './public/snapshot'

// 对外 hook（用于宿主获取/回填快照与导出）
export { useCMReporting } from './public/useCMReporting'
export type { CMReportingApi } from './public/useCMReporting'

// 对外 integrations（宿主接管外部选择与回写）
export type {
  CMReportingIntegrations,
  ExternalAddMode,
  ExternalPickResult,
  SmelterExternalPickItem,
  SmelterLookupMode,
  SmelterRowPickContext,
  ProductListIntegration,
  ProductPickContext,
  SmelterListIntegration,
} from './public/integrations'

// Excel 导出（基于模板赋值后导出）
export { exportToExcel } from './public/excel'
export type { ExportExcelInput } from './public/excel'

// ---------------------------------------------------------------------------
// Company Internal Adapter（cirs-gpm legacy JSON ↔ internal snapshot）
// ---------------------------------------------------------------------------

export { cirsGpmLegacyAdapter } from './public/adapters/cirsGpmLegacyAdapter'
export type {
  CirsGpmLegacyReport,
  CirsGpmLegacyRoundtripContext,
  ParsedCirsGpmLegacyReport,
} from './public/adapters/cirsGpmLegacyAdapter'
