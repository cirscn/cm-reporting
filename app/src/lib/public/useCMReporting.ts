/**
 * @file public/useCMReporting.ts
 * @description 对外稳定 hook：获取/回填全量 JSON、触发校验、导出 JSON/Excel。
 */

import { useMemo } from 'react'

import { useTemplateActions, useTemplateState } from '../shell/store'
import { useT } from '../ui/i18n/useT'

import type { ExportExcelInput } from './excel'
import { exportToExcel } from './excel'
import type { ReportSnapshotV1 } from './snapshot'
import { stringifySnapshot } from './snapshot'

export interface CMReportingApi {
  snapshot: ReportSnapshotV1
  getSnapshot: () => ReportSnapshotV1
  setSnapshot: (snapshot: ReportSnapshotV1) => void
  exportJson: () => string
  exportExcel: (input: Omit<ExportExcelInput, 'snapshot'>) => Promise<Blob>
  validate: () => Promise<boolean>
}

export function useCMReporting(): CMReportingApi {
  const { meta, form, lists } = useTemplateState()
  const { setFormData, validateForm } = useTemplateActions()
  const { locale } = useT()

  const snapshot = useMemo<ReportSnapshotV1>(() => {
    return {
      schemaVersion: 1,
      templateType: meta.templateType,
      versionId: meta.versionId,
      locale,
      data: { ...form, ...lists },
    }
  }, [meta.templateType, meta.versionId, form, lists, locale])

  return useMemo(
    () => ({
      snapshot,
      getSnapshot: () => snapshot,
      setSnapshot: (next) => {
        if (next.templateType !== meta.templateType || next.versionId !== meta.versionId) {
          throw new Error('snapshot does not match templateType/versionId')
        }
        setFormData(next.data)
      },
      exportJson: () => stringifySnapshot(snapshot),
      exportExcel: (input) => exportToExcel({ ...input, snapshot }),
      validate: () => validateForm(),
    }),
    [meta.templateType, meta.versionId, setFormData, snapshot, validateForm]
  )
}
