/**
 * @file ui/tables/SmelterListTable.tsx
 * @description 模块实现。
 */

// 说明：模块实现
import { PlusOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons'
import type { SmelterLookupRecord } from '@core/data/lookups'
import type { MineralDef, SmelterListConfig } from '@core/registry/types'
import {
  isSmelterNotIdentified,
  isSmelterNotListed,
  normalizeSmelterLookup,
} from '@core/transform'
import type { SmelterRow } from '@core/types/tableRows'
import { useT } from '@ui/i18n/useT'
import { useCreation, useMemoizedFn } from 'ahooks'
import { AutoComplete, Button, Card, Flex, Modal, Table, Select, Input, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { TableRowSelection } from 'antd/es/table/interface'
import type { ChangeEvent, ReactNode } from 'react'
import { useState } from 'react'

interface SmelterListTableProps {
  config: SmelterListConfig
  availableMetals: Array<MineralDef & { label?: string }>
  rows: SmelterRow[]
  onChange: (rows: SmelterRow[]) => void
  countryOptions?: Array<{ value: string; label: string }>
  smelterLookupOptions?: Array<{ value: string; label: string; disabled?: boolean }>
  smelterLookupRecords?: Record<string, SmelterLookupRecord>
  smelterLookupMeta?: {
    notListed: string
    notYetIdentified: string
  }
  showNotYetIdentifiedCountryHint?: boolean
}

const INPUT_FIELDS = [
  'smelterId',
  'smelterName',
  'smelterIdentification',
  'sourceId',
  'smelterStreet',
  'smelterCity',
  'smelterState',
  'smelterContactName',
  'smelterContactEmail',
  'proposedNextSteps',
  'mineName',
  'comments',
  'combinedSmelter',
] as const

const SELECT_FIELDS = [
  'metal',
  'smelterLookup',
  'smelterCountry',
  'mineCountry',
  'recycledScrap',
  'combinedMetal',
] as const

type InputField = (typeof INPUT_FIELDS)[number]
type SelectField = (typeof SELECT_FIELDS)[number]

/** 冶炼厂清单表格：支持 lookup 自动填充与行内编辑。 */
export function SmelterListTable({
  config,
  availableMetals,
  rows,
  onChange,
  countryOptions = [],
  smelterLookupOptions = [],
  smelterLookupRecords,
  smelterLookupMeta,
  showNotYetIdentifiedCountryHint = false,
}: SmelterListTableProps) {
  const { t } = useT()
  /** 批量选择状态（受控）。 */
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
  const validSelectedRowKeys = useCreation(() => {
    const valid = new Set(rows.map((r) => r.id))
    return selectedRowKeys.filter((k) => valid.has(k))
  }, [rows, selectedRowKeys])

  /** 行索引缓存：避免频繁全表 map/filter。 */
  const rowIndexMap = useCreation(
    () => new Map(rows.map((row, index) => [row.id, index])),
    [rows]
  )

  /** 判断：lookup 选择为“未列出”。 */
  const isNotListed = (value: string) =>
    Boolean(smelterLookupMeta && isSmelterNotListed(value))
  /** 判断：lookup 选择为“尚未识别”。 */
  const isNotYetIdentified = (value: string) =>
    Boolean(smelterLookupMeta && isSmelterNotIdentified(value))
  /** 判断：lookup 值来自已识别记录。 */
  const isFromLookup = (value: string) =>
    Boolean(value && !isNotListed(value) && !isNotYetIdentified(value))
  /** “Smelter not listed” 是否要求名称+国家（默认 true）。 */
  const notListedRequiresNameCountry = config.notListedRequireNameCountry ?? true

  /** 计算 “Smelter not yet identified” 的默认国家值。 */
  const resolveNotYetIdentifiedCountry = (metalKey: string) => {
    const byMetal = config.notYetIdentifiedCountryByMetal?.[metalKey]
    if (typeof byMetal === 'string') return byMetal
    return config.notYetIdentifiedCountryDefault ?? 'Unknown'
  }

  /** 必填字段包裹：仅在 required 时添加样式容器。 */
  const wrapRequired = (required: boolean, node: ReactNode) => {
    if (!required) return node
    return <div className="field-required">{node}</div>
  }

  /** 添加空行（保持字段结构完整）。 */
  const handleAddRow = useMemoizedFn(() => {
    const newRow: SmelterRow = {
      id: `smelter-${Date.now()}`,
      metal: '',
      smelterLookup: '',
      smelterName: '',
      smelterCountry: '',
      combinedMetal: '',
      combinedSmelter: '',
      smelterId: '',
      smelterIdentification: '',
      sourceId: '',
      smelterStreet: '',
      smelterCity: '',
      smelterState: '',
      smelterContactName: '',
      smelterContactEmail: '',
      proposedNextSteps: '',
      mineName: '',
      mineCountry: '',
      recycledScrap: '',
      comments: '',
    }
    onChange([...rows, newRow])
  })

  /** 删除指定行（基于缓存索引定位）。 */
  const handleRemoveRow = useMemoizedFn((id: string) => {
    const index = rowIndexMap.get(id)
    if (index === undefined) return
    const next = rows.slice()
    next.splice(index, 1)
    onChange(next)
  })

  const handleRemoveRowWithSelection = useMemoizedFn((id: string) => {
    setSelectedRowKeys((prev) => prev.filter((k) => k !== id))
    handleRemoveRow(id)
  })

  /** lookup 变更时同步填充/清空相关字段。 */
  const applySmelterLookup = (row: SmelterRow, value: string) => {
    const normalizedValue = normalizeSmelterLookup(value)
    const next: SmelterRow = { ...row, smelterLookup: normalizedValue }
    if (!smelterLookupRecords || !smelterLookupMeta || !value) {
      return next
    }
    if (isSmelterNotListed(normalizedValue)) {
      return {
        ...next,
        smelterName: '',
        smelterCountry: '',
        smelterIdentification: '',
        sourceId: '',
        smelterStreet: '',
        smelterCity: '',
        smelterState: '',
      }
    }
    if (isSmelterNotIdentified(normalizedValue)) {
      const country = resolveNotYetIdentifiedCountry(row.metal)
      return {
        ...next,
        smelterName: 'Unknown',
        smelterCountry: country,
        smelterIdentification: 'Unknown',
        sourceId: '',
        smelterStreet: '',
        smelterCity: '',
        smelterState: '',
      }
    }
    const record = smelterLookupRecords[normalizedValue]
    if (!record) return next
    return {
      ...next,
      smelterName: normalizedValue,
      smelterIdentification: record.smelterId,
      sourceId: record.sourceId,
      smelterCountry: record.country,
      smelterStreet: record.street,
      smelterCity: record.city,
      smelterState: record.state,
    }
  }

  /** 更新单元格（lookup 字段需走联动逻辑）。 */
  const handleCellChange = useMemoizedFn((id: string, field: keyof SmelterRow, value: string) => {
    const index = rowIndexMap.get(id)
    if (index === undefined) return
    const row = rows[index]
    if (!row) return
    const nextRow = (() => {
      if (field === 'smelterLookup') {
        return applySmelterLookup(row, value)
      }
      if (field === 'metal' && isNotYetIdentified(row.smelterLookup)) {
        const country = resolveNotYetIdentifiedCountry(value)
        return {
          ...row,
          metal: value,
          smelterName: row.smelterName || 'Unknown',
          smelterCountry: country,
          smelterIdentification: row.smelterIdentification || 'Unknown',
        }
      }
      if (row[field] === value) return row
      return { ...row, [field]: value }
    })()
    if (nextRow === row) return
    const next = rows.slice()
    next[index] = nextRow
    onChange(next)
  })

  /** 缓存输入/下拉/删除回调，减少表格内联函数开销。 */
  const inputHandlers = useCreation(() => {
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

  const selectHandlers = useCreation(() => {
    const map = new Map<string, (value: string) => void>()
    rows.forEach((row) => {
      SELECT_FIELDS.forEach((field) => {
        map.set(`${row.id}:${field}`, (value) => handleCellChange(row.id, field, value))
      })
    })
    return map
  }, [rows, handleCellChange])

  const removeHandlers = useCreation(() => {
    const map = new Map<string, () => void>()
    rows.forEach((row) => {
      map.set(row.id, () => handleRemoveRowWithSelection(row.id))
    })
    return map
  }, [rows, handleRemoveRowWithSelection])

  const getInputHandler = useMemoizedFn((id: string, field: InputField) =>
    inputHandlers.get(`${id}:${field}`)
  )
  const getSelectHandler = useMemoizedFn((id: string, field: SelectField) =>
    selectHandlers.get(`${id}:${field}`)
  )
  /** 获取稳定的删除按钮 handler（返回函数，不在渲染期执行）。 */
  const getRemoveHandler = useMemoizedFn((id: string) => removeHandlers.get(id))

  /** 批量删除处理 */
  const handleBatchDelete = useMemoizedFn(() => {
    if (validSelectedRowKeys.length === 0) return
    Modal.confirm({
      title: t('confirm.batchDelete'),
      content: t('confirm.batchDeleteContent', { count: validSelectedRowKeys.length }),
      okText: t('actions.batchDelete'),
      okType: 'danger',
      cancelText: t('actions.cancelSelection'),
      onOk: () => {
        const selectedSet = new Set(validSelectedRowKeys)
        onChange(rows.filter((row) => !selectedSet.has(row.id)))
        setSelectedRowKeys([])
      },
    })
  })

  /** 取消选择 */
  const handleCancelSelection = useMemoizedFn(() => {
    setSelectedRowKeys([])
  })

  /** 行选择配置 */
  const rowSelection: TableRowSelection<SmelterRow> = {
    selectedRowKeys: validSelectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys as string[]),
  }

  const metalOptions = useCreation(
    () =>
      availableMetals.map((m) => ({
        value: m.key,
        label: m.label ?? t(m.labelKey),
      })),
    [availableMetals, t]
  )
  const yesNoUnknownOptions = useCreation(
    () => [
      { value: 'Yes', label: t('options.yes') },
      { value: 'No', label: t('options.no') },
      { value: 'Unknown', label: t('options.unknown') },
    ],
    [t]
  )
  const yesNoOptions = useCreation(
    () => [
      { value: 'Yes', label: t('options.yes') },
      { value: 'No', label: t('options.no') },
    ],
    [t]
  )
  const recycledScrapOptions = config.recycledScrapOptions === 'yes-no'
    ? yesNoOptions
    : yesNoUnknownOptions
  /** 统一的下拉搜索过滤逻辑，避免多处重复定义。 */
  const filterOptionByLabel = useMemoizedFn((input: string, option?: { label?: string }) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
  )

  const columns = useCreation<ColumnsType<SmelterRow>>(() => {
    const columns: ColumnsType<SmelterRow> = []

    // Smelter ID input column (if configured)
    if (config.hasIdColumn) {
      columns.push({
        title: t('tables.smelterId'),
        dataIndex: 'smelterId',
        key: 'smelterId',
        width: 180,
        render: (value: string, record: SmelterRow) => (
          <Input
            value={value || undefined}
            onChange={getInputHandler(record.id, 'smelterId')}
            placeholder={t('placeholders.smelterIdInput')}
            className="font-mono text-xs"
          />
        ),
      })
    }

    columns.push({
      title: t('tables.metal'),
      dataIndex: 'metal',
      key: 'metal',
      width: 140,
      fixed: 'left',
      render: (value: string, record: SmelterRow) =>
        wrapRequired(
          true,
          <Select
            value={value || undefined}
            onChange={getSelectHandler(record.id, 'metal')}
            options={metalOptions}
            placeholder={t('placeholders.select')}
            className="w-full"
          />
        ),
    })

    if (config.hasLookup) {
      columns.push({
        title: t('tables.smelterLookup'),
        dataIndex: 'smelterLookup',
        key: 'smelterLookup',
        width: 220,
        render: (value: string, record: SmelterRow) =>
          wrapRequired(
            Boolean(record.metal),
            <Select
              value={value || undefined}
              onChange={getSelectHandler(record.id, 'smelterLookup')}
              options={smelterLookupOptions}
              placeholder={t('placeholders.smelterLookup')}
              showSearch
              filterOption={filterOptionByLabel}
              className="w-full"
            />
          ),
      })
    }

    columns.push(
      {
        title: t('tables.smelterName'),
        dataIndex: 'smelterName',
        key: 'smelterName',
        width: 200,
        render: (value: string, record: SmelterRow) => {
          const notListed = isNotListed(record.smelterLookup) && notListedRequiresNameCountry
          const notYetIdentified = isNotYetIdentified(record.smelterLookup)
          const fromLookup = isFromLookup(record.smelterLookup)
          const placeholder = notListed
            ? t('placeholders.smelterNameRequired')
            : notYetIdentified
              ? t('placeholders.smelterNameOptional')
              : t('placeholders.smelterName')
          return wrapRequired(
            notListed,
            <Input
              value={value || undefined}
              onChange={getInputHandler(record.id, 'smelterName')}
              placeholder={placeholder}
              disabled={fromLookup}
            />
          )
        },
      },
      {
        title: t('tables.country'),
        dataIndex: 'smelterCountry',
        key: 'smelterCountry',
        width: 180,
        render: (value: string, record: SmelterRow) => {
          const notListed = isNotListed(record.smelterLookup) && notListedRequiresNameCountry
          const notYetIdentified = isNotYetIdentified(record.smelterLookup)
          const fromLookup = isFromLookup(record.smelterLookup)
          const placeholder = notListed
            ? t('placeholders.smelterCountryRequired')
            : t('placeholders.smelterCountry')
          const showHint = notYetIdentified && showNotYetIdentifiedCountryHint
          return wrapRequired(
            notListed,
            <Flex vertical gap={4}>
              <Select
                value={value || undefined}
                onChange={getSelectHandler(record.id, 'smelterCountry')}
                options={countryOptions}
                placeholder={placeholder}
                showSearch
                filterOption={filterOptionByLabel}
                className="w-full"
                disabled={fromLookup}
              />
              {showHint && (
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {t('hints.smelterNotYetIdentifiedCountry')}
                </Typography.Text>
              )}
            </Flex>
          )
        },
      },
      {
        title: t('tables.smelterIdentification'),
        dataIndex: 'smelterIdentification',
        key: 'smelterIdentification',
        width: 180,
        render: (value: string, record: SmelterRow) => (
          <Input
            value={value || undefined}
            onChange={getInputHandler(record.id, 'smelterIdentification')}
            placeholder={t('placeholders.smelterIdentification')}
            disabled
          />
        ),
      },
      {
        title: t('tables.sourceId'),
        dataIndex: 'sourceId',
        key: 'sourceId',
        width: 180,
        render: (value: string, record: SmelterRow) => (
          <Input
            value={value || undefined}
            onChange={getInputHandler(record.id, 'sourceId')}
            placeholder={t('placeholders.smelterSourceId')}
            disabled
          />
        ),
      },
      {
        title: t('tables.street'),
        dataIndex: 'smelterStreet',
        key: 'smelterStreet',
        width: 200,
        render: (value: string, record: SmelterRow) => (
          <Input
            value={value || undefined}
            onChange={getInputHandler(record.id, 'smelterStreet')}
            placeholder={t('placeholders.smelterStreet')}
            disabled
          />
        ),
      },
      {
        title: t('tables.city'),
        dataIndex: 'smelterCity',
        key: 'smelterCity',
        width: 160,
        render: (value: string, record: SmelterRow) => (
          <Input
            value={value || undefined}
            onChange={getInputHandler(record.id, 'smelterCity')}
            placeholder={t('placeholders.smelterCity')}
            disabled
          />
        ),
      },
      {
        title: t('tables.stateProvince'),
        dataIndex: 'smelterState',
        key: 'smelterState',
        width: 170,
        render: (value: string, record: SmelterRow) => (
          <Input
            value={value || undefined}
            onChange={getInputHandler(record.id, 'smelterState')}
            placeholder={t('placeholders.smelterState')}
            disabled
          />
        ),
      },
      {
        title: t('tables.contactName'),
        dataIndex: 'smelterContactName',
        key: 'smelterContactName',
        width: 180,
        render: (value: string, record: SmelterRow) => (
          <Input
            value={value || undefined}
            onChange={getInputHandler(record.id, 'smelterContactName')}
            placeholder={t('placeholders.smelterContactName')}
          />
        ),
      },
      {
        title: t('tables.contactEmail'),
        dataIndex: 'smelterContactEmail',
        key: 'smelterContactEmail',
        width: 200,
        render: (value: string, record: SmelterRow) => (
          <Input
            value={value || undefined}
            onChange={getInputHandler(record.id, 'smelterContactEmail')}
            placeholder={t('placeholders.smelterContactEmail')}
          />
        ),
      },
      {
        title: t('tables.proposedNextSteps'),
        dataIndex: 'proposedNextSteps',
        key: 'proposedNextSteps',
        width: 200,
        render: (value: string, record: SmelterRow) => (
          <Input
            value={value || undefined}
            onChange={getInputHandler(record.id, 'proposedNextSteps')}
            placeholder={t('placeholders.smelterNextSteps')}
          />
        ),
      },
      {
        title: t('tables.mineName'),
        dataIndex: 'mineName',
        key: 'mineName',
        width: 180,
        render: (value: string, record: SmelterRow) => (
          <Input
            value={value || undefined}
            onChange={getInputHandler(record.id, 'mineName')}
            placeholder={t('placeholders.smelterMineName')}
          />
        ),
      },
      {
        title: t('tables.mineCountry'),
        dataIndex: 'mineCountry',
        key: 'mineCountry',
        width: 240,
        render: (value: string, record: SmelterRow) => (
          <AutoComplete
            value={value || undefined}
            onChange={getSelectHandler(record.id, 'mineCountry')}
            placeholder={t('placeholders.smelterMineCountry')}
            options={countryOptions}
            allowClear
            className="w-full"
          />
        ),
      },
      {
        title: t('tables.recycledScrap'),
        dataIndex: 'recycledScrap',
        key: 'recycledScrap',
        width: 260,
        render: (value: string, record: SmelterRow) => (
          <Select
            value={value || undefined}
            onChange={getSelectHandler(record.id, 'recycledScrap')}
            options={recycledScrapOptions}
            placeholder={t('placeholders.select')}
            className="w-full"
          />
        ),
      },
      {
        title: t('tables.comments'),
        dataIndex: 'comments',
        key: 'comments',
        width: 200,
        render: (value: string, record: SmelterRow) => (
          <Input
            value={value || undefined}
            onChange={getInputHandler(record.id, 'comments')}
            placeholder={t('placeholders.smelterComments')}
          />
        ),
      }
    )

    if (config.hasCombinedColumn) {
      columns.push(
        {
          title: t('tables.combinedMetal'),
          dataIndex: 'combinedMetal',
          key: 'combinedMetal',
          width: 180,
          render: (value: string, record: SmelterRow) => (
            <Select
              value={value || undefined}
              onChange={getSelectHandler(record.id, 'combinedMetal')}
              options={metalOptions}
              placeholder={t('placeholders.smelterCombinedMetal')}
              className="w-full"
            />
          ),
        },
        {
          title: t('tables.combinedSmelter'),
          dataIndex: 'combinedSmelter',
          key: 'combinedSmelter',
          width: 220,
          render: (value: string, record: SmelterRow) => (
            <Input
              value={value || undefined}
              onChange={getInputHandler(record.id, 'combinedSmelter')}
              placeholder={t('placeholders.smelterCombinedSmelter')}
            />
          ),
        }
      )
    }

    // Actions column
    columns.push({
      title: '',
      key: 'actions',
      width: 60,
      fixed: 'right',
      render: (_: unknown, record: SmelterRow) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={getRemoveHandler(record.id)}
        />
      ),
    })

    return columns
  }, [
    config,
    countryOptions,
    handleCellChange,
    handleRemoveRow,
    metalOptions,
    smelterLookupMeta,
    smelterLookupOptions,
    t,
    yesNoUnknownOptions,
    yesNoOptions,
    recycledScrapOptions,
  ])

  const emptyLocale = {
    emptyText: (
      <Flex vertical align="center" gap={16} style={{ padding: '32px 0' }}>
        <Typography.Text type="secondary" style={{ fontSize: 14 }}>
          {t('tables.noData')}
        </Typography.Text>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRow}>
          {t('actions.addRow')}
        </Button>
      </Flex>
    ),
  }

  return (
    <Card
      title={
        <Flex vertical gap={8} style={{ width: '100%' }}>
          <Flex align="center" justify="space-between">
            <Flex align="center" gap={8}>
              <Typography.Title level={5} style={{ margin: 0 }}>
                {t('tabs.smelterList')}
              </Typography.Title>
              <Tag color="blue">{t('badges.recordCount', { count: rows.length })}</Tag>
            </Flex>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRow}>
              {t('actions.addRow')}
            </Button>
          </Flex>
          {validSelectedRowKeys.length > 0 && (
            <Flex
              align="center"
              gap={12}
              style={{
                padding: '8px 12px',
                background: 'var(--ant-color-primary-bg)',
                borderRadius: 6,
              }}
            >
              <Typography.Text strong>
                {t('selection.selected', { count: validSelectedRowKeys.length })}
              </Typography.Text>
              <Button
                type="primary"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={handleBatchDelete}
              >
                {t('actions.batchDelete')}
              </Button>
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                onClick={handleCancelSelection}
              >
                {t('actions.cancelSelection')}
              </Button>
            </Flex>
          )}
        </Flex>
      }
    >
      <Table
        className="smelter-list-table"
        columns={columns}
        dataSource={rows}
        rowKey="id"
        rowSelection={rowSelection}
        pagination={false}
        scroll={{ x: 'max-content', y: rows.length > 20 ? 600 : undefined }}
        virtual={rows.length > 50}
        bordered
        locale={emptyLocale}
      />
    </Card>
  )
}
