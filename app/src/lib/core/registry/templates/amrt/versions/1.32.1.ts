import type { AmrtVersionOverride } from '../base'
import { AMRT_MINERALS_V131 } from '../base'

/** AMRT 1.32.1：更新原始模板，填写字段、选项与规则延续 1.31.1。 */
export const amrt_1_32_1: AmrtVersionOverride = {
  id: '1.32.1',
  mineralScope: {
    mode: 'dynamic-dropdown',
    minerals: AMRT_MINERALS_V131,
    otherSlotCount: 12,
  },
  pages: {
    instructionsFirst: false,
    hasLookup: true,
  },
  smelterList: {
    hasIdColumn: true,
    hasLookup: true,
    hasCombinedColumn: true,
    notYetIdentifiedCountryDefault: '',
    recycledScrapOptions: 'yes-no',
  },
  mineList: {
    smelterNameMode: 'dropdown',
  },
  productList: {
    hasRequesterColumns: true,
  },
}
