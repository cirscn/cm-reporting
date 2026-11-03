import { OPEN_AUTHORIZATION_DATE_CONFIG } from '../../../common/dateConfig'
import type { CmrtVersionOverride } from '../base'
import { CMRT_Q6_OPTIONS_V6_31_AND_ABOVE } from '../base'

/** CMRT 6.6.2：填写规则延续 6.6.1，导出保留新版模板的来源公式。 */
export const cmrt_6_6_2: CmrtVersionOverride = {
  id: '6.6.2',
  q6Options: CMRT_Q6_OPTIONS_V6_31_AND_ABOVE,
  productList: {
    hasRequesterColumns: true,
    partNumberLabelKey: 'productList.cmrt.respondentNumber',
    partNameLabelKey: 'productList.cmrt.respondentName',
  },
  smelterList: {
    notListedRequireNameCountry: false,
    notYetIdentifiedCountryByMetal: { tungsten: '' },
  },
  dateConfig: OPEN_AUTHORIZATION_DATE_CONFIG,
}
