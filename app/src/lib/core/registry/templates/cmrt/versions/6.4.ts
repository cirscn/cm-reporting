import { OPEN_AUTHORIZATION_DATE_CONFIG } from '../../../common/dateConfig'
import type { CmrtVersionOverride } from '../base'
import { CMRT_Q6_OPTIONS_V6_31_AND_ABOVE } from '../base'

export const cmrt_6_4: CmrtVersionOverride = {
  id: '6.4',
  q6Options: CMRT_Q6_OPTIONS_V6_31_AND_ABOVE,
  productList: {
    partNumberLabelKey: 'productList.cmrt.manufacturerNumber',
    partNameLabelKey: 'productList.cmrt.manufacturerName',
  },
  smelterList: {
    notListedRequireNameCountry: false,
  },
  dateConfig: OPEN_AUTHORIZATION_DATE_CONFIG,
}
