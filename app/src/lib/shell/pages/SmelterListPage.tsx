/**
 * @file app/pages/SmelterListPage.tsx
 * @description 页面组件。
 */

// 说明：页面组件
import {
  SMELTER_LOOKUP_DATA,
  SMELTER_LOOKUP_META,
} from '@core/data/lookups'
import { useTemplateActions, useTemplateDerived, useTemplateIntegrations, useTemplateState } from '@shell/store'
import { SmelterListTable } from '@ui/tables/SmelterListTable'
import { LAYOUT } from '@ui/theme/spacing'
import { Flex } from 'antd'

import { DocNote } from './DocContent'
import { useFieldFocus } from './useFieldFocus'

/** Smelter List 页面：渲染冶炼厂清单与辅助选项。 */
export function SmelterListPage() {
  const { meta, lists } = useTemplateState()
  const { versionDef } = meta
  const { smelterList: rows } = lists
  const { setSmelterList } = useTemplateActions()
  const { viewModels } = useTemplateDerived()
  const integrations = useTemplateIntegrations()

  // 页面派生数据：输出可选金属/国家/lookup 选项，页面只负责渲染表格。
  const {
    availableMetals,
    countryOptions,
    showNotYetIdentifiedCountryHint,
  } = viewModels.smelterList

  useFieldFocus()

  return (
    <Flex vertical gap={LAYOUT.sectionGap}>
      <DocNote section="smelterList" />
      <SmelterListTable
        templateType={meta.templateType}
        versionId={meta.versionId}
        versionDef={versionDef}
        config={versionDef.smelterList}
        availableMetals={availableMetals}
        rows={rows}
        onChange={setSmelterList}
        countryOptions={countryOptions}
        smelterLookupRecords={SMELTER_LOOKUP_DATA}
        smelterLookupMeta={SMELTER_LOOKUP_META}
        showNotYetIdentifiedCountryHint={showNotYetIdentifiedCountryHint}
        integration={integrations?.smelterList}
      />
    </Flex>
  )
}
