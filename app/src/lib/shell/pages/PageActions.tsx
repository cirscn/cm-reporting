/**
 * @file app/pages/PageActions.tsx
 * @description 页面组件。
 */

// 说明：页面组件
import type { PageDef, PageKey } from '@core/registry/types'
import type { CheckerError } from '@core/rules/checker'
import { getPageKeyForFieldPath } from '@core/rules/fieldPath'
import type { CheckerSummary } from '@core/rules/summary'
import type { ErrorKey } from '@core/validation/errorKeys'
import { useOptionalNavigation } from '@shell/navigation/useNavigation'
import { buildTemplatePath } from '@shell/routing/resolveTemplateRoute'
import { useTemplateState } from '@shell/store'
import { useT } from '@ui/i18n/useT'
import { useCreation, useMemoizedFn } from 'ahooks'
import { Alert, Button, Descriptions, Flex, List, Modal, Typography } from 'antd'
import { useState } from 'react'

const { Text } = Typography

/** PageActions Props。 */
interface PageActionsProps {
  currentPageKey: PageKey
  onNavigatePage: (pageKey: PageKey) => void
  pageOrder?: PageDef[]
  checkerErrors: CheckerError[]
  checkerSummary?: CheckerSummary
}

/** 页面上下页动作条。 */
export function PageActions({
  currentPageKey,
  onNavigatePage,
  pageOrder,
  checkerErrors,
  checkerSummary,
}: PageActionsProps) {
  const { meta } = useTemplateState()
  const { templateType, versionId, versionDef } = meta
  const navigation = useOptionalNavigation()
  const { t } = useT()
  const [submitOpen, setSubmitOpen] = useState(false)

  /** 基于当前页计算上一页/下一页（仅包含可用页面）。 */
  const { prev, next } = useCreation(() => {
    const pages = pageOrder && pageOrder.length > 0 ? pageOrder : versionDef.pages.filter((page) => page.available)
    const index = pages.findIndex((page) => page.key === currentPageKey)
    if (index < 0) return { prev: null, next: null }

    return {
      prev: pages[index - 1] ?? null,
      next: pages[index + 1] ?? null,
    }
  }, [currentPageKey, pageOrder, versionDef.pages])
  const isReview = currentPageKey === 'checker'

  const handlePrev = useMemoizedFn(() => {
    if (prev) onNavigatePage(prev.key)
  })

  const handleNext = useMemoizedFn(() => {
    if (next) onNavigatePage(next.key)
  })

  const openSubmit = useMemoizedFn(() => setSubmitOpen(true))
  const closeSubmit = useMemoizedFn(() => setSubmitOpen(false))
  const handleFixErrors = useMemoizedFn(() => {
    const firstError = checkerErrors[0]
    closeSubmit()
    if (!firstError) return
    const pageKey = getPageKeyForFieldPath(firstError.fieldPath)
    const targetPath = buildTemplatePath({
      template: templateType,
      version: versionId,
      page: pageKey,
    })
    const target = `${targetPath}?focus=${encodeURIComponent(firstError.fieldPath)}`
    if (navigation) {
      navigation.actions.navigate(target)
      return
    }
    onNavigatePage(pageKey)
  })

  const translateError = useMemoizedFn(
    (key: ErrorKey, values?: Record<string, string | undefined>) => t(key, values)
  )
  const completion = checkerSummary?.completion ?? (checkerErrors.length ? 0 : 100)
  const totalRequired = checkerSummary?.totalRequired ?? 0
  const completedRequired = checkerSummary?.completedRequired ?? 0

  if (!prev && !next && !isReview) return null

  return (
    <Flex
      align="center"
      justify="space-between"
    >
      <Button onClick={handlePrev} disabled={!prev} style={{ minWidth: 96 }}>
        {t('actions.prev')}
      </Button>
      {isReview ? (
        <>
          <Button type="primary" onClick={openSubmit} className="min-w-24">
            {t('actions.submit')}
          </Button>
          <Modal
            open={submitOpen}
            onCancel={closeSubmit}
            footer={null}
            title={t('checker.submitTitle')}
          >
            <Flex vertical gap="middle">
              <Descriptions column={1}>
                <Descriptions.Item label={t('checker.submitCompletion')}>
                  <Text strong type="success">{completion}%</Text>
                </Descriptions.Item>
                <Descriptions.Item label={t('checker.submitErrors')}>
                  <Text strong type="danger">{checkerErrors.length}</Text>
                </Descriptions.Item>
              </Descriptions>
              {checkerErrors.length === 0 ? (
                <Alert type="success" message={t('checker.submitAllPass')} showIcon />
              ) : (
                <>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {t('checker.submitFixTop')}
                  </Text>
                  <List
                    dataSource={checkerErrors.slice(0, 5)}
                    renderItem={(error) => (
                      <List.Item key={`${error.code}-${error.fieldPath}`} style={{ padding: '4px 0' }}>
                        <Text type="secondary" style={{ fontSize: 14 }}>
                          {translateError(error.messageKey, {
                            field: error.fieldLabelKey ? t(error.fieldLabelKey) : undefined,
                            ...(error.messageValues ?? {}),
                          })}
                        </Text>
                      </List.Item>
                    )}
                  />
                </>
              )}
              <Text type="secondary" style={{ fontSize: 12 }}>
                {t('checker.progressDetail', { done: completedRequired, total: totalRequired })}
              </Text>
              <Flex justify="flex-end" gap={8}>
                <Button onClick={closeSubmit}>{t('checker.submitContinue')}</Button>
                <Button
                  type="primary"
                  onClick={handleFixErrors}
                  disabled={checkerErrors.length === 0}
                >
                  {t('checker.submitFix')}
                </Button>
              </Flex>
            </Flex>
          </Modal>
        </>
      ) : (
        <Button type="primary" onClick={handleNext} disabled={!next} style={{ minWidth: 96 }}>
          {t('actions.next')}
        </Button>
      )}
    </Flex>
  )
}
