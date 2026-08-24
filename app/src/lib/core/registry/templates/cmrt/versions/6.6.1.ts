import { OPEN_AUTHORIZATION_DATE_CONFIG } from '../../../common/dateConfig'
import type { CmrtVersionOverride } from '../base'
import { CMRT_Q6_OPTIONS_V6_31_AND_ABOVE } from '../base'

/** CMRT 6.6.1：6.6 的官方无 Logo 升版，结构与规则保持一致。 */
export const cmrt_6_6_1: CmrtVersionOverride = {
  id: '6.6.1',
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
