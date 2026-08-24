const UNBRANDED_TEMPLATE_VERSIONS = new Set([
  'AMRT@1.31.1',
  'CMRT@6.6.1',
  'EMRT@2.11.1',
])

/** 返回官方模板原始文件名；无 Logo 版本不带 RMI_ 前缀。 */
export function getTemplateFilename(type, version) {
  const templateKey = `${type}@${version}`
  const prefix = UNBRANDED_TEMPLATE_VERSIONS.has(templateKey) ? '' : 'RMI_'
  return `${prefix}${type}_${version}.xlsx`
}
