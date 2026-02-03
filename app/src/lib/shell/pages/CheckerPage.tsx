/**
 * @file app/pages/CheckerPage.tsx
 * @description 页面组件。
 */

// 说明：页面组件
import type { PageKey } from '@core/registry/types'
import type { CheckerError } from '@core/rules/checker'
import { getPageKeyForFieldPath } from '@core/rules/fieldPath'
import { useOptionalNavigation } from '@shell/navigation/useNavigation'
import { buildTemplatePath } from '@shell/routing/resolveTemplateRoute'
import { useTemplateDerived, useTemplateState } from '@shell/store'
import { CheckerPanel } from '@ui/checker/CheckerPanel'
import { useMemoizedFn } from 'ahooks'

/** CheckerPage Props。 */
interface CheckerPageProps {
  onNavigateToField?: (pageKey: PageKey, fieldPath: string) => void
}

/** Checker 页面：展示校验结果与跳转到具体字段。 */
export function CheckerPage({ onNavigateToField }: CheckerPageProps) {
  const { meta } = useTemplateState()
  const { templateType, versionId, versionDef } = meta
  const { checkerErrors, checkerSummary, checkerPassedItems } = useTemplateDerived()
  const navigation = useOptionalNavigation()

  const errors = checkerErrors
  /** 根据错误定位字段所在页面并跳转。 */
  const handleGoToField = useMemoizedFn((error: CheckerError) => {
    const pageKey = getPageKeyForFieldPath(error.fieldPath)
    if (onNavigateToField) {
      onNavigateToField(pageKey, error.fieldPath)
      return
    }
    if (navigation) {
      // 路由模式：优先使用内部导航。
      const path = buildTemplatePath({
        template: templateType,
        version: versionId,
        page: pageKey,
      })
      navigation.actions.navigate(`${path}?focus=${encodeURIComponent(error.fieldPath)}`)
      return
    }
    if (typeof window !== 'undefined') {
      // 无导航上下文时，回退到硬跳转。
      const path = buildTemplatePath({
        template: templateType,
        version: versionId,
        page: pageKey,
      })
      window.location.assign(`${path}?focus=${encodeURIComponent(error.fieldPath)}`)
    }
  })

  return (
    <CheckerPanel
      versionDef={versionDef}
      errors={errors}
      summary={checkerSummary}
      passedItems={checkerPassedItems}
      onGoToField={handleGoToField}
    />
  )
}
