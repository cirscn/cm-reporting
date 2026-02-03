export const AMRT_VERSION_IDS = ['1.1', '1.2', '1.3'] as const

export type AmrtVersionId = typeof AMRT_VERSION_IDS[number]

export const AMRT_DEFAULT_VERSION: AmrtVersionId = '1.3'

export const AMRT_VERSION_ENTRIES = AMRT_VERSION_IDS.map((id) => ({ id, label: id }))
