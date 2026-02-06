/**
 * @file ui/tables/ProductListTable.tsx
 * @description 产品清单表格：支持增删行、行内编辑、外部选择与批量操作。
 */

import { PlusOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons'
import type { ProductListConfig, TemplateType, TemplateVersionDef } from '@core/registry/types'
import type { ProductRow } from '@core/types/tableRows'
import type {
  ExternalAddMode,
  ProductListIntegration,
  ProductPickContext,
} from '@lib/public/integrations'
import { useHandlerMap } from '@ui/hooks/useHandlerMap'
import { useT } from '@ui/i18n/useT'
import { useBoolean, useCreation, useLatest, useMemoizedFn } from 'ahooks'
import { Button, Card, Flex, Modal, Table, Input, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { TableRowSelection } from 'antd/es/table/interface'
import type { ChangeEvent, ReactNode } from 'react'
import { memo, useState } from 'react'

interface ProductListTableProps {
  templateType: TemplateType
  versionId: string
  versionDef: TemplateVersionDef
  config: ProductListConfig
  rows: ProductRow[]
  onChange: (rows: ProductRow[]) => void
  required?: boolean
  /**
   * 是否展示 requester 列。
   * - 默认使用模板版本配置：config.hasRequesterColumns
   * - 宿主如需强制展示可显式传入 true（不建议用于非该模板版本）。
   */
  showRequesterColumns?: boolean
  integration?: ProductListIntegration
}

const INPUT_FIELDS = [
  'productNumber',
  'productName',
  'requesterNumber',
  'requesterName',
  'comments',
] as const

/** 产品清单表格：支持增删行、行内编辑与外部选择。 */
export const ProductListTable = memo(function ProductListTable({
  templateType,
  versionId,
  versionDef,
  config,
  rows,
  onChange,
  required = false,
  showRequesterColumns,
  integration,
}: ProductListTableProps) {
  const { t, locale } = useT()
  /** 批量选择状态（受控）。 */
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
  const [externalPicking, { setTrue: startPicking, setFalse: stopPicking }] = useBoolean(false)
  const rowsRef = useLatest(rows)
  const validSelectedRowKeys = useCreation(() => {
    const valid = new Set(rows.map((r) => r.id))
    return selectedRowKeys.filter((k) => valid.has(k))
  }, [rows, selectedRowKeys])

  /** 行索引缓存：避免频繁全表 map/filter。 */
  const rowIndexMap = useCreation(() => new Map(rows.map((row, index) => [row.id, index])), [rows])

  /** 必填字段包裹：用于标记黄色必填背景。 */
  const wrapRequired = useMemoizedFn((isRequired: boolean, node: ReactNode) => {
    if (!isRequired) return node
    return <div className="field-required">{node}</div>
  })

  /** 添加空行（保持字段结构完整）。 */
  const handleAddRow = useMemoizedFn(() => {
    const newRow: ProductRow = {
      id: `product-${Date.now()}`,
      productNumber: '',
      productName: '',
      comments: '',
    }
    onChange([...rows, newRow])
  })

  const integrationAddMode: ExternalAddMode = integration?.addMode ?? 'append-empty-row'
  const showExternalPick = Boolean(integration) && integrationAddMode !== 'append-empty-row'
  const showAddRow = integrationAddMode !== 'external-only'
  const externalPickLabel = integration?.label ?? t('actions.pickExternal')
  const showLoadingIndicator = integration?.showLoadingIndicator ?? false

  const normalizeExternalProductRow = useMemoizedFn(
    (partial: Partial<ProductRow>, seq: number): ProductRow => {
      const idBase = `product-${Date.now()}-${seq}`
      return {
        ...(partial as Record<string, string | undefined>),
        id: typeof partial.id === 'string' && partial.id.trim() ? partial.id : idBase,
        productNumber: partial.productNumber ?? '',
        productName: partial.productName ?? '',
        requesterNumber: partial.requesterNumber ?? '',
        requesterName: partial.requesterName ?? '',
        comments: partial.comments ?? '',
      }
    },
  )

  const getCurrentRowsSnapshot = useMemoizedFn(() => rowsRef.current.map((row) => ({ ...row })))

  const handleExternalPick = useMemoizedFn(async () => {
    if (!integration || externalPicking) return
    const currentRows = getCurrentRowsSnapshot()
    const ctx: ProductPickContext = {
      templateType,
      versionId,
      locale,
      versionDef,
      config,
      currentRows,
    }
    startPicking()
    try {
      const result = await integration.onPickProducts(ctx)
      const items = result?.items ?? []
      if (items.length === 0) return
      const normalized = items.map((item, index) => normalizeExternalProductRow(item, index))
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

  /** 删除指定行（基于缓存索引定位）。 */
  const handleRemoveRow = useMemoizedFn((id: string) => {
    const index = rowIndexMap.get(id)
    if (index === undefined) return
    const next = rows.slice()
    next.splice(index, 1)
    onChange(next)
  })

  /** 更新单元格（值不变则不触发更新）。 */
  const handleCellChange = useMemoizedFn((id: string, field: keyof ProductRow, value: string) => {
    const index = rowIndexMap.get(id)
    if (index === undefined) return
    const row = rows[index]
    if (!row || row[field] === value) return
    const next = rows.slice()
    next[index] = { ...row, [field]: value }
    onChange(next)
  })

  /** 缓存输入项 onChange 处理器，避免表格内联函数扩散。 */
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

  const handleRemoveRowWithSelection = useMemoizedFn((id: string) => {
    setSelectedRowKeys((prev) => prev.filter((k) => k !== id))
    handleRemoveRow(id)
  })

  /** 缓存删除按钮 handler。 */
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
  const rowSelection: TableRowSelection<ProductRow> = {
    selectedRowKeys: validSelectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys as string[]),
  }

  const columns = useCreation<ColumnsType<ProductRow>>(() => {
    const base: ColumnsType<ProductRow> = [
      {
        title: t(config.productNumberLabelKey),
        dataIndex: 'productNumber',
        key: 'productNumber',
        width: 180,
        fixed: 'left',
        render: (value: string, record: ProductRow) =>
          wrapRequired(
            required,
            <Input
              value={value || undefined}
              onChange={getInputHandler(`${record.id}:productNumber`)}
              placeholder={t('productPlaceholders.productNumber')}
            />,
          ),
      },
      {
        title: t(config.productNameLabelKey),
        dataIndex: 'productName',
        key: 'productName',
        width: 200,
        render: (value: string, record: ProductRow) => (
          <Input
            value={value || undefined}
            onChange={getInputHandler(`${record.id}:productName`)}
            placeholder={t('productPlaceholders.productName')}
          />
        ),
      },
    ]

    const enableRequesterColumns = showRequesterColumns ?? config.hasRequesterColumns
    if (enableRequesterColumns) {
      base.push(
        {
          title: t('tables.requesterNumber'),
          dataIndex: 'requesterNumber',
          key: 'requesterNumber',
          width: 180,
          render: (value: string, record: ProductRow) => (
            <Input
              value={value || undefined}
              onChange={getInputHandler(`${record.id}:requesterNumber`)}
              placeholder={t('productPlaceholders.requesterNumber')}
            />
          ),
        },
        {
          title: t('tables.requesterName'),
          dataIndex: 'requesterName',
          key: 'requesterName',
          width: 200,
          render: (value: string, record: ProductRow) => (
            <Input
              value={value || undefined}
              onChange={getInputHandler(`${record.id}:requesterName`)}
              placeholder={t('productPlaceholders.requesterName')}
            />
          ),
        },
      )
    }

    base.push({
      title: t(config.commentLabelKey),
      dataIndex: 'comments',
      key: 'comments',
      width: 200,
      render: (value: string, record: ProductRow) => (
        <Input
          value={value || undefined}
          onChange={getInputHandler(`${record.id}:comments`)}
          placeholder={t('productPlaceholders.comments')}
        />
      ),
    })

    base.push({
      title: '',
      key: 'actions',
      width: 60,
      fixed: 'right',
      render: (_: unknown, record: ProductRow) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={getRemoveHandler(record.id)}
        />
      ),
    })

    return base
  }, [config, getInputHandler, getRemoveHandler, required, showRequesterColumns, t, wrapRequired])

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

  return (
    <Card
      title={
        <Flex vertical gap={8} style={{ width: '100%' }}>
          <Flex align="center" justify="space-between">
            <Flex align="center" gap={8}>
              <Typography.Title level={5} style={{ margin: 0 }}>
                {t('tabs.productList')}
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
})
