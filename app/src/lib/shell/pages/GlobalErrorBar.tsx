/**
 * @file app/pages/GlobalErrorBar.tsx
 * @description 使用 Ant Design Alert 实现的全局错误/成功提示条。
 */

import { CheckCircleOutlined, ExclamationCircleOutlined, RightOutlined } from '@ant-design/icons'
import { useOptionalNavigation } from '@shell/navigation/useNavigation'
import { buildTemplatePath } from '@shell/routing/resolveTemplateRoute'
import { useTemplateDerived, useTemplateState } from '@shell/store'
import { useT } from '@ui/i18n/useT'
import { useMemoizedFn } from 'ahooks'

interface GlobalErrorBarProps {
  onNavigateChecker?: () => void
}

/**
 * GlobalErrorBar：顶部全局错误/成功提示条。
 * 自定义样式实现，不使用 Ant Design Alert 组件以获得更好的控制。
 */
export function GlobalErrorBar({ onNavigateChecker }: GlobalErrorBarProps) {
  const { meta } = useTemplateState()
  const { templateType, versionId } = meta
  const { checkerErrors } = useTemplateDerived()
  const navigation = useOptionalNavigation()
  const { t } = useT()

  const errors = checkerErrors
  const hasErrors = errors.length > 0

  const handleClick = useMemoizedFn(() => {
    if (!hasErrors) return

    if (onNavigateChecker) {
      onNavigateChecker()
      return
    }
    if (navigation) {
      const path = buildTemplatePath({
        template: templateType,
        version: versionId,
        page: 'checker',
      })
      navigation.actions.navigate(path)
      return
    }
    if (typeof window !== 'undefined') {
      const path = buildTemplatePath({
        template: templateType,
        version: versionId,
        page: 'checker',
      })
      window.location.assign(path)
    }
  })

  if (!hasErrors) {
    return (
      <div className="global-status-bar global-status-bar--success">
        <div className="global-status-bar__content">
          <CheckCircleOutlined className="global-status-bar__icon" />
          <span className="global-status-bar__message">
            {t('checker.globalSuccessBar')}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      className="global-status-bar global-status-bar--error"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <div className="global-status-bar__content">
        <ExclamationCircleOutlined className="global-status-bar__icon" />
        <span className="global-status-bar__message">
          {t('checker.globalErrorBar', { count: errors.length })}
        </span>
      </div>
      <button className="global-status-bar__action" type="button">
        {t('checker.globalErrorAction')}
        <RightOutlined />
      </button>
    </div>
  )
}
