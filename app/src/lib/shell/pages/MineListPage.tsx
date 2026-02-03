/**
 * @file app/pages/MineListPage.tsx
 * @description 页面组件。
 */

import { useTemplateActions, useTemplateDerived, useTemplateState } from '@shell/store'
import { MineListTable } from '@ui/tables/MineListTable'
import { LAYOUT } from '@ui/theme/spacing'
import { Flex, Typography } from 'antd'

import { DocNote } from './DocContent'
import { useFieldFocus } from './useFieldFocus'

/** Mine List 页面：渲染矿山清单表格与下拉联动。 */
export function MineListPage() {
  const { meta, lists } = useTemplateState()
  const { versionDef } = meta
  const { mineList: rows } = lists
  const { setMineList } = useTemplateActions()
  const { viewModels } = useTemplateDerived()

  const { availableMetals, countryOptions, smelterOptions, smelterOptionsByMetal } =
    viewModels.mineList

  useFieldFocus()

  if (!versionDef.mineList.available) {
    return (
      <Typography.Text type="secondary">
        <DocNote section="mineList" />
      </Typography.Text>
    )
  }

  return (
    <Flex vertical gap={LAYOUT.sectionGap}>
      <DocNote section="mineList" />
      <MineListTable
        config={versionDef.mineList}
        availableMetals={availableMetals}
        rows={rows}
        onChange={setMineList}
        countryOptions={countryOptions}
        smelterOptions={smelterOptions}
        smelterOptionsByMetal={smelterOptionsByMetal}
      />
    </Flex>
  )
}
