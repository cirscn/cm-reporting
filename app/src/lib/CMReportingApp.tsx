/**
 * @file lib/CMReportingApp.tsx
 * @description 主入口组件，接收 templateType、versionId 等 props。
 */

import type { PageKey, TemplateType } from '@core/registry/types'
import { NavigationProvider } from '@shell/navigation/NavigationContext'
import { CheckerPage } from '@shell/pages/CheckerPage'
import { DeclarationPage } from '@shell/pages/DeclarationPage'
import { DocPage } from '@shell/pages/DocContent'
import { MineListPage } from '@shell/pages/MineListPage'
import { MineralsScopePage } from '@shell/pages/MineralsScopePage'
import { ProductListPage } from '@shell/pages/ProductListPage'
import { RevisionPage } from '@shell/pages/RevisionPage'
import { SmelterListPage } from '@shell/pages/SmelterListPage'
import { TemplateShell } from '@shell/pages/TemplateShell'
import { buildTemplatePath } from '@shell/routing/resolveTemplateRoute'
import { compact } from 'lodash-es'
import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import type { CMReportingIntegrations } from './public/integrations'

/**
 * CMReportingApp Props。
 */
export interface CMReportingAppProps {
  /** 模板类型 */
  templateType: TemplateType
  /** 版本 ID */
  versionId: string
  /** 全局只读模式 */
  readOnly?: boolean
  /** 是否显示底部翻页操作（默认 true） */
  showPageActions?: boolean
  /** 当前页面（受控模式） */
  pageKey?: PageKey
  /** 页面导航回调（受控模式） */
  onNavigatePage?: (pageKey: PageKey) => void
  /** 内容区域最大宽度（可选，不设置则填充父容器） */
  maxContentWidth?: number
  /** 宿主扩展点：外部选择/回写列表等 */
  integrations?: CMReportingIntegrations
  /** 插入点：用于对外门面组件做 snapshot/export 绑定（不作为 public API 承诺） */
  children?: ReactNode
}

const DEFAULT_PAGE: PageKey = 'declaration'

/**
 * CMReportingApp：主入口组件。
 * 接收 templateType、versionId 作为 props，内部管理页面导航状态。
 */
export function CMReportingApp({
  templateType,
  versionId,
  readOnly = false,
  showPageActions = true,
  pageKey: controlledPageKey,
  onNavigatePage,
  maxContentWidth,
  integrations,
  children,
}: CMReportingAppProps) {
  const [internalPageKey, setInternalPageKey] = useState<PageKey>(DEFAULT_PAGE)
  const [searchParams, setSearchParams] = useState(new URLSearchParams())

  const pageKey = controlledPageKey ?? internalPageKey
  const handleNavigatePage = useCallback(
    (nextPage: PageKey) => {
      if (onNavigatePage) {
        onNavigatePage(nextPage)
      } else {
        setInternalPageKey(nextPage)
      }
      setSearchParams(new URLSearchParams())
    },
    [onNavigatePage],
  )

  const navigationValue = useMemo(() => {
    return {
      state: {
        pathname: buildTemplatePath({ template: templateType, version: versionId, page: pageKey }),
        params: {
          template: templateType,
          version: versionId,
          page: pageKey,
        },
        searchParams,
      },
      actions: {
        navigate: (to: string) => {
          const url = new URL(to, 'http://app.local')
          const segments = compact(url.pathname.split('/'))
          const nextPage = (segments[2] || pageKey) as PageKey
          handleNavigatePage(nextPage)
          setSearchParams(new URLSearchParams(url.search))
        },
      },
    }
  }, [pageKey, searchParams, templateType, versionId, handleNavigatePage])

  const renderPage = useCallback(
    (page: PageKey) => {
      switch (page) {
        case 'revision':
          return <RevisionPage />
        case 'instructions':
          return <DocPage titleKey="tabs.instructions" section="instructions" />
        case 'definitions':
          return <DocPage titleKey="tabs.definitions" section="definitions" />
        case 'declaration':
          return <DeclarationPage />
        case 'minerals-scope':
          return <MineralsScopePage />
        case 'smelter-list':
          return <SmelterListPage />
        case 'checker':
          return (
            <CheckerPage
              onNavigateToField={(targetPage, fieldPath) => {
                handleNavigatePage(targetPage)
                setSearchParams(new URLSearchParams({ focus: fieldPath }))
              }}
            />
          )
        case 'mine-list':
          return <MineListPage />
        case 'product-list':
          return <ProductListPage />
        case 'smelter-lookup':
          return <DocPage titleKey="tabs.smelterLookup" section="smelterLookup" />
        default:
          return <DeclarationPage />
      }
    },
    [handleNavigatePage],
  )

  return (
    <NavigationProvider value={navigationValue}>
      <TemplateShell
        templateType={templateType}
        versionId={versionId}
        readOnly={readOnly}
        showPageActions={showPageActions}
        pageKey={pageKey}
        onNavigatePage={handleNavigatePage}
        renderPage={renderPage}
        maxContentWidth={maxContentWidth}
        integrations={integrations}
      >
        {children}
      </TemplateShell>
    </NavigationProvider>
  )
}

export default CMReportingApp
