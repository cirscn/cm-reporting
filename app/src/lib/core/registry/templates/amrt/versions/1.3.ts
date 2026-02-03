import type { AmrtVersionOverride } from '../base'
import { AMRT_MINERALS_V13 } from '../base'

export const amrt_1_3: AmrtVersionOverride = {
  id: '1.3',
  mineralScope: {
    mode: 'dynamic-dropdown',
    minerals: AMRT_MINERALS_V13,
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
