# Action Plan: Comprehensive CssValue Support

**Date:** 2025-11-06
**Based on:** css-values-parse.md (1552 lines)
**Status:** Planning Phase

---

## Executive Summary

The document outlines a comprehensive architecture for supporting ALL CSS value types through proper parsing/generation infrastructure. Key insight: **Don't handle individual functions in isolation** - create a centralized dispatcher that routes function parsing to specialized modules.

### Current State vs Document Recommendations

**What We Have:**

- ✅ Basic CssValue types (literal, keyword, variable)
- ✅ Color parsing with CssValue components (h, s, l use CssValue)
- ✅ `cssValueToCss` utility in `@b/utils`
- ✅ `parseCssValueNode` in `@b/utils`
- ⚠️ Color generator doesn't handle `var()` as complete color

**What's Missing (Per Document):**

- ❌ Centralized function dispatcher
- ❌ `calc()`, `min()`, `max()`, `clamp()` parsers
- ❌ Transform functions (translate, rotate, scale)
- ❌ Time/Frequency types
- ❌ String literal and Hash handling in parseCssValueNode
- ❌ Generic function fallback in parseCssValueNode

---

## Phase 1: Fix Immediate var() Issue (Current Session Goal)

### Task 1.1: Add Variable Case to Color Generator

**File:** `packages/b_generators/src/color/color.ts`
**Action:** Add case for `"variable"` that uses `cssValueToCss`

```typescript
case "variable":
  // Variable can represent any color type
  return generateOk(cssValueToCss(color as CssValue));
```

**Estimated Time:** 5 minutes
**Dependencies:** None - `cssValueToCss` already imported via utils
**Test:** Run agent.ts with var() test cases

### Task 1.2: Verify and Test

**Files:**

- `packages/b_values/src/agent.ts` (test runner)
- Quality checks

**Actions:**

1. Test var() as complete color
2. Test var() in gradient with angle
3. Run full test suite
4. Run quality checks

**Estimated Time:** 10 minutes

---

## Phase 2: Create Function Dispatcher Infrastructure

### Task 2.1: Create Math Module Structure

**Location:** `packages/b_parsers/src/math/`
**Files to Create:**

- `calc.ts` - calc() parser
- `minmax.ts` - min()/max() parser
- `clamp.ts` - clamp() parser
- `index.ts` - barrel export

**Estimated Time:** 2-3 hours
**Dependencies:** Requires `parseCssValueNode` from `@b/utils`

### Task 2.2: Create Function Dispatcher

**File:** `packages/b_parsers/src/function-dispatcher.ts` (NEW)
**Purpose:** Central routing for complex function parsing

**Key Structure:**

```typescript
const PARSER_MAP = {
  // Math
  calc: parseCalcFunction,
  min: parseMinmaxFunction,
  max: parseMinmaxFunction,
  clamp: parseClampFunction,

  // Color (already exist, just register)
  rgb: parseRgbFunction,
  rgba: parseRgbFunction,
  hsl: parseHslFunction,
  // ... etc
};

export function parseComplexFunction(node: FunctionNode): ParseResult<CssValue> | null;
```

**Estimated Time:** 1 hour
**Dependencies:** Task 2.1

### Task 2.3: Update parseCssValueNode

**File:** `packages/b_utils/src/parse/css-value-parser.ts`
**Actions:**

1. Add String literal handling (case "String")
2. Add Hash handling (case "Hash")
3. Update Function handling:
   - Keep var() inline
   - Delegate to parseComplexFunction for known functions
   - Fall back to generic function IR for unknown

**Estimated Time:** 1 hour
**Dependencies:** Task 2.2

---

## Phase 3: Transform Functions Support

### Task 3.1: Define Transform Types

**Location:** `packages/b_types/src/transform/`
**Files to Create:**

- `index.ts` - All transform schemas and types

**Schemas Needed:**

- `translateSchema` (translate, translateX/Y/Z, translate3d)
- `rotateSchema` (rotate, rotateX/Y/Z, rotate3d)
- `scaleSchema` (scale, scaleX/Y/Z, scale3d)
- `transformFunctionSchema` (union of above)
- `transformListSchema` (array of functions)

**Estimated Time:** 1-2 hours

### Task 3.2: Create Transform Parsers

**Location:** `packages/b_parsers/src/transform/`
**Files to Create:**

- `index.ts` - Transform function parsers

**Functions:**

- `parseTranslateFunction()`
- `parseRotateFunction()`
- `parseScaleFunction()`
- `parseTransformFunction()` (dispatcher)

**Estimated Time:** 2-3 hours
**Dependencies:** Task 3.1

### Task 3.3: Create Transform Generators

**Location:** `packages/b_generators/src/transform/`
**Files to Create:**

- `index.ts` - Transform function generators

**Estimated Time:** 1-2 hours
**Dependencies:** Task 3.2

### Task 3.4: Register Transforms in Dispatcher

