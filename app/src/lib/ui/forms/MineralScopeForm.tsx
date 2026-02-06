/**
 * @file ui/forms/MineralScopeForm.tsx
 * @description 模块实现。
 */

import type { I18nKey } from '@core/i18n'
import type { MineralDef, TemplateVersionDef } from '@core/registry/types'
import type { ErrorKey } from '@core/validation/errorKeys'
import { useHandlerMap } from '@ui/hooks/useHandlerMap'
import { useT } from '@ui/i18n'
import { useCreation, useMemoizedFn } from 'ahooks'
import { Checkbox, Col, Tag, Input, Row, Select, Tooltip, Typography, Flex } from 'antd'

import { resolveErrorMessage } from '../fields/error'

interface MineralScopeFormProps {
  versionDef: TemplateVersionDef
  selectedMinerals: string[]
  onMineralsChange: (minerals: string[]) => void
  errors?: {
    selection?: ErrorKey
    custom?: Record<number, ErrorKey>
  }
  customMinerals?: string[]
  onCustomMineralsChange?: (minerals: string[]) => void
}

/**
 * 导出函数：MineralScopeForm。
 */
export function MineralScopeForm({
  versionDef,
  selectedMinerals,
  onMineralsChange,
  errors,
  customMinerals = [],
  onCustomMineralsChange,
}: MineralScopeFormProps) {
  const { t } = useT()
  const { mineralScope } = versionDef
  const isRequired = mineralScope.mode !== 'fixed'
  const maxSlots = mineralScope.mode === 'free-text' ? mineralScope.maxCount || 10 : 0
  const otherSlotCount = mineralScope.otherSlotCount ?? 0
  const freeTextSlots = useCreation(
    () => (maxSlots > 0 ? Array.from({ length: maxSlots }, (_, index) => index) : []),
    [maxSlots]
  )
  const otherSlots = useCreation(
    () =>
      otherSlotCount > 0
        ? Array.from({ length: otherSlotCount }, (_, index) => index)
        : [],
    [otherSlotCount]
  )
  const { maxCountHint, maxCountReachedHint } = useCreation(
    () => getMineralScopeHints(t, mineralScope.maxCount),
    [t, mineralScope.maxCount]
  )
  const selectionError = resolveErrorMessage(t, errors?.selection)
  const customErrors = resolveErrorRecord(t, errors?.custom)

  const handleMineralToggle = useMemoizedFn((mineral: MineralDef, checked: boolean) => {
    if (checked) {
      if (mineralScope.maxCount && selectedMinerals.length >= mineralScope.maxCount) {
        return
      }
      onMineralsChange([...selectedMinerals, mineral.key])
      return
    }
    onMineralsChange(selectedMinerals.filter((m) => m !== mineral.key))
  })
  const handleCustomMineralChange = useMemoizedFn((index: number, value: string) => {
    const next = [...customMinerals]
    next[index] = value
    onCustomMineralsChange?.(next)
  })
  const customSlots = mineralScope.mode === 'free-text' ? freeTextSlots : otherSlots

  /** 复选框 onChange handler（合并原 toggleHandlers + checkboxHandlers）。 */
  const getCheckboxHandler = useHandlerMap(() => {
    const map = new Map<string, (event: { target: { checked: boolean } }) => void>()
    mineralScope.minerals.forEach((mineral) => {
      map.set(mineral.key, (event) => handleMineralToggle(mineral, event.target.checked))
    })
    return map
  }, [mineralScope.minerals, handleMineralToggle])

  /** 自定义矿产名输入 handler（合并原 customMineralHandlers + customInputHandlers）。 */
  const getCustomInputHandler = useHandlerMap(() => {
    const map = new Map<number, (event: { target: { value: string } }) => void>()
    customSlots.forEach((index) => {
      map.set(index, (event) => handleCustomMineralChange(index, event.target.value))
    })
    return map
  }, [customSlots, handleCustomMineralChange])

  // 固定模式：仅展示矿种标签（只读）。
  if (mineralScope.mode === 'fixed') {
    return (
      <Flex vertical gap={12}>
        <Typography.Text strong type="secondary">
          {t('sections.mineralsScope')}
        </Typography.Text>
        <Flex wrap gap={8}>
          {mineralScope.minerals.map((mineral) => (
            <Tag key={mineral.key} color="blue">
              {t(mineral.labelKey)}
            </Tag>
          ))}
        </Flex>
      </Flex>
    )
  }

  // 动态模式：以多选框选择矿种。
  if (mineralScope.mode === 'dynamic-dropdown') {
    const otherSelected = selectedMinerals.includes('other')
    return (
      <Flex vertical gap={12}>
        <Flex align="center" gap={8}>
          <Typography.Text strong type="secondary">
            {t('sections.mineralsScope')}
          </Typography.Text>
          {isRequired && <Typography.Text type="danger">*</Typography.Text>}
          {mineralScope.maxCount && (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              ({selectedMinerals.length}/{mineralScope.maxCount})
            </Typography.Text>
          )}
        </Flex>
        <Flex wrap gap={16}>
          {mineralScope.minerals.map((mineral) => {
            const isSelected = selectedMinerals.includes(mineral.key)
            const isDisabled =
              !isSelected &&
              mineralScope.maxCount !== undefined &&
              selectedMinerals.length >= mineralScope.maxCount
            const checkbox = (
              <Checkbox
                key={mineral.key}
                checked={isSelected}
                disabled={isDisabled}
                onChange={getCheckboxHandler(mineral.key)}
              >
                {t(mineral.labelKey)}
              </Checkbox>
            )
            return isDisabled && maxCountReachedHint ? (
              <Tooltip key={mineral.key} title={maxCountReachedHint}>
                <span>{checkbox}</span>
              </Tooltip>
            ) : (
              checkbox
            )
          })}
        </Flex>
        {maxCountHint && (
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {maxCountHint}
          </Typography.Text>
        )}
        {otherSelected && otherSlots.length > 0 && (
          <Flex vertical gap={8}>
            <Flex align="center" gap={4}>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {t('sections.mineralsOther')}
              </Typography.Text>
              <Typography.Text type="danger">*</Typography.Text>
            </Flex>
            <Row gutter={[8, 8]}>
              {otherSlots.map((index) => (
                <Col key={index} xs={12} md={6}>
                  <Input
                    value={customMinerals[index] || undefined}
                    onChange={getCustomInputHandler(index)}
                    placeholder={t('placeholders.customMineral', { index: index + 1 })}
                    status={customErrors[index] ? 'error' : undefined}
                  />
                </Col>
              ))}
            </Row>
            {customErrors[0] && (
              <Typography.Text type="danger" style={{ fontSize: 12 }}>
                {customErrors[0]}
              </Typography.Text>
            )}
          </Flex>
        )}
        {selectionError && (
          <Typography.Text type="danger" style={{ fontSize: 12 }}>
            {selectionError}
          </Typography.Text>
        )}
      </Flex>
    )
  }

  // 自由输入模式（AMRT 1.1/1.2）：文本框填写自定义矿种。
  if (mineralScope.mode === 'free-text') {
    return (
      <Flex vertical gap={8}>
        <Flex align="center" gap={4}>
          <Typography.Text strong type="secondary">
            {t('sections.mineralsScope')}
          </Typography.Text>
          <Typography.Text type="danger">*</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
            ({t('hints.mineralsMaxCount', { max: maxSlots })})
          </Typography.Text>
        </Flex>
        <Row gutter={[8, 8]}>
          {freeTextSlots.map((index) => (
            <Col key={index} xs={12} md={6}>
              <Input
                value={customMinerals[index] || undefined}
                onChange={getCustomInputHandler(index)}
                placeholder={t('placeholders.customMineral', { index: index + 1 })}
                status={customErrors[index] ? 'error' : undefined}
              />
            </Col>
          ))}
        </Row>
        {customErrors[0] && (
          <Typography.Text type="danger" style={{ fontSize: 12 }}>
            {customErrors[0]}
          </Typography.Text>
        )}
      </Flex>
    )
  }

  return null
}

