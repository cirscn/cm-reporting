> **内部计划文档（非产品交付）**  
> 本文用于研发/实施计划，不作为产品需求基线；对外请以 `docs/prd/` 与 `docs/diffs/` 为准。

# Conflict Minerals SchemaRenderer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Current Stage:** 当前阶段仅深挖 Excel 规则并形成完整需求；Code/React 暂时移除，以下实现/测试/提交步骤暂停执行。

**Goal:** 落地基于 Canonical Schema 的 SchemaRenderer（React 19 + AntD + Tailwind），支持 CMRT/EMRT/CRT 多版本共存、规则引擎、Zod+TS 双校验与中文错误。

**Architecture:** Rule Graph + Canonical Schema + Adapter，Renderer 以 schema 驱动；版本差异通过 overlays 叠加。

**Tech Stack (Implementation Phase):** React 19, Ant Design (v6 目标), Tailwind, TypeScript, Zod, Node test runner (`node --experimental-transform-types --test`).

### Task 1: Core Rule Engine（Expr/Condition/Rule）

**Files:**
- Create: `Code/SchemaRenderer/runtime/expr.ts`
- Create: `Code/SchemaRenderer/runtime/condition.ts`
- Create: `Code/SchemaRenderer/runtime/rules.ts`
- Test: `Code/SchemaRenderer/__tests__/expr.test.ts`
- Test: `Code/SchemaRenderer/__tests__/rules.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evalExpr } from '../runtime/expr';

describe('evalExpr', () => {
  it('handles eq/in/empty', () => {
    assert.equal(evalExpr({ op: 'eq', args: [{ value: 1 }, { value: 1 }] }), true);
    assert.equal(evalExpr({ op: 'in', args: [{ value: 'A' }, { value: ['A', 'B'] }] }), true);
    assert.equal(evalExpr({ op: 'empty', args: [{ value: '' }] }), true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `node --experimental-transform-types --test Code/SchemaRenderer/__tests__/expr.test.ts`  
Expected: FAIL with "evalExpr is not defined"

**Step 3: Write minimal implementation**

```ts
export const evalExpr = (expr: Expr): unknown => { /* minimal */ };
```

**Step 4: Run test to verify it passes**

Run: `node --experimental-transform-types --test Code/SchemaRenderer/__tests__/expr.test.ts`  
Expected: PASS

**Step 5: Commit**

```bash
git add Code/SchemaRenderer/runtime/expr.ts Code/SchemaRenderer/__tests__/expr.test.ts
git commit -m "feat: add expr evaluator"
```

### Task 2: Overlay Merge（Schema Builder）

**Files:**
- Create: `Code/SchemaRenderer/buildSchema.ts`
- Test: `Code/SchemaRenderer/__tests__/buildSchema.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildSchema } from '../buildSchema';

