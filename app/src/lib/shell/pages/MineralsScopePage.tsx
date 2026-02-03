/**
 * @file app/pages/MineralsScopePage.tsx
 * @description 页面组件。
 */

// 说明：页面组件
import { useTemplateActions, useTemplateErrors, useTemplateState } from '@shell/store'
import { MineralsScopeReasonsForm } from '@ui/forms/MineralsScopeReasonsForm'

/** Minerals Scope 页面：仅呈现矿产范围选择表单。 */
export function MineralsScopePage() {
  const { meta, form, lists } = useTemplateState()
  const { versionDef } = meta
  const { selectedMinerals, customMinerals } = form
  const { mineralsScope } = lists
  const { setMineralsScope } = useTemplateActions()
  const errors = useTemplateErrors()

  // 页面只负责渲染表单，不做额外派生计算。
  return (
    <MineralsScopeReasonsForm
      versionDef={versionDef}
      rows={mineralsScope}
      selectedMinerals={selectedMinerals}
      customMinerals={customMinerals}
      onChange={setMineralsScope}
      errors={errors.mineralsScopeRows}
    />
  )
}
