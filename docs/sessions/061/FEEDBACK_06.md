# Feedback 06 - Deep Dive: Consistency, Correctness & `parseErr` Audit

**Date:** 2025-11-10
**Source:** Comprehensive Architecture Review & Error Handling Audit

---

## Executive Summary

This feedback represents the most detailed architectural review of the `@b/*` monorepo to date. It confirms the foundation is **exceptionally strong** while identifying specific consistency issues to address before scaling to 50+ properties.

**Key Finding:** Your error model intent (contextual `property` stamping) is correct, but `parseErr` usage is inconsistent. Fixing this now prevents 50+ properties from perpetuating the pattern.

---

## 🎯 High-Level Architecture Validation

### ✅ What's Working Very Well

1. **Clear Layering**
   - `@b/types`: IR and results
   - `@b/keywords`, `@b/units`: vocab + primitives
   - `@b/parsers`: CSS → IR, AST-native, reusable utilities
   - `@b/generators`: IR → CSS, small focused modules
   - `@b/declarations`: property registry, property-level parsers/generators
   - `@b/values`: umbrella package

2. **Good Universal Rules**
   - CSS-wide keywords handled once at `parseDeclaration`, not in each property parser
   - Custom properties via `--*` template plus special parser
   - Property registry + `PropertyIRMap` for typed property names

3. **Good Error Model**
   - `ParseResult` and `GenerateResult` support partials and aggregated `issues`
   - Warnings vs errors are clearly separated

4. **Multi-Value Parse Abstraction**
   - `createMultiValueParser` is exactly what you want for 50+ properties

**Verdict:** Architecturally strong enough to scale. The work now is to eliminate minor inconsistencies, encode patterns, and automate.

---

## 🔧 Key Consistency & Correctness Issues

### 1. Duplicate/Conflicting Types in `types.ts`

**Issue:** `CSSDeclaration` and `DeclarationResult` defined twice in same file; commented-out `PropertyIRMap` alongside new import.

**Fix:** Clean, authoritative version provided in FEEDBACK_06_PATCHES.md

---

### 2. `createMultiValueParser` Drops Issues on Success

**Current Behavior:**

```typescript
if (!hasErrors) {
  return {
    ok: true,
    value: finalIR,
    issues: [], // ❌ Drops warnings!
  };
}
```

**Impact:** Loses non-fatal warnings from nested parsers. Inconsistent with rest of system.

**Fix:**

```typescript
const hasErrors = allIssues.some((i) => i.severity === "error");

return {
  ok: !hasErrors,
  value: finalIR,
  issues: allIssues, // ✅ Always propagate
};
```

---

### 3. CSS-Wide Keyword Handling vs Custom Properties

**Issue:** Universal handler short-circuits CSS-wide keywords for ALL properties, including custom properties.

**Problem:** For `--foo: initial`, CSS-wide keywords are NOT special per spec; they're just literal tokens. Current code incorrectly parses them as `{ kind: "keyword" }`.

**Fix:**

```typescript
// Skip custom properties for CSS-wide keyword check
if (!isCustomProperty(property)) {
  const trimmedValue = value.trim().toLowerCase();
  const wideKeywordCheck = Keywords.cssWide.safeParse(trimmedValue);

  if (wideKeywordCheck.success) {
    return parseOk({
      property,
      ir: { kind: "keyword", value: wideKeywordCheck.data } as never,
      ...(important ? { important: true } : {}),
    });
  }
}
```

---

### 4. Custom Property `rawValue` Flag Unused

**Issue:** `rawValue: true` is set but never read in dispatch logic.

**Current:**

```typescript
if (isCustomProperty(property)) {
  parseResult = unsafeCallParser(definition.parser, value);
} else if (definition.multiValue) { ... }
```

**Fix:**

```typescript
const isRaw = "rawValue" in definition && definition.rawValue === true;

if (isRaw || isCustomProperty(property)) {
  // Raw-value properties and custom properties get original string
  parseResult = unsafeCallParser(definition.parser, value);
} else if (definition.multiValue) {
  // Multi-value property: parser handles splitting
  parseResult = unsafeCallParser(definition.parser, value);
} else {
  // Single-value: parse to AST first
  let valueAst: csstree.Value;
  try {
    valueAst = csstree.parse(value, { context: "value", positions: true }) as csstree.Value;
  } catch (e: unknown) {
    const error = e as Error;
    return parseErr("InvalidSyntax", createError("invalid-syntax", error.message));
  }

  parseResult = unsafeCallParser(definition.parser, valueAst);
}
```

---

### 5. OKLCH Semantic Validation Bug

**Issue:** Using `checkAlpha()` for lightness validation.

**Problem:**

```typescript
checkAlpha(l, "l", "OKLCHColor"); // ❌ Wrong semantics
```

Lightness is NOT alpha:

- As `%`: 0-100%
- As number: 0-1

**Fix:** Dedicated helper:

