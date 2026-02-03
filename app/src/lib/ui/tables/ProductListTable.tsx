/**
 * @file ui/tables/ProductListTable.tsx
 * @description 模块实现。
 */

// 说明：模块实现
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ProductListConfig } from '@core/registry/types'
import type { ProductRow } from '@core/types/tableRows'
import { useT } from '@ui/i18n/useT'
import { useCreation, useMemoizedFn } from 'ahooks'
import { Button, Card, Flex, Table, Input, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { ChangeEvent, ReactNode } from 'react'

interface ProductListTableProps {
  config: ProductListConfig
  rows: ProductRow[]
  onChange: (rows: ProductRow[]) => void
  required?: boolean
}

const INPUT_FIELDS = [
  'productNumber',
  'productName',
  'requesterNumber',
  'requesterName',
  'comments',
] as const

type InputField = (typeof INPUT_FIELDS)[number]

/** 产品清单表格：支持增删行与行内编辑。 */
export function ProductListTable({
  config,
  rows,
  onChange,
  required = false,
}: ProductListTableProps) {
  const { t } = useT()
  /** 行索引缓存：避免频繁全表 map/filter。 */
  const rowIndexMap = useCreation(
    () => new Map(rows.map((row, index) => [row.id, index])),
    [rows]
  )

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
      requesterNumber: '',
      requesterName: '',
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

  const removeHandlers = useCreation(() => {
    const map = new Map<string, () => void>()
    rows.forEach((row) => {
      map.set(row.id, () => handleRemoveRow(row.id))
    })
    return map
  }, [rows, handleRemoveRow])

  const getInputHandler = useMemoizedFn((id: string, field: InputField) =>
    inputHandlers.get(`${id}:${field}`)
  )
  /** 获取稳定的删除按钮 handler（返回函数，不在渲染期执行）。 */
  const getRemoveHandler = useMemoizedFn((id: string) => removeHandlers.get(id))

  const columns = useCreation<ColumnsType<ProductRow>>(() => {
    const base: ColumnsType<ProductRow> = [
      {
        title: t(config.productNumberLabelKey),
        dataIndex: 'productNumber',
        key: 'productNumber',
        width: 180,
        render: (value: string, record: ProductRow) => (
          wrapRequired(
            required,
            <Input
              value={value || undefined}
              onChange={getInputHandler(record.id, 'productNumber')}
              placeholder={t('productPlaceholders.productNumber')}
            />
          )
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
            onChange={getInputHandler(record.id, 'productName')}
            placeholder={t('productPlaceholders.productName')}
          />
        ),
      },
    ]

    if (config.hasRequesterColumns) {
      base.push(
        {
          title: t('tables.requesterNumber'),
          dataIndex: 'requesterNumber',
          key: 'requesterNumber',
          width: 180,
          render: (value: string, record: ProductRow) => (
            <Input
              value={value || undefined}
              onChange={getInputHandler(record.id, 'requesterNumber')}
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
              onChange={getInputHandler(record.id, 'requesterName')}
              placeholder={t('productPlaceholders.requesterName')}
            />
          ),
        }
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
          onChange={getInputHandler(record.id, 'comments')}
          placeholder={t('productPlaceholders.comments')}
        />
      ),
    })

    base.push({
      title: '',
      key: 'actions',
      width: 60,
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
  }, [config, t, handleCellChange, handleRemoveRow])

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
        <Flex align="center" justify="space-between" style={{ width: '100%' }}>
          <Flex align="center" gap={8}>
            <Typography.Title level={5} style={{ margin: 0 }}>
              {t('tabs.productList')}
            </Typography.Title>
            <Tag color="blue">{t('badges.recordCount', { count: rows.length })}</Tag>
          </Flex>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRow}>
            {t('actions.addRow')}
          </Button>
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
        locale={emptyLocale}
      />
    </Card>
  )
}
