/**
 * @file app/pages/useFieldFocus.ts
 * @description 页面组件。
 */

// 说明：页面组件
import { useOptionalNavigation } from '@shell/navigation/useNavigation'
import { useCreation } from 'ahooks'
import { useEffect } from 'react'

/** 根据 URL 中的 focus 参数定位并高亮表单字段。 */
export function useFieldFocus() {
  const navigation = useOptionalNavigation()
  /** 优先使用路由上下文 searchParams，缺失时回退到 window。 */
  const searchParams = useCreation(() => {
    if (navigation) return navigation.state.searchParams
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search)
    }
    return new URLSearchParams()
  }, [navigation])

  useEffect(() => {
    const fieldPath = searchParams.get('focus')
    if (!fieldPath) return

    // 找到字段容器并滚动到可见位置。
    const target = document.querySelector(`[data-field-path="${fieldPath}"]`)
    if (!target) return

    target.scrollIntoView({ behavior: 'smooth', block: 'center' })

    // 聚焦输入控件并添加短暂高亮。
    const input = target.querySelector('input, textarea, .ant-select-selector') as
      | HTMLElement
      | null
    input?.focus()
    target.classList.add('app-field-focus')

    const timeout = window.setTimeout(() => {
      target.classList.remove('app-field-focus')
    }, 1500)

    return () => window.clearTimeout(timeout)
  }, [searchParams])
}
