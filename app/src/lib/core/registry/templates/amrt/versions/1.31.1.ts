import type { AmrtVersionOverride } from '../base'
import { AMRT_MINERALS_V131 } from '../base'

/** AMRT 1.31.1：1.31 的官方无 Logo 升版，结构与规则保持一致。 */
export const amrt_1_31_1: AmrtVersionOverride = {
  id: '1.31.1',
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