```typescript
function checkOKLCHLightness(l: CssValue): Issue | undefined {
  if (l.kind !== "literal") return undefined;

  if (l.unit === "%") {
    return checkLiteralRange(l, 0, 100, { field: "l", unit: "%", typeName: "OKLCHColor" });
  }

  return checkLiteralRange(l, 0, 1, { field: "l", typeName: "OKLCHColor" });
}
```

---

## 🚨 Critical: `parseErr` Audit & Recommendations

### Original Intent (Correct)

Attach `property` so errors display with informational context to users.

### Current Reality (Inconsistent)

Three patterns observed:

**A) ✅ Correct: Property-aware call**

```typescript
return parseErr("background-size", createError("invalid-syntax", "Expected 1-2 size values"));
```

**B) ❌ Slightly Off: Semantic labels instead of property names**

```typescript
return parseErr("angle", createError("invalid-syntax", "..."));
return parseErr("color", createError("invalid-syntax", "..."));
return parseErr("InvalidSyntax", createError("invalid-syntax", "...")); // Worst
```

**Problem:** Users may see "angle" or "InvalidSyntax" instead of "background-image".

**C) ✅ Mixed/Stamped Later**

```typescript
// In parseDeclaration
const enrichedIssues = allIssues.map((issue) => ({
  ...issue,
  property,
}));
```

Good at declaration level, but inconsistent at parser level.

---

### Recommended Rules

**Rule 1: Low-level reusable parsers**

- Use stable domain name as context: `"angle"`, `"length"`, `"color"`, `"gradient"`
- Don't pretend it's the CSS property
- Declaration-level code sets real CSS `property`

**Rule 2: Property-specific parsers**

- Use the actual CSS property name: `"background-repeat"`

**Rule 3: Orchestrators (`parseDeclaration`)**

- Always stamp issues with actual property
- Already doing this correctly

**Rule 4: Don't use magic names**

- No `"InvalidSyntax"` or `"Function"` as property
- Use meaningful context labels

---

### Concrete Fixes

**A) AST Utils**

```typescript
// Before
return parseErr("InvalidSyntax", createError("invalid-syntax", "Failed to parse CSS"));

// After
return parseErr("css-ast", createError("invalid-syntax", "Failed to parse CSS"));
```

**B) Function Node**

```typescript
// Before
return parseErr("Function", createError("missing-value", "No function found"));

// After
return parseErr("function-node", createError("missing-value", "No function found"));
```

**C) Generic Value Parser**

```typescript
// Before
return parseErr("Unsupported", createError("unsupported-kind", "Unsupported node type"));

// After
return parseErr("css-value", createError("unsupported-kind", "Unsupported node type"));
```

---

## 🤖 TDD & Standardization Strategy

### Why TDD for This Codebase

**Perfect fit because:**

1. Schema-driven (Zod IR definitions)
2. Pattern-heavy (consistent property structure)
3. Subtle behaviors to protect (keywords, multi-value, issues)

**Not ceremony-heavy:** "Every pattern has standard harness; properties drop into it."

---

### Canonical TDD Loop Per Property

**Three standard tests:**

1. **Parsing examples:** CSS declarations → IR + ok/issues
2. **Generation examples:** IR → CSS string + issues
3. **Roundtrip:** CSS → parse → generate → compare

---

### Shared Test Harness

```typescript
// packages/b_declarations/test/property-test-utils.ts

export function runPropertyTests<TIR>(opts: {
  property: string;
  schema?: ZodType<TIR>; // Auto-validate IR structure
  parse?: ParseCase<TIR>[];
  generate?: GenerateCase<TIR>[];
  roundtrip?: RoundtripCase[];
}) {
  // Standardized assertions for all properties
  // Normalized comparisons
  // Schema validation if provided
  // Issue debugging on failure
}
```

---

### Per-Property Test Template

```typescript
// packages/b_declarations/src/properties/background-size/background-size.test.ts

import { runPropertyTests } from "../../test/property-test-utils";
import type { BackgroundSizeIR } from "./types";
import { backgroundSizeIRSchema } from "./types";

runPropertyTests<BackgroundSizeIR>({
  property: "background-size",
  schema: backgroundSizeIRSchema, // Auto-validates IR structure

  parse: [
    {
      css: "background-size: cover",
      expectOk: true,
      irContains: { kind: "keyword" },
    },
  ],

  generate: [
    {
      property: "background-size",
      ir: { kind: "keyword", value: "cover" } as BackgroundSizeIR,
      expectOk: true,
      expectValue: "background-size: cover",
    },
  ],

  roundtrip: [
    {
      css: "background-size: 10px 20px, cover",
    },
  ],
});
```

---

### Key Wins

**Standardization:**

- Same test structure for all properties
- No ad-hoc assertions
- Schema-driven validation

**Safety:**

- One core refactor + test run shows all inconsistencies
- Future properties can't drift from patterns

