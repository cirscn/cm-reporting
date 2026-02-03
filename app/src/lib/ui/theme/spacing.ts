/**
 * @file ui/theme/spacing.ts
 * @description 统一的间距常量定义，用于保持 UI 布局的一致性。
 */

/**
 * 基础间距单位 (4px)
 * 所有间距值都基于此单位的倍数
 */
const BASE = 4

/**
 * 间距常量
 * - xs: 4px  - 紧凑元素内部间距（如标签与图标）
 * - sm: 8px  - 小间距（如按钮组、行内元素）
 * - md: 12px - 中等间距（如列表项、表单控件）
 * - lg: 16px - 标准间距（如卡片间距、模块间距）
 * - xl: 20px - 大间距（如区块间距）
 * - xxl: 24px - 超大间距（如页面区域）
 */
export const SPACING = {
  /** 4px - 紧凑元素内部间距 */
  xs: BASE,
  /** 8px - 小间距（按钮组、行内元素） */
  sm: BASE * 2,
  /** 12px - 中等间距（列表项、表单控件） */
  md: BASE * 3,
  /** 16px - 标准间距（卡片间距、模块间距） */
  lg: BASE * 4,
  /** 20px - 大间距（区块间距） */
  xl: BASE * 5,
  /** 24px - 超大间距（页面区域） */
  xxl: BASE * 6,
} as const

/**
 * 页面布局相关间距
 */
export const LAYOUT = {
  /** 页面内容区域内边距 */
  pagePadding: SPACING.lg,
  /** 页面模块之间的间距 */
  sectionGap: SPACING.lg,
  /** 表单卡片内边距 */
  cardPadding: SPACING.xxl,
  /** 表格卡片头部内边距 */
  cardHeaderPadding: `${SPACING.md}px ${SPACING.lg}px`,
} as const

/**
 * 组件内部间距
 */
export const COMPONENT = {
  /** Flex 行内元素小间距 */
  inlineGapSm: SPACING.sm,
  /** Flex 行内元素中间距 */
  inlineGapMd: SPACING.md,
  /** 垂直列表项间距 */
  listGap: SPACING.md,
  /** 表单字段间距 */
  fieldGap: SPACING.lg,
} as const
