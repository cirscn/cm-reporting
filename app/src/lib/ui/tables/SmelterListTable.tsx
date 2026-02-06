/**
 * @file ui/tables/SmelterListTable.tsx
 * @description 冶炼厂清单表格：支持 lookup 自动填充、行内编辑、外部选择与批量操作。
 */

import { PlusOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons'
import type { SmelterLookupRecord } from '@core/data/lookups'
import type {
  MineralDef,
  SmelterListConfig,
  TemplateType,
  TemplateVersionDef,
} from '@core/registry/types'
import { isSmelterNotIdentified, isSmelterNotListed, normalizeSmelterLookup } from '@core/transform'
import type { SmelterRow } from '@core/types/tableRows'
import type {
  ExternalAddMode,
  SmelterListIntegration,
  SmelterPickContext,
  SmelterRowPickContext,
  SmelterLookupMode,
} from '@lib/public/integrations'
import { useHandlerMap } from '@ui/hooks/useHandlerMap'
import { useT } from '@ui/i18n/useT'
import { useBoolean, useCreation, useLatest, useMemoizedFn } from 'ahooks'
import {
  AutoComplete,
  Button,
  Card,
  Flex,
  Modal,
  Table,
  Select,
  Input,
  Tag,
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { TableRowSelection } from 'antd/es/table/interface'
import type { ChangeEvent, ReactNode } from 'react'
import { memo, useState } from 'react'

interface SmelterListTableProps {
  templateType: TemplateType
  versionId: string
  versionDef: TemplateVersionDef
  config: SmelterListConfig
  availableMetals: Array<MineralDef & { label?: string }>
  rows: SmelterRow[]
  onChange: (rows: SmelterRow[]) => void
  countryOptions?: Array<{ value: string; label: string }>
  smelterLookupRecords?: Record<string, SmelterLookupRecord>
  smelterLookupMeta?: {
    notListed: string
    notYetIdentified: string
  }
  showNotYetIdentifiedCountryHint?: boolean
  integration?: SmelterListIntegration
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

/** 冶炼厂清单表格：支持 lookup 自动填充、行内编辑与外部选择。 */
export const SmelterListTable = memo(function SmelterListTable({
  templateType,
  versionId,
  versionDef,
  config,
  availableMetals,
  rows,
  onChange,
  countryOptions = [],
  smelterLookupRecords,
  smelterLookupMeta,
  showNotYetIdentifiedCountryHint = false,
  integration,
}: SmelterListTableProps) {
  const { t, locale } = useT()
  /** 批量选择状态（受控）。 */
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
  const [externalPicking, { setTrue: startPicking, setFalse: stopPicking }] = useBoolean(false)
  const rowsRef = useLatest(rows)
  const [rowPickingId, setRowPickingId] = useState<string | null>(null)
  const validSelectedRowKeys = useCreation(() => {
    const valid = new Set(rows.map((r) => r.id))
    return selectedRowKeys.filter((k) => valid.has(k))
  }, [rows, selectedRowKeys])

  /** 行索引缓存：避免频繁全表 map/filter。 */
  const rowIndexMap = useCreation(() => new Map(rows.map((row, index) => [row.id, index])), [rows])

  /** 判断：lookup 选择为“未列出”。 */
  const isNotListed = (value: string) => Boolean(smelterLookupMeta && isSmelterNotListed(value))
  /** 判断：lookup 选择为“尚未识别”。 */
  const isNotYetIdentified = (value: string) =>
    Boolean(smelterLookupMeta && isSmelterNotIdentified(value))
  /** 判断：lookup 值来自已识别记录。 */
  const isFromLookup = (value: string) => {
    if (!value) return false
    if (isNotListed(value) || isNotYetIdentified(value)) return false
    const normalized = normalizeSmelterLookup(value)
    return Boolean(smelterLookupRecords?.[normalized])
  }
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

  const integrationAddMode: ExternalAddMode = integration?.addMode ?? 'append-empty-row'
  const showExternalPick =
    Boolean(integration?.onPickSmelters) && integrationAddMode !== 'append-empty-row'
  const showAddRow = integrationAddMode !== 'external-only'
  const externalPickLabel = integration?.label ?? t('actions.pickExternal')
  const showLoadingIndicator = integration?.showLoadingIndicator ?? false
  const smelterLookupMode: SmelterLookupMode = integration?.lookupMode ?? 'internal'
  const useExternalLookup = smelterLookupMode === 'external' || smelterLookupMode === 'hybrid'

  const getCurrentRowsSnapshot = useMemoizedFn(() => rowsRef.current.map((r) => ({ ...r })))

  const normalizeExternalSmelterRow = useMemoizedFn(
    (partial: Partial<SmelterRow>, seq: number): SmelterRow => {
      const idBase = `smelter-${Date.now()}-${seq}`
      return {
        ...(partial as Record<string, string | undefined>),
        id: typeof partial.id === 'string' && partial.id.trim() ? partial.id : idBase,
        metal: partial.metal ?? '',
        smelterLookup: partial.smelterLookup ?? '',
        smelterName: partial.smelterName ?? '',
        smelterCountry: partial.smelterCountry ?? '',
        combinedMetal: partial.combinedMetal ?? '',
        combinedSmelter: partial.combinedSmelter ?? '',
        smelterId: partial.smelterId ?? '',
        smelterIdentification: partial.smelterIdentification ?? '',
        sourceId: partial.sourceId ?? '',
        smelterStreet: partial.smelterStreet ?? '',
        smelterCity: partial.smelterCity ?? '',
        smelterState: partial.smelterState ?? '',
        smelterContactName: partial.smelterContactName ?? '',
        smelterContactEmail: partial.smelterContactEmail ?? '',
        proposedNextSteps: partial.proposedNextSteps ?? '',
        mineName: partial.mineName ?? '',
        mineCountry: partial.mineCountry ?? '',
        recycledScrap: partial.recycledScrap ?? '',
        comments: partial.comments ?? '',
      }
    },
  )

  const handleExternalPick = useMemoizedFn(async () => {
    if (!integration || !integration.onPickSmelters || externalPicking) return
    const currentRows = getCurrentRowsSnapshot()
    const ctx: SmelterPickContext = {
      templateType,
      versionId,
      locale,
      versionDef,
      config,
      currentRows,
    }
    startPicking()
    try {
      const result = await integration.onPickSmelters(ctx)
      const items = result?.items ?? []
      if (items.length === 0) return
      const normalized = items.map((item, index) => normalizeExternalSmelterRow(item, index))
      onChange([...rowsRef.current, ...normalized])
    } catch {
      Modal.error({
        title: t('errors.externalPickFailedTitle'),
        content: t('errors.externalPickFailedContent'),
      })
    } finally {
      stopPicking()
    }
  })

  const applyExternalPickToRow = useMemoizedFn(
    (row: SmelterRow, partial: Partial<SmelterRow>): SmelterRow => {
      const merged: SmelterRow = {
        ...row,
        ...(partial as Record<string, string | undefined>),
        id: row.id,
        metal: row.metal,
      }
      if (!merged.smelterLookup) return merged
      if (!smelterLookupMeta) return merged
      const mergedWithName: SmelterRow =
        !merged.smelterName &&
        !isNotListed(merged.smelterLookup) &&
        !isNotYetIdentified(merged.smelterLookup)
          ? { ...merged, smelterName: merged.smelterLookup }
          : merged
      if (isFromLookup(mergedWithName.smelterLookup)) {
        return applySmelterLookup(mergedWithName, mergedWithName.smelterLookup)
      }
      return mergedWithName
    },
  )

  const updateRowById = useMemoizedFn((id: string, nextRow: SmelterRow) => {
    const currentRows = rowsRef.current
    const index = currentRows.findIndex((r) => r.id === id)
    if (index < 0) return
    const next = currentRows.slice()
    next[index] = nextRow
    onChange(next)
  })

  const handleExternalPickForRow = useMemoizedFn(async (id: string) => {
    if (!integration?.onPickSmelterForRow || rowPickingId) return
    const currentRows = rowsRef.current
    const row = currentRows.find((r) => r.id === id)
    if (!row || !row.metal) return
    const ctx: SmelterRowPickContext = {
      templateType,
      versionId,
      locale,
      versionDef,
      config,
      currentRows: getCurrentRowsSnapshot(),
      rowId: id,
      row: { ...row },
      metal: row.metal,
    }
    setRowPickingId(id)
    try {
      const result = await integration.onPickSmelterForRow(ctx)
      const picked = result?.items?.[0]
      if (!picked) return
      updateRowById(id, applyExternalPickToRow(row, picked))
    } catch {
      Modal.error({
        title: t('errors.externalPickFailedTitle'),
        content: t('errors.externalPickFailedContent'),
      })
    } finally {
      setRowPickingId(null)
    }
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
    if (!smelterLookupMeta || !value) return next
    if (isSmelterNotListed(normalizedValue)) {
      return {
        ...next,
        smelterId: '',
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
        smelterId: 'Unknown',
        smelterIdentification: 'Unknown',
        sourceId: '',
        smelterStreet: '',
        smelterCity: '',
        smelterState: '',
      }
    }

    // internal：不再使用内置 smelter lookup 选项；允许 free text 并同步到 Smelter Name。
    if (!useExternalLookup) {
      return {
        ...next,
        smelterName: normalizedValue,
      }
    }

    const record = smelterLookupRecords?.[normalizedValue]
    if (!record) return next
    return {
      ...next,
      smelterName: normalizedValue,
      smelterId: record.smelterId,
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

  /** 缓存输入回调，减少表格内联函数开销。 */
  const getInputHandler = useHandlerMap(() => {
    const map = new Map<string, (event: ChangeEvent<HTMLInputElement>) => void>()
    rows.forEach((row) => {
      INPUT_FIELDS.forEach((field) => {
        map.set(`${row.id}:${field}`, (event) =>
          handleCellChange(row.id, field, event.target.value),
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
      map.set(row.id, () => handleRemoveRowWithSelection(row.id))
    })
    return map
  }, [rows, handleRemoveRowWithSelection])

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
    [availableMetals, t],
  )
  const yesNoUnknownOptions = useCreation(
    () => [
      { value: 'Yes', label: t('options.yes') },
      { value: 'No', label: t('options.no') },
      { value: 'Unknown', label: t('options.unknown') },
    ],
    [t],
  )
  const yesNoOptions = useCreation(
    () => [
      { value: 'Yes', label: t('options.yes') },
      { value: 'No', label: t('options.no') },
    ],
    [t],
  )
  const recycledScrapOptions =
    config.recycledScrapOptions === 'yes-no' ? yesNoOptions : yesNoUnknownOptions
  /** 统一的下拉搜索过滤逻辑，避免多处重复定义。 */
  const filterOptionByLabel = useMemoizedFn((input: string, option?: { label?: string }) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
  )

  const columns = useCreation<ColumnsType<SmelterRow>>(() => {
    const columns: ColumnsType<SmelterRow> = []

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
            onChange={getSelectHandler(`${record.id}:metal`)}
            options={metalOptions}
            placeholder={t('placeholders.select')}
            className="w-full"
          />,
        ),
    })

    if (config.hasLookup) {
      columns.push({
        title: t('tables.smelterName'),
        dataIndex: 'smelterLookup',
        key: 'smelterLookup',
        width: 220,
        fixed: 'left',
        render: (value: string, record: SmelterRow) =>
          wrapRequired(
            Boolean(record.metal),
            useExternalLookup && integration?.onPickSmelterForRow ? (
              <Flex align="center" gap={8}>
                {isNotListed(record.smelterLookup) && notListedRequiresNameCountry ? (
                  <Input
                    value={record.smelterName || undefined}
                    onChange={getInputHandler(`${record.id}:smelterName`)}
                    placeholder={t('placeholders.smelterNameRequired')}
                  />
                ) : record.smelterLookup ? (
                  <>
                    <Typography.Text ellipsis style={{ maxWidth: 150 }}>
                      {record.smelterLookup}
                    </Typography.Text>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => handleExternalPickForRow(record.id)}
                      disabled={!record.metal || rowPickingId === record.id}
                      loading={showLoadingIndicator && rowPickingId === record.id}
                    >
                      {t('actions.edit')}
                    </Button>
                  </>
                ) : (
                  <Button
                    type="link"
                    size="small"
                    onClick={() => handleExternalPickForRow(record.id)}
                    disabled={!record.metal || rowPickingId === record.id}
                    loading={showLoadingIndicator && rowPickingId === record.id}
                  >
                    {t('actions.chooseSmelter')}
                  </Button>
                )}
                {smelterLookupMode === 'hybrid' && (
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {t('actions.pickExternal')}
                  </Typography.Text>
                )}
              </Flex>
            ) : (
              <Flex vertical gap={4}>
                <AutoComplete
                  value={value || undefined}
                  onChange={getSelectHandler(`${record.id}:smelterLookup`)}
                  options={
                    smelterLookupMeta
                      ? [
                          {
                            value: smelterLookupMeta.notListed,
                            label: smelterLookupMeta.notListed,
                          },
                          {
                            value: smelterLookupMeta.notYetIdentified,
                            label: smelterLookupMeta.notYetIdentified,
                          },
                        ]
                      : []
                  }
                  placeholder={t('placeholders.smelterName')}
                  allowClear
                  className="w-full"
                />
                {isNotListed(record.smelterLookup) && notListedRequiresNameCountry && (
                  <Input
                    value={record.smelterName || undefined}
                    onChange={getInputHandler(`${record.id}:smelterName`)}
                    placeholder={t('placeholders.smelterNameRequired')}
                  />
                )}
              </Flex>
            ),
          ),
      })
    }

    // Smelter ID input column (if configured) - keep after metal + lookup/name
    if (config.hasIdColumn) {
      columns.push({
        title: t('tables.smelterId'),
        dataIndex: 'smelterId',
        key: 'smelterId',
        width: 180,
        fixed: 'left',
        render: (value: string, record: SmelterRow) => (
          <Input
            value={value || undefined}
            onChange={getInputHandler(`${record.id}:smelterId`)}
            placeholder={t('placeholders.smelterIdInput')}
            className="font-mono text-xs"
            disabled={useExternalLookup && isFromLookup(record.smelterLookup)}
          />
        ),
      })
    }

    const hideSmelterNameColumn = Boolean(config.hasLookup)

    if (!hideSmelterNameColumn) {
      columns.push({
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
              onChange={getInputHandler(`${record.id}:smelterName`)}
              placeholder={placeholder}
              disabled={useExternalLookup && fromLookup}
            />,
          )
        },
      })
    }

    columns.push(
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
                onChange={getSelectHandler(`${record.id}:smelterCountry`)}
                options={countryOptions}
                placeholder={placeholder}
                showSearch
                filterOption={filterOptionByLabel}
                className="w-full"
                disabled={useExternalLookup && fromLookup}
              />
              {showHint && (
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {t('hints.smelterNotYetIdentifiedCountry')}
                </Typography.Text>
              )}
            </Flex>,
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
            onChange={getInputHandler(`${record.id}:smelterIdentification`)}
            placeholder={t('placeholders.smelterIdentification')}
            disabled={useExternalLookup && isFromLookup(record.smelterLookup)}
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
            onChange={getInputHandler(`${record.id}:sourceId`)}
            placeholder={t('placeholders.smelterSourceId')}
            disabled={useExternalLookup && isFromLookup(record.smelterLookup)}
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
            onChange={getInputHandler(`${record.id}:smelterStreet`)}
            placeholder={t('placeholders.smelterStreet')}
            disabled={useExternalLookup && isFromLookup(record.smelterLookup)}
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
            onChange={getInputHandler(`${record.id}:smelterCity`)}
            placeholder={t('placeholders.smelterCity')}
            disabled={useExternalLookup && isFromLookup(record.smelterLookup)}
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
            onChange={getInputHandler(`${record.id}:smelterState`)}
            placeholder={t('placeholders.smelterState')}
            disabled={useExternalLookup && isFromLookup(record.smelterLookup)}
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
            onChange={getInputHandler(`${record.id}:smelterContactName`)}
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
            onChange={getInputHandler(`${record.id}:smelterContactEmail`)}
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
            onChange={getInputHandler(`${record.id}:proposedNextSteps`)}
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
            onChange={getInputHandler(`${record.id}:mineName`)}
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
            onChange={getSelectHandler(`${record.id}:mineCountry`)}
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
            onChange={getSelectHandler(`${record.id}:recycledScrap`)}
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
            onChange={getInputHandler(`${record.id}:comments`)}
            placeholder={t('placeholders.smelterComments')}
          />
        ),
      },
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
              onChange={getSelectHandler(`${record.id}:combinedMetal`)}
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
              onChange={getInputHandler(`${record.id}:combinedSmelter`)}
              placeholder={t('placeholders.smelterCombinedSmelter')}
            />
          ),
        },
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
    handleExternalPickForRow,
    handleRemoveRow,
    integration,
    metalOptions,
    notListedRequiresNameCountry,
    rowPickingId,
    showLoadingIndicator,
    smelterLookupMeta,
    smelterLookupMode,
    t,
    useExternalLookup,
    yesNoUnknownOptions,
    yesNoOptions,
    recycledScrapOptions,
  ])

  const emptyLocale = {
    emptyText: (
      <Flex vertical align="center" gap={16} className="py-8">
        <Typography.Text type="secondary" className="text-sm">
          {t('tables.noData')}
        </Typography.Text>
        <Flex align="center" gap={8}>
          {showAddRow && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRow}>
              {t('actions.addRow')}
            </Button>
          )}
          {showExternalPick && (
            <Button
              type={showAddRow ? 'default' : 'primary'}
              icon={<PlusOutlined />}
              onClick={handleExternalPick}
              loading={showLoadingIndicator && externalPicking}
              disabled={externalPicking}
            >
              {externalPickLabel}
            </Button>
          )}
        </Flex>
      </Flex>
    ),
  }

  const rowClassName = integration?.rowClassName

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
            <Flex align="center" gap={8}>
              {showAddRow && (
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRow}>
                  {t('actions.addRow')}
                </Button>
              )}
              {showExternalPick && (
                <Button
                  type={showAddRow ? 'default' : 'primary'}
                  icon={<PlusOutlined />}
                  onClick={handleExternalPick}
                  loading={showLoadingIndicator && externalPicking}
                  disabled={externalPicking}
                >
                  {externalPickLabel}
                </Button>
              )}
            </Flex>
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
        rowClassName={rowClassName ? (record, index) => rowClassName(record, index) : undefined}
        rowSelection={rowSelection}
        pagination={false}
        scroll={{ x: 'max-content', y: rows.length > 20 ? 600 : undefined }}
        virtual={rows.length > 50}
        bordered
        locale={emptyLocale}
      />
    </Card>
  )
})
