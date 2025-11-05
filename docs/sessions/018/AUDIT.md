# 🔍 Comprehensive Audit Report

## Executive Summary

**Critical Issues Found:**

1. **Mixed Result Types** - OLD `Result<T, string>` pattern vs NEW `ParseResult<T>` / `GenerateResult`
2. **Missing Generator** - `b_declarations/src/generator.ts` does not exist
3. **Error Throwing** - `gradient/index.ts` throws instead of returning `GenerateResult`
4. **Validation vs Representation** - Code rejects invalid inputs instead of gathering issues

---

## Issue #1: Mixed Result Type System

### Current State

Two competing Result type systems exist:

**OLD Pattern (core.ts):**

- `Result<T, E>` - Simple success/failure
- Uses `ok(value)` and `err(error)`
- Error is a single value (often string)
- **Used by:** All parsers, property definitions, declarations

**NEW Pattern (parse.ts/generate.ts):**

- `ParseResult<T>` and `GenerateResult`
- Contains `issues: Issue[]` array
- Allows warnings + success (partial success)
- Follows W3C CSS spec philosophy: "gather issues, don't reject"
- **Used by:** Generators only

### Files Using OLD Pattern

**b_declarations:**

- `src/parser.ts` - Returns `Result<DeclarationResult, string>`
- `src/types.ts` - `PropertyDefinition.parser: (value: string) => Result<T, string>`
- `src/properties/background-image.ts` - Returns `Result<BackgroundImageIR, string>`
- `src/utils/keywords.ts` - Returns `Result<string, string>`

**b_parsers (22+ files):**

- `src/gradient/linear.ts` - `Result<Type.LinearGradient, string>`
- `src/gradient/radial.ts` - `Result<Type.RadialGradient, string>`
- `src/gradient/conic.ts` - `Result<Type.ConicGradient, string>`
- `src/gradient/color-stop.ts` - `Result<Type.ColorStop, string>`
- `src/color/*.ts` (8 files) - All use `Result<ColorType, string>`
- `src/angle.ts` - `Result<Type.Angle, string>`
- `src/length.ts` - `Result<Type.Length, string>`
- `src/position.ts` - `Result<Type.PositionValue, string>`
- `src/url.ts` - `Result<Url, string>`

### Problem

Parsers return `Result<T, string>` but should return `ParseResult<T>` to:

- Track multiple issues (not just first error)
- Allow warnings without failure
- Follow W3C spec: represent what we can, report issues

---

## Issue #2: Missing b_declarations/src/generator.ts

### Current State

- ✅ `b_declarations/src/parser.ts` exists - parses CSS → IR
- ❌ `b_declarations/src/generator.ts` missing - should generate IR → CSS

### Expected Structure

```typescript
// packages/b_declarations/src/generator.ts
import { generateOk, generateErr, type GenerateResult } from "@b/types";
import { propertyRegistry } from "./registry";

/**
 * Generate CSS declaration from IR.
 * Should mirror parser.ts structure.
 */
export function generateDeclaration(input: { property: string; ir: unknown }): GenerateResult {
  // 1. Lookup property definition
  // 2. Call property's generator function
  // 3. Return GenerateResult
}
```

### Additional Required Changes

- `PropertyDefinition` needs `generator` field (like `parser`)
- Properties need to register generators (currently only have parsers)
- Each property file needs generator function

---

## Issue #3: gradient/index.ts Throws Errors

### Current Code

```typescript
// packages/b_generators/src/gradient/index.ts:33
if (!result.ok) {
  throw new Error(`Failed to generate gradient: ...`);
}
return result.value; // Returns string, not GenerateResult
```

### Problem

- Convenience function throws on failure
- Unwraps `GenerateResult` → returns raw `string`
- Violates "gather issues, don't throw" principle

### Solution Options

**Option A: Remove throw, return GenerateResult**

```typescript
export function generate(gradient: Gradient): GenerateResult {
  switch (gradient.kind) {
    case "linear":
      return Linear.generate(gradient);
    case "radial":
      return Radial.generate(gradient);
    case "conic":
      return Conic.generate(gradient);
  }
}
```

