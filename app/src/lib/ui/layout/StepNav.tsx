/**
 * @file ui/layout/StepNav.tsx
 * @description 工作流步骤导航组件，使用 Ant Design Steps 组件实现。
 */

import { useMemoizedFn } from 'ahooks'
import { Steps } from 'antd'

export interface StepNavItem {
  key: string
  label: string
}

interface StepNavProps {
  steps: StepNavItem[]
  currentKey?: string
  onChange?: (key: string) => void
}

/**
 * StepNav：使用 Ant Design Steps 的步骤进度指示器。
 */
export function StepNav({ steps, currentKey, onChange }: StepNavProps) {
  const currentIndex = steps.findIndex((step) => step.key === currentKey)

  const handleChange = useMemoizedFn((index: number) => {
    const step = steps[index]
    if (step) {
      onChange?.(step.key)
    }
  })

  if (steps.length === 0) return null

  const items = steps.map((step, index) => ({
    key: step.key,
    title: <span>{step.label}</span>,
    status:
      index < currentIndex
        ? ('finish' as const)
        : index === currentIndex
          ? ('process' as const)
          : ('wait' as const),
  }))

  return (
    <div className="step-nav-container">
      <div className="step-nav-inner">
        <Steps
          current={currentIndex >= 0 ? currentIndex : 0}
          items={items}
          onChange={handleChange}
          type="default"
          className="step-nav-steps"
        />
      </div>
    </div>
  )
}
