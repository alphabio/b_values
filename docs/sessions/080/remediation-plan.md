# Nuanced Audit Report & Remediation Plan

**Date:** 2025-11-19
**Session:** 080
**Status:** ⚠️ ISSUES FOUND

## 🚨 Executive Summary

The nuanced audit revealed **35 violations** of the Gold Standard across 3 categories. While the high-level architecture is sound, there is significant "pattern drift" in older properties.

## 🔍 Detailed Findings

### 1. Keywords & Types (22 Violations)

**Issue:** Missing `z.infer<typeof ...>` pattern in `types.ts`.
**Impact:** Type definitions are manually maintained instead of inferred from Zod schemas, leading to potential drift.
**Affected Properties:**

- `animation-*` (direction, fill-mode, play-state)
- `border-*-style`, `border-*-width` (all sides)
- `font-*` (family, size, stretch, variant, weight)
- `text-*` (align, overflow, transform)
- `transform-style`, `visibility`, `white-space`

### 2. Parsers & Generators (4 Violations)

**Issue:** Manual AST inspection of Dimension/Number nodes instead of delegating to `@b/parsers`.
**Impact:** Inconsistent parsing logic, potential bugs with unitless zeros or complex values.
**Affected Properties:**

- `animation-iteration-count`
- `font-weight`
- `opacity`
- `perspective`

### 3. Units & Values (9 Violations)

**Issue:** Properties accept units/numbers but do not import/use `CssValue`.
**Impact:** Lack of support for `var()`, `calc()`, `attr()`, and standard unit normalization.
**Affected Properties:**

- `animation-delay`, `animation-duration`, `animation-iteration-count`
- `font-style`, `font-weight`
- `opacity`, `perspective`
- `transition-delay`, `transition-duration`

## 🛠️ Remediation Plan

I propose a **3-Phase Remediation Strategy**:

### Phase 1: Type Inference Fix (Low Risk)

**Goal:** Convert manual types to `z.infer`.
**Action:** Update `types.ts` for all 22 properties.
**Example:**

```typescript
- export type TextAlignKeyword = "start" | "end" ...;
+ export type TextAlignKeyword = z.infer<typeof Keywords.textAlignKeywordSchema>;
```

### Phase 2: CssValue Integration (Medium Risk)

**Goal:** Enable `CssValue` support for unit properties.
**Action:** Update `types.ts` to include `CssValue` and update `parser.ts` to use `Parsers.Utils.parseNodeToCssValue`.
**Target:** `animation-*`, `transition-*`, `opacity`, `perspective`.

### Phase 3: Parser Delegation (Medium Risk)

**Goal:** Remove manual AST inspection.
**Action:** Refactor `parser.ts` to delegate to `Parsers.Length` / `Parsers.Number`.
**Target:** `font-weight`, `opacity`, `perspective`.

## 📅 Execution Order

1. **Phase 1** (Quick win, high volume)
2. **Phase 2** (High value, enables `var()`)
3. **Phase 3** (Cleanup)
