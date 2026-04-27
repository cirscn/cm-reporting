import type { AmrtVersionOverride } from '../base'
import { AMRT_MINERALS_V131 } from '../base'

export const amrt_1_31: AmrtVersionOverride = {
  id: '1.31',
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
