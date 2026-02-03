/**
 * @file types/lodash-es.d.ts
 * @description 类型声明。
 */

// 说明：类型声明
declare module 'lodash-es' {
/**
 * 导出函数：groupBy。
 */
  export function groupBy<T>(
    collection: T[],
    iteratee: (item: T) => string
  ): Record<string, T[]>

/**
 * 导出函数：compact。
 */
  export function compact<T>(
    collection: Array<T | null | undefined | false | '' | 0>
  ): T[]

/**
 * 导出函数：sumBy。
 */
  export function sumBy<T>(
    collection: T[],
    iteratee: (item: T) => number
  ): number

/**
 * 导出函数：intersection。
 */
  export function intersection<T>(...arrays: T[][]): T[]

/**
 * 导出函数：intersectionBy。
 */
  export function intersectionBy<T>(
    array: T[],
    values: T[],
    iteratee: (item: T) => string | number
  ): T[]

/**
 * 导出函数：some。
 */
  export function some<T>(
    collection: T[],
    predicate: (item: T) => boolean
  ): boolean

/**
 * 导出函数：uniq。
 */
  export function uniq<T>(collection: T[]): T[]
}
