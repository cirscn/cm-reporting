import type { TemplateType } from '@core/registry/types'

import type { ReportSnapshotV1 } from '../../snapshot'

import { parseCirsGpmLegacyReport } from './parse'
import { internalToCirsGpmLegacy } from './toExternal'
import { cirsGpmLegacyToInternal } from './toInternal'
import type { CirsGpmLegacyReport, CirsGpmLegacyRoundtripContext } from './types'

function resolveQuestionnaireType(templateType: TemplateType): number | undefined {
  if (templateType === 'cmrt') return 1
  if (templateType === 'emrt') return 2
  if (templateType === 'amrt') return 3
  return undefined
}

export const cirsGpmLegacyAdapter = {
  parse: parseCirsGpmLegacyReport,
  toInternal: cirsGpmLegacyToInternal,
  toExternal: internalToCirsGpmLegacy,
  /**
   * 从“纯内部 snapshot”导出 legacy JSON（不依赖导入得到的 ctx）。
   *
   * 语义：
   * - `toExternal(snapshot, ctx)`：用于 legacy JSON → internal → legacy JSON 的精确回写（尽量保留 missing/null/number/string 等历史细节）。
   * - `toExternalLoose(snapshot)`：用于“未导入 legacy JSON，但希望导出 legacy schema”的场景；只保证输出符合 legacy schema，
   *   不承诺 byte-level roundtrip，也不承诺完全复刻某个历史系统的字段缺失/类型细节。
   */
  toExternalLoose: (snapshot: ReportSnapshotV1): CirsGpmLegacyReport => {
    const ctx = createScratchRoundtripContext(snapshot.templateType, snapshot.versionId)
    return internalToCirsGpmLegacy(snapshot, ctx)
  },
} as const

export function createScratchRoundtripContext(
  templateType: TemplateType,
  versionId: string
): CirsGpmLegacyRoundtripContext {
  // 通过最小 legacy “骨架”构造 ctx：用于 loose 导出时提供版本/字段计划与类型回写策略。
  // 注意：这不是从真实 legacy JSON 导入得到的 ctx，因此不能用于要求“原样回吐”的 roundtrip 场景。
  const upper = templateType.toUpperCase()
  const legacy: CirsGpmLegacyReport =
    templateType === 'crt'
      ? {
          type: 'crt',
          version: `RMI_${upper}_${versionId}`,
          cmtCompany: {},
          cmtRangeQuestions: [],
          cmtCompanyQuestions: [],
          cmtSmelters: [],
          minList: [],
          cmtParts: [],
        }
      : {
          name: `RMI_${upper}_${versionId}`,
          questionnaireType: resolveQuestionnaireType(templateType),
          cmtCompany: {},
          cmtRangeQuestions: [],
          cmtCompanyQuestions: [],
          cmtSmelters: [],
          minList: [],
          cmtParts: [],
          ...(templateType === 'amrt' ? { amrtReasonList: [] } : {}),
        }
  return cirsGpmLegacyToInternal(legacy).ctx
}

export type { CirsGpmLegacyReport, CirsGpmLegacyRoundtripContext } from './types'
export type { ParsedCirsGpmLegacyReport } from './parse'
