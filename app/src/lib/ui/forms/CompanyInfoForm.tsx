/**
 * @file ui/forms/CompanyInfoForm.tsx
 * @description 公司信息表单，使用 Ant Design 组件和垂直布局。
 */

import type { I18nKey } from '@core/i18n'
import type { FieldDef, TemplateVersionDef } from '@core/registry/types'
import type { ErrorKey } from '@core/validation/errorKeys'
import { useT } from '@ui/i18n'
import { useCreation, useMemoizedFn } from 'ahooks'
import { Card, Col, Flex, Row, Tag, Typography } from 'antd'
import { groupBy, sumBy } from 'lodash-es'

import { DateField, SelectField, TextField } from '../fields'

const { Title } = Typography

interface CompanyInfoFormProps {
  versionDef: TemplateVersionDef
  values: Record<string, string>
  onChange: (key: string, value: string) => void
  errors?: Record<string, ErrorKey>
  requiredFields?: Map<string, boolean>
  dateFormatHint?: string
}

/** 声明范围选项。 */
const SCOPE_OPTIONS = [
  { value: 'A', label: 'A. Company-wide' },
  { value: 'B', label: 'B. Product (or List of Products)' },
  { value: 'C', label: 'C. User defined' },
]

const COMPANY_FIELD_KEYS = new Set([
  'companyName', 'declarationScope', 'scopeDescription',
  'companyId', 'companyAuthId', 'address',
])
const CONTACT_FIELD_KEYS = new Set(['contactName', 'contactEmail', 'contactPhone'])
const AUTHORIZER_FIELD_KEYS = new Set([
  'authorizerName', 'authorizerTitle', 'authorizerEmail',
  'authorizerPhone', 'authorizationDate',
])

const PLACEHOLDER_KEYS: Record<string, I18nKey> = {
  companyName: 'placeholders.companyName',
  declarationScope: 'placeholders.declarationScope',
  scopeDescription: 'placeholders.scopeDescription',
  companyId: 'placeholders.companyId',
  companyAuthId: 'placeholders.companyAuthId',
  address: 'placeholders.address',
  contactName: 'placeholders.contactName',
  contactEmail: 'placeholders.contactEmail',
  contactPhone: 'placeholders.contactPhone',
  authorizerName: 'placeholders.authorizerName',
  authorizerTitle: 'placeholders.authorizerTitle',
  authorizerEmail: 'placeholders.authorizerEmail',
  authorizerPhone: 'placeholders.authorizerPhone',
  authorizationDate: 'placeholders.authorizationDate',
}

/**
 * CompanyInfoForm：公司信息表单组件。
 */
