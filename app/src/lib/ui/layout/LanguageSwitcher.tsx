/**
 * @file ui/layout/LanguageSwitcher.tsx
 * @description 语言切换组件，使用 Ant Design Select 实现。
 */

import { GlobalOutlined } from '@ant-design/icons'
import type { Locale } from '@core/i18n'
import { useT } from '@ui/i18n'
import { useMemoizedFn } from 'ahooks'
import { Select } from 'antd'

const localeOptions: { value: Locale; label: string }[] = [
  { value: 'en-US', label: 'EN' },
  { value: 'zh-CN', label: '中文' },
]

/**
 * LanguageSwitcher：语言切换下拉组件。
 * 适合放在顶部操作区或自定义工具栏内。
 */
export function LanguageSwitcher() {
  const { locale, changeLocale } = useT()

  const handleChange = useMemoizedFn((next: Locale) => {
    changeLocale(next)
  })

  return (
    <Select
      value={locale}
      onChange={handleChange}
      options={localeOptions}
      suffixIcon={<GlobalOutlined />}
      style={{ minWidth: 70 }}
      popupMatchSelectWidth={false}
    />
  )
}
