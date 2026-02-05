/**
 * @file app/pages/ProductListPage.tsx
 * @description 页面组件。
 */

// 说明：页面组件
import { useTemplateActions, useTemplateDerived, useTemplateIntegrations, useTemplateState } from '@shell/store'
import { ProductListTable } from '@ui/tables/ProductListTable'
import { LAYOUT } from '@ui/theme/spacing'
import { Flex } from 'antd'

import { DocNote } from './DocContent'
import { useFieldFocus } from './useFieldFocus'

/** Product List 页面：渲染产品清单表格。 */
export function ProductListPage() {
  const { meta, lists } = useTemplateState()
  const { versionDef } = meta
  const { productList: rows } = lists
  const { setProductList } = useTemplateActions()
  const { requiredFields } = useTemplateDerived()
  const integrations = useTemplateIntegrations()

  useFieldFocus()

  return (
    <Flex vertical gap={LAYOUT.sectionGap}>
      {/* 文档提示：用于展示产品清单的状态与补充说明。 */}
      <DocNote section="productList" />
      <ProductListTable
        templateType={meta.templateType}
        versionId={meta.versionId}
        versionDef={versionDef}
        config={versionDef.productList}
        rows={rows}
        onChange={setProductList}
        required={requiredFields.productListRequired}
        showRequesterColumns={versionDef.productList.hasRequesterColumns}
        integration={integrations?.productList}
      />
    </Flex>
  )
}