**Option B: Rename to indicate unwrapping**

```typescript
// Keep current for convenience, but rename
export function generateUnsafe(gradient: Gradient): string {
  const result = generate(gradient);
  if (!result.ok) throw new Error(...);
  return result.value;
}

// Add safe version
export function generate(gradient: Gradient): GenerateResult { ... }
```

---

## Issue #4: Early Returns on Errors

### Examples from background-image.ts

**Lines 76-78:**

```typescript
const urlResult = Parsers.Url.parseUrl(layer);
if (!urlResult.ok) {
  return err(`Invalid url() in background-image: ${urlResult.error}`);
}
```

**Lines 89-91, 102-104, 115-117:**
Same pattern - returns error immediately instead of:

- Recording the issue
- Attempting to continue parsing
- Collecting all issues before deciding success/failure

### W3C CSS Spec Philosophy

From CSS spec: Parsers should be "forgiving" and represent as much as possible:

- Parse what we can understand
- Skip what we don't
- Report all issues (not just first)
- Still produce usable IR when possible

### Example Fix Pattern

**Before:**

```typescript
if (!result.ok) {
  return err(`Failed: ${result.error}`);
}
```

**After:**

```typescript
if (!result.ok) {
  issues.push(createError("invalid-value", `Failed: ${result.error}`));
  // Optionally continue or use fallback
  continue; // Skip this layer, try next
}
```

---

## Recommended Migration Strategy

### Phase 1: Foundation (High Priority)

1. ✅ Create `b_declarations/src/generator.ts`
2. ✅ Add `generator` field to `PropertyDefinition` type
3. ✅ Fix `gradient/index.ts` to not throw

### Phase 2: Parsers (Medium Priority - Large Scope)

4. ⚠️ Update all parser signatures: `Result<T, string>` → `ParseResult<T>`
5. ⚠️ Update all parser implementations to gather issues
6. ⚠️ Update all property parsers to use new pattern

**Files affected:** ~30+ files across b_parsers and b_declarations

### Phase 3: Property Generators (Medium Priority)

7. ✅ Create generator functions for each property
8. ✅ Register generators in property definitions
9. ✅ Add generator tests

**Files affected:** Each property in b_declarations/src/properties/

### Phase 4: Forgiving Parsing (Lower Priority - Ongoing)

10. 🔄 Refactor parsers to be more forgiving
11. 🔄 Don't early-return on errors where we can continue
12. 🔄 Collect all issues before returning

---

## Scope Assessment

### Small Changes (Can do now)

- Create `generator.ts` in b_declarations
- Fix `gradient/index.ts` throw
- Add `generator` to `PropertyDefinition`

### Medium Changes (Session 019 scope)

- Create generators for 1-3 properties (e.g., background-image)
- Test generator integration

### Large Changes (Multi-session)

- Migrate all parsers to `ParseResult<T>`
- Make parsers forgiving (gather vs reject)
- Full property generator coverage

---

## Proposed Session 019 Plan

**Focus:** Address critical issues, lay foundation for generators

**Goals:**

1. ✅ Create `b_declarations/src/generator.ts` (mirror of parser.ts)
2. ✅ Add `generator` field to `PropertyDefinition` type
3. ✅ Fix `gradient/index.ts` to return `GenerateResult` (no throw)
4. ✅ Create generator for `background-image` property
5. ✅ Add tests for declaration generation
6. 📝 Document migration path for parsers (ADR)

**Out of Scope:**

- Migrating all parsers to `ParseResult` (Phase 2 - future session)
- Making parsers forgiving (Phase 4 - future session)
- Creating generators for all properties (Phase 3 - future sessions)

**Success Criteria:**

- `generateDeclaration()` function works for background-image
- Tests passing: `generateDeclaration({ property: "background-image", ir }).value === "url(...), linear-gradient(...)"`
- No breaking changes to existing code
- Clear path documented for future migration

---
