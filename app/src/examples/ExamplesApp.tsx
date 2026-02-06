/**
 * @file examples/ExamplesApp.tsx
 * @description Example 应用容器：用于验证能力边界与集成模式。
 */

import { SMELTER_LOOKUP_DATA } from '@core/data/lookups'
import { initI18n, type Locale } from '@core/i18n'
import { getDefaultVersion } from '@core/registry'
import type { PageKey, TemplateType } from '@core/registry/types'
import { CMReportingApp } from '@lib/CMReportingApp'
import type { CirsGpmLegacyRoundtripContext } from '@lib/index'
import { cirsGpmLegacyAdapter } from '@lib/index'
import type { ReportSnapshotV1 } from '@lib/public/snapshot'
import { Button, Flex, Select, Typography, message } from 'antd'
import dayjs from 'dayjs'
import { useCallback, useRef, useState } from 'react'

import type { DevExportBridgeRef } from './DevExportBridge'
import { DevExportBridge } from './DevExportBridge'
import { DevImportBridge } from './DevImportBridge'
import { ExamplesHeader } from './ExamplesHeader'
import { useExampleExternalPickers } from './ExternalPickers'
import type { ImportJsonResult } from './ImportJsonModal'
import { ImportJsonModal } from './ImportJsonModal'
import { CMReportingRefScenario } from './scenarios/CMReportingRefScenario'
import { LegacyTransformScenario } from './scenarios/LegacyTransformScenario'
import { SmelterRowClassNameScenario } from './scenarios/SmelterRowClassNameScenario'

const DEFAULT_TEMPLATE: TemplateType = 'cmrt'
const DEFAULT_PAGE: PageKey = 'declaration'

const DAYJS_LOCALE_BY_APP: Record<Locale, string> = {
  'en-US': 'en',
  'zh-CN': 'zh-cn',
}

type ExamplesScenarioKey = 'full-flow' | 'cmreporting-ref' | 'legacy-transform' | 'rowclassname'

const SCENARIO_OPTIONS: Array<{ value: ExamplesScenarioKey; label: string }> = [
  { value: 'full-flow', label: '完整流程（TemplateShell）' },
  { value: 'cmreporting-ref', label: 'CMReporting + ref（Snapshot）' },
  { value: 'legacy-transform', label: 'legacy transform（roundtrip/loose）' },
  { value: 'rowclassname', label: 'SmelterList rowClassName' },
]

