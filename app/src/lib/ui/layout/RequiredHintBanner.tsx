/**
 * @file ui/layout/RequiredHintBanner.tsx
 * @description 使用 Ant Design Alert 实现的必填字段提示横幅。
 */

import { RightOutlined } from '@ant-design/icons'
import { useT } from '@ui/i18n/useT'
import { Alert, Button } from 'antd'

interface RequiredHintBannerProps {
  className?: string
  /** 未完成的必填项数量，0 或 undefined 表示全部完成 */
  errorCount?: number
  /** 点击"前往 Checker"的回调 */
  onGoToChecker?: () => void
}

/**
 * RequiredHintBanner：必填字段提示横幅。
 * - 有未完成项时：warning 类型，显示错误计数和跳转操作
 * - 全部完成时：success 类型
 */
export function RequiredHintBanner({ className, errorCount = 0, onGoToChecker }: RequiredHintBannerProps) {
  const { t } = useT()

  if (errorCount === 0) {
    return (
      <Alert
        type="success"
        showIcon
        className={className}
        message={t('checker.globalSuccessBar')}
      />
    )
  }

  return (
    <Alert
      type="warning"
      showIcon
      className={className}
      message={t('checker.globalErrorBar', { count: errorCount })}
      action={
        onGoToChecker ? (
          <Button type="link" size="small" onClick={onGoToChecker}>
            {t('checker.globalErrorAction')} <RightOutlined className="text-xs" />
          </Button>
        ) : undefined
      }
    />
  )
}
