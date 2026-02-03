import type { CmrtVersionOverride } from '../base'
import { CMRT_Q6_OPTIONS_V6_31_AND_ABOVE } from '../base'

export const cmrt_6_5: CmrtVersionOverride = {
  id: '6.5',
  q6Options: CMRT_Q6_OPTIONS_V6_31_AND_ABOVE,
  productList: {
    productNumberLabelKey: 'productList.cmrt.respondentNumber',
    productNameLabelKey: 'productList.cmrt.respondentName',
  },
  smelterList: {
    notListedRequireNameCountry: false,
    notYetIdentifiedCountryByMetal: { tungsten: '' },
  },
  dateConfig: {},
}
