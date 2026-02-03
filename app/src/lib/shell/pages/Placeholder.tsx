/**
 * @file app/pages/Placeholder.tsx
 * @description 页面组件。
 */

import { useT } from '@ui/i18n/useT'
import { SPACING } from '@ui/theme/spacing'
import { Flex, Typography } from 'antd'

const { Title, Text } = Typography

/** PlaceholderPage Props。 */
interface PlaceholderProps {
  title: string
}

/**
 * 页面组件：PlaceholderPage（用于未实现页面的统一占位）。
 */
export function PlaceholderPage({ title }: PlaceholderProps) {
  const { t } = useT()
  return (
    <Flex justify="center" align="center" style={{ height: 256 }}>
      <Text type="secondary" style={{ fontSize: 18 }}>
        {t('common.comingSoon', { title })}
      </Text>
    </Flex>
  )
}

/**
 * 页面组件：HomePage（入口占位页）。
 */
export function HomePage() {
  const { t } = useT()
  return (
    <Flex vertical justify="center" align="center" gap={SPACING.lg} style={{ height: 256 }}>
      <Title level={3} style={{ margin: 0 }}>{t('common.homeTitle')}</Title>
      <Text type="secondary">{t('common.homeSubtitle')}</Text>
    </Flex>
  )
}

/** TemplatePage Props。 */
interface TemplatePageProps {
  page: string
}

/**
 * 页面组件：TemplatePage（路由 fallback 占位）。
 */
export function TemplatePage({ page }: TemplatePageProps) {
  return <PlaceholderPage title={page} />
}
