import type { CmrtVersionOverride } from '../base'
import { CMRT_Q6_OPTIONS_V6_22_AND_BELOW } from '../base'

export const cmrt_6_22: CmrtVersionOverride = {
  id: '6.22',
  q6Options: CMRT_Q6_OPTIONS_V6_22_AND_BELOW,
  productList: {
    productNumberLabelKey: 'productList.cmrt.manufacturerNumber',
    productNameLabelKey: 'productList.cmrt.manufacturerName',
  },
  smelterList: {
    notListedRequireNameCountry: false,
  },
  dateConfig: {
    maxDate: '2026-03-31',
  },
}
