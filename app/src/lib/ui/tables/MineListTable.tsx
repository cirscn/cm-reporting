/**
 * @file ui/tables/MineListTable.tsx
 * @description 模块实现。
 */

// 说明：模块实现
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import type { MineralDef, MineListConfig } from '@core/registry/types'
import type { MineRow } from '@core/types/tableRows'
import { renderRequiredHeaderLabel, wrapRequired } from '@ui/helpers/fieldRequired'
import { getReadonlyTextControlProps } from '@ui/helpers/readonlyDisplay'
import { useHandlerMap } from '@ui/hooks/useHandlerMap'
import { useT } from '@ui/i18n/useT'
import { useCreation, useMemoizedFn } from 'ahooks'
import { AutoComplete, Button, Card, ConfigProvider, Flex, Table, Select, Input, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { ChangeEvent } from 'react'

import { getMineHeaderProfile } from './mineHeaderProfile'

type SmelterOption = { value: string; label: string }

interface MineListTableProps {
  config: MineListConfig
  availableMetals: Array<MineralDef & { label?: string }>
  rows: MineRow[]
  onChange: (rows: MineRow[]) => void
  smelterOptions?: SmelterOption[]
  smelterOptionsByMetal?: Record<string, SmelterOption[]>
}

const EMPTY_SMELTER_OPTIONS: SmelterOption[] = []
const EMPTY_SMELTER_OPTIONS_BY_METAL: Record<string, SmelterOption[]> = {}

const INPUT_FIELDS = [
  'smelterName',
  'mineName',
  'mineCountry',
  'mineId',
  'mineIdSource',
  'mineStreet',
  'mineCity',
  'mineProvince',
  'mineContactName',
  'mineContactEmail',
  'proposedNextSteps',
  'comments',
] as const

const SELECT_FIELDS = ['metal', 'smelterName'] as const
const REQUIRED_AFTER_METAL_FIELDS = new Set([
  'smelterName',
  'mineName',
  'mineCountry',
])

/** 矿山清单表格：支持增删行与行内编辑。 */
export function MineListTable({
  config,
  availableMetals,
  rows,
  onChange,
  smelterOptions = EMPTY_SMELTER_OPTIONS,
  smelterOptionsByMetal = EMPTY_SMELTER_OPTIONS_BY_METAL,
}: MineListTableProps) {
  const { t, locale } = useT()
  const { componentDisabled } = ConfigProvider.useConfig()
  /** 行索引缓存：避免频繁全表 map/filter。 */
  const rowIndexMap = useCreation(
    () => new Map(rows.map((row, index) => [row.id, index])),
    [rows]
  )

  // wrapRequired 已提取到 @ui/helpers/fieldRequired
  /** 添加空行（保持字段结构完整）。 */
  const handleAddRow = useMemoizedFn(() => {
    if (componentDisabled) return
    const newRow: MineRow = {
      id: `mine-${Date.now()}`,
      metal: '',
      smelterName: '',
      mineName: '',
      mineCountry: '',
      mineId: '',
      mineIdSource: '',
      mineStreet: '',
      mineCity: '',
      mineProvince: '',
      mineDistrict: '',
      mineContactName: '',
      mineContactEmail: '',
      proposedNextSteps: '',
      comments: '',
    }
    onChange([...rows, newRow])
  })

  /** 删除指定行（基于缓存索引定位）。 */
  const handleRemoveRow = useMemoizedFn((id: string) => {
    if (componentDisabled) return
    const index = rowIndexMap.get(id)
    if (index === undefined) return
    const next = rows.slice()
    next.splice(index, 1)
    onChange(next)
  })

  /** 更新单元格（值不变则不触发更新）。 */
  const handleCellChange = useMemoizedFn((id: string, field: keyof MineRow, value: string) => {
    if (componentDisabled) return
    const index = rowIndexMap.get(id)
    if (index === undefined) return
    const row = rows[index]
    if (!row || row[field] === value) return
    const next = rows.slice()
    next[index] = { ...row, [field]: value }
    onChange(next)
  })

  /** 缓存输入回调，减少表格内联函数开销。 */
  const getInputHandler = useHandlerMap(() => {
    const map = new Map<string, (event: ChangeEvent<HTMLInputElement>) => void>()
    rows.forEach((row) => {
      INPUT_FIELDS.forEach((field) => {
        map.set(`${row.id}:${field}`, (event) =>
          handleCellChange(row.id, field, event.target.value)
        )
      })
    })
    return map
  }, [rows, handleCellChange])

  /** 缓存下拉回调。 */
  const getSelectHandler = useHandlerMap(() => {
    const map = new Map<string, (value: string) => void>()
    rows.forEach((row) => {
      SELECT_FIELDS.forEach((field) => {
        map.set(`${row.id}:${field}`, (value) => handleCellChange(row.id, field, value))
      })
    })
    return map
  }, [rows, handleCellChange])

  /** 缓存删除按钮回调。 */
  const getRemoveHandler = useHandlerMap(() => {
    const map = new Map<string, () => void>()
    rows.forEach((row) => {
      map.set(row.id, () => handleRemoveRow(row.id))
    })
    return map
  }, [rows, handleRemoveRow])

  const metalOptions = useCreation(
    () =>
      availableMetals.map((m) => ({
        value: m.key,
        label: m.label ?? t(m.labelKey),
      })),
    [availableMetals, t]
  )
  /** 统一的下拉搜索过滤逻辑，避免多处重复定义。 */
  const filterOptionByLabel = useMemoizedFn((input: string, option?: { label?: string }) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
  )
  const headerProfile = useCreation(
    () => getMineHeaderProfile({ locale, t }),
    [locale, t],
  )
  const hasSelectedMineMetal = useCreation(
    () => rows.some((row) => row.metal.trim()),
    [rows],
  )
  const resolveColumnTitle = useMemoizedFn((column: keyof typeof headerProfile.labels) =>
    renderRequiredHeaderLabel(
      headerProfile.labels[column],
      hasSelectedMineMetal && REQUIRED_AFTER_METAL_FIELDS.has(column),
    ),
  )

  const columns = useCreation<ColumnsType<MineRow>>(() => [
    {
      title: headerProfile.labels.metal,
      dataIndex: 'metal',
      key: 'metal',
      width: 150,
      render: (value: string, record: MineRow) => (
        wrapRequired(
          true,
          <Select
            value={value || undefined}
            onChange={getSelectHandler(`${record.id}:metal`)}
            options={metalOptions}
            disabled={componentDisabled}
            {...getReadonlyTextControlProps({
              value,
              placeholder: t('placeholders.select'),
              disabled: componentDisabled,
              className: 'w-full',
            })}
          />,
          componentDisabled,
        )
      ),
    },
    {
      title: resolveColumnTitle('smelterName'),
      dataIndex: 'smelterName',
      key: 'smelterName',
      width: 220,
      render: (value: string, record: MineRow) => {
        const filteredOptions = record.metal
          ? smelterOptionsByMetal[record.metal] ?? []
          : smelterOptions
        const required = Boolean(record.metal)
        return config.smelterNameMode === 'dropdown'
          ? wrapRequired(
              required,
              <Select
                value={value || undefined}
                onChange={getSelectHandler(`${record.id}:smelterName`)}
                options={filteredOptions}
                disabled={componentDisabled || !record.metal}
                showSearch
                filterOption={filterOptionByLabel}
                {...getReadonlyTextControlProps({
                  value,
                  placeholder: t('placeholders.mineSmelterSelect'),
                  disabled: componentDisabled,
                  className: 'w-full',
                })}
              />,
              componentDisabled,
            )
          : wrapRequired(
              required,
              <AutoComplete
                value={value || undefined}
                onChange={getSelectHandler(`${record.id}:smelterName`)}
                options={filteredOptions}
                disabled={componentDisabled || !record.metal}
                allowClear
                filterOption={filterOptionByLabel}
                {...getReadonlyTextControlProps({
                  value,
                  placeholder: t('placeholders.mineSmelterInput'),
                  disabled: componentDisabled,
                  className: 'w-full',
                })}
              />,
              componentDisabled,
            )
      },
    },
    {
      title: resolveColumnTitle('mineName'),
      dataIndex: 'mineName',
      key: 'mineName',
      width: 180,
      render: (value: string, record: MineRow) => (
        wrapRequired(
          Boolean(record.metal),
          <Input
            value={value || undefined}
            onChange={getInputHandler(`${record.id}:mineName`)}
            disabled={componentDisabled}
            {...getReadonlyTextControlProps({
              value,
              placeholder: t('placeholders.mineName'),
              disabled: componentDisabled,
            })}
          />,
          componentDisabled,
        )
      ),
    },
    {
      title: headerProfile.labels.mineId,
      dataIndex: 'mineId',
      key: 'mineId',
      width: 160,
      render: (value: string, record: MineRow) => (
        <Input
          value={value || undefined}
          onChange={getInputHandler(`${record.id}:mineId`)}
          disabled={componentDisabled}
          {...getReadonlyTextControlProps({
            value,
            placeholder: t('placeholders.mineId'),
            disabled: componentDisabled,
          })}
        />
      ),
    },
    {
      title: headerProfile.labels.mineIdSource,
      dataIndex: 'mineIdSource',
      key: 'mineIdSource',
      width: 180,
      render: (value: string, record: MineRow) => (
        <Input
          value={value || undefined}
          onChange={getInputHandler(`${record.id}:mineIdSource`)}
          disabled={componentDisabled}
          {...getReadonlyTextControlProps({
            value,
            placeholder: t('placeholders.mineSourceId'),
            disabled: componentDisabled,
          })}
        />
      ),
    },
    {
      title: resolveColumnTitle('mineCountry'),
      dataIndex: 'mineCountry',
      key: 'mineCountry',
      width: 160,
      render: (value: string, record: MineRow) => (
        wrapRequired(
          Boolean(record.metal),
          <Input
            value={value || undefined}
            onChange={getInputHandler(`${record.id}:mineCountry`)}
            disabled={componentDisabled}
            {...getReadonlyTextControlProps({
              value,
              placeholder: t('placeholders.mineCountry'),
              disabled: componentDisabled,
            })}
          />,
          componentDisabled,
        )
      ),
    },
    {
      title: headerProfile.labels.mineStreet,
      dataIndex: 'mineStreet',
      key: 'mineStreet',
      width: 200,
      render: (value: string, record: MineRow) => (
        <Input
          value={value || undefined}
          onChange={getInputHandler(`${record.id}:mineStreet`)}
          disabled={componentDisabled}
          {...getReadonlyTextControlProps({
            value,
            placeholder: t('placeholders.mineStreet'),
            disabled: componentDisabled,
          })}
        />
      ),
    },
    {
      title: headerProfile.labels.mineCity,
      dataIndex: 'mineCity',
      key: 'mineCity',
      width: 160,
      render: (value: string, record: MineRow) => (
        <Input
          value={value || undefined}
          onChange={getInputHandler(`${record.id}:mineCity`)}
          disabled={componentDisabled}
          {...getReadonlyTextControlProps({
            value,
            placeholder: t('placeholders.mineCity'),
            disabled: componentDisabled,
          })}
        />
      ),
    },
    {
      title: headerProfile.labels.mineProvince,
      dataIndex: 'mineProvince',
      key: 'mineProvince',
      width: 170,
      render: (value: string, record: MineRow) => (
        <Input
          value={value || undefined}
          onChange={getInputHandler(`${record.id}:mineProvince`)}
          disabled={componentDisabled}
          {...getReadonlyTextControlProps({
            value,
            placeholder: t('placeholders.mineState'),
            disabled: componentDisabled,
          })}
        />
      ),
    },
    {
      title: headerProfile.labels.mineContactName,
      dataIndex: 'mineContactName',
      key: 'mineContactName',
      width: 180,
      render: (value: string, record: MineRow) => (
        <Input
          value={value || undefined}
          onChange={getInputHandler(`${record.id}:mineContactName`)}
          disabled={componentDisabled}
          {...getReadonlyTextControlProps({
            value,
            placeholder: t('placeholders.mineContactName'),
            disabled: componentDisabled,
          })}
        />
      ),
    },
    {
      title: headerProfile.labels.mineContactEmail,
      dataIndex: 'mineContactEmail',
      key: 'mineContactEmail',
      width: 200,
      render: (value: string, record: MineRow) => (
        <Input
          value={value || undefined}
          onChange={getInputHandler(`${record.id}:mineContactEmail`)}
          disabled={componentDisabled}
          {...getReadonlyTextControlProps({
            value,
            placeholder: t('placeholders.mineContactEmail'),
            disabled: componentDisabled,
          })}
        />
      ),
    },
    {
      title: headerProfile.labels.proposedNextSteps,
      dataIndex: 'proposedNextSteps',
      key: 'proposedNextSteps',
      width: 200,
      render: (value: string, record: MineRow) => (
        <Input
          value={value || undefined}
          onChange={getInputHandler(`${record.id}:proposedNextSteps`)}
          disabled={componentDisabled}
          {...getReadonlyTextControlProps({
            value,
            placeholder: t('placeholders.mineNextSteps'),
            disabled: componentDisabled,
          })}
        />
      ),
    },
    {
      title: headerProfile.labels.comments,
      dataIndex: 'comments',
      key: 'comments',
      width: 180,
      render: (value: string, record: MineRow) => (
        <Input
          value={value || undefined}
          onChange={getInputHandler(`${record.id}:comments`)}
          disabled={componentDisabled}
          {...getReadonlyTextControlProps({
            value,
            placeholder: t('placeholders.mineComments'),
            disabled: componentDisabled,
          })}
        />
      ),
    },
    ...(
      componentDisabled
        ? []
        : [
            {
              title: '',
              key: 'actions',
              width: 60,
              render: (_: unknown, record: MineRow) => (
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={getRemoveHandler(record.id)}
                />
              ),
            } satisfies ColumnsType<MineRow>[number],
          ]
    ),
  ], [
    componentDisabled,
    config.smelterNameMode,
    filterOptionByLabel,
    getInputHandler,
    getRemoveHandler,
    getSelectHandler,
    headerProfile,
    hasSelectedMineMetal,
    metalOptions,
    resolveColumnTitle,
    smelterOptions,
    t,
  ])

  if (!config.available) return null

  return (
    <Card
      title={
        <Flex align="center" justify="space-between" style={{ width: '100%' }}>
          <Flex align="center" gap={8}>
            <Typography.Title level={5} style={{ margin: 0 }}>
              {t('tabs.mineList')}
            </Typography.Title>
            <Tag color="blue">{t('badges.recordCount', { count: rows.length })}</Tag>
          </Flex>
          {!componentDisabled && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRow}>
              {t('actions.addRow')}
            </Button>
          )}
        </Flex>
      }
    >
      <Table
        columns={columns}
        dataSource={rows}
        rowKey="id"
        pagination={false}
        scroll={{ x: 'max-content' }}
        bordered
      />
    </Card>
  )
}
