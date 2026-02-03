/**
 * @file app/pages/RevisionPage.tsx
 * @description 页面组件。
 */

import { getTemplateDefinition } from '@core/registry'
import { useTemplateState } from '@shell/store'
import { useT } from '@ui/i18n/useT'
import { LAYOUT, SPACING } from '@ui/theme/spacing'
import { useMemoizedFn } from 'ahooks'
import { Card, Descriptions, Flex, List, Tag, Typography } from 'antd'

const { Title, Text } = Typography

/** Revision 页面：展示模板版本信息与历史列表。 */
export function RevisionPage() {
  const { meta } = useTemplateState()
  const { templateType, versionId } = meta
  const { t } = useT()
  const definition = getTemplateDefinition(templateType)
  const versions = definition.versions
  /** 是否展示发布时间列（任一版本含 releaseDate 即展示）。 */
  const showReleaseDate = versions.some((version) => Boolean(version.releaseDate))
  /** 统一版本行渲染函数，避免 List 内联函数。 */
  const renderVersionItem = useMemoizedFn((version: typeof versions[number]) => (
    <List.Item>
      <Flex align="center" justify="space-between" style={{ width: '100%' }}>
        <Flex align="center" gap={SPACING.sm}>
          <Text strong>{version.label}</Text>
          {version.id === versionId && <Tag color="blue">{t('revision.currentTag')}</Tag>}
          {version.id === definition.defaultVersion && (
            <Tag color="gold">{t('revision.defaultTag')}</Tag>
          )}
        </Flex>
        {showReleaseDate && version.releaseDate ? (
          <Text type="secondary" style={{ fontSize: 12 }}>{version.releaseDate}</Text>
        ) : null}
      </Flex>
    </List.Item>
  ))

  return (
    <Flex vertical gap={LAYOUT.sectionGap}>
      <div>
        <Title level={4} style={{ margin: 0 }}>{t('tabs.revision')}</Title>
        <Text type="secondary">{t('revision.subtitle')}</Text>
      </div>

      <Card>
        <Descriptions column={{ xs: 1, md: 2 }}>
          <Descriptions.Item label={t('revision.templateName')}>
            <Text strong>{t(definition.fullNameKey)}</Text>
          </Descriptions.Item>
          <Descriptions.Item label={t('revision.currentVersion')}>
            <Text strong>{versionId}</Text>
          </Descriptions.Item>
          <Descriptions.Item label={t('revision.defaultVersion')}>
            <Text strong>{definition.defaultVersion}</Text>
          </Descriptions.Item>
          <Descriptions.Item label={t('revision.totalVersions')}>
            <Text strong>{versions.length}</Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title={t('revision.availableVersions')}>
        <List dataSource={versions} renderItem={renderVersionItem} />
      </Card>
    </Flex>
  )
}
