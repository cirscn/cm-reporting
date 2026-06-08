import assert from 'node:assert/strict'
import test from 'node:test'

import { scopeCss } from './scope-css.mjs'

test('scopes component styles but drops Tailwind preflight resets', () => {
  const source = [
    ':root{--cm-section-gap:16px}',
    '*,::after,::before,::backdrop,::file-selector-button{box-sizing:border-box;margin:0;padding:0;border:0 solid}',
    'button,input,select,optgroup,textarea,::file-selector-button{font:inherit;background-color:transparent;border-radius:0}',
    'a{color:inherit;text-decoration:inherit}',
    'button,a,[role=button],.ant-btn,.ant-select,.ant-input,.ant-picker{touch-action:manipulation}',
    '.ant-input-disabled,.ant-input-disabled:hover{color:var(--ant-color-text)!important}',
    '@media(hover:hover){.hover\\:bg-blue-50\\/50:hover{background:#eff6ff80}}',
    '@keyframes fadeIn{from{opacity:0}to{opacity:1}}',
    '@property --tw-rotate-x{syntax:"*";inherits:false}',
    '@property --cm-progress{syntax:"<number>";inherits:false;initial-value:0}',
  ].join('')

  const output = scopeCss(source)

  assert.match(output, /\.cm-reporting-scope\s*\{--cm-section-gap:16px\}/)
  assert.match(
    output,
    /\.cm-reporting-scope button,\.cm-reporting-scope a,\.cm-reporting-scope \[role=button\]/,
  )
  assert.match(output, /\.cm-reporting-scope \.ant-input-disabled/)
  assert.match(output, /@media\(hover:hover\)\{\.cm-reporting-scope \.hover\\:bg-blue-50\\\/50:hover/)
  assert.match(output, /@keyframes fadeIn/)
  assert.match(output, /@keyframes fadeIn\{from\{opacity:0\}to\{opacity:1\}\}/)
  assert.match(output, /@property --cm-progress/)
  assert.doesNotMatch(output, /@property --tw-rotate-x/)
  assert.doesNotMatch(output, /(^|})a\{/)
  assert.doesNotMatch(output, /\.cm-reporting-scope \*\s*\{/)
  assert.doesNotMatch(output, /border:0 solid/)
  assert.doesNotMatch(output, /background-color:transparent/)
  assert.doesNotMatch(output, /border-radius:0/)
  assert.doesNotMatch(output, /(^|})\.ant-input-disabled/)
})