**File:** `packages/b_parsers/src/function-dispatcher.ts`
**Action:** Add all transform variants to PARSER_MAP

**Estimated Time:** 15 minutes
**Dependencies:** Task 3.2

---

## Phase 4: Time and Frequency Support

### Task 4.1: Define Time/Frequency Units

**Location:** `packages/b_units/src/`
**Files to Create:**

- `time.ts` - Time units (s, ms)
- `frequency.ts` - Frequency units (Hz, kHz)

**Estimated Time:** 30 minutes

### Task 4.2: Define Time/Frequency Types

**Location:** `packages/b_types/src/`
**Files to Create:**

- `time.ts` - Time schema
- `frequency.ts` - Frequency schema

**Estimated Time:** 30 minutes
**Dependencies:** Task 4.1

### Task 4.3: Create Time/Frequency Parsers

**Location:** `packages/b_parsers/src/`
**Files to Create or Update:**

- Parser utilities for time/frequency values

**Estimated Time:** 1 hour
**Dependencies:** Task 4.2

---

## Phase 5: Math Function Generators

### Task 5.1: Create Math Generators

**Location:** `packages/b_generators/src/math/`
**Files to Create:**

- `calc.ts` - Generate calc() CSS
- `minmax.ts` - Generate min()/max() CSS
- `clamp.ts` - Generate clamp() CSS
- `index.ts` - Barrel export

**Estimated Time:** 1-2 hours
**Dependencies:** Phase 2 complete

---

## Phase 6: Testing and Documentation

### Task 6.1: Create Comprehensive Tests

**For Each Module:**

- Parser tests (valid/invalid inputs)
- Generator tests (round-trip)
- Integration tests (complex nesting)

**Estimated Time:** 4-6 hours

### Task 6.2: Update Documentation

**Files to Update:**

- Architecture docs
- API documentation
- Example usage

**Estimated Time:** 2-3 hours

---

## Dependency Graph

```
Phase 1: var() Fix (IMMEDIATE)
  └─> No dependencies

Phase 2: Function Dispatcher
  ├─> Task 2.1: Math Module
  ├─> Task 2.2: Dispatcher (depends on 2.1)
  └─> Task 2.3: Update parseCssValueNode (depends on 2.2)

Phase 3: Transforms
  ├─> Task 3.1: Types
  ├─> Task 3.2: Parsers (depends on 3.1)
  ├─> Task 3.3: Generators (depends on 3.2)
  └─> Task 3.4: Register (depends on 3.2, Phase 2)

Phase 4: Time/Frequency
  ├─> Task 4.1: Units
  ├─> Task 4.2: Types (depends on 4.1)
  └─> Task 4.3: Parsers (depends on 4.2)

Phase 5: Math Generators
  └─> Depends on Phase 2

Phase 6: Testing/Docs
  └─> Depends on all previous phases
```

---

## Time Estimates

| Phase     | Minimum    | Maximum    | Priority     |
| --------- | ---------- | ---------- | ------------ |
| Phase 1   | 15 min     | 30 min     | **CRITICAL** |
| Phase 2   | 4 hrs      | 5 hrs      | High         |
| Phase 3   | 5 hrs      | 8 hrs      | Medium       |
| Phase 4   | 2 hrs      | 3 hrs      | Medium       |
| Phase 5   | 1 hr       | 2 hrs      | Medium       |
| Phase 6   | 6 hrs      | 9 hrs      | Low          |
| **TOTAL** | **18 hrs** | **27 hrs** |              |

---

## Recommended Approach

### Iteration 1 (This Session): Fix var() - 30 minutes

- Complete Phase 1
- Validate with quality checks
- Document findings

### Iteration 2: Core Infrastructure - 6-8 hours

- Complete Phase 2 (Function Dispatcher)
- Complete Phase 5 (Math Generators)
- Basic testing

### Iteration 3: Extended Support - 10-12 hours

- Complete Phase 3 (Transforms)
- Complete Phase 4 (Time/Frequency)
- Comprehensive testing

### Iteration 4: Polish - 3-4 hours

- Complete Phase 6 (Testing/Docs)
- Performance optimization
- Edge case handling

---

## Key Architectural Insights from Document

1. **Avoid Circular Dependencies:** Don't put complex parsers in `@b/utils` - use `@b/parsers` as the home for domain logic

2. **Centralized Dispatch:** The function-dispatcher pattern prevents duplication and ensures consistent error handling

3. **Progressive Enhancement:** Start with basic structure, add specialized handlers incrementally

4. **Type Safety:** Use discriminated unions for function variants (translate/translateX/translateY)

5. **Partial IR:** Always try to preserve partial structure even on parse errors for better error messages

---

## Next Steps

1. **Execute Phase 1** (var() fix) - IMMEDIATE
2. Get user approval for Phase 2 scope
3. Create detailed task breakdown for Phase 2
4. Begin implementation
