/**
 * @file ui/layout/AppLayout.tsx
 * @description 应用级页面框架，包含 StepNav、Sidebar 和内容区域。
 */

import { LAYOUT } from '@ui/theme/spacing'
import { useMemoizedFn } from 'ahooks'
import { Card, Flex, Layout } from 'antd'
import type { ReactNode } from 'react'
import { useState } from 'react'

import { Sidebar, type SidebarTab } from './Sidebar'
import { StepNav, type StepNavItem } from './StepNav'

const { Content } = Layout

interface AppLayoutProps {
  /** 侧边栏标签页（与 steps 互斥） */
  tabs?: SidebarTab[]
  /** 工作流步骤（与 tabs 互斥，优先使用） */
  steps?: StepNavItem[]
  /** 顶部横幅区域（如全局错误提示） */
  topBanner?: ReactNode
  /** 底部插槽（如分页操作） */
  bottomSlot?: ReactNode
  /** 当前激活的标签页 key */
  currentTabKey?: string
  /** 标签页切换回调 */
  onTabChange?: (key: string) => void
  /** 当前激活的步骤 key */
  currentStepKey?: string
  /** 步骤切换回调 */
  onStepChange?: (key: string) => void
  /** 页面内容 */
  children?: ReactNode
  /** 内容区域最大宽度（可选，不设置则填充父容器） */
  maxContentWidth?: number
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
}

/**
 * AppLayout：应用级页面框架。
 * 实现原型设计中的整体布局结构，包含步骤导航和内容区域。
 */
export function AppLayout({
  tabs,
  steps,
  topBanner,
  bottomSlot,
  currentTabKey,
  onTabChange,
  currentStepKey,
  onStepChange,
  children,
  maxContentWidth,
  className,
  style,
}: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)

  const handleCollapse = useMemoizedFn((nextCollapsed: boolean) => {
    setCollapsed(nextCollapsed)
  })

  // 优先使用 steps，其次使用 tabs 作为侧边栏
  const useStepNav = Boolean(steps && steps.length > 0)
  const showSidebar = Boolean(tabs && tabs.length > 0 && !useStepNav)

  const layoutStyle = maxContentWidth
    ? ({
        ...(style ?? {}),
        '--cm-content-max-width': `${maxContentWidth}px`,
      } as React.CSSProperties)
    : style

  return (
    <Layout className={`h-full min-h-full bg-gray-100 ${className ?? ''}`} style={layoutStyle}>
      {/* 步骤导航条 */}
      {useStepNav && (
        <StepNav steps={steps!} currentKey={currentStepKey} onChange={onStepChange} />
      )}

      {/* 顶部横幅（如全局错误提示） */}
      {topBanner}

      {/* 主内容区域 */}
      <Layout>
        {/* 侧边栏（仅在无步骤导航时显示） */}
        {showSidebar && (
          <Sidebar
            tabs={tabs}
            collapsed={collapsed}
            onCollapse={handleCollapse}
            selectedKey={currentTabKey}
            onSelect={onTabChange}
          />
        )}

        {/* 内容区域 */}
        <Layout style={{ padding: LAYOUT.pagePadding, display: 'flex', flexDirection: 'column' }}>
          <Content style={{ flex: 1, overflow: 'auto' }}>
            <Flex
              vertical
              gap={LAYOUT.sectionGap}
              className="animate-fade-in w-full"
              style={maxContentWidth ? { maxWidth: maxContentWidth, margin: '0 auto' } : undefined}
            >
              {children}
            </Flex>
          </Content>
          {/* 底部导航栏 - 粘性定位，始终可见 */}
          {bottomSlot && (
            <div
              className="sticky-bottom-nav"
              style={{
                position: 'sticky',
                bottom: 0,
                zIndex: 10,
                marginTop: LAYOUT.sectionGap,
                maxWidth: maxContentWidth,
                marginLeft: maxContentWidth ? 'auto' : undefined,
                marginRight: maxContentWidth ? 'auto' : undefined,
                width: '100%',
              }}
            >
              <Card>{bottomSlot}</Card>
            </div>
          )}
        </Layout>
      </Layout>
    </Layout>
  )
}
