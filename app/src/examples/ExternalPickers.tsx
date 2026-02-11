/**
 * @file examples/ExternalPickers.tsx
 * @description Examples：宿主侧实现外部选择器，并通过 integrations 回写冶炼厂/产品列表。
 */

import { SMELTER_LOOKUP_DATA, SMELTER_LOOKUP_META } from '@core/data/lookups'
import type { ProductRow, SmelterRow } from '@lib/index'
import type {
  ExternalPickResult,
  ProductPickContext,
  SmelterRowPickContext,
} from '@lib/public/integrations'
import { useMemoizedFn } from 'ahooks'
import { Button, Flex, Modal, Table, Typography } from 'antd'
import type { ColumnsType, TableRowSelection } from 'antd/es/table/interface'
import { useCallback, useMemo, useRef, useState } from 'react'

const { Text } = Typography

type ResolveFn<T> = (value: T) => void
type ExampleSmelterPickItem = Partial<SmelterRow> & { smelterNumber?: string }

function stripKey<T extends { key: string }>(row: T): Omit<T, 'key'> {
  const { key, ...rest } = row
  void key
  return rest
}

function buildSmelterCandidatesByMetal({
  metal,
}: {
  metal: string
}): Array<Partial<SmelterRow> & { key: string }> {
  const lookupItems = Object.entries(SMELTER_LOOKUP_DATA).map(([name, record]) => ({
    key: name,
    metal,
    smelterLookup: name,
    smelterName: name,
    smelterCountry: record.country,
    smelterNumber: record.smelterId,
    smelterIdentification: record.smelterId,
    sourceId: record.sourceId,
    smelterStreet: record.street,
    smelterCity: record.city,
    smelterState: record.state,
    demoExtra: 'kept-by-normalizer',
    comments: '[examples] picked from external (with extra field preserved)',
  }))

  const notListed: Array<Partial<SmelterRow> & { key: string }> = [
    {
      key: 'demo-not-listed',
      metal,
      smelterLookup: SMELTER_LOOKUP_META.notListed,
      smelterName: 'Examples Custom Smelter',
      smelterCountry: 'Unknown',
      smelterIdentification: '',
      sourceId: '',
      demoExtra: 'not-listed-extra',
      comments: '[examples] Smelter not listed',
    },
  ]

  return [...lookupItems, ...notListed]
}

function buildProductCandidates(params: {
  includeRequester: boolean
}): Array<Partial<ProductRow> & { key: string }> {
  const base: Array<Partial<ProductRow> & { key: string }> = [
    {
      key: 'prd-001',
      productNumber: 'PRD-001',
      productName: 'Examples Product A',
      comments: '[examples] picked from external (with extra field preserved)',
      demoExtra: 'kept-by-normalizer',
    },
    {
      key: 'prd-002',
      productNumber: 'PRD-002',
      productName: 'Examples Product B',
      comments: '[examples] picked from external',
      demoExtra: 'kept-by-normalizer',
    },
  ]
  if (!params.includeRequester) return base
  return base.map((row, index) => ({
    ...row,
    requesterNumber: `REQ-00${index + 1}`,
    requesterName: 'Examples Requester',
  }))
}