/** 解析矿产上限提示文案。 */
function getMineralScopeHints(
  t: (key: I18nKey, options?: Record<string, unknown>) => string,
  maxCount?: number
) {
  if (!maxCount) return { maxCountHint: undefined, maxCountReachedHint: undefined }
  return {
    maxCountHint: t('hints.mineralsMaxCount', { max: maxCount }),
    maxCountReachedHint: t('hints.mineralsMaxCountReached'),
  }
}

/** 解析矿产自由输入错误映射（按索引）。 */
function resolveErrorRecord(
  t: (key: I18nKey, options?: Record<string, unknown>) => string,
  errors?: Record<number, ErrorKey>
) {
  const result: Record<number, string> = {}
  if (!errors) return result
  Object.entries(errors).forEach(([key, value]) => {
    if (!value) return
    const index = Number(key)
    if (Number.isNaN(index)) return
    result[index] = resolveErrorMessage(t, value) ?? value
  })
  return result
}

// 简化版范围选择器（用于 Declaration 页头部）。
interface ScopeSelectorProps {
  value?: 'A' | 'B' | 'C'
  onChange: (value: 'A' | 'B' | 'C') => void
  scopeDescription?: string
  onScopeDescriptionChange?: (value: string) => void
}

/** 声明范围选项（ScopeSelector 使用）。 */
const SCOPE_OPTIONS = [
  { value: 'A', label: 'A. Company-wide' },
  { value: 'B', label: 'B. Product (or List of Products)' },
  { value: 'C', label: 'C. User defined' },
]

/**
 * 导出函数：ScopeSelector。
 */
export function ScopeSelector({
  value,
  onChange,
  scopeDescription,
  onScopeDescriptionChange,
}: ScopeSelectorProps) {
  const { t } = useT()
  const handleScopeDescriptionChange = useMemoizedFn((nextValue: string) => {
    onScopeDescriptionChange?.(nextValue)
  })
  const handleScopeDescriptionInput = useMemoizedFn((event: { target: { value: string } }) => {
    handleScopeDescriptionChange(event.target.value)
  })

  return (
    <Flex vertical gap={16}>
      <Flex vertical gap={8}>
        <Flex align="center" gap={4}>
          <Typography.Text strong type="secondary">
            {t('fields.reportingScope')}
          </Typography.Text>
          <Typography.Text type="danger">*</Typography.Text>
        </Flex>
        <Select
          value={value || undefined}
          onChange={onChange}
          options={SCOPE_OPTIONS}
          placeholder={t('placeholders.declarationScope')}
          style={{ width: '100%', maxWidth: 448 }}
        />
      </Flex>
      {value === 'C' && (
        <Flex vertical gap={8}>
          <Flex align="center" gap={4}>
            <Typography.Text strong type="secondary">
              {t('fields.scopeDescription')}
            </Typography.Text>
            <Typography.Text type="danger">*</Typography.Text>
          </Flex>
          <Input.TextArea
            value={scopeDescription || undefined}
            onChange={handleScopeDescriptionInput}
            placeholder={t('placeholders.scopeDescription')}
            rows={3}
            style={{ maxWidth: 448 }}
          />
        </Flex>
      )}
    </Flex>
  )
}
