/**
 * @file ui/layout/StepNav.tsx
 * @description 工作流步骤导航组件，使用 Ant Design Steps 组件实现。
 */

import { CheckCircleOutlined } from '@ant-design/icons'
import { useMemoizedFn } from 'ahooks'
import { Steps, Tag } from 'antd'

const STEP_NAV_Z_INDEX = 20
const DEFAULT_STEP_INDEX = 0
const EMPTY_PROGRESS_TOTAL = 0

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
  purposeTip?: string
  allStepsCompleted?: boolean
  onChange?: (key: string) => void
}

type StepStatus = 'wait' | 'process' | 'finish'

interface StepTitleOptions {
  step: StepNavItem
  isComplete: boolean
  showProgress: boolean
}

function isProgressComplete(progress: StepProgress | undefined) {
  return Boolean(
    progress && progress.total > EMPTY_PROGRESS_TOTAL && progress.completed === progress.total,
  )
}

function renderStepTitle({ step, isComplete, showProgress }: StepTitleOptions) {
  const hasProgress = showProgress && step.progress && step.progress.total > EMPTY_PROGRESS_TOTAL

  return (
    <span className="step-nav-title-content">
      <span className="step-nav-title-label">{step.label}</span>
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
  )
}

function resolveCurrentIndex(steps: StepNavItem[], currentKey: string | undefined) {
  const currentIndex = steps.findIndex((step) => step.key === currentKey)
  return currentIndex >= DEFAULT_STEP_INDEX ? currentIndex : DEFAULT_STEP_INDEX
}

function resolveStepStatus(options: {
  index: number
  currentIndex: number
  isComplete: boolean
  allStepsCompleted: boolean
}): StepStatus {
  if (options.allStepsCompleted || options.isComplete) return 'finish'
  if (options.index === options.currentIndex) return 'process'
  return 'wait'
}

function buildStepItems(options: {
  steps: StepNavItem[]
  currentIndex: number
  allStepsCompleted: boolean
}) {
  const { steps, currentIndex, allStepsCompleted } = options

  return steps.map((step, index) => {
    const isComplete = allStepsCompleted || isProgressComplete(step.progress)
    const isActiveCompleted = allStepsCompleted && index === currentIndex
    const status = resolveStepStatus({ index, currentIndex, isComplete, allStepsCompleted })

    return {
      key: step.key,
      className: isActiveCompleted ? 'step-nav-item--active-completed' : undefined,
      title: renderStepTitle({
        step,
        isComplete,
        showProgress: !allStepsCompleted,
      }),
      icon: isComplete ? (
        <CheckCircleOutlined style={{ color: 'var(--ant-color-success)' }} />
      ) : undefined,
      status,
    }
  })
}

/**
 * StepNav：使用 Ant Design Steps 的步骤进度指示器。
 */
export function StepNav({
  steps,
  currentKey,
  purposeTip,
  allStepsCompleted = false,
  onChange,
}: StepNavProps) {
  const currentIndex = resolveCurrentIndex(steps, currentKey)
  const hasPurposeTip = Boolean(purposeTip?.trim())

  const handleChange = useMemoizedFn((index: number) => {
    const step = steps[index]
    if (step) {
      onChange?.(step.key)
    }
  })

  if (steps.length === 0) return null

  const items = buildStepItems({ steps, currentIndex, allStepsCompleted })

  return (
    <div
      className="step-nav-container"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: STEP_NAV_Z_INDEX,
        flexShrink: 0,
      }}
    >
      {hasPurposeTip && (
        <div className="step-nav-purpose-row">
          <Tag color="blue" className="step-nav-purpose-tip">
            {purposeTip}
          </Tag>
        </div>
      )}
      <div className={`step-nav-inner ${hasPurposeTip ? 'step-nav-inner--with-purpose' : ''}`}>
        <Steps
          current={currentIndex}
          items={items}
          onChange={handleChange}
          type="default"
          className="step-nav-steps"
        />
      </div>
    </div>
  )
}
