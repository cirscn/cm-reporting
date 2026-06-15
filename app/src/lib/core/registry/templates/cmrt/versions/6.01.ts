import { LIMITED_AUTHORIZATION_DATE_CONFIG } from '../../../common/dateConfig'
import type { CmrtVersionOverride } from '../base'
import { CMRT_Q6_OPTIONS_V6_22_AND_BELOW } from '../base'

export const cmrt_6_01: CmrtVersionOverride = {
  id: '6.01',
  q6Options: CMRT_Q6_OPTIONS_V6_22_AND_BELOW,
  productList: {
    partNumberLabelKey: 'productList.cmrt.manufacturerNumber',
    partNameLabelKey: 'productList.cmrt.manufacturerName',
  },
  smelterList: {
    notListedRequireNameCountry: true,
  },
  dateConfig: LIMITED_AUTHORIZATION_DATE_CONFIG,
}
