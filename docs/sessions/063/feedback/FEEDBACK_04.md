# Feedback 04 - THE BIG ONE: Deep Dive with Concrete Patches & Ruby-Style Automation

**Captured:** 2025-11-10
**Source:** Comprehensive review with architecture validation, concrete patches, Ruby-style scaffolding, and TDD approach

---

## Executive Summary

**Foundation Assessment:** ✅ **YES - solid foundation to scale to 50+ properties**

**Critical Message:** "This is already a very high-signal codebase" - strong separation, IR-first, zod-backed, result types, AST-native.

**Work Mode:**

1. High-level architecture/consistency review
2. Concrete inconsistencies/footguns to clean up NOW
3. Targeted automation (Rails-style generators)

**Follow-up offer:** "If you'd like, I can follow up with specific patches"

---

## High-Level Architecture Review

### What's Working Very Well ✅

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
   - Warnings vs errors clearly separated

4. **Multi-value Parse Abstraction**
   - `createMultiValueParser` is exactly what you want for 50+ properties

### Foundation Verdict

**"Architecturally strong enough to scale"**

**Work Now:**

- Eliminate minor inconsistencies
- Encode patterns so new properties are boring to add
- Automate generation/checking so drift is impossible

---

## Key Consistency and Correctness Issues

### 🔴 1. Duplicate/Conflicting Types in `@b/declarations/src/types.ts`

**Issue:** `CSSDeclaration`, `DeclarationResult` defined TWICE in same file. Commented-out older `PropertyIRMap` side-by-side with new import.

**Fix:** Keep `PropertyIRMap` only in `types.map.ts` (auto-generated)

**Clean Version Provided:** Complete replacement for `packages/b_declarations/src/types.ts`

**Key Points:**

- Re-export `PropertyIRMap` from `types.map.ts`
- Define types once: `RegisteredProperty`, `PropertyDefinition`, parsers
- Clear parser types: `SingleValueParser`, `MultiValueParser`, `RawValueParser`
- Union type for `PropertyDefinition` based on parsing mode

---

### 🔴 2. `createMultiValueParser` Drops Issues on Success

**Current Behavior:**

```typescript
if (!hasErrors) {
  return {
    ok: true,
    value: finalIR,
    issues: [], // ❌ DROPS WARNINGS
  };
}
```

**Impact:** Loses non-fatal warnings from nested parsers. Inconsistent with rest of system where success-with-warnings is valid.

**Fix:**

```typescript
const hasErrors = allIssues.some((i) => i.severity === "error");

return {
  ok: !hasErrors,
  value: finalIR,
  issues: allIssues, // ✅ Always propagate
};
```

**Location:** `packages/b_declarations/src/utils/create-multi-value-parser.ts`

---

### 🔴 3. `parseDeclaration`'s Universal CSS-wide Handling vs Property IRs

**Issue:** Universal handler short-circuits CSS-wide keywords for ALL properties, including custom properties `--*`

**Problem:** For `--foo: initial`, CSS-wide keywords are not special per spec - they're just literal tokens. Current code bypasses `parseCustomProperty`.

**Fix:**

```typescript
// Only handle CSS-wide for non-custom properties
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

**Contract Decision:**

- **Option A (simpler):** Top-level parser handles CSS-wide for all non-custom properties
- Property IRs should include `kind: "keyword", value: CssWide` branch if they care
- Custom properties bypass this

---

### 🟠 4. Custom Property `rawValue` Flag Unused

**Issue:** `CustomPropertyDefinition` sets `rawValue: true`, but `parseDeclaration` routes based on `isCustomProperty()` check only - `rawValue` never read.

**Problem:** Future non-`--*` raw-value properties (e.g., `font-variation-settings`) won't work.

**Fix:**

```typescript
const isRaw = "rawValue" in definition && definition.rawValue === true;

