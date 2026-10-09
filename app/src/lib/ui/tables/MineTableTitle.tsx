import { PlusOutlined } from '@ant-design/icons'
import { useT } from '@ui/i18n/useT'
import { COMPONENT } from '@ui/theme/spacing'
import { Button, Flex, Tag, Typography } from 'antd'

const TITLE_LEVEL = 5

export function MineTableTitle(props: { count: number; disabled: boolean; onAddRow: () => void }) {
  const { t } = useT()
  return (
    <Flex align="center" justify="space-between" className="w-full">
      <Flex align="center" gap={COMPONENT.inlineGapSm}>
        <Typography.Title level={TITLE_LEVEL} className="!m-0">{t('tabs.mineList')}</Typography.Title>
        <Tag color="blue">{t('badges.recordCount', { count: props.count })}</Tag>
      </Flex>
      {!props.disabled && (
        <Button type="primary" icon={<PlusOutlined />} onClick={props.onAddRow}>
          {t('actions.addRow')}
        </Button>
      )}
    </Flex>
  )
}
