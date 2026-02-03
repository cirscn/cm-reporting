/**
 * @file ui/layout/SectionCard.tsx
 * @description 使用 Ant Design Card 组件实现的内容区域卡片。
 */

import { Card, Flex, Tag, Typography } from 'antd'
import type { ReactNode } from 'react'

const { Title } = Typography

interface SectionCardProps {
  /** 卡片标题 */
  title?: ReactNode
  /** 标题图标 */
  icon?: ReactNode
  /** 标题右侧徽章/额外内容 */
  extra?: ReactNode
  /** 卡片内容 */
  children?: ReactNode
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
  /** 内容区域是否有内边距 */
  bordered?: boolean
}

/**
 * SectionCard：使用 Ant Design Card 的内容区域卡片组件。
 */
export function SectionCard({
  title,
  icon,
  extra,
  children,
  className,
  style,
  bordered = true,
}: SectionCardProps) {
  const cardTitle = title ? (
    <Flex align="center" gap={8}>
      {icon}
      <span>{title}</span>
    </Flex>
  ) : undefined

  return (
    <Card
      title={cardTitle}
      extra={extra}
      bordered={bordered}
      className={`app-section-card ${className ?? ''}`}
      style={style}
    >
      {children}
    </Card>
  )
}

interface SectionHeaderProps {
  title: ReactNode
  icon?: ReactNode
  extra?: ReactNode
  level?: 3 | 4 | 5
  className?: string
}

/**
 * SectionHeader：独立的区域标题组件。
 */
export function SectionHeader({
  title,
  icon,
  extra,
  level = 4,
  className,
}: SectionHeaderProps) {
  return (
    <Flex
      align="center"
      justify="space-between"
      className={`app-section-header ${className ?? ''}`}
    >
      <Flex align="center" gap={8}>
        {icon}
        <Title level={level} style={{ margin: 0 }}>
          {title}
        </Title>
      </Flex>
      {extra}
    </Flex>
  )
}

interface StatusBadgeProps {
  done: number
  total: number
  type?: 'warning' | 'success' | 'error' | 'info'
}

/**
 * StatusBadge：状态徽章，显示完成进度。
 */
export function StatusBadge({ done, total, type = 'warning' }: StatusBadgeProps) {
  const colorMap = {
    warning: 'orange',
    success: 'green',
    error: 'red',
    info: 'blue',
  }

  return (
    <Tag color={colorMap[type]}>
      {done}/{total} required completed
    </Tag>
  )
}
