export const CMRT_VERSION_IDS = ['6.01', '6.1', '6.22', '6.31', '6.4', '6.5'] as const

export type CmrtVersionId = typeof CMRT_VERSION_IDS[number]

export const CMRT_DEFAULT_VERSION: CmrtVersionId = '6.5'

export const CMRT_VERSION_ENTRIES = CMRT_VERSION_IDS.map((id) => ({ id, label: id }))
