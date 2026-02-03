export const EMRT_VERSION_IDS = ['1.1', '1.11', '1.2', '1.3', '2.0', '2.1'] as const

export type EmrtVersionId = typeof EMRT_VERSION_IDS[number]

export const EMRT_DEFAULT_VERSION: EmrtVersionId = '2.1'

export const EMRT_VERSION_ENTRIES = EMRT_VERSION_IDS.map((id) => ({ id, label: id }))
