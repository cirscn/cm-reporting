/**
 * @file ui/forms/MineralsScopeReasonsForm.tsx
 * @description 模块实现。
 */

// 说明：AMRT Minerals Scope（矿物范围原因）表单。
import { DeleteOutlined } from '@ant-design/icons'
import type { MineralDef, TemplateVersionDef } from '@core/registry/types'
import { getDisplayMinerals } from '@core/template/minerals'
import type { MineralsScopeRow } from '@core/types/tableRows'
import type { ErrorKey } from '@core/validation/errorKeys'
import { useT } from '@ui/i18n/useT'
import { LAYOUT } from '@ui/theme/spacing'
import { useCreation, useMemoizedFn } from 'ahooks'
import { Button, Flex, Input, Select, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { ChangeEvent, ReactNode } from 'react'

interface MineralsScopeReasonsFormProps {
  versionDef: TemplateVersionDef
  rows: MineralsScopeRow[]
  /** 已选择的矿种 key（用于限定下拉范围）。 */
  selectedMinerals: string[]
  /** 其他/自定义矿种名称（用于生成动态矿种选项）。 */
  customMinerals: string[]
  onChange: (rows: MineralsScopeRow[]) => void
  errors?: Record<number, { mineral?: ErrorKey; reason?: ErrorKey }>
}

/**
 * Minerals Scope 表单（AMRT）：填写矿种与纳入原因。
 */
export function MineralsScopeReasonsForm({
  versionDef,
  rows,
  selectedMinerals,
  customMinerals,
  onChange,
  errors = {},
}: MineralsScopeReasonsFormProps) {
  const { t } = useT()

  const mineralOptions = useCreation(
    () => {
      const activeMinerals = getDisplayMinerals(versionDef, selectedMinerals, customMinerals)
      const sortedMinerals =
        versionDef.templateType === 'amrt'
          ? [...activeMinerals].sort((a, b) => {
              const left = (a.label ?? t(a.labelKey)).trim()
              const right = (b.label ?? t(b.labelKey)).trim()
              const result = left.localeCompare(right)
              return result !== 0 ? result : a.key.localeCompare(b.key)
            })
          : activeMinerals
      return sortedMinerals.map((mineral: MineralDef & { label?: string }) => ({
        value: mineral.key,
        label: mineral.label ?? t(mineral.labelKey),
      }))
    },
    [versionDef, selectedMinerals, customMinerals, t]
  )

  const rowIndexMap = useCreation(
    () => new Map(rows.map((row, index) => [row.id, index])),
    [rows]
  )

  /** 必填字段包裹：用于标记黄色必填背景。 */
  const wrapRequired = useMemoizedFn((node: ReactNode) => (
    <div className="field-required">{node}</div>
  ))

  const handleAddRow = useMemoizedFn(() => {
    const newRow: MineralsScopeRow = {
      id: `minerals-scope-${Date.now()}`,
      mineral: '',
      reason: '',
    }
    onChange([...rows, newRow])
  })

  const handleRemoveRow = useMemoizedFn((id: string) => {
    const index = rowIndexMap.get(id)
    if (index === undefined) return
    const next = rows.slice()
    next.splice(index, 1)
    onChange(next)
  })

  const handleCellChange = useMemoizedFn(
    (id: string, field: keyof MineralsScopeRow, value: string) => {
      const index = rowIndexMap.get(id)
      if (index === undefined) return
      const row = rows[index]
      if (!row || row[field] === value) return
      const next = rows.slice()
      next[index] = { ...row, [field]: value }
      onChange(next)
    }
  )

  const inputHandlers = useCreation(() => {
    const map = new Map<string, (event: ChangeEvent<HTMLInputElement>) => void>()
    rows.forEach((row) => {
      map.set(`${row.id}:reason`, (event) =>
        handleCellChange(row.id, 'reason', event.target.value)
      )
    })
    return map
  }, [rows, handleCellChange])

  const selectHandlers = useCreation(() => {
    const map = new Map<string, (value: string) => void>()
    rows.forEach((row) => {
      map.set(`${row.id}:mineral`, (value) => handleCellChange(row.id, 'mineral', value))
    })
    return map
  }, [rows, handleCellChange])

  const getInputHandler = useMemoizedFn((id: string) => inputHandlers.get(`${id}:reason`))
  const getSelectHandler = useMemoizedFn((id: string) => selectHandlers.get(`${id}:mineral`))

  const columns = useCreation<ColumnsType<MineralsScopeRow>>(
    () => [
      {
        title: t('tables.metal'),
        dataIndex: 'mineral',
        key: 'mineral',
        width: 220,
        render: (value: string, record: MineralsScopeRow) => {
          const error = errors[rowIndexMap.get(record.id) ?? -1]?.mineral
          return wrapRequired(
            <Select
              value={value || undefined}
              onChange={getSelectHandler(record.id)}
              options={mineralOptions}
              placeholder={t('placeholders.select')}
              className="w-full"
              status={error ? 'error' : undefined}
            />
          )
        },
      },
      {
        title:
          versionDef.templateType === 'amrt'
            ? t(versionDef.version.id === '1.1' ? 'tables.mineralsScopeReasonPrt' : 'tables.mineralsScopeReasonAmrt')
            : t('tables.mineralsScopeReason'),
        dataIndex: 'reason',
        key: 'reason',
        render: (value: string, record: MineralsScopeRow) => {
          const error = errors[rowIndexMap.get(record.id) ?? -1]?.reason
          return wrapRequired(
            <Input
              value={value || undefined}
              onChange={getInputHandler(record.id)}
              placeholder={t('placeholders.mineralsScopeReason')}
              status={error ? 'error' : undefined}
            />
          )
        },
      },
      {
        title: '',
        key: 'actions',
        width: 60,
        render: (_: unknown, record: MineralsScopeRow) => (
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleRemoveRow(record.id)}
          />
        ),
      },
    ],
    [t, mineralOptions, errors, rowIndexMap, getSelectHandler, getInputHandler, handleRemoveRow]
  )

  return (
    <Flex vertical gap={LAYOUT.sectionGap}>
      <Flex align="center" justify="space-between">
        <Flex wrap align="center" gap={8}>
          <Typography.Title level={5} style={{ margin: 0 }}>{t('tabs.mineralsScope')}</Typography.Title>
          <Tag color="blue">
            {t('badges.recordCount', { count: rows.length })}
          </Tag>
        </Flex>
        <Button type="primary" onClick={handleAddRow}>
          {t('actions.addRow')}
        </Button>
      </Flex>
      <Table
        columns={columns}
        dataSource={rows}
        rowKey="id"
        pagination={false}
        scroll={{ x: 'max-content' }}
        bordered
      />
      {rows.length === 0 && (
        <Typography.Text type="secondary" style={{ display: 'block', textAlign: 'center', padding: '32px 0' }}>
          {t('tables.noData')}
        </Typography.Text>
      )}
    </Flex>
  )
}
