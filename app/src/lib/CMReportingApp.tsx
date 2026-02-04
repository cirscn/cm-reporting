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

/**
 * CMReportingApp Props。
 */
export interface CMReportingAppProps {
  /** 模板类型 */
  templateType: TemplateType
  /** 版本 ID */
  versionId: string
  /** 当前页面（受控模式） */
  pageKey?: PageKey
  /** 页面导航回调（受控模式） */
  onNavigatePage?: (pageKey: PageKey) => void
  /** 内容区域最大宽度（可选，不设置则填充父容器） */
  maxContentWidth?: number
  /** 插入点：用于对外门面组件做 snapshot/export 绑定（不作为 public API 承诺）。 */
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
  pageKey: controlledPageKey,
  onNavigatePage,
  maxContentWidth,
  children,
}: CMReportingAppProps) {
  // 内部页面状态（非受控模式）
  const [internalPageKey, setInternalPageKey] = useState<PageKey>(DEFAULT_PAGE)
  const [searchParams, setSearchParams] = useState(new URLSearchParams())

  // 使用受控或非受控模式
  const pageKey = controlledPageKey ?? internalPageKey
  const handleNavigatePage = useCallback((nextPage: PageKey) => {
    if (onNavigatePage) {
      onNavigatePage(nextPage)
    } else {
      setInternalPageKey(nextPage)
    }
    setSearchParams(new URLSearchParams())
  }, [onNavigatePage])

  // 构建导航上下文
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

  // 渲染页面内容
  const renderPage = useCallback((page: PageKey) => {
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
  }, [handleNavigatePage])

  return (
    <NavigationProvider value={navigationValue}>
      <TemplateShell
        templateType={templateType}
        versionId={versionId}
        pageKey={pageKey}
        onNavigatePage={handleNavigatePage}
        renderPage={renderPage}
        maxContentWidth={maxContentWidth}
      >
        {children}
      </TemplateShell>
    </NavigationProvider>
  )
}

export default CMReportingApp
