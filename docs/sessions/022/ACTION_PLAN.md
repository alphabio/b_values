# Action Plan - Session 022: Architecture Refinement

**Date:** 2025-11-05
**Focus:** Implement feedback from architecture review
**Estimated Total Time:** 4-6 hours

---

## 🎯 Overview

Refine error handling patterns and package structure based on comprehensive architecture review. Four key areas identified, prioritized by impact and alignment with ADR 002 (Rich Error Messaging).

---

## 📋 Phase 1: Multi-Error Reporting (HIGH PRIORITY)

**Goal:** Replace fail-fast strategy with error collection in parsers

**Why First:**

- Highest value for developer experience
- Aligns with ADR 002 vision
- Foundational for future error improvements
- Leverages existing `ParseResult` type

**Estimated Time:** 2-3 hours

### Task 1.1: Refactor `parseBackgroundImage`

**File:** `packages/b_declarations/src/properties/background-image/parser.ts`

**Changes:**

1. Collect all layer parse results (don't return on first error)
2. Aggregate issues from all layers
3. Return successful layers + all issues
4. Set `ok: false` if any errors exist

**Pattern:**

```typescript
const layerResults: ParseResult<ImageLayer>[] = [];

for (const layerStr of layerStrings) {
  // Parse each layer
  if (layer.startsWith("url(")) {
    const urlResult = Parsers.Url.parseUrl(layer);
    layerResults.push(urlResult.ok ? parseOk({ kind: "url", url: urlResult.value.value }) : urlResult);
    continue;
  }
  // ... handle other layer types
}

// Aggregate
const allIssues = layerResults.flatMap((r) => r.issues);
const successfulLayers = layerResults.filter((r) => r.ok).map((r) => r.value);
const finalValue: BackgroundImageIR = { kind: "layers", layers: successfulLayers };

// Return with all issues
if (allIssues.some((i) => i.severity === "error")) {
  return { ok: false, value: finalValue, issues: allIssues, property: "background-image" };
}
return parseOk(finalValue, "background-image");
```

**Tests to Update:**

- `packages/b_declarations/src/properties/background-image/parser.test.ts`
- Verify error assertions expect multiple issues

### Task 1.2: Refactor Gradient Parsers

**Files:**

- `packages/b_parsers/src/gradient/linear-gradient.ts`
- `packages/b_parsers/src/gradient/radial-gradient.ts`
- `packages/b_parsers/src/gradient/conic-gradient.ts`

**Changes:** Same pattern as 1.1 for color stop parsing

**Tests to Update:**

- `packages/b_parsers/src/gradient/*.test.ts`

### Task 1.3: Validation

- Run `just test` - all 942 tests must pass
- Run `just check` - all quality gates must pass
- Commit: `feat(parsers): implement multi-error collection strategy`

---

## 📋 Phase 2: Standardize Zod Validation (MEDIUM PRIORITY)

**Goal:** Consistent error handling in generators using existing helpers

**Why Second:**

- Improves consistency
- Leverages existing `zodErrorToIssues` helper
- Medium test impact

**Estimated Time:** 1-2 hours

### Task 2.1: Update `generateErr` Function

**File:** `packages/b_types/src/result/generate.ts`

**Changes:**

```typescript
export function generateErr(issues: Issue | Issue[], property?: string): GenerateResult {
  const result: GenerateResult = {
    ok: false,
    issues: Array.isArray(issues) ? issues : [issues],
  };
  if (property !== undefined) {
    result.property = property;
  }
  return result;
}
```

### Task 2.2: Apply `zodErrorToIssues` to All Color Generators

**Files:**

- `packages/b_generators/src/color/rgb.ts`
- `packages/b_generators/src/color/hsl.ts`
- `packages/b_generators/src/color/hwb.ts`
- `packages/b_generators/src/color/lab.ts`
- `packages/b_generators/src/color/lch.ts`
- `packages/b_generators/src/color/oklab.ts`
- `packages/b_generators/src/color/oklch.ts`

**Pattern:**

```typescript
import { zodErrorToIssues } from "@b/utils";

export function generate(color: unknown): GenerateResult {
  const validation = rgbColorSchema.safeParse(color);
  if (!validation.success) {
    return generateErr(zodErrorToIssues(validation.error), "rgb-color");
  }
  // ... rest of logic
}
```

### Task 2.3: Update Test Assertions

**Files:**

- `packages/b_generators/src/color/*.test.ts`

**Changes:** Update error message expectations for new format

### Task 2.4: Validation

- Run `just test` - all tests must pass
- Run `just check` - all quality gates must pass
- Commit: `refactor(generators): standardize Zod validation with zodErrorToIssues`

---

## 📋 Phase 3: Structure & Code Smells (LOW PRIORITY)

**Goal:** Clean up package structure and remove code smells

**Why Third:**

- Low impact, quick wins
- No test changes needed

**Estimated Time:** 30 minutes

### Task 3.1: Reorganize `b_declarations` Structure

**Changes:**

```bash
# Move types.ts to top level
mv packages/b_declarations/src/core/types.ts packages/b_declarations/src/types.ts

# Update all imports that reference core/types
# (mostly in parser.ts, generator.ts, properties/*/definition.ts)
```

**Files to Update:**

- `packages/b_declarations/src/parser.ts`
- `packages/b_declarations/src/generator.ts`
- `packages/b_declarations/src/properties/background-image/definition.ts`

### Task 3.2: Fix Redundant Error Wrapping

**File:** `packages/b_declarations/src/parser.ts`

**Change:**

```typescript
// Before
if (!parseResult.ok) {
  return parseErr(createError("invalid-value", `Failed to parse ${property}: ${parseResult.issues[0]?.message}`));
}

// After (preserve all issues)
if (!parseResult.ok) {
  return parseResult;
}
```

### Task 3.3: Validation

- Run `just check` - verify no errors
- Run `just build` - verify builds
- Commit: `refactor(b_declarations): reorganize structure and remove code smells`

---

## 📋 Phase 4: Add Schema Strictness & New Property (VALIDATION)

**Goal:** Prove patterns work and catch IR typos

**Why Last:**

- New feature validation
- Demonstrates improved patterns
- Low risk

**Estimated Time:** 1 hour

### Task 4.1: Add `.strict()` to Zod Schemas

**Files:** All schemas in `packages/b_types/src/`

**Pattern:**

```typescript
export const rgbColorSchema = z
  .object({
    kind: z.literal("rgb"),
    r: cssValueSchema,
    g: cssValueSchema,
    b: cssValueSchema,
    alpha: cssValueSchema.optional(),
  })
  .strict(); // Add this
```

### Task 4.2: Implement Simple Property (e.g., `opacity`)

**New Files:**

```
packages/b_declarations/src/properties/opacity/
├── definition.ts
├── parser.ts
├── generator.ts
├── parser.test.ts
└── generator.test.ts
```

**Demonstrates:**

- Multi-error pattern (if applicable)
- Zod validation pattern
- Clean structure
- End-to-end flow

### Task 4.3: Validation

- Run `just test` - verify new property tests pass
- Run `just check` - all quality gates pass
- Commit: `feat(properties): add opacity property with strict validation`

---

## 🎯 Success Criteria

**After Each Phase:**

- ✅ All 942+ tests passing
- ✅ All quality gates passing (`just check`)
- ✅ Production build successful (`just build`)
- ✅ Zero TypeScript errors
- ✅ Zero lint warnings
- ✅ Conventional commit message

**Overall Success:**

- ✅ Consistent error handling patterns
- ✅ Multi-error reporting in all parsers
- ✅ Standardized Zod validation in generators
- ✅ Clean package structure
- ✅ Proof-of-concept property using all patterns
- ✅ Better developer experience with comprehensive errors

---

## 📊 Timeline Estimate

| Phase   | Tasks                 | Time | Cumulative |
| ------- | --------------------- | ---- | ---------- |
| Phase 1 | Multi-error reporting | 2-3h | 2-3h       |
| Phase 2 | Zod validation        | 1-2h | 3-5h       |
| Phase 3 | Structure cleanup     | 0.5h | 3.5-5.5h   |
| Phase 4 | Validation            | 1h   | 4.5-6.5h   |

**Total:** 4.5-6.5 hours across all phases

---

## 🚀 Next Action

**Ready to begin Phase 1: Multi-Error Reporting**

Awaiting user confirmation to proceed with:

- Task 1.1: Refactor `parseBackgroundImage`
- Task 1.2: Refactor gradient parsers
- Task 1.3: Update tests and validate

**Command:** "Start Phase 1" or specify alternative priority
