/**
 * @file main.lib.tsx
 * @description Lib-only 预览入口（不加载 demo 样式/头部）。
 */

import type { Locale } from '@core/i18n'
import {
  getDefaultVersion,
  isValidTemplateType,
  isValidVersion,
} from '@core/registry'
import type { TemplateType } from '@core/registry/types'
import { CMReportingApp } from '@lib/CMReportingApp'
import { CMReportingProvider } from '@lib/providers/CMReportingProvider'
import 'antd/dist/reset.css'
import '@lib/styles.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const DEFAULT_TEMPLATE: TemplateType = 'cmrt'

const resolveLocale = (value: string | null): Locale =>
  value === 'zh-CN' ? 'zh-CN' : 'en-US'

const resolveTemplate = (value: string | null): TemplateType =>
  isValidTemplateType(value ?? '') ? (value as TemplateType) : DEFAULT_TEMPLATE

const resolveVersion = (templateType: TemplateType, value: string | null): string => {
  if (value && isValidVersion(templateType, value)) return value
  return getDefaultVersion(templateType)
}

const search = new URLSearchParams(window.location.search)
const templateType = resolveTemplate(search.get('template'))
const versionId = resolveVersion(templateType, search.get('version'))
const locale = resolveLocale(search.get('locale'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CMReportingProvider locale={locale}>
      <CMReportingApp templateType={templateType} versionId={versionId} />
    </CMReportingProvider>
  </StrictMode>,
)
