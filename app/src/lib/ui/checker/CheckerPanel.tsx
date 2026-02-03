/**
 * @file ui/checker/CheckerPanel.tsx
 * @description 模块实现。
 */

// 说明：模块实现
import type { TemplateVersionDef } from '@core/registry/types'
import type { CheckerError } from '@core/rules/checker'
import { groupCheckerErrors } from '@core/rules/errorGroups'
import type { ErrorKey } from '@core/validation/errorKeys'
import { useT } from '@ui/i18n'
import { useCreation, useMemoizedFn } from 'ahooks'
import { Button, Card, Collapse, Flex, List, Tag, Typography } from 'antd'
import { useState } from 'react'

import type { CheckerSummary, PassedItem } from './types'

const { Text, Title } = Typography

interface CheckerPanelProps {
  versionDef: TemplateVersionDef
  errors: CheckerError[]
  summary?: CheckerSummary
  passedItems?: PassedItem[]
  onGoToField?: (error: CheckerError) => void
}

/**
 * 导出函数：CheckerPanel。
 */
export function CheckerPanel({
  versionDef,
  errors,
  summary,
  passedItems = [],
  onGoToField,
}: CheckerPanelProps) {
  const { t } = useT()
  /** 错误文案翻译：使用稳定引用避免子树重复渲染。 */
  const translateError = useMemoizedFn(
    (key: ErrorKey, values?: Record<string, string | undefined>) => t(key, values)
  )
  const hasErrors = errors.length > 0
  const [showPassedDetails, setShowPassedDetails] = useState(false)
  const totalRequired = summary?.totalRequired ?? 0
  const completedRequired = summary?.completedRequired ?? 0
  const passedLabel = summary
    ? t('checker.passedSummary', { count: completedRequired, total: totalRequired })
    : t('checker.noErrors')

  /** 仅在 errors/versionDef 变化时重分组，减少渲染成本。 */
  const groupedErrors = useCreation(() => groupCheckerErrors(errors, versionDef), [errors, versionDef])
  /** 统一的跳转回调，避免在列表内创建多层函数。 */
  const handleGoToField = useMemoizedFn((error: CheckerError) => {
    onGoToField?.(error)
  })
  /** 缓存跳转按钮 handler（返回函数，不在渲染期执行）。 */
  const goToFieldHandlers = useCreation(() => {
    const map = new Map<string, () => void>()
    if (!onGoToField) return map
    errors.forEach((error) => {
      map.set(`${error.code}-${error.fieldPath}`, () => handleGoToField(error))
    })
    return map
  }, [errors, handleGoToField, onGoToField])
  /** 获取稳定的跳转 handler。 */
  const getGoToFieldHandler = useMemoizedFn((error: CheckerError) =>
    goToFieldHandlers.get(`${error.code}-${error.fieldPath}`)
  )
  const togglePassedDetails = useMemoizedFn(() => {
    setShowPassedDetails((prev) => !prev)
  })
  const passedBodyStyle = showPassedDetails ? undefined : { display: 'none' }

  return (
    <Flex vertical gap={16}>
      <div>
        <Title level={5} style={{ margin: 0 }}>{t('tabs.checker')}</Title>
        <Text type="secondary">{t('checker.subtitle')}</Text>
      </div>

      <Card
        title={
          <Flex align="center" justify="space-between" style={{ width: '100%' }}>
            <Flex align="center" gap={8}>
              <span aria-hidden>❌</span>
              <Text type="danger" strong>{t('checker.errorsTitle')}</Text>
            </Flex>
            <Tag color="error">{t('checker.errorBadge', { count: errors.length })}</Tag>
          </Flex>
        }
      >
        {!hasErrors ? (
          <Typography.Text type="secondary">{t('checker.noErrors')}</Typography.Text>
        ) : (
          <Collapse
            bordered={false}
            defaultActiveKey={groupedErrors.map((g) => g.key)}
            items={groupedErrors.map((group) => ({
              key: group.key,
              label: (
                <Flex align="center" justify="space-between" style={{ width: '100%' }}>
                  <Text type="secondary">{t(group.labelKey)}</Text>
                  <Tag>{t('checker.groupCount', { count: group.items.length })}</Tag>
                </Flex>
              ),
              children: (
                <Flex vertical gap={8}>
                  {group.items.map((error) => {
                    const errorKey = `${error.code}-${error.fieldPath}`
                    return (
                      <Flex key={errorKey} align="flex-start" justify="space-between" gap={12}>
                        <Text>
                          {translateError(error.messageKey, {
                            field: error.fieldLabelKey ? t(error.fieldLabelKey) : undefined,
                            ...(error.messageValues ?? {}),
                          })}
                        </Text>
                        {onGoToField && (
                          <Button type="link" onClick={getGoToFieldHandler(error)}>
                            {t('checker.goToField')}
                          </Button>
                        )}
                      </Flex>
                    )
                  })}
                </Flex>
              ),
            }))}
          />
        )}
      </Card>

      <Card
        bodyStyle={passedBodyStyle}
        title={
          <Flex
            align="center"
            justify="space-between"
            style={{ width: '100%', cursor: 'pointer' }}
            onClick={togglePassedDetails}
          >
            <Text type="success" strong>✅ {passedLabel}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {showPassedDetails ? t('checker.passedToggleHide') : t('checker.passedToggleShow')}
            </Text>
          </Flex>
        }
      >
        {showPassedDetails && (
          passedItems.length === 0 ? (
            <Text type="secondary">{t('checker.passedEmpty')}</Text>
          ) : (
            <List
              dataSource={passedItems}
              renderItem={(item) => (
                <List.Item key={item.key}>
                  <List.Item.Meta
                    title={item.label}
                    description={item.location}
                  />
                </List.Item>
              )}
            />
          )
        )}
      </Card>
    </Flex>
  )
}

// 分组逻辑已下沉到 core（groupCheckerErrors）。