if (isRaw || isCustomProperty(property)) {
  parseResult = unsafeCallParser(definition.parser, value);
} else if (definition.multiValue) {
  parseResult = unsafeCallParser(definition.parser, value);
} else {
  // AST path...
}
```

**Location:** `packages/b_declarations/src/parser.ts`

---

### 🟡 5. `generateDeclaration` and Generator Return Shapes

**Issue:** Inconsistency - some generators set `property` internally, some use `generateOk(value, "property")`, some don't.

**Problem:** `generateDeclaration` wraps with `property: value` anyway, making internal property setting redundant.

**Recommendation:**

- **Contract:** Property-specific generator returns CSS value for property (no `property:` prefix)
- May or may not set `property` in issues
- Prefer `generateOk(value)` or `generateOk(value, propertyName)` for issue context
- Don't embed full `property: value` inside property generators

---

### 🟡 6. `parseDeclarationList`/`generateDeclarationList` Consistency

**Issue:** Asymmetry in partial-success handling

**Parse:** Mixed success/failure → `{ ok: false, value: declarations, issues }`
**Generate:** Mixed success/failure → if at least one OK: `ok: true`, else `ok: false`

**Verdict:** Defensible (generation is pure IR, parse is user input) but MUST document clearly - downstream callers should not assume symmetry.

---

### 🟡 7. `splitNodesByComma` and nestingDepth Comment

**Issue:** Declares `const nestingDepth = 0;` but never changes it. Comment claims "top-level commas only" but doesn't track nested commas.

**Reality:** css-tree encapsulates nested content in subtrees - depth tracking not needed.

**Fix:** Remove `nestingDepth` from comments or implement properly (or just note that css-tree handles it).

**Location:** `@b_parsers/src/utils/ast/split-by-comma.ts`

---

### 🟡 8. `cssValueSchema` Construction

**Issue:** `getLiteralValues` designed for literal unions; many entries are objects, contribute nothing to error message.

**Current:** `Expected ${allCssValues.join(" | ")}` - will be odd

**Fix:** Not blocking, but consider hand-written error or smarter summarizer:

- "Expected valid CssValue (literal, keyword, variable, function, ...)"

**Priority:** Polish item, not urgent

---

### 🟡 9. Minor Correctness Issues

#### OKLCH Generator Bug

**Location:** `@b_generators/src/color/oklch.ts`

**Issue:**

```typescript
checkAlpha(l, "l", "OKLCHColor"); // ❌ Semantically wrong
```

**Problem:** `checkAlpha` is semantically for alpha channels. `l` in OKLCH is lightness.

**Spec Context:**

```
<oklch()> = oklch( [from <color>]?
  [ <percentage> | <number> | none ]  // l (lightness)
  [ <percentage> | <number> | none ]  // c (chroma)
  [ <hue> | none ]                     // h
  [ / [ <alpha-value> | none ] ]?     // alpha
)
```

**Semantics:**

- `l` (lightness): As number: 0-1, As percentage: 0%-100%
- `c` (chroma): Soft bounded, often 0-0.4
- `h` (hue): Any number/angle
- `alpha`: `<alpha-value>` - number 0-1 or percentage 0%-100%

**Test Failure:**

```
Expected: "0-100%"
Received: "l value 150% is out of valid range 0-1% in OKLCHColor"
```

**Root Cause:** Used `checkLiteralRange(l, 0, 1, ...)` which for `%` unit prints "0-1%" instead of "0-100%"

**Complete Fix Provided:** New `checkOKLCHLightness` helper function

```typescript
function checkOKLCHLightness(l: import("@b/types").CssValue): import("@b/types").Issue | undefined {
  if (l.kind !== "literal") return undefined;

  if (l.unit === "%") {
    // 0% – 100%
    return checkLiteralRange(l, 0, 100, { field: "l", unit: "%", typeName: "OKLCHColor" });
  }

  // Unitless or other units: treat as 0–1 soft range
  return checkLiteralRange(l, 0, 1, { field: "l", typeName: "OKLCHColor" });
}
```

**Usage:**

```typescript
const warnings = collectWarnings(
  checkOKLCHLightness(l),
  checkLiteralRange(c, 0, 0.4, { field: "c", typeName: "OKLCHColor" }),
  checkHue(h, "h", "OKLCHColor"),
  alpha ? checkAlpha(alpha, "alpha", "OKLCHColor") : undefined
);
```

**Follow-up Offer:** "I can apply same style of fix to `lab`, `lch`, `oklab` etc."

#### Comments Need Updates

Several mention "length-percentage only" where IR is now `CssValue` to allow `var()/calc()`

---

## Automation / Scaling Suggestions

### 1. Auto-generate `PropertyIRMap` and Barrel Exports

**Already marked as auto-generated in `types.map.ts`**

**Automate:**

- Scan `packages/b_declarations/src/properties/**/definition.ts`
- Read exported `defineProperty<SomeIR>` calls
- Extract: `name` (CSS property string), `IR` type (generic)
- Generate `types.map.ts`:

  ```typescript
  import type { BackgroundImageIR, ... } from "./properties";

  export interface PropertyIRMap {
    "background-image": BackgroundImageIR;
    ...
    [key: `--${string}`]: CustomPropertyIR;
  }
  ```

- Optionally: generate `properties/index.ts` exports

**Implementation:** Node script + `ts-morph` or `babel` to parse `defineProperty`

---

### 2. Validate `PropertyDefinition` and IR Alignment at Build Time

**Goal:** Ensure registration consistency automatically (because of `as never` in dispatchers)

**Script to:**

- Import each `*definition.ts`
- For each `defineProperty<T>({ name })`, verify:
  - `PropertyIRMap[name]` exists and is `T` (TS-level check)
- Run `tsc --noEmit` with helper that makes relation explicit

**Benefit:** Compile-time alarm if:

- Someone adds `border-color` but forgets map generator
- Mismatched types

---

### 3. Template Generator for New Properties (Ruby-Style!)

**Codify existing pattern (`background-*`):**

**Given:**

- Property name
- Syntax hint
- IR schema name
- Single vs multi-value

**Generate:**

- `properties/<name>/types.ts` (zod schema + type)
- `parser.ts` (using `createMultiValueParser` or AST-based)
- `generator.ts`
- `definition.ts`
- Add export to `properties/index.ts` and `PropertyIRMap`

**Prevents style drift, low-effort**

---

### 4. Test Matrix Generation

**Leverage IR schemas and generators to auto-derive tests:**

For each property with zod IR schema + parser + generator:

**Generate roundtrip tests:**

- Sample valid values from schema (hand-seeded or fixtures)
- Assert:
  - `parse(ok)` → `generate(ok)` → same/normalized CSS
  - For multi-value: order and comma spacing normalized

**Benefits:**

- Validates consistency
- Acts as documentation for contributors

---

### 5. Lint Rules for Result Usage

**Codify conventions with eslint rules:**

**Prevent:**

- Returning raw strings instead of `GenerateResult`
- Forgetting to propagate `issues`
- `parseErr` called with string message instead of `Issue`

**Implementation:** Simple custom ESLint plugin for this repo

**Saves from:** Subtle divergences as system grows

---

## Ruby-Style Property Generator: Full Implementation

### Goal

Rails-like generator:

```bash
pnpm b:new-prop color
pnpm b:new-prop background-color --multi
pnpm b:new-prop font-weight --keywords "normal|bold|bolder|lighter|100|200|..."
```

**Generates:**

- All property files (types, parser, generator, definition)
- Updates exports + types map
- Same style as existing `background-*` properties

---

### Property Types Supported (Initial Version)

**4 Core Modes:**

1. **single-value, AST-based**
   - Parser input: `Value` node
   - Good for: `color`, `opacity`, `width`

2. **multi-value, comma-separated**
   - Parser input: `string` via `createMultiValueParser`
   - Good for: `background-image`, `font-family`

3. **raw-value**
   - Parser input: raw string
   - Good for: `--*` custom properties, opaque stuff

4. **keyword-only**
   - Single or list of known keywords
   - Backed by `@b/keywords`

**CLI:** `--mode=single|multi|raw|keyword-list`

---

### Complete Script: `scripts/new-property.ts`

**FULL IMPLEMENTATION PROVIDED (250+ lines)**

**Key Features:**

- Parses CLI flags: `--mode`, `--syntax`, `--inherited`, `--initial`, `--ir`, `--keywords`
- Computes folder/paths
- Emits 4 files with scaffolding
- Appends export to `properties/index.ts`
- Updates `types.map.ts` by inserting `PropertyIRMap` entry
- Usage examples in code
- Error handling and validation

**Template Functions:**

- `genTypesContent(opts)` - Smart keyword union generation
- `genParserContent(opts)` - Mode-specific parser scaffolding
- `genGeneratorContent(opts)` - Generator boilerplate
- `genDefinitionContent(opts)` - Property registration

**Hook Up:**

```json
// package.json
"scripts": {
  "new-prop": "ts-node scripts/new-property.ts"
}
```

**Examples:**

```bash
pnpm new-prop background-color --mode single --syntax "<color>" --initial transparent --ir BackgroundColorIR
pnpm new-prop font-family --mode multi --syntax "<family-name>#" --initial "" --ir FontFamilyIR
```

---

### Enhancement: `--from` Flag (EXCELLENT IDEA!)

**Concept:** Clone existing property as starting point - very "Rails scaffold"

**Benefits:**

- Copy proven working pattern
- Adjust specifics for new property
- Maintain consistency automatically

**Implementation Notes:**

- Copy all 5 files from source property
- Replace names/types throughout
- Clone tests too (see TDD section)

**Future Addition:** `pnpm new-prop foo-bar --from background-size`

---

### Why This Helps (NOW)

1. **Lock in Architecture**
   - Every new property follows same folder structure
   - Same registration pattern
   - Plugged into `types.map.ts`

2. **Massively Reduce Cognitive Overhead**
   - No hunting "how did I do background-repeat again?"
   - No forgotten exports
   - No missing `PropertyIRMap` entries

3. **Refactor Patterns in One Place**
   - Change templates
   - Regenerate for new properties
   - Old ones remain stable

---

## TDD Approach

### Question: "Do you think we should make it TDD?"

**Answer: YES. And you're in a perfect position to do it without slowing down.**

**Why TDD Works Here:**

- Schema-driven and pattern-heavy
- Enforces consistency across 50+ properties
- Protects subtle parse/generate/issue behaviors
- Makes `--from`/scaffold tools safe to trust

**Pragmatic Approach:** Not "write five tests before every keystroke"

**Better:** "Every pattern has standard test harness; new properties drop into it"

---

### Canonical TDD Loops Per Property

**3 Standard Tests:**

1. **Parsing Examples**
   - Given CSS declarations → expect IR + ok/false + issues

2. **Generation Examples**
   - Given IR → expect CSS string + issues

3. **Roundtrip**
   - Given CSS → parse → generate → compare normalized CSS

**Example Template:**

```typescript
// packages/b_declarations/src/properties/background-size/background-size.test.ts
import { parseDeclaration, generateDeclaration } from "@b/declarations";

