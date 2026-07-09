import fs from 'node:fs'
import path from 'node:path'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test, vi } from 'vitest'

import { StepNav } from './StepNav'

function readStepNavCss() {
  const stylesPath = path.resolve(import.meta.dirname, '../../step-nav.css')
  return fs.readFileSync(stylesPath, 'utf8')
}

vi.mock('@ant-design/icons', () => ({
  CheckCircleOutlined: () => <span data-kind="check-icon" />,
}))

vi.mock('ahooks', () => ({
  useMemoizedFn: <T extends (...args: never[]) => unknown>(fn: T) => fn,
}))

vi.mock('antd', () => ({
  Steps: ({
    className,
    current,
    items,
  }: {
    className?: string
    current?: number
    items?: Array<{
      key: string
      title?: React.ReactNode
      className?: string
      icon?: React.ReactNode
      status?: string
    }>
  }) => (
    <div data-current={current} data-kind="steps" className={className}>
      {items?.map((item, index) => (
        <div
          key={item.key}
          className={item.className}
          data-kind="step-item"
          data-status={item.status}
        >
          {item.icon ?? <span data-kind="step-number">{index + 1}</span>}
          {item.title}
        </div>
      ))}
    </div>
  ),
  Tag: ({
    children,
    className,
    color,
  }: {
    children?: React.ReactNode
    className?: string
    color?: string
  }) => (
    <span className={className} data-color={color} data-kind="tag">
      {children}
    </span>
  ),
}))

describe('StepNav', () => {
  test('keeps the current step indicator circular in styles', () => {
    const css = readStepNavCss()

    expect(css).toContain('.step-nav-steps .ant-steps-item-process .ant-steps-item-icon')
    expect(css).toContain('border-radius: 50%')
    expect(css).toContain('--cm-step-nav-icon-size: 32px')
    expect(css).toContain('width: var(--cm-step-nav-icon-size)')
    expect(css).toContain('height: var(--cm-step-nav-icon-size)')
    expect(css).not.toContain('transform: scale(1.05)')
  })

  test('styles the readonly current completed step with icon fill only', () => {
    const css = readStepNavCss()

    expect(css).toContain(
      '.step-nav-steps .step-nav-item--active-completed .ant-steps-item-icon',
    )
    expect(css).toContain('background: var(--ant-color-success)')
    expect(css).toContain('border-color: var(--ant-color-success)')
    expect(css).toContain('color: var(--ant-color-text-light-solid) !important')
    expect(css).not.toContain(
      '.step-nav-steps .step-nav-item--active-completed .step-nav-title-content',
    )
    expect(css).not.toContain('transform: scale(')
  })

  test('aligns the horizontal connector line higher against the step title', () => {
    const css = readStepNavCss()

    expect(css).toContain('.step-nav-steps .ant-steps-item-title::after')
    expect(css).toContain('top: calc(var(--ant-steps-title-line-height) / 3) !important')
    expect(css).toContain('.step-nav-steps.ant-steps-horizontal .ant-steps-item-tail')
    expect(css).toContain('.step-nav-steps .ant-steps-item-rail')
    expect(css).toContain('height: var(--cm-step-nav-line-height) !important')
  })

  test('sticks to the top so step navigation stays visible while content scrolls', () => {
    const html = renderToStaticMarkup(
      <StepNav
        currentKey="declaration"
        steps={[
          { key: 'declaration', label: '申报' },
          { key: 'smelterList', label: '冶炼厂' },
        ]}
      />,
    )

    expect(html).toContain('step-nav-container')
    expect(html).toContain('position:sticky')
    expect(html).toContain('top:0')
    expect(html).toContain('z-index:20')
  })

  test('renders a dedicated alignment wrapper for step label content', () => {
    const html = renderToStaticMarkup(
      <StepNav
        currentKey="declaration"
        steps={[
          { key: 'declaration', label: '申报', progress: { completed: 7, total: 57 } },
        ]}
      />,
    )

    expect(html).toContain('step-nav-title-content')
    expect(html).toContain('step-nav-title-label')
  })

  test('renders the version purpose tip as an info tag above steps', () => {
    const html = renderToStaticMarkup(
      <StepNav
        currentKey="declaration"
        purposeTip="此报告的目的是收集在产品中所用锡、钽、钨、黄金等金属的采购信息。"
        steps={[{ key: 'declaration', label: '申报' }]}
      />,
    )

    expect(html).toContain('step-nav-purpose-tip')
    expect(html).toContain('data-kind="tag"')
    expect(html).toContain('data-color="blue"')
    expect(html).toContain('此报告的目的是收集在产品中所用锡、钽、钨、黄金等金属的采购信息。')
  })

  test('renders the version purpose tip in a dedicated left aligned row', () => {
    const html = renderToStaticMarkup(
      <StepNav
        currentKey="declaration"
        purposeTip="此报告的目的是收集产品中使用的特定原材料的采购信息。"
        steps={[{ key: 'declaration', label: '申报' }]}
      />,
    )

    expect(html).toContain('step-nav-purpose-row')
    expect(html.indexOf('step-nav-purpose-row')).toBeLessThan(html.indexOf('step-nav-inner'))
  })

  test('keeps incomplete editable steps numbered while showing their progress', () => {
    const html = renderToStaticMarkup(
      <StepNav
        currentKey="checker"
        steps={[
          { key: 'declaration', label: '申报', progress: { completed: 12, total: 12 } },
          { key: 'smelter-list', label: '冶炼厂列表', progress: { completed: 0, total: 1 } },
          { key: 'product-list', label: '产品列表' },
          { key: 'checker', label: '校验' },
        ]}
      />,
    )

    expect(html).toContain('0/1')
    expect(html).toContain('data-status="wait"')
    expect(html).toContain('data-kind="step-number"')
    expect(html).not.toContain('产品列表</span><span data-kind="tag"')
    expect(html.match(/data-kind="check-icon"/g)).toHaveLength(1)
  })

  test('marks all readonly completed steps as checked and hides progress counts', () => {
    const html = renderToStaticMarkup(
      <StepNav
        allStepsCompleted
        steps={[
          { key: 'declaration', label: '申报', progress: { completed: 12, total: 12 } },
          { key: 'smelter-list', label: '冶炼厂列表', progress: { completed: 0, total: 1 } },
          { key: 'product-list', label: '产品列表' },
        ]}
      />,
    )

    expect(html).not.toContain('12/12')
    expect(html).not.toContain('0/1')
    expect(html).toContain('data-current="0"')
    expect(html.match(/data-kind="check-icon"/g)).toHaveLength(3)
    expect(html).toContain('step-nav-item--active-completed')
  })
})