describe('buildSchema', () => {
  it('applies add/remove/patch overlays', () => {
    const base = { tabs: [], sections: [], fields: [], rules: [], overlays: [] } as any;
    const schema = buildSchema(base, { version: 'x', addFields: [{ key: 'a' }] });
    assert.equal(schema.fields.some((f: any) => f.key === 'a'), true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `node --experimental-transform-types --test Code/SchemaRenderer/__tests__/buildSchema.test.ts`  
Expected: FAIL

**Step 3: Write minimal implementation**

```ts
export const buildSchema = (...) => { /* minimal */ };
```

**Step 4: Run test to verify it passes**

Run: `node --experimental-transform-types --test Code/SchemaRenderer/__tests__/buildSchema.test.ts`

**Step 5: Commit**

```bash
git add Code/SchemaRenderer/buildSchema.ts Code/SchemaRenderer/__tests__/buildSchema.test.ts
git commit -m "feat: add schema overlay builder"
```

### Task 3: Zod Validation + 中文错误映射

**Files:**
- Create: `Code/SchemaRenderer/validation.ts`
- Test: `Code/SchemaRenderer/__tests__/validation.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mapZodError } from '../validation';

describe('mapZodError', () => {
  it('maps required error to zh', () => {
    const msg = mapZodError([{ path: ['a'], message: 'Required' }]);
    assert.equal(msg[0].message.includes('必填'), true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `node --experimental-transform-types --test Code/SchemaRenderer/__tests__/validation.test.ts`  
Expected: FAIL

**Step 3: Write minimal implementation**

```ts
export const mapZodError = (...) => { /* minimal */ };
```

**Step 4: Run test to verify it passes**

Run: `node --experimental-transform-types --test Code/SchemaRenderer/__tests__/validation.test.ts`

**Step 5: Commit**

```bash
git add Code/SchemaRenderer/validation.ts Code/SchemaRenderer/__tests__/validation.test.ts
git commit -m "feat: add zod error mapping"
```

### Task 4: React SchemaRenderer 基础组件

**Files:**
- Create: `Code/SchemaRenderer/components/SchemaRenderer.tsx`
- Create: `Code/SchemaRenderer/components/FieldRenderer.tsx`
- Create: `Code/SchemaRenderer/components/TableRenderer.tsx`
- Create: `Code/SchemaRenderer/components/SectionRenderer.tsx`
- Create: `Code/SchemaRenderer/components/TabRenderer.tsx`

**Step 1: Write the failing test**

```ts
// React 暂时移除；测试栈不在当前阶段。
```

**Step 2: Run test to verify it fails**

Run: `暂不执行（当前阶段仅规则需求）`

**Step 3: Write minimal implementation**

```tsx
export const SchemaRenderer = (...) => { /* minimal */ };
```

**Step 4: Run test to verify it passes**

Run: `暂不执行（当前阶段仅规则需求）`

**Step 5: Commit**

```bash
git add Code/SchemaRenderer/components
git commit -m "feat: add schema renderer components"
```

### Task 5: 示例 Schema（CMRT 6.5 / EMRT / CRT）

**Files:**
- Create: `Code/SchemaRenderer/schemas/cmrt-6.5.ts`
- Create: `Code/SchemaRenderer/schemas/emrt-2.1.ts`
- Create: `Code/SchemaRenderer/schemas/crt-2.21.ts`

**Step 1: Write the failing test**

```ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { cmrt65 } from '../schemas/cmrt-6.5';

describe('cmrt schema', () => {
  it('has declaration tab', () => {
    assert.equal(cmrt65.tabs.some((t) => t.key === 'declaration'), true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `node --experimental-transform-types --test Code/SchemaRenderer/__tests__/schema.test.ts`

**Step 3: Write minimal implementation**

```ts
export const cmrt65: SchemaBundle = { /* minimal */ };
```

**Step 4: Run test to verify it passes**

Run: `node --experimental-transform-types --test Code/SchemaRenderer/__tests__/schema.test.ts`

**Step 5: Commit**

```bash
git add Code/SchemaRenderer/schemas
git commit -m "feat: add initial schemas"
```

### Task 6: Adapter 层（接口 data ↔ schema）

**Files:**
- Create: `Code/SchemaRenderer/adapters/cmrt.ts`
- Create: `Code/SchemaRenderer/adapters/emrt.ts`
- Create: `Code/SchemaRenderer/adapters/crt.ts`
- Test: `Code/SchemaRenderer/__tests__/adapter.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCmrt } from '../adapters/cmrt';

describe('normalizeCmrt', () => {
  it('maps backend data to canonical shape', () => {
    const result = normalizeCmrt({ data: { name: 'RMI_CMRT_6.5' } } as any);
    assert.equal(result.name, 'RMI_CMRT_6.5');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `node --experimental-transform-types --test Code/SchemaRenderer/__tests__/adapter.test.ts`

**Step 3: Write minimal implementation**

```ts
export const normalizeCmrt = (...) => { /* minimal */ };
```

**Step 4: Run test to verify it passes**

Run: `node --experimental-transform-types --test Code/SchemaRenderer/__tests__/adapter.test.ts`

**Step 5: Commit**

```bash
git add Code/SchemaRenderer/adapters
git commit -m "feat: add adapters"
```