describe("background-size", () => {
  test("parse simple", () => {
    const res = parseDeclaration("background-size: cover");
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value.ir).toEqual({ kind: "keyword", value: "cover" });
  });

  test("generate simple", () => {
    const res = generateDeclaration({
      property: "background-size",
      ir: { kind: "keyword", value: "cover" },
    } as any);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value).toBe("background-size: cover");
  });

  test("roundtrip multi-layer", () => {
    const css = "background-size: 10px 20px, cover";
    const parsed = parseDeclaration(css);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    const gen = generateDeclaration({
      property: "background-size",
      ir: parsed.value.ir,
    } as any);
    expect(gen.ok).toBe(true);
    if (!gen.ok) return;

    expect(gen.value).toBe("background-size: 10px 20px, cover");
  });
});
```

**TDD Flow:**

- Copy/instantiate test (or generate it)
- Watch it fail
- Fill in types/parser/generator until passes

---

### Automate Test Scaffolding

**Generator should:**

- Create matching test file: `properties/<prop>/<prop>.test.ts`
- If `--from` used: clone and rewrite tests too

**Rails-like Flow:**

```bash
pnpm new-prop foo-bar --from background-size
# Tests fail
# Tweak specifics until green
```

**TDD in spirit, without ceremony**

---

### Tests as Spec Locks for Tricky Behaviors

**Behaviors to protect with tests:**

1. **CSS-wide keyword handling**
   - Normal property: `"color: inherit"` → IR keyword
   - Custom property: `"--x: initial"` → stays raw

2. **Multi-value parsing**
   - Missing commas → errors + partial IR

3. **Partial-success semantics**
   - `parseDeclarationList` / `generateDeclarationList` mixed validity

4. **Color functions (`oklch`, `oklab`)**
   - Range warnings: 0-100% vs 0-1

5. **Custom property**
   - Whitespace preservation
   - "Raw" behavior stays correct

**Strategy:** Small shared test helper or snapshot-style expectations once, then keep every property aligned via helpers.

---

### TDD for the Generator Itself

**Full Ruby-mode:**

**Add tests for scaffolder:**

- Run `new-property` in temp dir (or fixture)
- Assert:
  - Directories created
  - Files created
  - `properties/index.ts` updated
  - `types.map.ts` updated
  - No duplicate exports

**Especially useful for `--from`** - prevent partial replacements/divergence

**Minimal Approach:**

- Keep `new-property.ts` simple
- Test with tiny fake workspace in `scripts/__tests__`
- One-time cost makes generator safe to lean on

---

### How Strict to Be

**Recommendation:**

**Each Property:**

- At least 3 tests:
  - 1-2 parse cases
  - 1-2 generate cases
  - 1 roundtrip

**Shared Utils/Parsers:**

- Focused unit tests (`createMultiValueParser`, color generators, etc.)

**Use test failures as guardrails** when refactoring patterns (like we just did with `oklch`)

**Don't need to TDD every helper** but:

- For subtle, cross-cutting, easily broken behavior (keywords, multi-value, issues, `--*`): TDD it or pin it down early

---

## Follow-up Offers

**From reviewer:**

1. ✅ "Propose exact patches for 2-4 of the points above"
2. ✅ "Sketch the `generate-types-map.mts` script that scans definitions and emits `types.map.ts`"
3. ✅ "Adjust generator to precisely match existing background-\* style"
4. ✅ "Add `--from background-repeat` mode that clones existing property"
5. ✅ "Sketch `new-property-test.ts` template that generator drops in"
6. ✅ "Show `--from` variant that clones source property's tests (TDD-by-example)"

---

## Summary

**Assessment:** Already "very high-signal codebase"

**Foundation:** ✅ Solid enough to scale to 50+ properties

**Priority Work (Before Scaling):**

### Clean Up

1. 🔴 Duplicates/noise in `@b/declarations/types.ts` - **COMPLETE REPLACEMENT PROVIDED**
2. 🔴 `createMultiValueParser` issue propagation - **PATCH PROVIDED**
3. 🔴 CSS-wide keyword handling for custom vs standard properties - **PATCH PROVIDED**
4. 🟠 Unify treatment of `rawValue` - **PATCH PROVIDED**
5. 🟡 Minor semantic misuses (`oklch` hue/alpha check) - **COMPLETE FIX PROVIDED**

### Automate

1. 🔥 `PropertyIRMap` generation from `defineProperty` - **IMPLEMENTATION APPROACH DETAILED**
2. 🔥 Alignment checks between `PropertyDefinition` and IR - **STRATEGY PROVIDED**
3. 🔥 Scaffolding for new properties - **FULL SCRIPT PROVIDED (250+ lines)**
4. 🔥 Roundtrip tests from schemas - **APPROACH DETAILED**
5. 🟢 `--from` flag for cloning properties - **"EXCELLENT IDEA" - APPROACH PROVIDED**
6. 🟢 TDD approach with test generation - **COMPREHENSIVE STRATEGY PROVIDED**

**This is the most comprehensive, actionable feedback yet** - includes complete working code for Ruby-style generators and TDD framework.
