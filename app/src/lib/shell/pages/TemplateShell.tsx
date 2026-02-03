/**
 * @file app/pages/TemplateShell.tsx
 * @description 模板壳组件，提供模板上下文并渲染布局。
 */

import type { PageKey, TemplateType } from '@core/registry/types'
import { getWorkflowPages } from '@core/template/workflow'
import { TemplateProvider, useTemplateDerived, useTemplateState } from '@shell/store'
import { useT } from '@ui/i18n/useT'
import { AppLayout } from '@ui/layout/AppLayout'
import { RequiredHintBanner } from '@ui/layout/RequiredHintBanner'
import { useCreation, useMemoizedFn } from 'ahooks'
import type { ReactNode } from 'react'

import { PageActions } from './PageActions'

/** TemplateShell Props。 */
export interface TemplateShellProps {
  templateType: TemplateType
  versionId: string
  pageKey: PageKey
  onNavigatePage: (pageKey: PageKey) => void
  renderPage: (pageKey: PageKey) => ReactNode
  /** 内容区域最大宽度（可选，不设置则填充父容器） */
  maxContentWidth?: number
}

/** 判断是否为合法 PageKey。 */
function isPageKey(value: string, availableKeys: PageKey[]): value is PageKey {
  return availableKeys.includes(value as PageKey)
}

/** 模板壳：提供模板上下文并渲染布局。 */
export function TemplateShell({
  templateType,
  versionId,
  pageKey,
  onNavigatePage,
  renderPage,
  maxContentWidth,
}: TemplateShellProps) {
  return (
    <TemplateProvider templateType={templateType} versionId={versionId}>
      <TemplateScaffold
        pageKey={pageKey}
        onNavigatePage={onNavigatePage}
        renderPage={renderPage}
        maxContentWidth={maxContentWidth}
      />
    </TemplateProvider>
  )
}

/** TemplateScaffold Props。 */
interface TemplateScaffoldProps {
  pageKey: PageKey
  onNavigatePage: (pageKey: PageKey) => void
  renderPage: (pageKey: PageKey) => ReactNode
  maxContentWidth?: number
}

/** 模板页面骨架：负责 tabs/versions 计算与布局。 */
function TemplateScaffold({
  pageKey,
  onNavigatePage,
  renderPage,
  maxContentWidth,
}: TemplateScaffoldProps) {
  const { meta } = useTemplateState()
  const { versionDef } = meta
  const { t, locale, i18n } = useT()
  const { checkerErrors, checkerSummary } = useTemplateDerived()

  /** 工作流页面集合（用于 stepper 与上下页）。 */
  const workflowPages = useCreation(() => getWorkflowPages(versionDef), [versionDef])
  const workflowSteps = useCreation(
    () =>
      workflowPages.map((page) => ({
        key: page.key,
        label: t(page.labelKey),
      })),
    [workflowPages, t, locale, i18n.isInitialized]
  )
  const workflowPageKeys = useCreation(
    () => workflowPages.map((page) => page.key),
    [workflowPages]
  )

  /** 切换 step 时仅允许工作流页面。 */
  const handleStepChange = useMemoizedFn((key: string) => {
    if (isPageKey(key, workflowPageKeys)) onNavigatePage(key)
  })
  const handleGoToChecker = useMemoizedFn(() => {
    onNavigatePage('checker')
  })

  return (
    <AppLayout
      steps={workflowSteps}
      currentStepKey={pageKey}
      onStepChange={handleStepChange}
      maxContentWidth={maxContentWidth}
      bottomSlot={
        <PageActions
          currentPageKey={pageKey}
          onNavigatePage={onNavigatePage}
          pageOrder={workflowPages}
          checkerErrors={checkerErrors}
          checkerSummary={checkerSummary}
        />
      }
    >
      {pageKey !== 'checker' && (
        <RequiredHintBanner
          errorCount={checkerErrors.length}
          onGoToChecker={handleGoToChecker}
        />
      )}
      {renderPage(pageKey)}
    </AppLayout>
  )
}
