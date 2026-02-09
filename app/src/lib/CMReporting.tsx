/**
 * @file CMReporting.tsx
 * @description 对外唯一推荐的开箱即用入口组件（UI + JSON/Excel 导出契约）。
 */

import type { Locale } from '@core/i18n'
import type { TemplateType } from '@core/registry/types'
import type { ReactNode } from 'react'
import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef } from 'react'

import { CMReportingApp } from './CMReportingApp'
import { CMReportingProvider } from './providers/CMReportingProvider'
import type { CMReportingProviderProps } from './providers/CMReportingProvider'
import type { ExportExcelInput } from './public/excel'
import { exportToExcel } from './public/excel'
import type { CMReportingIntegrations } from './public/integrations'
import type { ReportSnapshotV1 } from './public/snapshot'
import { stringifySnapshot } from './public/snapshot'
import { useTemplateActions, useTemplateState } from './shell/store'

export interface CMReportingRef {
  getSnapshot: () => ReportSnapshotV1
  setSnapshot: (snapshot: ReportSnapshotV1) => void
  exportJson: () => string
  exportExcel: (input: Omit<ExportExcelInput, 'snapshot'>) => Promise<Blob>
  validate: () => Promise<boolean>
}

export interface CMReportingProps {
  templateType: TemplateType
  versionId: string
  locale?: Locale
  onLocaleChange?: (locale: Locale) => void
  theme?: CMReportingProviderProps['theme']
  cssVariables?: CMReportingProviderProps['cssVariables']
  /** 全局只读模式：启用后禁用页面内所有编辑控件。 */
  readOnly?: boolean
  maxContentWidth?: number
  /** 宿主扩展点：外部选择/回写列表等。 */
  integrations?: CMReportingIntegrations
  /** 初始全量快照（用于“编辑旧报告”）。 */
  initialSnapshot?: ReportSnapshotV1
  /** 任意字段变化时回调全量快照（建议宿主自行节流/落库）。 */
  onSnapshotChange?: (snapshot: ReportSnapshotV1) => void
  /** 加载态内容（传给 Provider 的 Suspense fallback）。 */
  fallback?: ReactNode
}

function SnapshotController({
  templateType,
  versionId,
  locale,
  initialSnapshot,
  onSnapshotChange,
  controllerRef,
}: {
  templateType: TemplateType
  versionId: string
  locale: Locale | undefined
  initialSnapshot?: ReportSnapshotV1
  onSnapshotChange?: (snapshot: ReportSnapshotV1) => void
  controllerRef: React.Ref<CMReportingRef>
}) {
  const { meta, form, lists } = useTemplateState()
  const { setFormData, validateForm } = useTemplateActions()
  const importedSnapshotRef = useRef<ReportSnapshotV1 | null>(null)
  const hydratedRef = useRef<boolean>(!initialSnapshot)

  const snapshot = useMemo<ReportSnapshotV1>(() => {
    return {
      schemaVersion: 1,
      templateType: meta.templateType,
      versionId: meta.versionId,
      locale,
      data: {
        ...form,
        ...lists,
      },
    }
  }, [meta.templateType, meta.versionId, form, lists, locale])

  // 在首帧绘制前完成 “编辑旧报告” 的快照导入，避免宿主在 useLayoutEffect 里读取 ref 时拿到旧数据。
  useLayoutEffect(() => {
    if (!initialSnapshot) {
      hydratedRef.current = true
      return
    }
    if (importedSnapshotRef.current === initialSnapshot) return
    hydratedRef.current = false
    setFormData(initialSnapshot.data)
    importedSnapshotRef.current = initialSnapshot
    hydratedRef.current = true
  }, [initialSnapshot, setFormData])

  useEffect(() => {
    if (!hydratedRef.current) return
    onSnapshotChange?.(snapshot)
  }, [snapshot, onSnapshotChange])

  useImperativeHandle(
    controllerRef,
    (): CMReportingRef => ({
      getSnapshot: () => snapshot,
      setSnapshot: (next) => {
        if (next.templateType !== templateType || next.versionId !== versionId) {
          throw new Error('snapshot does not match templateType/versionId')
        }
        setFormData(next.data)
      },
      exportJson: () => stringifySnapshot(snapshot),
      exportExcel: async (input) => exportToExcel({ ...input, snapshot }),
      validate: () => validateForm(),
    }),
    [snapshot, setFormData, validateForm, templateType, versionId]
  )

  return null
}

/**
 * CMReporting：对外唯一推荐入口。
 * - UI：开箱即用渲染整套流程
 * - 数据：全量 JSON snapshot 导入/导出
 * - 导出：Excel（基于模板赋值后导出）
 */
export const CMReporting = forwardRef<CMReportingRef, CMReportingProps>(function CMReporting(
  {
    templateType,
    versionId,
    locale = 'en-US',
    onLocaleChange,
    theme,
    cssVariables,
    readOnly = false,
    maxContentWidth,
    integrations,
    initialSnapshot,
    onSnapshotChange,
    fallback,
  },
  ref
) {
  if (
    initialSnapshot &&
    (initialSnapshot.templateType !== templateType || initialSnapshot.versionId !== versionId)
  ) {
    throw new Error('initialSnapshot does not match templateType/versionId')
  }

  return (
    <CMReportingProvider
      locale={locale}
      onLocaleChange={onLocaleChange}
      theme={theme}
      cssVariables={cssVariables}
      fallback={fallback}
    >
      <CMReportingApp
        templateType={templateType}
        versionId={versionId}
        readOnly={readOnly}
        maxContentWidth={maxContentWidth}
        integrations={integrations}
      >
        <SnapshotController
          controllerRef={ref}
          templateType={templateType}
          versionId={versionId}
          locale={locale}
          initialSnapshot={initialSnapshot}
          onSnapshotChange={onSnapshotChange}
        />
      </CMReportingApp>
    </CMReportingProvider>
  )
})
