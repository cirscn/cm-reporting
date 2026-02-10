/**
 * @file app/pages/PageActions.tsx
 * @description 页面底部翻页操作。
 */

import type { PageDef, PageKey } from '@core/registry/types'
import { useTemplateState } from '@shell/store'
import { useT } from '@ui/i18n/useT'
import { useCreation, useMemoizedFn } from 'ahooks'
import { Button, Flex } from 'antd'

interface PageActionsProps {
  currentPageKey: PageKey
  onNavigatePage: (pageKey: PageKey) => void
  pageOrder?: PageDef[]
}

/** 页面上一页/下一页动作条。 */
export function PageActions({ currentPageKey, onNavigatePage, pageOrder }: PageActionsProps) {
  const { meta } = useTemplateState()
  const { versionDef } = meta
  const { t } = useT()

  const { prev, next } = useCreation(() => {
    const pages =
      pageOrder && pageOrder.length > 0
        ? pageOrder
        : versionDef.pages.filter((page) => page.available)
    const index = pages.findIndex((page) => page.key === currentPageKey)
    if (index < 0) return { prev: null, next: null }

    return {
      prev: pages[index - 1] ?? null,
      next: pages[index + 1] ?? null,
    }
  }, [currentPageKey, pageOrder, versionDef.pages])

  const handlePrev = useMemoizedFn(() => {
    if (prev) onNavigatePage(prev.key)
  })

  const handleNext = useMemoizedFn(() => {
    if (next) onNavigatePage(next.key)
  })

  if (!prev && !next) return null

  return (
    <Flex align="center" justify="space-between">
      <Button onClick={handlePrev} disabled={!prev} style={{ minWidth: 96 }}>
        {t('actions.prev')}
      </Button>
      <Button type="primary" onClick={handleNext} disabled={!next} style={{ minWidth: 96 }}>
        {t('actions.next')}
      </Button>
    </Flex>
  )
}
