export const CRT_VERSION_IDS = ['2.2', '2.21'] as const

export type CrtVersionId = typeof CRT_VERSION_IDS[number]

export const CRT_DEFAULT_VERSION: CrtVersionId = '2.21'

export const CRT_VERSION_ENTRIES = CRT_VERSION_IDS.map((id) => ({ id, label: id }))
