/**
 * @file ui/layout/Sidebar.tsx
 * @description 模块实现。
 */

// 说明：模块实现
import {
  FileTextOutlined,
  UnorderedListOutlined,
  CheckCircleOutlined,
  ShoppingOutlined,
  SearchOutlined,
  BookOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import { useCreation, useMemoizedFn } from 'ahooks'
import { Layout, Menu } from 'antd'
import type { MenuProps } from 'antd'
import type { ReactNode } from 'react'

const { Sider } = Layout

/**
 * 导出接口类型：SidebarTab。
 */
export interface SidebarTab {
  key: string
  label: string
  icon?: ReactNode
}

interface SidebarProps {
  tabs?: SidebarTab[]
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
  selectedKey?: string
  onSelect?: (key: string) => void
}

const defaultTabs: SidebarTab[] = [
  { key: 'declaration', label: 'Declaration', icon: <FileTextOutlined /> },
  { key: 'smelter-list', label: 'Smelter List', icon: <UnorderedListOutlined /> },
  { key: 'checker', label: 'Checker', icon: <CheckCircleOutlined /> },
  { key: 'product-list', label: 'Product List', icon: <ShoppingOutlined /> },
  { key: 'smelter-lookup', label: 'Smelter Look-up', icon: <SearchOutlined /> },
  { key: 'definitions', label: 'Definitions', icon: <BookOutlined /> },
  { key: 'instructions', label: 'Instructions', icon: <InfoCircleOutlined /> },
]

/**
 * 导出函数：Sidebar（页面导航菜单）。
 */
export function Sidebar({
  tabs = defaultTabs,
  collapsed = false,
  onCollapse,
  selectedKey,
  onSelect,
}: SidebarProps) {
  /** 菜单项列表：基于 tabs 构建，避免每次渲染重建。 */
  const menuItems: MenuProps['items'] = useCreation(
    () =>
      tabs.map((tab) => ({
        key: tab.key,
        icon: tab.icon,
        label: tab.label,
      })),
    [tabs]
  )

  /** 菜单点击回调：保持引用稳定。 */
  const handleMenuClick = useMemoizedFn((info: { key: string }) => {
    onSelect?.(info.key)
  })
  /** 折叠状态变化回调：保持引用稳定。 */
  const handleCollapse = useMemoizedFn((nextCollapsed: boolean) => {
    onCollapse?.(nextCollapsed)
  })

  const activeKey = selectedKey ?? tabs[0]?.key

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={handleCollapse}
      theme="light"
      className="border-r border-gray-200 bg-white"
      width={200}
    >
      <Menu
        mode="inline"
        selectedKeys={activeKey ? [activeKey] : []}
        items={menuItems}
        onClick={handleMenuClick}
        className="h-full border-r-0 px-2 py-2"
      />
    </Sider>
  )
}
