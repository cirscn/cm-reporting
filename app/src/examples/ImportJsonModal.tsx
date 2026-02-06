import {
  CheckCircleOutlined,
  CloudUploadOutlined,
  InfoCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import type { CirsGpmLegacyRoundtripContext } from '@lib/index'
import { cirsGpmLegacyAdapter, parseSnapshot } from '@lib/index'
import type { ReportSnapshotV1 } from '@lib/public/snapshot'
import { useMemoizedFn } from 'ahooks'
import { Button, Flex, Input, Modal, Upload, message } from 'antd'
import type { UploadProps } from 'antd'
import { useMemo, useState } from 'react'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isProbablySnapshot(input: unknown): boolean {
  return (
    isRecord(input) &&
    input.schemaVersion === 1 &&
    'templateType' in input &&
    'versionId' in input &&
    'data' in input
  )
}

export interface ImportJsonModalProps {
  open: boolean
  onClose: () => void
  onImported: (result: ImportJsonResult) => void
}

interface DetectedInfo {
  source: 'snapshot' | 'legacy'
  templateType: ReportSnapshotV1['templateType']
  versionId: string
}

export interface ImportJsonResult {
  source: DetectedInfo['source']
  snapshot: ReportSnapshotV1
  legacyCtx?: CirsGpmLegacyRoundtripContext
}

function formatDetected(info: DetectedInfo): string {
  const template = info.templateType.toUpperCase()
  const version = info.versionId
  if (info.source === 'legacy') {
    return `RMI_${template}_${version}`
  }
  return `Snapshot ${template} v${version}`
}

export function ImportJsonModal({ open, onClose, onImported }: ImportJsonModalProps) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [msgApi, contextHolder] = message.useMessage()

  const detection = useMemo<{ info: DetectedInfo | null; error: string }>(() => {
    const trimmed = text.trim()
    if (!trimmed) return { info: null as DetectedInfo | null, error: '' }
    try {
      const json = JSON.parse(trimmed) as unknown
      if (isProbablySnapshot(json)) {
        const snapshot = parseSnapshot(json)
        return {
          info: {
            source: 'snapshot',
            templateType: snapshot.templateType,
            versionId: snapshot.versionId,
          },
          error: '',
        }
      }
      const parsed = cirsGpmLegacyAdapter.parse(json)
      return {
        info: {
          source: 'legacy',
          templateType: parsed.templateType,
          versionId: parsed.versionId,
        },
        error: '',
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return { info: null, error: msg }
    }
  }, [text])

  const canImport = useMemo(() => !!detection.info && !detection.error, [detection])

  const beforeUpload = useMemoizedFn<NonNullable<UploadProps['beforeUpload']>>(async (file) => {
    const nextText = await file.text()
    setText(nextText)
    return false
  })

  const handleImport = useMemoizedFn(async () => {
    if (!canImport) return
    setLoading(true)
    try {
      const json = JSON.parse(text) as unknown
      const result: ImportJsonResult = isProbablySnapshot(json)
        ? { source: 'snapshot', snapshot: parseSnapshot(json) }
        : (() => {
            const parsed = cirsGpmLegacyAdapter.toInternal(json)
            return { source: 'legacy', snapshot: parsed.snapshot, legacyCtx: parsed.ctx }
          })()
      onImported(result)
      msgApi.success(
        `导入成功: RMI_${result.snapshot.templateType.toUpperCase()}_${result.snapshot.versionId}`
      )
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      msgApi.error(msg)
    } finally {
      setLoading(false)
    }
  })

  const handleClose = useMemoizedFn(() => {
    if (loading) return
    onClose()
  })

  const getDetectionStatus = () => {
    if (detection.info) return 'success'
    if (detection.error) return 'error'
    return 'waiting'
  }

  const status = getDetectionStatus()

  return (
    <>
      {contextHolder}
      <Modal
        title="导入 JSON"
        open={open}
        onCancel={handleClose}
        footer={null}
        width={680}
        styles={{
          body: { padding: 0 },
        }}
        closable
        destroyOnHidden
      >
        {/* Content */}
        <div>
          {/* Info Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #e8f4fd 0%, #f0f7fc 100%)',
              borderRadius: 10,
              padding: '14px 18px',
              marginBottom: 24,
              border: '1px solid #cce5f6',
            }}
          >
            <Flex align="flex-start" gap={12}>
              <InfoCircleOutlined style={{ color: '#1976d2', fontSize: 18, marginTop: 2 }} />
              <div style={{ color: '#1565c0', fontSize: 13, lineHeight: 1.6 }}>
                自动识别 RMI JSON / ReportSnapshotV1。导入后将重置到 Declaration
                页并渲染为可编辑状态。
              </div>
            </Flex>
          </div>

          {/* Upload Section */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>
              上传文件
            </div>
            <Upload
              accept=".json,application/json"
              maxCount={1}
              beforeUpload={beforeUpload}
              showUploadList={false}
            >
              <Button
                icon={<CloudUploadOutlined />}
                style={{
                  height: 40,
                  paddingLeft: 20,
                  paddingRight: 20,
                  borderRadius: 8,
                  borderStyle: 'dashed',
                  borderWidth: 1.5,
                }}
              >
                选择 JSON 文件
              </Button>
            </Upload>
          </div>

          {/* Paste Section */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>
              粘贴 JSON
            </div>
            <Input.TextArea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={10}
              placeholder="在此粘贴 RMI JSON 或 ReportSnapshotV1..."
              spellCheck={false}
              style={{
                borderRadius: 10,
                fontSize: 13,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Detection Result */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>
              识别结果
            </div>
            <div
              style={{
                borderRadius: 10,
                padding: '16px 18px',
                background:
                  status === 'success'
                    ? 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)'
                    : status === 'error'
                      ? 'linear-gradient(135deg, #ffebee 0%, #fce4ec 100%)'
                      : 'linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%)',
                border: `1px solid ${
                  status === 'success' ? '#a5d6a7' : status === 'error' ? '#ef9a9a' : '#e0e0e0'
                }`,
                transition: 'all 0.3s ease',
              }}
            >
              <Flex align="center" gap={12}>
                {status === 'success' && (
                  <CheckCircleOutlined style={{ fontSize: 20, color: '#43a047' }} />
                )}
                {status === 'error' && (
                  <WarningOutlined style={{ fontSize: 20, color: '#e53935' }} />
                )}
                {status === 'waiting' && (
                  <InfoCircleOutlined style={{ fontSize: 20, color: '#9e9e9e' }} />
                )}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      color:
                        status === 'success'
                          ? '#2e7d32'
                          : status === 'error'
                            ? '#c62828'
                            : '#616161',
                    }}
                  >
                    {status === 'success' && `已识别: ${formatDetected(detection.info!)}`}
                    {status === 'error' && '未识别'}
                    {status === 'waiting' && '等待输入'}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      marginTop: 4,
                      color:
                        status === 'success'
                          ? '#558b2f'
                          : status === 'error'
                            ? '#d32f2f'
                            : '#9e9e9e',
                    }}
                  >
                    {status === 'success' &&
                      (detection.info?.source === 'legacy'
                        ? '来源：RMI legacy JSON（从 RMI_* 标识推断类型与版本）'
                        : '来源：ReportSnapshotV1')}
                    {status === 'error' && detection.error}
                    {status === 'waiting' && '上传或粘贴 JSON 后自动识别'}
                  </div>
                </div>
              </Flex>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 28px',
            borderTop: '1px solid #f0f0f0',
            background: '#fafafa',
            borderRadius: '0 0 8px 8px',
          }}
        >
          <Flex justify="flex-end" gap={12}>
            <Button
              onClick={handleClose}
              disabled={loading}
              style={{ height: 38, paddingLeft: 20, paddingRight: 20, borderRadius: 8 }}
            >
              取消
            </Button>
            <Button
              type="primary"
              onClick={handleImport}
              disabled={!canImport}
              loading={loading}
              style={{
                height: 38,
                paddingLeft: 24,
                paddingRight: 24,
                borderRadius: 8,
                fontWeight: 600,
              }}
            >
              确定
            </Button>
          </Flex>
        </div>
      </Modal>
    </>
  )
}