export function CompanyInfoForm({
  versionDef,
  values,
  onChange,
  errors = {},
  requiredFields,
  dateFormatHint,
}: CompanyInfoFormProps) {
  const { t } = useT()

  const showPrompts =
    versionDef.templateType !== 'cmrt' ||
    ['6.31', '6.4', '6.5'].includes(versionDef.version.id)

  const scopeType = values.declarationScope as 'A' | 'B' | 'C' | undefined

  const handleChange = useMemoizedFn((key: string, value: string) => {
    onChange(key, value)
  })

  const fieldHandlers = useCreation(() => {
    const map = new Map<string, (value: string) => void>()
    versionDef.companyInfoFields.forEach((field) => {
      map.set(field.key, (value) => handleChange(field.key, value))
    })
    return map
  }, [versionDef.companyInfoFields, handleChange])

  const getFieldHandler = useMemoizedFn((key: string) => fieldHandlers.get(key)!)

  const getPlaceholder = (fieldKey: string) => {
    const key = PLACEHOLDER_KEYS[fieldKey]
    if (!key) return undefined
    if (!showPrompts) return ''
    return t(key)
  }

  const renderField = (field: FieldDef, span: number = 12) => {
    const value = values[field.key] || ''
    const error = errors[field.key]
    const isRequired = requiredFields?.get(field.key) ?? field.required === true
    const label = t(field.labelKey)
    const placeholder = getPlaceholder(field.key)
    const fieldHandler = getFieldHandler(field.key)

    const content = (() => {
      if (field.type === 'select' && field.key === 'declarationScope') {
        return (
          <SelectField
            value={value}
            onChange={fieldHandler}
            label={label}
            required={isRequired}
            error={error}
            options={SCOPE_OPTIONS}
            placeholder={placeholder}
            fieldPath={`companyInfo.${field.key}`}
          />
        )
      }

      if (field.type === 'date') {
        const resolvedDateHint = showPrompts ? dateFormatHint : undefined
        return (
          <DateField
            value={value}
            onChange={fieldHandler}
            label={label}
            required={isRequired}
            error={error}
            minDate={versionDef.dateConfig.minDate}
            maxDate={versionDef.dateConfig.maxDate}
            placeholder={placeholder}
            formatHint={resolvedDateHint}
            fieldPath={`companyInfo.${field.key}`}
          />
        )
      }

      return (
        <TextField
          value={value}
          onChange={fieldHandler}
          label={label}
          required={isRequired}
          error={error}
          multiline={field.type === 'textarea'}
          rows={field.key === 'scopeDescription' ? 3 : undefined}
          placeholder={placeholder}
          fieldPath={`companyInfo.${field.key}`}
        />
      )
    })()

    return (
      <Col key={field.key} xs={24} md={span}>
        {content}
      </Col>
    )
  }

  const { companyFields, contactFields, authorizerFields } = useCreation(() => {
    const fieldGroups = groupBy(versionDef.companyInfoFields, (field) => {
      if (CONTACT_FIELD_KEYS.has(field.key)) return 'contact'
      if (AUTHORIZER_FIELD_KEYS.has(field.key)) return 'authorizer'
      if (COMPANY_FIELD_KEYS.has(field.key)) return 'company'
      return 'other'
    })
    const companyFieldsRaw = fieldGroups.company ?? []
    const companyFieldsFiltered =
      scopeType === 'C'
        ? companyFieldsRaw
        : companyFieldsRaw.filter((field) => field.key !== 'scopeDescription')
    return {
      companyFields: companyFieldsFiltered,
      contactFields: fieldGroups.contact ?? [],
      authorizerFields: fieldGroups.authorizer ?? [],
    }
  }, [versionDef.companyInfoFields, scopeType])

  const isRequired = (field: FieldDef) =>
    requiredFields ? requiredFields.get(field.key) === true : field.required === true

  const requiredTotal = useCreation(
    () => sumBy(versionDef.companyInfoFields, (field) => (isRequired(field) ? 1 : 0)),
    [versionDef.companyInfoFields, requiredFields]
  )

  const requiredCompleted = useCreation(
    () =>
      sumBy(versionDef.companyInfoFields, (field) => {
        if (!isRequired(field)) return 0
        const value = values[field.key]
        return typeof value === 'string' && value.trim().length > 0 ? 1 : 0
      }),
    [versionDef.companyInfoFields, requiredFields, values]
  )

  const sectionHeaderStyle = { marginBottom: 0 }
  const combinedFields = useCreation(
    () => [...companyFields, ...contactFields, ...authorizerFields],
    [companyFields, contactFields, authorizerFields]
  )

  return (
    <Card
      title={
        <Flex align="center" justify="space-between" style={{ width: '100%' }}>
          <Title level={5} style={sectionHeaderStyle}>
            {t('sections.companyInfo')}
          </Title>
          {requiredTotal > 0 && (
            <Tag color="orange">
              {t('badges.requiredCompleted', { done: requiredCompleted, total: requiredTotal })}
            </Tag>
          )}
        </Flex>
      }
    >
      <Flex vertical gap={24}>
        <Row gutter={[24, 0]}>
          {combinedFields.map((field) => renderField(field, 12))}
        </Row>
      </Flex>
    </Card>
  )
}
