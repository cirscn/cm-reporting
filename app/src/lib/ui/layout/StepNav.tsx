/**
 * @file ui/layout/StepNav.tsx
 * @description 工作流步骤导航组件，使用 Ant Design Steps 组件实现。
 */

import { CheckCircleOutlined } from '@ant-design/icons'
import { useMemoizedFn } from 'ahooks'
import { Steps, Tag } from 'antd'

export interface StepProgress {
  total: number
  completed: number
}

export interface StepNavItem {
  key: string
  label: string
  progress?: StepProgress
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

  const items = steps.map((step, index) => {
    const isComplete = step.progress && step.progress.completed === step.progress.total && step.progress.total > 0
    const hasProgress = step.progress && step.progress.total > 0

    return {
      key: step.key,
      title: (
        <span className="flex items-center gap-1.5">
          <span>{step.label}</span>
          {hasProgress && (
            <Tag
              color={isComplete ? 'success' : 'default'}
              className="text-xs ml-1"
              style={{ margin: 0 }}
            >
              {step.progress!.completed}/{step.progress!.total}
            </Tag>
          )}
        </span>
      ),
      // 完成的步骤显示勾选图标，其他使用默认数字
      icon: isComplete ? (
        <CheckCircleOutlined style={{ color: 'var(--ant-color-success)' }} />
      ) : undefined,
      status:
        isComplete
          ? ('finish' as const)
          : index < currentIndex
            ? ('finish' as const)
            : index === currentIndex
              ? ('process' as const)
              : ('wait' as const),
    }
  })

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
