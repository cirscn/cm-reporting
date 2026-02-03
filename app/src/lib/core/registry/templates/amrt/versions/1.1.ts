import type { AmrtVersionOverride } from '../base'
import {
  AMRT_MINERALS_V11_PREFILL,
  AMRT_V11_PREFILL_LABELS,
} from '../base'

export const amrt_1_1: AmrtVersionOverride = {
  id: '1.1',
  mineralScope: {
    mode: 'free-text',
    minerals: AMRT_MINERALS_V11_PREFILL,
    defaultCustomMinerals: AMRT_V11_PREFILL_LABELS,
  },
  pages: {
    instructionsFirst: true,
    hasLookup: false,
  },
  smelterList: {
    hasIdColumn: false,
    hasLookup: false,
    hasCombinedColumn: false,
    notYetIdentifiedCountryDefault: 'Unknown',
    recycledScrapOptions: 'yes-no-unknown',
  },
  mineList: {
    smelterNameMode: 'manual',
  },
  productList: {
    hasRequesterColumns: false,
  },
}