function downloadJson(filename: string, jsonText: string) {
  const blob = new Blob([jsonText], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  // 避免部分浏览器在 click 后立即 revoke 导致下载失败（如 Safari）
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

interface ExamplesAppProps {
  locale: Locale
  onLocaleChange: (locale: Locale) => void
}

/**
 * ExamplesApp：Example 应用容器。
 * 管理 templateType、versionId、locale、pageKey 状态，
 * 由 ExamplesHeader 负责顶栏与全局操作。
 */
export function ExamplesApp({ locale, onLocaleChange }: ExamplesAppProps) {
  const [scenario, setScenario] = useState<ExamplesScenarioKey>('full-flow')
  const [templateType, setTemplateType] = useState<TemplateType>(DEFAULT_TEMPLATE)
  const [versionId, setVersionId] = useState(() => getDefaultVersion(DEFAULT_TEMPLATE))
  const [pageKey, setPageKey] = useState<PageKey>(DEFAULT_PAGE)
  const [importOpen, setImportOpen] = useState(false)
  const [pendingSnapshot, setPendingSnapshot] = useState<ReportSnapshotV1 | null>(null)
  const [legacyCtx, setLegacyCtx] = useState<CirsGpmLegacyRoundtripContext | null>(null)
  const exportBridgeRef = useRef<DevExportBridgeRef | null>(null)
  const { onPickProducts, onPickSmelterForRow, productModal, smelterModal } = useExampleExternalPickers()

  const clearImportContext = useCallback(() => {
    setPendingSnapshot(null)
    setLegacyCtx(null)
  }, [])

  const syncGlobalLocale = useCallback((nextLocale: Locale) => {
    initI18n(nextLocale)
    dayjs.locale(DAYJS_LOCALE_BY_APP[nextLocale] ?? 'en')
  }, [])

  // 模板切换：重置版本和页面
  const handleTemplateChange = useCallback((nextTemplate: TemplateType) => {
    setTemplateType(nextTemplate)
    setVersionId(getDefaultVersion(nextTemplate))
    setPageKey(DEFAULT_PAGE)
    clearImportContext()
  }, [clearImportContext])

  // 版本切换：重置页面
  const handleVersionChange = useCallback((nextVersion: string) => {
    setVersionId(nextVersion)
    setPageKey(DEFAULT_PAGE)
    clearImportContext()
  }, [clearImportContext])

  // 语言切换
  const handleLocaleChange = useCallback((nextLocale: Locale) => {
    onLocaleChange(nextLocale)
  }, [onLocaleChange])

  const handleScenarioChange = useCallback((nextScenario: ExamplesScenarioKey) => {
    if (nextScenario === 'full-flow') {
      syncGlobalLocale(locale)
    }
    setScenario(nextScenario)
  }, [locale, syncGlobalLocale])

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

  const handleImported = useCallback((result: ImportJsonResult) => {
    setTemplateType(result.snapshot.templateType)
    setVersionId(result.snapshot.versionId)
    setPageKey(DEFAULT_PAGE)
    setPendingSnapshot(result.snapshot)
    setLegacyCtx(result.source === 'legacy' ? (result.legacyCtx ?? null) : null)
  }, [])

  // 导出处理
  const handleExport = useCallback(() => {
    if (pendingSnapshot) {
      message.warning('正在应用导入数据，请稍后再导出')
      return
    }

    const bridge = exportBridgeRef.current
    if (!bridge) {
      message.error('导出失败：未找到导出桥接组件')
      return
    }

    // Example 约定：始终导出 RMI legacy schema（用于验证“能力边界”与宿主 transform）。
    // - 若本次会话通过 legacy JSON 导入，则使用导入时生成的 ctx 精确回写（roundtrip）。
    // - 若未导入 legacy JSON（纯 UI 新建/编辑），则使用 loose transform 生成 legacy schema（不承诺 byte-level roundtrip）。
    // 宿主如需导出 internal snapshot，可改用 `@lib.stringifySnapshot(snapshot)` 并自定义文件名/持久化策略。
    const snapshot = bridge.getSnapshot()
    const upperTemplate = snapshot.templateType.toUpperCase()
    const legacyReady =
      legacyCtx &&
      legacyCtx.templateType === snapshot.templateType &&
      legacyCtx.versionId === snapshot.versionId

    const legacy = legacyReady
      ? cirsGpmLegacyAdapter.toExternal(snapshot, legacyCtx)
      : cirsGpmLegacyAdapter.toExternalLoose(snapshot)
    const jsonText = JSON.stringify(legacy)
    const filename = `RMI_${upperTemplate}_${snapshot.versionId}.json`

    downloadJson(filename, jsonText)
    message.success(`已导出：${filename}`)
  }, [legacyCtx, pendingSnapshot])

  return (
    <>
      <Flex
        align="center"
        justify="space-between"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 80,
          background: 'var(--ant-color-bg-container)',
          borderBottom: '1px solid var(--ant-color-border-secondary)',
          height: 44,
          padding: '0 12px',
        }}
      >
        <Flex align="center" gap={10}>
          <Typography.Text strong>Examples</Typography.Text>
          {scenario !== 'full-flow' && (
            <Button size="small" onClick={() => handleScenarioChange('full-flow')}>
              返回完整流程
            </Button>
          )}
        </Flex>
        <Select
          value={scenario}
          onChange={handleScenarioChange}
          options={SCENARIO_OPTIONS}
          popupMatchSelectWidth={false}
          style={{ minWidth: 260 }}
        />
      </Flex>

      {scenario === 'full-flow' ? (
        <>
          <ImportJsonModal open={importOpen} onClose={handleCloseImport} onImported={handleImported} />
          {smelterModal}
          {productModal}
          <ExamplesHeader
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
            integrations={{
              smelterList: {
                lookupMode: 'external',
                showLoadingIndicator: false,
                rowClassName: (record) => {
                  const lookup = record.smelterLookup?.trim() ?? ''
                  if (!lookup) return ''
                  if (lookup.toLowerCase() === 'smelter not listed') return 'smelter-row-unlisted'
                  if (lookup.toLowerCase() === 'smelter not yet identified') return ''
                  return SMELTER_LOOKUP_DATA[lookup] ? '' : 'smelter-row-unlisted'
                },
                onPickSmelterForRow,
              },
              productList: {
                addMode: 'external-only',
                label: '外部选择（Examples）',
                showLoadingIndicator: false,
                onPickProducts,
              },
            }}
          >
            <DevImportBridge pendingSnapshot={pendingSnapshot} onApplied={() => setPendingSnapshot(null)} />
            <DevExportBridge ref={exportBridgeRef} />
          </CMReportingApp>
        </>
      ) : scenario === 'cmreporting-ref' ? (
        <CMReportingRefScenario />
      ) : scenario === 'legacy-transform' ? (
        <LegacyTransformScenario />
      ) : (
        <SmelterRowClassNameScenario />
      )}
    </>
  )
}
