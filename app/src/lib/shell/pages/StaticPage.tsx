/**
 * @file app/pages/StaticPage.tsx
 * @description 页面组件。
 */

// 说明：页面组件
import type { I18nKey } from '@core/i18n'
import { useT } from '@ui/i18n'

import { PlaceholderPage } from './Placeholder'

/** StaticPage Props。 */
interface StaticPageProps {
  titleKey: I18nKey
}

/**
 * 页面组件：StaticPage（固定标题的占位页）。
 */
export function StaticPage({ titleKey }: StaticPageProps) {
  const { t } = useT()
  return <PlaceholderPage title={t(titleKey)} />
}
