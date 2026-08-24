import assert from 'node:assert/strict'
import test from 'node:test'

import { getTemplateFilename } from './template-file-names.js'

test('保留旧版本的 RMI_ 文件名前缀', () => {
  assert.equal(getTemplateFilename('CMRT', '6.6'), 'RMI_CMRT_6.6.xlsx')
  assert.equal(getTemplateFilename('EMRT', '2.11'), 'RMI_EMRT_2.11.xlsx')
  assert.equal(getTemplateFilename('AMRT', '1.31'), 'RMI_AMRT_1.31.xlsx')
})

test('解析无 Logo 升版的官方原始文件名', () => {
  assert.equal(getTemplateFilename('CMRT', '6.6.1'), 'CMRT_6.6.1.xlsx')
  assert.equal(getTemplateFilename('EMRT', '2.11.1'), 'EMRT_2.11.1.xlsx')
  assert.equal(getTemplateFilename('AMRT', '1.31.1'), 'AMRT_1.31.1.xlsx')
})
