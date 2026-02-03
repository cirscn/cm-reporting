/**
 * @file core/index.ts
 * @description 核心能力统一入口（registry + rules）。
 */

// 说明：该入口仅用于阅读/索引；业务代码建议按需直引具体模块以减少 bundle。

/** 模板/版本定义统一入口。 */
export * from './registry'
/** 规则/校验统一入口。 */
export * from './rules'
