export function assertVersion<T extends string>(
  versions: readonly T[],
  versionId: string,
  templateName: string
): asserts versionId is T {
  if (!versions.includes(versionId as T)) {
    throw new Error(`Unknown ${templateName} version: ${versionId}`)
  }
}

export function createVersionMap<T extends { id: string }>(
  items: readonly T[]
): Map<string, T> {
  const map = new Map<string, T>()
  items.forEach((item) => {
    map.set(item.id, item)
  })
  return map
}
