/**
 * @file demo/DevApp.tsx
 * @description Demo 应用容器，管理模板/版本/语言切换状态。
 */

import type { Locale } from '@core/i18n'
import { getDefaultVersion } from '@core/registry'
import type { PageKey, TemplateType } from '@core/registry/types'
import { CMReportingApp } from '@lib/CMReportingApp'
import type { ReportSnapshotV1 } from '@lib/public/snapshot'
import { useCallback, useState } from 'react'

import { DemoHeader } from './DemoHeader'
import { DevImportBridge } from './DevImportBridge'
import { ImportJsonModal } from './ImportJsonModal'

const DEFAULT_TEMPLATE: TemplateType = 'cmrt'
const DEFAULT_PAGE: PageKey = 'declaration'
interface DevAppProps {
  locale: Locale
  onLocaleChange: (locale: Locale) => void
}

/**
 * DevApp：Demo 应用容器。
 * 管理 templateType、versionId、locale、pageKey 状态，
 * 由 DemoHeader 负责顶栏与全局操作。
 */
export function DevApp({ locale, onLocaleChange }: DevAppProps) {
  const [templateType, setTemplateType] = useState<TemplateType>(DEFAULT_TEMPLATE)
  const [versionId, setVersionId] = useState(() => getDefaultVersion(DEFAULT_TEMPLATE))
  const [pageKey, setPageKey] = useState<PageKey>(DEFAULT_PAGE)
  const [importOpen, setImportOpen] = useState(false)
  const [pendingSnapshot, setPendingSnapshot] = useState<ReportSnapshotV1 | null>(null)

  // 模板切换：重置版本和页面
  const handleTemplateChange = useCallback((nextTemplate: TemplateType) => {
    setTemplateType(nextTemplate)
    setVersionId(getDefaultVersion(nextTemplate))
    setPageKey(DEFAULT_PAGE)
    setPendingSnapshot(null)
  }, [])

  // 版本切换：重置页面
  const handleVersionChange = useCallback((nextVersion: string) => {
    setVersionId(nextVersion)
    setPageKey(DEFAULT_PAGE)
    setPendingSnapshot(null)
  }, [])

  // 语言切换
  const handleLocaleChange = useCallback((nextLocale: Locale) => {
    onLocaleChange(nextLocale)
  }, [onLocaleChange])

  // 页面导航
  const handleNavigatePage = useCallback((nextPage: PageKey) => {
    setPageKey(nextPage)
  }, [])

  const handleOpenImport = useCallback(() => {
    setImportOpen(true)
  }, [])

  const handleCloseImport = useCallback(() => {
    setImportOpen(false)
  }, [])

  const handleImported = useCallback((snapshot: ReportSnapshotV1) => {
    setTemplateType(snapshot.templateType)
    setVersionId(snapshot.versionId)
    setPageKey(DEFAULT_PAGE)
    setPendingSnapshot(snapshot)
  }, [])

  // 导出处理
  const handleExport = useCallback(() => {
    console.log('Export triggered', { templateType, versionId, locale })
    // TODO: 实现导出逻辑
  }, [templateType, versionId, locale])

  return (
    <>
      <ImportJsonModal open={importOpen} onClose={handleCloseImport} onImported={handleImported} />
      <DemoHeader
        templateType={templateType}
        versionId={versionId}
        locale={locale}
        onTemplateChange={handleTemplateChange}
        onVersionChange={handleVersionChange}
        onLocaleChange={handleLocaleChange}
        onExport={handleExport}
        onImport={handleOpenImport}
      />
      <CMReportingApp
        templateType={templateType}
        versionId={versionId}
        pageKey={pageKey}
        onNavigatePage={handleNavigatePage}
        maxContentWidth={1400}
      >
        <DevImportBridge pendingSnapshot={pendingSnapshot} onApplied={() => setPendingSnapshot(null)} />
      </CMReportingApp>
    </>
  )
}