export function useExampleExternalPickers() {
  const [productCandidates, setProductCandidates] = useState<
    Array<Partial<ProductRow> & { key: string }>
  >([])
  const [smelterCandidates, setSmelterCandidates] = useState<Array<ExampleSmelterPickItem & { key: string }>>(
    [],
  )

  const [smelterOpen, setSmelterOpen] = useState(false)
  const [productOpen, setProductOpen] = useState(false)
  const [selectedSmelterKeys, setSelectedSmelterKeys] = useState<string[]>([])
  const [selectedProductKeys, setSelectedProductKeys] = useState<string[]>([])

  const [smelterCtxInfo, setSmelterCtxInfo] = useState<{
    templateType: SmelterRowPickContext['templateType']
    versionId: string
    rowsCount: number
    rowId: string
    metal: string
    currentLookup: string
  } | null>(null)
  const [productCtxInfo, setProductCtxInfo] = useState<{
    templateType: string
    versionId: string
    rowsCount: number
  } | null>(null)
  const smelterResolveRef = useRef<ResolveFn<ExternalPickResult<ExampleSmelterPickItem>> | null>(null)
  const productResolveRef = useRef<ResolveFn<ExternalPickResult<Partial<ProductRow>>> | null>(null)

  const finalizeSmelter = useMemoizedFn((result: ExternalPickResult<ExampleSmelterPickItem>) => {
    smelterResolveRef.current?.(result)
    smelterResolveRef.current = null
    setSmelterCtxInfo(null)
    setSmelterCandidates([])
    setSelectedSmelterKeys([])
    setSmelterOpen(false)
  })

  const finalizeProduct = useMemoizedFn((result: ExternalPickResult<Partial<ProductRow>>) => {
    productResolveRef.current?.(result)
    productResolveRef.current = null
    setProductCtxInfo(null)
    setSelectedProductKeys([])
    setProductCandidates([])
    setProductOpen(false)
  })

  const onPickSmelterForRow = useCallback(
    async (ctx: SmelterRowPickContext) => {
      if (smelterOpen) return null
      setSmelterCandidates(buildSmelterCandidatesByMetal({ metal: ctx.metal }))
      setSelectedSmelterKeys([])
      setSmelterCtxInfo({
        templateType: ctx.templateType,
        versionId: ctx.versionId,
        rowsCount: ctx.currentRows.length,
        rowId: ctx.rowId,
        metal: ctx.metal,
        currentLookup: ctx.row.smelterLookup ?? '',
      })
      setSmelterOpen(true)
      return new Promise<ExternalPickResult<ExampleSmelterPickItem>>((resolve) => {
        smelterResolveRef.current = resolve
      })
    },
    [smelterOpen],
  )

  const onPickProducts = useCallback(
    async (ctx: ProductPickContext) => {
      if (productOpen) return null
      setProductCandidates(
        buildProductCandidates({ includeRequester: ctx.config.hasRequesterColumns }),
      )
      setProductCtxInfo({
        templateType: ctx.templateType,
        versionId: ctx.versionId,
        rowsCount: ctx.currentRows.length,
      })
      setProductOpen(true)
      return new Promise<ExternalPickResult<Partial<ProductRow>>>((resolve) => {
        productResolveRef.current = resolve
      })
    },
    [productOpen],
  )

  const includeProductRequesterColumns = productCandidates.some((row) =>
    Boolean(row.requesterNumber || row.requesterName),
  )

  const smelterColumns = useMemo<ColumnsType<ExampleSmelterPickItem & { key: string }>>(
    () => [
      { title: 'Metal', dataIndex: 'metal', key: 'metal', width: 120 },
      { title: 'Smelter', dataIndex: 'smelterName', key: 'smelterName' },
      { title: 'Country', dataIndex: 'smelterCountry', key: 'smelterCountry', width: 160 },
      {
        title: 'Smelter ID',
        dataIndex: 'smelterNumber',
        key: 'smelterNumber',
        width: 140,
      },
      { title: 'Source', dataIndex: 'sourceId', key: 'sourceId', width: 120 },
    ],
    [],
  )

  const productColumns = useMemo<ColumnsType<Partial<ProductRow> & { key: string }>>(() => {
    const cols: ColumnsType<Partial<ProductRow> & { key: string }> = [
      { title: 'Product #', dataIndex: 'productNumber', key: 'productNumber', width: 160 },
      { title: 'Product Name', dataIndex: 'productName', key: 'productName' },
    ]
    if (includeProductRequesterColumns) {
      cols.push(
        { title: 'Requester #', dataIndex: 'requesterNumber', key: 'requesterNumber', width: 160 },
        { title: 'Requester Name', dataIndex: 'requesterName', key: 'requesterName', width: 180 },
      )
    }
    return cols
  }, [includeProductRequesterColumns])

  const smelterSelection: TableRowSelection<ExampleSmelterPickItem & { key: string }> = useMemo(
    () => ({
      type: 'radio',
      selectedRowKeys: selectedSmelterKeys,
      onChange: (keys) => setSelectedSmelterKeys(keys as string[]),
    }),
    [selectedSmelterKeys],
  )

  const productSelection: TableRowSelection<Partial<ProductRow> & { key: string }> = useMemo(
    () => ({
      selectedRowKeys: selectedProductKeys,
      onChange: (keys) => setSelectedProductKeys(keys as string[]),
    }),
    [selectedProductKeys],
  )

  const smelterModal = (
    <Modal
      title="External Smelter Picker (Examples)"
      open={smelterOpen}
      onCancel={() => finalizeSmelter(null)}
      width={980}
      footer={
        <Flex justify="end" gap={8}>
          <Button onClick={() => finalizeSmelter(null)}>Cancel</Button>
          <Button
            type="primary"
            onClick={() => {
              const selected = new Set(selectedSmelterKeys)
              const items = smelterCandidates.filter((row) => selected.has(row.key)).map(stripKey)
              finalizeSmelter({ items })
            }}
            disabled={selectedSmelterKeys.length === 0}
          >
            Confirm
          </Button>
        </Flex>
      }
    >
      <Flex vertical gap={8}>
        <Text type="secondary">
          先在表格内选择 metal，再在该行点击“选择冶炼厂/修改”。当前：Template{' '}
          {smelterCtxInfo?.templateType ?? '-'} / Version {smelterCtxInfo?.versionId ?? '-'} / Row{' '}
          {smelterCtxInfo?.rowId ?? '-'} / Metal {smelterCtxInfo?.metal ?? '-'} / Current{' '}
          {smelterCtxInfo?.rowsCount ?? 0} / Lookup {smelterCtxInfo?.currentLookup || '-'}
        </Text>
        <Table
          rowKey="key"
          columns={smelterColumns}
          dataSource={smelterCandidates}
          rowSelection={smelterSelection}
          pagination={false}
          scroll={{ y: 360 }}
          size="small"
        />
      </Flex>
    </Modal>
  )

  const productModal = (
    <Modal
      title="External Product Picker (Examples)"
      open={productOpen}
      onCancel={() => finalizeProduct(null)}
      width={980}
      footer={
        <Flex justify="end" gap={8}>
          <Button onClick={() => finalizeProduct(null)}>Cancel</Button>
          <Button
            type="primary"
            onClick={() => {
              const selected = new Set(selectedProductKeys)
              const items = productCandidates.filter((row) => selected.has(row.key)).map(stripKey)
              finalizeProduct({ items })
            }}
            disabled={selectedProductKeys.length === 0}
          >
            Confirm
          </Button>
        </Flex>
      }
    >
      <Flex vertical gap={8}>
        <Text type="secondary">
          Template: {productCtxInfo?.templateType ?? '-'} / Version:{' '}
          {productCtxInfo?.versionId ?? '-'} / Current rows: {productCtxInfo?.rowsCount ?? 0}
        </Text>
        <Table
          rowKey="key"
          columns={productColumns}
          dataSource={productCandidates}
          rowSelection={productSelection}
          pagination={false}
          scroll={{ y: 360 }}
          size="small"
        />
      </Flex>
    </Modal>
  )

  return {
    onPickSmelterForRow,
    onPickProducts,
    smelterModal,
    productModal,
  }
}
