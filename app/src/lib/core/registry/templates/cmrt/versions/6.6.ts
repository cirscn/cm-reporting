import { OPEN_AUTHORIZATION_DATE_CONFIG } from '../../../common/dateConfig'
import type { CmrtVersionOverride } from '../base'
import { CMRT_Q6_OPTIONS_V6_31_AND_ABOVE } from '../base'

export const cmrt_6_6: CmrtVersionOverride = {
  id: '6.6',
  q6Options: CMRT_Q6_OPTIONS_V6_31_AND_ABOVE,
  productList: {
    hasRequesterColumns: true,
    productNumberLabelKey: 'productList.cmrt.respondentNumber',
    productNameLabelKey: 'productList.cmrt.respondentName',
  },
  smelterList: {
    notListedRequireNameCountry: false,
    notYetIdentifiedCountryByMetal: { tungsten: '' },
  },
  dateConfig: OPEN_AUTHORIZATION_DATE_CONFIG,
}
