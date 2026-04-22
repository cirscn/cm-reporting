# Smelter Header Alignment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 让 `CMRT / EMRT / CRT / AMRT` 的 `Smelter List` 表头顺序、文案和显隐规则对齐各自 Excel 模板，同时保留现有后端字段不变。

**Architecture:** 先按模板把版本差异归并成少数几组表头规则，再把规则下沉到版本化配置，避免继续把版本判断堆进 `SmelterListTable`。表格组件只负责按配置出列；测试分别锁定“模板组映射”和“最终渲染结果”。

**Tech Stack:** React 19、TypeScript、Ant Design 6、Vitest、pnpm。

---

### Task 1: 固化模板分组规则

**Files:**
- Modify: `E:\projects\cm-reporting\app\src\lib\core\registry\types.ts`
- Modify: `E:\projects\cm-reporting\app\src\lib\core\registry\templates\cmrt\base.ts`
- Modify: `E:\projects\cm-reporting\app\src\lib\core\registry\templates\crt\base.ts`
- Modify: `E:\projects\cm-reporting\app\src\lib\core\registry\templates\emrt\base.ts`
- Modify: `E:\projects\cm-reporting\app\src\lib\core\registry\templates\amrt\base.ts`

**Step 1: 写失败测试**

在 `SmelterListTable` 新测试里断言以下模板组差异：
- `CMRT 6.5` 第一列是“冶炼厂识别号码输入列”
- `EMRT 2.1` 第三列是“冶炼厂查找 (*)”
- `AMRT 1.1` 不显示“冶炼厂识别号码输入列”
- `AMRT 1.3` 仍显示识别号码列，但不显示 lookup 列

**Step 2: 运行测试确认失败**

Run: `pnpm vitest run src/lib/ui/tables/SmelterListTable.header.test.tsx`

Expected: 失败，当前列顺序/文案与模板不一致。

**Step 3: 写最小实现**

给 `SmelterListConfig` 增加表头配置字段，至少覆盖：
- 列顺序
- 文案 key 或直出文案
- 是否显示 `smelterNumber`
- 是否显示 `smelterLookup`
- 是否显示 `combinedMetal/combinedSmelter`

**Step 4: 重新跑测试**

Run: `pnpm vitest run src/lib/ui/tables/SmelterListTable.header.test.tsx`

Expected: 通过。

### Task 2: 改造 SmelterListTable 出列逻辑

**Files:**
- Modify: `E:\projects\cm-reporting\app\src\lib\ui\tables\SmelterListTable.tsx`
- Test: `E:\projects\cm-reporting\app\src\lib\ui\tables\SmelterListTable.header.test.tsx`

**Step 1: 写失败测试**

测试里渲染至少 4 个版本：
- `cmrt@6.5`
- `crt@2.21`
- `emrt@2.1`
- `amrt@1.1`

断言表头顺序和显隐与模板一致，且不出现：
- `Standard Smelter Name`
- `Country Code`
- `State / Province Code`

**Step 2: 运行测试确认失败**

Run: `pnpm vitest run src/lib/ui/tables/SmelterListTable.header.test.tsx`

Expected: 失败，当前组件仍按旧逻辑固定出列。

**Step 3: 写最小实现**

改造 `SmelterListTable`：
- 先构建所有候选列定义
- 再按配置顺序组装可见列
- 去掉硬编码的 `hasCombinedColumn` 直接 push 顺序
- 将模板文案通过新 key 或版本化文案配置输出

**Step 4: 重新跑测试**

Run: `pnpm vitest run src/lib/ui/tables/SmelterListTable.header.test.tsx`

Expected: 通过。

### Task 3: 保住已有只读与交互行为

**Files:**
- Modify: `E:\projects\cm-reporting\app\src\lib\ui\tables\SmelterListTable.readOnly.test.tsx`
- Modify: `E:\projects\cm-reporting\app\src\lib\ui\tables\SmelterListTable.tsx`

**Step 1: 写失败测试**

补一个版本差异测试，确保：
- 列头改了后，`smelterNumber / smelterIdentification / sourceId / country` 在只读态仍禁用
- lookup 存在的版本仍能出 `smelterLookup`
- lookup 不存在的版本不会错误渲染该列

**Step 2: 运行测试确认失败**

Run: `pnpm vitest run src/lib/ui/tables/SmelterListTable.readOnly.test.tsx`

Expected: 如出列逻辑破坏占位符或渲染路径，测试失败。

**Step 3: 写最小实现**

只修列装配顺序和条件，不动字段编辑逻辑、不改后端字段。

**Step 4: 重新跑测试**

Run: `pnpm vitest run src/lib/ui/tables/SmelterListTable.readOnly.test.tsx`

Expected: 通过。

### Task 4: 更新对外说明

**Files:**
- Modify: `E:\projects\cm-reporting\app\src\lib\README.md`
- Modify: `E:\projects\cm-reporting\app\src\examples\README.md`
- Modify: `E:\projects\cm-reporting\skills\cm-reporting-integration\SKILL.md`
- Create: `E:\projects\cm-reporting\app\.changeset\<generated>.md`

**Step 1: 写文档改动**

补充说明：
- 表头按模板版本对齐
- UI 表头与后端字段不是一回事
- `Standard Smelter Name / Country Code / State / Province Code` 不在 UI 中显示

**Step 2: 生成 changeset**

Run: `pnpm changeset`

Expected: 生成中文说明的 patch changeset。

### Task 5: 全量校验

**Files:**
- Verify only

**Step 1: 运行针对性测试**

Run: `pnpm vitest run src/lib/ui/tables/SmelterListTable.header.test.tsx src/lib/ui/tables/SmelterListTable.readOnly.test.tsx`

Expected: 全通过。

**Step 2: 运行仓库强制校验**

Run: `pnpm lint`

Run: `pnpm exec tsc -b --pretty false`

Run: `pnpm test`

Run: `pnpm sg:scan`

Expected: 全通过。

**Step 3: 交付说明**

输出一张最终对照表：
- 当前 UI 表头
- 前端字段
- 后端字段
- 是否模板必显