**Leverages existing architecture:**

- IR schemas as source of truth
- Result types
- `defineProperty` registry

---

## 🛠️ Property Scaffolding with `--from`

### Ruby-Style Generator

```bash
# Create new property from template
pnpm new-prop margin --from background-size

# Or from scratch with mode
pnpm new-prop font-family --mode multi --syntax "<family-name>#"
```

### What `--from` Does

1. **Clones structure** from existing property
2. **Rewrites identifiers**:
   - Property names (`background-size` → `margin`)
   - IR types (`BackgroundSizeIR` → `MarginIR`)
   - PascalCase symbols (`BackgroundSize` → `Margin`)
3. **Updates wiring**:
   - `properties/index.ts`
   - `types.map.ts`
4. **Copies tests** with same replacements

### Design Constraints

**Keep it simple:**

- File-level copying + mechanical text transforms
- No AST parsing (first iteration)
- Deterministic, no guessing

**Consistent codebase = powerful generator:**

- Your properties already follow tight patterns
- Makes transforms reliable

---

### Generator Script Enhancements

**Key addition: `cloneFromExisting` function**

```typescript
function cloneFromExisting(baseDir: string, opts: Options) {
  const srcDir = path.join(baseDir, opts.from);
  const dstDir = path.join(baseDir, opts.name);

  // Copy all .ts files
  const srcFiles = ["types.ts", "parser.ts", "generator.ts", "definition.ts", "index.ts"];

  // Text replacements
  const replacements = {
    [srcPropName]: dstPropName,
    [srcIR]: dstIR,
    [srcPascal]: dstPascal,
  };

  // Clone + rewrite each file
  for (const file of srcFiles) {
    let content = fs.readFileSync(path.join(srcDir, file), "utf8");

    for (const [old, new] of Object.entries(replacements)) {
      content = content.replace(new RegExp(old, "g"), new);
    }

    fs.writeFileSync(path.join(dstDir, file), content, "utf8");
  }

  return true;
}
```

---

## 📊 Tests as Schema-Driven Contracts

### Your Insight (Brilliant)

> "I like this approach because it enforces standardisation... the asserts will be consistent across all properties / assert based on schema type not ad hoc"

**Exactly:** Tests become schema-driven contracts, not ad-hoc examples.

### Implementation

**Auto-validate IR structure:**

```typescript
if (opts.schema && res.ok) {
  expect(() => opts.schema!.parse(res.value.ir)).not.toThrow();
}
```

**Benefits:**

- Zod schemas (already your source of truth) enforce correctness
- No need to write detailed IR assertions
- One schema = validation for parse + generate + roundtrip

---

## 🎓 Lessons Learned

### What This Review Validated

1. **Architecture is production-ready**
2. **Patterns are solid and scalable**
3. **Minor inconsistencies won't compound** if fixed now
4. **TDD + schema validation = foolproof scaling**

### Critical Actions Before Scaling

1. ✅ Clean `types.ts` (single source of truth)
2. ✅ Fix `createMultiValueParser` issue propagation
3. ✅ Handle CSS-wide keywords correctly for custom properties
4. ✅ Fix OKLCH semantic validation
5. ✅ Normalize `parseErr` usage
6. ✅ Implement shared test harness
7. ✅ Add `--from` to property generator
8. ✅ Create test templates alongside scaffolding

---

## 🔗 Cross-References

- Validates architecture from **FEEDBACK_01-05**
- Provides concrete fixes for all identified issues
- Establishes TDD strategy complementing scaffolding automation
- Confirms `parseErr` audit findings and remediation path

---

## 💡 Bottom Line

**You're asking all the right questions.** The architecture is excellent. The cleanup items are:

1. Mechanical (can be scripted)
2. Localized (won't cascade)
3. Essential (prevent 50+ properties from inheriting inconsistencies)

**With these fixes + TDD harness + `--from` generator:** You'll have a bulletproof system for scaling to 50+ properties with confidence.

---

## 📋 Implementation Priority

### Phase 0: Critical Fixes (2-3 hours)

1. Clean `types.ts` (FEEDBACK_06_PATCHES.md)
2. Fix `createMultiValueParser` issue propagation
3. Fix CSS-wide keyword handling for custom properties
4. Fix `rawValue` flag dispatch
5. Fix OKLCH semantic validation

### Phase 1: Error Handling Consistency (2 hours)

6. Normalize `parseErr` usage across codebase
7. Document error stamping contract

### Phase 2: TDD Infrastructure (4-6 hours)

8. Create shared test harness (`runPropertyTests`)
9. Create per-property test template
10. Generate tests alongside properties

### Phase 3: Scaffolding Enhancement (2-3 hours)

11. Add `--from` support to property generator
12. Include test cloning in `--from`
13. Update documentation

**Total Estimated Effort:** ~12-16 hours
**Impact:** Bulletproof foundation for 50+ properties
