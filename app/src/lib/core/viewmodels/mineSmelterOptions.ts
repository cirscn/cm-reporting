import { isSmelterNotIdentified, isSmelterNotListed } from '../transform'
import type { SmelterRow } from '../types/tableRows'

/** value 为所选冶炼厂行的 ID，label 为展示名称。 */
export interface MineSmelterOption {
  value: string
  label: string
}

function getSmelterName(row: SmelterRow): string {
  if (row.smelterName) return row.smelterName
  if (isSmelterNotListed(row.smelterLookup) || isSmelterNotIdentified(row.smelterLookup)) return ''
  return row.smelterLookup
}

export function buildMineSmelterOptions(rows: SmelterRow[]) {
  const optionsById = new Map<string, MineSmelterOption>()
  const optionsByMetal = new Map<string, Map<string, MineSmelterOption>>()

  for (const row of rows) {
    const label = getSmelterName(row)
    if (!label) continue
    const option = { value: row.id, label }
    optionsById.set(row.id, option)
    const metal = row.metal.trim()
    if (!metal) continue
    const bucket = optionsByMetal.get(metal) ?? new Map<string, MineSmelterOption>()
    bucket.set(row.id, option)
    optionsByMetal.set(metal, bucket)
  }

  return {
    smelterOptions: Array.from(optionsById.values()),
    smelterOptionsByMetal: Object.fromEntries(
      Array.from(optionsByMetal, ([metal, options]) => [metal, Array.from(options.values())]),
    ),
  }
}
