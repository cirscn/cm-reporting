/**
 * @file core/template/strings.ts
 * @description 字符串工具集：跨模块共享的通用字符串处理函数。
 */

// ---------------------------------------------------------------------------
// humanizeKey —— 将 kebab-case / snake_case key 转为人类可读的 Title Case
// ---------------------------------------------------------------------------

/**
 * 将 key（kebab-case 或 snake_case）转为人类可读的展示形式。
 *
 * @example
 * humanizeKey('rare-earth-elements') // → 'Rare Earth Elements'
 * humanizeKey('cobalt')              // → 'Cobalt'
 * humanizeKey('other-0')             // → 'Other 0'
 */
export function humanizeKey(value: string): string {
  return value
    .split(/[-_]/)
    .map((part) => (part ? part[0]!.toUpperCase() + part.slice(1) : part))
    .join(' ')
}

// ---------------------------------------------------------------------------
// deepCloneJson —— 深拷贝 JSON 兼容对象
// ---------------------------------------------------------------------------

/**
 * 深拷贝一个 JSON 可序列化的值。
 * 优先使用 `structuredClone`（现代浏览器 & Node 17+），回退到 JSON 序列化。
 */
export function deepCloneJson<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value)
  }
  return JSON.parse(JSON.stringify(value)) as T
}
