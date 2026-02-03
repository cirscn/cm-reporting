/**
 * @file app/pages/DocContent.tsx
 * @description 文档内容组件，使用 Ant Design Card 和 Alert 实现。
 */

import type { I18nKey } from '@core/i18n'
import { getDefaultVersion } from '@core/registry'
import type { TemplateType } from '@core/registry/types'
import { useTemplateState } from '@shell/store'
import { useT } from '@ui/i18n/useT'
import { LAYOUT, SPACING } from '@ui/theme/spacing'
import { useCreation, useMemoizedFn } from 'ahooks'
import { Alert, Card, Flex, Typography } from 'antd'
import { compact } from 'lodash-es'

import type { DocSectionKey } from './docTypes'
import { PlaceholderPage } from './Placeholder'
import { useDocStatus, type DocStatus } from './useDocStatus'

const { Title, Paragraph, Text } = Typography

/** 术语定义项结构。 */
interface DefinitionEntry {
  term: string
  definition: string
}

/** 根据模板/版本与章节解析 doc key，当前版本不存在则回退到默认版本。 */
function resolveDocKey(
  templateType: TemplateType,
  versionId: string,
  section: DocSectionKey,
  exists: (key: string) => boolean
) {
  const directKey = `docs.${templateType}.${versionId}.${section}`
  if (exists(directKey)) return directKey
  const fallbackKey = `docs.${templateType}.${getDefaultVersion(templateType)}.${section}`
  return fallbackKey
}

/** 解析文档 key：基于模板/版本，并监听 locale 确保切换语言后重算。 */
function useDocKey(section: DocSectionKey): I18nKey {
  const { meta } = useTemplateState()
  const { templateType, versionId } = meta
  const { locale, i18n } = useT()
  const exists = useMemoizedFn((key: string) => i18n.exists(key))
  return useCreation(
    () => resolveDocKey(templateType, versionId, section, exists) as I18nKey,
    [templateType, versionId, section, exists, locale]
  )
}

/** 获取文档段落：从 i18n 数组读取并过滤空值。 */
function useDocParagraphs(section: DocSectionKey): string[] {
  const { t } = useT()
  const key = useDocKey(section)
  return useCreation(() => {
    const value = t(key, { returnObjects: true, defaultValue: [] })
    if (!Array.isArray(value)) return []
    return compact(
      value.map((item) =>
        typeof item === 'string' && item.trim().length > 0 ? item : null
      )
    )
  }, [key, t])
}

/** 获取定义列表：仅保留 term/definition 均为字符串的条目。 */
function useDocDefinitions(): DefinitionEntry[] {
  const { t } = useT()
  const key = useDocKey('definitions')
  return useCreation(() => {
    const value = t(key, { returnObjects: true, defaultValue: [] })
    if (!Array.isArray(value)) return []
    return compact(
      value.map((item) => {
        if (!item || typeof item !== 'object') return null
        if (!('term' in item) || !('definition' in item)) return null
        const entry = item as DefinitionEntry
        if (typeof entry.term !== 'string' || typeof entry.definition !== 'string') return null
        return entry
      })
    )
  }, [key, t])
}

/** DocNote Props。 */
interface DocNoteProps {
  section: DocSectionKey
}

/** 渲染状态提示块：使用 Ant Design Alert 组件。 */
function renderStatus(status: DocStatus) {
  const alertType =
    status.tone === 'success'
      ? 'success'
      : status.tone === 'warning'
        ? 'warning'
        : 'info'
  return (
    <Alert
      type={alertType}
      message={status.text}
      showIcon
      style={{ marginBottom: SPACING.sm }}
    />
  )
}

/** 章节提示（可含状态信息）：使用 Ant Design Card 组件。 */
export function DocNote({ section }: DocNoteProps) {
  const paragraphs = useDocParagraphs(section)
  const status = useDocStatus(section)
  if (paragraphs.length === 0) return null
  return (
    <Card>
      {status ? renderStatus(status) : null}
      <Typography>
        {paragraphs.map((text, index) => (
          <Paragraph
            key={`${section}-${index}`}
            style={{ marginBottom: index < paragraphs.length - 1 ? SPACING.sm : 0, whiteSpace: 'pre-line' }}
            type="secondary"
          >
            {text}
          </Paragraph>
        ))}
      </Typography>
    </Card>
  )
}

/** DocPage Props。 */
interface DocPageProps {
  titleKey: I18nKey
  section: DocSectionKey
}

/** 文档页面：支持普通段落或 definitions 列表，使用 Ant Design Card。 */
export function DocPage({ titleKey, section }: DocPageProps) {
  const { t } = useT()
  const paragraphs = useDocParagraphs(section)
  const entries = useDocDefinitions()
  const status = useDocStatus(section)

  if (section === 'definitions') {
    if (entries.length === 0) {
      return <PlaceholderPage title={t(titleKey)} />
    }
    return (
      <Flex vertical gap={LAYOUT.sectionGap}>
        <Title level={4} style={{ margin: 0 }}>{t(titleKey)}</Title>
        {entries.map((entry, index) => (
          <Card key={`definition-${index}`}>
            <Text strong>{entry.term}</Text>
            <Paragraph
              type="secondary"
              style={{ marginTop: SPACING.xs, marginBottom: 0, whiteSpace: 'pre-line' }}
            >
              {entry.definition}
            </Paragraph>
          </Card>
        ))}
      </Flex>
    )
  }

  if (paragraphs.length === 0) {
    return <PlaceholderPage title={t(titleKey)} />
  }

  return (
    <Flex vertical gap={LAYOUT.sectionGap}>
      <Title level={4} style={{ margin: 0 }}>{t(titleKey)}</Title>
      {status ? renderStatus(status) : null}
      <Typography>
        {paragraphs.map((text, index) => (
          <Paragraph
            key={`${section}-${index}`}
            type="secondary"
            style={{ marginBottom: index < paragraphs.length - 1 ? SPACING.md : 0, whiteSpace: 'pre-line' }}
          >
            {text}
          </Paragraph>
        ))}
      </Typography>
    </Flex>
  )
}
