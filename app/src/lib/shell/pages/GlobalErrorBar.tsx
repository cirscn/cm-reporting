/**
 * @file app/pages/GlobalErrorBar.tsx
 * @description 使用 Ant Design Alert 实现的全局错误/成功提示条。
 */

import { CheckCircleOutlined, ExclamationCircleOutlined, RightOutlined, SaveOutlined } from '@ant-design/icons'
import { useOptionalNavigation } from '@shell/navigation/useNavigation'
import { buildTemplatePath } from '@shell/routing/resolveTemplateRoute'
import { useTemplateDerived, useTemplateState } from '@shell/store'
import { useT } from '@ui/i18n/useT'
import { useMemoizedFn } from 'ahooks'
import { Tag, Tooltip } from 'antd'

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
  const { checkerErrors, checkerSummary } = useTemplateDerived()
  const navigation = useOptionalNavigation()
  const { t } = useT()

  const { sections } = checkerSummary

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
        <Tooltip title={t('checker.sessionSavedHint')}>
          <Tag icon={<SaveOutlined />} color="default" className="global-status-bar__session-tag">
            {t('checker.sessionSaved')}
          </Tag>
        </Tooltip>
      </div>
    )
  }

  // 构建分区进度显示
  const sectionTags = [
    { key: 'companyInfo', label: t('sections.companyInfo'), ...sections.companyInfo },
    { key: 'questionMatrix', label: t('sections.questionMatrix'), ...sections.questionMatrix },
    { key: 'companyQuestions', label: t('sections.companyQuestions'), ...sections.companyQuestions },
    { key: 'smelterList', label: t('tabs.smelterList'), ...sections.smelterList },
    { key: 'productList', label: t('tabs.productList'), ...sections.productList },
  ].filter((s) => s.total > 0)

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
        <div className="global-status-bar__sections">
          {sectionTags.map((section) => (
            <Tag
              key={section.key}
              color={section.completed === section.total ? 'success' : 'warning'}
              className="global-status-bar__section-tag"
            >
              {section.label} {section.completed}/{section.total}
            </Tag>
          ))}
        </div>
      </div>
      <div className="global-status-bar__actions">
        <Tooltip title={t('checker.sessionSavedHint')}>
          <Tag icon={<SaveOutlined />} color="default" className="global-status-bar__session-tag">
            {t('checker.sessionSaved')}
          </Tag>
        </Tooltip>
        <button className="global-status-bar__action" type="button">
          {t('checker.globalErrorAction')}
          <RightOutlined />
        </button>
      </div>
    </div>
  )
}
