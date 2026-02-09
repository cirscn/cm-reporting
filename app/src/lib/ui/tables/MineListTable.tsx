/**
 * @file ui/tables/MineListTable.tsx
 * @description 模块实现。
 */

// 说明：模块实现
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import type { MineralDef, MineListConfig } from '@core/registry/types'
import type { MineRow } from '@core/types/tableRows'
import { wrapRequired } from '@ui/helpers/fieldRequired'
import { useHandlerMap } from '@ui/hooks/useHandlerMap'
import { useT } from '@ui/i18n/useT'
import { useCreation, useMemoizedFn } from 'ahooks'
import { AutoComplete, Button, Card, ConfigProvider, Flex, Table, Select, Input, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { ChangeEvent } from 'react'

interface MineListTableProps {
  config: MineListConfig
  availableMetals: Array<MineralDef & { label?: string }>
  rows: MineRow[]
  onChange: (rows: MineRow[]) => void
  countryOptions?: Array<{ value: string; label: string }>
  smelterOptions?: Array<{ value: string; label: string }>
  smelterOptionsByMetal?: Record<string, Array<{ value: string; label: string }>>
}

const INPUT_FIELDS = [
  'smelterName',
  'mineName',
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

const SELECT_FIELDS = ['metal', 'smelterName', 'mineCountry'] as const

/** 矿山清单表格：支持增删行与行内编辑。 */
export function MineListTable({
  config,
  availableMetals,
  rows,
  onChange,
  countryOptions = [],
  smelterOptions = [],
  smelterOptionsByMetal = {},
}: MineListTableProps) {
  const { t } = useT()
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

  const columns = useCreation<ColumnsType<MineRow>>(() => [
    {
      title: t('tables.metal'),
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
            placeholder={t('placeholders.select')}
            className="w-full"
          />,
          componentDisabled,
        )
      ),
    },
    {
      title: t('tables.mineSmelterName'),
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
                placeholder={t('placeholders.mineSmelterSelect')}
                showSearch
                filterOption={filterOptionByLabel}
                className="w-full"
              />,
              componentDisabled,
            )
          : wrapRequired(
              required,
              <AutoComplete
                value={value || undefined}
                onChange={getSelectHandler(`${record.id}:smelterName`)}
                placeholder={t('placeholders.mineSmelterInput')}
                options={filteredOptions}
                allowClear
                filterOption={filterOptionByLabel}
                className="w-full"
              />,
              componentDisabled,
            )
      },
    },
    {
      title: t('tables.mineName'),
      dataIndex: 'mineName',
      key: 'mineName',
      width: 180,
      render: (value: string, record: MineRow) => (
        wrapRequired(
          Boolean(record.metal),
          <Input
            value={value || undefined}
            onChange={getInputHandler(`${record.id}:mineName`)}
            placeholder={t('placeholders.mineName')}
          />,
          componentDisabled,
        )
      ),
    },
    {
      title: t('tables.mineId'),
      dataIndex: 'mineId',
      key: 'mineId',
      width: 160,
      render: (value: string, record: MineRow) => (
        <Input
          value={value || undefined}
          onChange={getInputHandler(`${record.id}:mineId`)}
          placeholder={t('placeholders.mineId')}
        />
      ),
    },
    {
      title: t('tables.mineSourceId'),
      dataIndex: 'mineIdSource',
      key: 'mineIdSource',
      width: 180,
      render: (value: string, record: MineRow) => (
        <Input
          value={value || undefined}
          onChange={getInputHandler(`${record.id}:mineIdSource`)}
          placeholder={t('placeholders.mineSourceId')}
        />
      ),
    },
    {
      title: t('tables.country'),
      dataIndex: 'mineCountry',
      key: 'mineCountry',
      width: 160,
      render: (value: string, record: MineRow) => (
        wrapRequired(
          Boolean(record.metal),
          <Select
            value={value || undefined}
            onChange={getSelectHandler(`${record.id}:mineCountry`)}
            options={countryOptions}
            placeholder={t('placeholders.mineCountry')}
            showSearch
            filterOption={filterOptionByLabel}
            className="w-full"
          />,
          componentDisabled,
        )
      ),
    },
    {
      title: t('tables.street'),
      dataIndex: 'mineStreet',
      key: 'mineStreet',
      width: 200,
      render: (value: string, record: MineRow) => (
        <Input
          value={value || undefined}
          onChange={getInputHandler(`${record.id}:mineStreet`)}
          placeholder={t('placeholders.mineStreet')}
        />
      ),
    },
    {
      title: t('tables.city'),
      dataIndex: 'mineCity',
      key: 'mineCity',
      width: 160,
      render: (value: string, record: MineRow) => (
        <Input
          value={value || undefined}
          onChange={getInputHandler(`${record.id}:mineCity`)}
          placeholder={t('placeholders.mineCity')}
        />
      ),
    },
    {
      title: t('tables.stateProvince'),
      dataIndex: 'mineProvince',
      key: 'mineProvince',
      width: 170,
      render: (value: string, record: MineRow) => (
        <Input
          value={value || undefined}
          onChange={getInputHandler(`${record.id}:mineProvince`)}
          placeholder={t('placeholders.mineState')}
        />
      ),
    },
    {
      title: t('tables.contactName'),
      dataIndex: 'mineContactName',
      key: 'mineContactName',
      width: 180,
      render: (value: string, record: MineRow) => (
        <Input
          value={value || undefined}
          onChange={getInputHandler(`${record.id}:mineContactName`)}
          placeholder={t('placeholders.mineContactName')}
        />
      ),
    },
    {
      title: t('tables.contactEmail'),
      dataIndex: 'mineContactEmail',
      key: 'mineContactEmail',
      width: 200,
      render: (value: string, record: MineRow) => (
        <Input
          value={value || undefined}
          onChange={getInputHandler(`${record.id}:mineContactEmail`)}
          placeholder={t('placeholders.mineContactEmail')}
        />
      ),
    },
    {
      title: t('tables.proposedNextSteps'),
      dataIndex: 'proposedNextSteps',
      key: 'proposedNextSteps',
      width: 200,
      render: (value: string, record: MineRow) => (
        <Input
          value={value || undefined}
          onChange={getInputHandler(`${record.id}:proposedNextSteps`)}
          placeholder={t('placeholders.mineNextSteps')}
        />
      ),
    },
    {
      title: t('tables.comments'),
      dataIndex: 'comments',
      key: 'comments',
      width: 180,
      render: (value: string, record: MineRow) => (
        <Input
          value={value || undefined}
          onChange={getInputHandler(`${record.id}:comments`)}
          placeholder={t('placeholders.mineComments')}
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
    countryOptions,
    filterOptionByLabel,
    getInputHandler,
    getRemoveHandler,
    getSelectHandler,
    metalOptions,
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
