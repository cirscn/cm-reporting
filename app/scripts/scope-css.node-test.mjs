import assert from 'node:assert/strict'
import test from 'node:test'

import { scopeCss } from './scope-css.mjs'

test('scopes element resets and component overrides under the CM Reporting root', () => {
  const source = [
    ':root{--cm-section-gap:16px}',
    'a{color:inherit;text-decoration:inherit}',
    '.ant-input-disabled,.ant-input-disabled:hover{color:var(--ant-color-text)!important}',
    '@media(hover:hover){.hover\\:bg-blue-50\\/50:hover{background:#eff6ff80}}',
    '@keyframes fadeIn{from{opacity:0}to{opacity:1}}',
    '@property --tw-rotate-x{syntax:"*";inherits:false}',
    '@property --cm-progress{syntax:"<number>";inherits:false;initial-value:0}',
  ].join('')

  const output = scopeCss(source)

  assert.match(output, /\.cm-reporting-scope\s*\{--cm-section-gap:16px\}/)
  assert.match(output, /\.cm-reporting-scope a\s*\{color:inherit;text-decoration:inherit\}/)
  assert.match(output, /\.cm-reporting-scope \.ant-input-disabled/)
  assert.match(output, /@media\(hover:hover\)\{\.cm-reporting-scope \.hover\\:bg-blue-50\\\/50:hover/)
  assert.match(output, /@keyframes fadeIn/)
  assert.match(output, /@keyframes fadeIn\{from\{opacity:0\}to\{opacity:1\}\}/)
  assert.match(output, /@property --cm-progress/)
  assert.doesNotMatch(output, /@property --tw-rotate-x/)
  assert.doesNotMatch(output, /(^|})a\{/)
  assert.doesNotMatch(output, /(^|})\.ant-input-disabled/)
})
