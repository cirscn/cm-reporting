# Company Question Required Indicators Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 补齐按矿产公司题的必填显示，让必填矿产在界面上有明确星号，并保持空值高亮。

**Architecture:** 只改 `CompanyQuestionsForm` 的按矿产渲染层，不改门控规则和校验逻辑。测试先锁定 `EMRT 2.1` 的问题 C，再用最小代码补星号展示。

**Tech Stack:** React 19、Ant Design 6、Vitest、SSR 字符串断言

---

### Task 1: 补失败测试

**Files:**
- Create: `app/src/lib/ui/forms/CompanyQuestionsForm.requiredIndicators.test.tsx`

**Step 1: Write the failing test**

验证 `EMRT 2.1` 的问题 C 在矿产必填且为空时：
- 矿产名旁边有必填星号
- 答案下拉带 `field-required-empty`

### Task 2: 实现最小修复

**Files:**
- Modify: `app/src/lib/ui/forms/CompanyQuestionsForm.tsx`

**Step 1: Add explicit required marker**

在按矿产公司题的矿产名旁边补一个显式红色 `*`，避免依赖无 label 的 `Form.Item`。

### Task 3: 验证

**Files:**
- Test: `app/src/lib/ui/forms/CompanyQuestionsForm.requiredIndicators.test.tsx`

**Step 1: Run targeted test**

先跑单测，再跑仓库要求的完整校验。
