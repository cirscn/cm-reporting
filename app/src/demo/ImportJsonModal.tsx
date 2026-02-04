import { cirsGpmLegacyAdapter, parseSnapshot } from '@lib/index'
import type { ReportSnapshotV1 } from '@lib/public/snapshot'
import { useMemoizedFn } from 'ahooks'
import { Alert, Button, Flex, Form, Input, Modal, Upload, message } from 'antd'
import type { UploadProps } from 'antd'
import { useMemo, useState } from 'react'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isProbablySnapshot(input: unknown): boolean {
  return isRecord(input) && input.schemaVersion === 1 && 'templateType' in input && 'versionId' in input && 'data' in input
}

export interface ImportJsonModalProps {
  open: boolean
  onClose: () => void
  onImported: (snapshot: ReportSnapshotV1) => void
}

interface DetectedInfo {
  source: 'snapshot' | 'legacy'
  templateType: ReportSnapshotV1['templateType']
  versionId: string
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
      const snapshot = isProbablySnapshot(json)
        ? parseSnapshot(json)
        : cirsGpmLegacyAdapter.toInternal(json).snapshot
      onImported(snapshot)
      msgApi.success(`Imported: RMI_${snapshot.templateType.toUpperCase()}_${snapshot.versionId}`)
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

  return (
    <>
      {contextHolder}
      <Modal
        title="Import JSON"
        open={open}
        onCancel={handleClose}
        onOk={handleImport}
        okButtonProps={{ disabled: !canImport, loading }}
        cancelButtonProps={{ disabled: loading }}
        width={760}
      >
        <Flex vertical gap={12}>
          <Alert
            type="info"
            showIcon
            message="本地导入（不上传）"
            description="自动识别 RMI JSON / ReportSnapshotV1。导入后将重置到 Declaration 页并渲染为可编辑状态。"
          />

          <Form layout="vertical">
            <Form.Item label="Upload">
              <Upload
                accept=".json,application/json"
                maxCount={1}
                beforeUpload={beforeUpload}
                showUploadList={false}
              >
                <Button>Choose JSON file</Button>
              </Upload>
            </Form.Item>

            <Form.Item label="Paste JSON">
              <Input.TextArea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={12}
                placeholder="Paste RMI JSON or ReportSnapshotV1 here…"
                spellCheck={false}
              />
            </Form.Item>

            <Form.Item label="识别结果">
              <Alert
                type={detection.info ? 'success' : detection.error ? 'error' : 'info'}
                showIcon
                message={
                  detection.info
                    ? `已识别：${formatDetected(detection.info)}`
                    : detection.error
                      ? '未识别'
                      : '等待输入'
                }
                description={
                  detection.info
                    ? detection.info.source === 'legacy'
                      ? '来源：RMI legacy JSON（从 RMI_* 标识推断类型与版本）'
                      : '来源：ReportSnapshotV1'
                    : detection.error
                      ? detection.error
                      : '上传或粘贴 JSON 后自动识别'
                }
              />
            </Form.Item>
          </Form>
        </Flex>
      </Modal>
    </>
  )
}
