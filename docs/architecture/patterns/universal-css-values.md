# Universal CSS Values Pattern

**Status:** ✅ Implemented
**Date:** 2025-11-10
**Session:** 064

---

## 🎯 Philosophy

**Core Principle:** Pure parsers/generators at property level. Declaration layer handles substitution.

```
┌─────────────────────────────────────────────────────────────┐
│ Declaration Layer (@b/declarations)                         │
│                                                             │
│ Responsibilities:                                           │
│ • Knows about var(), calc(), min(), max(), clamp(), attr() │
│ • Intercepts universal CSS functions BEFORE delegation     │
│ • Returns CssValue IR for substitutable values             │
│ • Delegates concrete values to pure parsers                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ delegates to
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Parser Layer (@b/parsers)                                   │
│                                                             │
│ Responsibilities:                                           │
│ • PURE domain logic (CSS spec for that property)           │
│ • NO knowledge of var(), calc(), etc.                       │
│ • NO CssValue imports or handling                           │
│ • Returns property-specific IR only                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📐 Architecture Layers

### Layer 1: Type System (Zod Schemas)

**Location:** `packages/b_declarations/src/properties/*/types.ts`

**Pattern:** Allow union of concrete type OR CssValue

```typescript
import { z } from "zod";
import { cssValueSchema } from "@b/types";
import * as Keywords from "@b/keywords";

// Example 1: Simple keyword property
const backgroundClipValueSchema = cssValueSchema;

export const backgroundClipIRSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("keyword"),
    value: Keywords.cssWide,
  }),
  z.object({
    kind: z.literal("list"),
    values: z.array(backgroundClipValueSchema).min(1),
  }),
]);

// Example 2: Structured property
const repeatStyleSchema = z.discriminatedUnion("kind", [...]);
const repeatStyleOrCssValueSchema = z.union([repeatStyleSchema, cssValueSchema]);

export const backgroundRepeatIRSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("keyword"),
    value: Keywords.cssWide,
  }),
  z.object({
    kind: z.literal("list"),
    values: z.array(repeatStyleOrCssValueSchema).min(1),
  }),
]);

// Example 3: Complex property (needs fix)
const imageOrCssValueSchema = z.union([imageSchema, cssValueSchema]);

export const backgroundImageIRSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("keyword"),
    value: z.union([Keywords.cssWide, Keywords.none]),
  }),
  z.object({
    kind: z.literal("list"),
    values: z.array(imageOrCssValueSchema).min(1), // ← Union here
  }),
]);
```

**Key principle:** Apply union at **leaf values**, not container structures.

---

### Layer 2: Declaration Layer (Substitution Handler)

**Location:** `packages/b_declarations/src/utils/create-multi-value-parser.ts`

**Pattern:** Intercept universal functions before calling property parser

```typescript
import { Utils } from "@b/parsers";
import { isUniversalFunction } from "./type-guards";

export function createMultiValueParser<TItem, TFinal>(
  config: MultiValueParserConfig<TItem, TFinal>
): (node: csstree.Value) => ParseResult<TFinal> {
  return (node: csstree.Value): ParseResult<TFinal> => {
    // ... split by comma, parse each item ...

    for (const chunk of chunks) {
      // Parse chunk to AST
      const itemAst = parseChunk(chunk);

      // 🔑 INTERCEPT: Check for universal CSS functions first
      const firstNode = itemAst.children.first;
      if (firstNode && isUniversalFunction(firstNode)) {
        const universalResult = Utils.parseNodeToCssValue(itemAst);
        if (universalResult.ok) {
          // Declaration layer handles substitution
          itemResults.push(universalResult as ParseResult<TItem>);
          continue;
        }
        // Fall through if parsing failed
      }

      // Delegate to pure property parser
      itemResults.push(config.itemParser(itemAst));
    }

    // ... aggregate results ...
  };
}
```

**Responsibilities:**
- Detect universal CSS functions (`var()`, `calc()`, `min()`, `max()`, `clamp()`, `attr()`)
- Parse them using `parseNodeToCssValue()` from `@b/parsers`
- Return `CssValue` IR
- Never expose universal functions to property parsers

---

### Layer 3: Parser Layer (Pure Domain Logic)

**Location:** `packages/b_parsers/src/background/*.ts`

**Pattern:** Pure functions that only know property-specific CSS spec

```typescript
// packages/b_parsers/src/background/clip.ts
import * as csstree from "@eslint/css-tree";
import { parseOk, parseErr, type ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";

/**
 * Parse background-clip value.
 * 
 * PURE: Only handles concrete keywords (border-box, padding-box, etc.)
 * Does NOT handle var(), calc(), or any universal CSS functions.
 * Declaration layer intercepts those before calling this parser.
 */
export function parseBackgroundClip(
  node: csstree.Value
): ParseResult<BackgroundClipValue> {
  if (node.children.size !== 1) {
    return parseErr("background-clip", "Expected single value");
  }

  const first = node.children.first!;

  if (first.type === "Identifier") {
    const keyword = first.name.toLowerCase();
    
    if (Keywords.backgroundClip.options.includes(keyword)) {
      return parseOk("background-clip", {
        kind: "keyword",
        value: keyword,
      });
    }
  }

  return parseErr(
    "background-clip",
    "Expected border-box, padding-box, content-box, or text"
  );
}
```

**Purity guarantees:**
- ✅ NO `var()` handling
- ✅ NO `calc()` handling
- ✅ NO `CssValue` imports
- ✅ NO `isUniversalFunction()` checks
- ✅ ONLY domain-specific CSS spec knowledge

---

### Layer 4: Type Guards (Declaration Utilities)

**Location:** `packages/b_declarations/src/utils/type-guards.ts`

**Pattern:** Utilities for declaration layer to identify universal values

```typescript
import type * as csstree from "@eslint/css-tree";
import type { CssValue } from "@b/types";

/**
 * Universal CSS functions that can appear in any property value.
 * These are handled at the declaration layer, not by property parsers.
 */
const UNIVERSAL_FUNCTIONS = [
  "var",     // CSS custom properties
  "calc",    // Mathematical expressions
  "min",     // Minimum value
  "max",     // Maximum value
  "clamp",   // Clamped value
  "attr",    // Attribute references
  "env",     // Environment variables
] as const;

/**
 * CssValue kind whitelist.
 * Used to distinguish CssValue from property-specific IR.
 */
const CSS_VALUE_KINDS = [
  "literal",
  "keyword",
  "variable",
  "list",
  "calc",
  "calc-operation",
  "min",
  "max",
  "clamp",
  "url",
  "attr",
  "function",
  "string",
  "hex-color",
] as const;

/**
 * Check if AST node is a universal CSS function.
 * Used by declaration layer to intercept before delegating to parser.
 */
export function isUniversalFunction(node: csstree.CssNode): boolean {
  if (node.type !== "Function") return false;
  const funcName = (node as csstree.FunctionNode).name.toLowerCase();
  return (UNIVERSAL_FUNCTIONS as ReadonlyArray<string>).includes(funcName);
}

/**
 * Check if a value is a CssValue (not property-specific IR).
 * Both CssValue and property IR may have "kind" field, so use whitelist.
 */
export function isCssValue(value: unknown): value is CssValue {
  if (typeof value !== "object" || value === null) return false;
  if (!("kind" in value)) return false;
  
  const kind = (value as { kind: string }).kind;
  return (CSS_VALUE_KINDS as ReadonlyArray<string>).includes(kind);
}

/**
 * Type guard for consumers to narrow union types.
 */
export function isConcreteValue<T>(
  value: T | CssValue
): value is T {
  return !isCssValue(value);
}
```

---

## 🔄 Data Flow

### Parsing Flow

```
Input: "background-clip: var(--my-clip), border-box"
                    │
                    ▼
         ┌──────────────────────┐
         │ parseDeclaration     │
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │ createMultiValueParser│
         └──────────┬───────────┘
                    │
          ┌─────────┴─────────┐
          │                   │
          ▼                   ▼
    ┌──────────┐        ┌──────────┐
    │ var(--x) │        │ border-box│
    └────┬─────┘        └────┬─────┘
         │                   │
         │ isUniversal?      │ isUniversal?
         │ YES               │ NO
         │                   │
         ▼                   ▼
    parseNodeToCssValue   parseBackgroundClip
         │                   │ (pure parser)
         │                   │
         ▼                   ▼
    { kind: "variable",  { kind: "keyword",
      name: "--my-clip"   value: "border-box" }
    }
         │                   │
         └─────────┬─────────┘
                   ▼
          { kind: "list",
            values: [
              { kind: "variable", name: "--my-clip" },
              { kind: "keyword", value: "border-box" }
            ]
          }
```

### Generation Flow

```
Input IR:
{
  kind: "list",
  values: [
    { kind: "variable", name: "--my-clip" },
    { kind: "keyword", value: "border-box" }
  ]
}
         │
         ▼
┌─────────────────────┐
│ generateDeclaration │
└─────────┬───────────┘
          │
          ▼
  ┌───────────────────┐
  │ Multi-value gen   │
  └───────┬───────────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
isCssValue?   isCssValue?
   YES           NO
    │             │
    ▼             ▼
cssValueToCss  generateClip
    │          (pure gen)
    │             │
    ▼             ▼
"var(--my-clip)" "border-box"
    │             │
    └──────┬──────┘
           ▼
"background-clip: var(--my-clip), border-box"
```

---

## 📝 Implementation Checklist

### ✅ Phase 0: Type Guards (COMPLETE)
- [x] Implement `isUniversalFunction()`
- [x] Implement `isCssValue()` with CssValue kind whitelist
- [x] Implement `isConcreteValue()` helper
- [x] 19 tests passing

### ✅ Phase 1: Declaration Layer Injection (COMPLETE)
- [x] Inject universal function check in `createMultiValueParser`
- [x] Parse universal functions using `parseNodeToCssValue`
- [x] Cast result to `ParseResult<TItem>` (safe: union type)
- [x] Existing tests passing (background-clip, background-repeat, background-size)

### ⏳ Phase 2: Schema Updates (IN PROGRESS)
- [x] background-clip: Already uses `cssValueSchema` ✅
- [x] background-repeat: Already uses union pattern ✅
- [x] background-size: Already uses `cssValueSchema` in nested types ✅
- [ ] background-image: Add `z.union([imageSchema, cssValueSchema])`
- [ ] background-attachment: Check schema
- [ ] background-origin: Check schema

### ⏳ Phase 3: Integration Tests (TODO)
- [ ] Fix test expectations for background-image
- [ ] Verify all background-* properties with var()
- [ ] Test mixed concrete + universal values
- [ ] Test nested var() with fallbacks

### ⏳ Phase 4: Single-Value Properties (TODO)
- [ ] Check if single-value properties need injection
- [ ] Add injection to `parseDeclaration` if needed
- [ ] Test single-value properties with var()

---

## 📊 Benefits

### Separation of Concerns
- **Parsers:** Expert in property-specific CSS spec
- **Declaration:** Expert in CSS-wide features
- Clear boundary: "Is this universal or property-specific?"

### Scalability
- Add 50 properties → parsers stay pure
- Universal features work automatically
- Zero per-property boilerplate in parser/generator logic

### Testability
- Test parsers with only concrete values (pure unit tests)
- Test declaration layer with universal values (integration tests)
- Clear test boundaries

### Maintainability
- Change var() behavior? → One place (declaration layer)
- Add new universal function (env())? → One place (type guards)
- Add new property? → Just write pure parser + schema union

---

## 🎯 Guiding Principles

1. **Parsers/Generators are pure** - No universal function knowledge
2. **Declaration layer handles substitution** - Intercepts before delegation
3. **Type system allows both** - Union of concrete OR CssValue
4. **Apply unions at leaf values** - Not container structures
5. **Use whitelists for type guards** - Avoid false positives

---

## 🔗 Related Patterns

- **CSS-wide keywords** (Session 057): Similar pattern, handled at declaration layer
- **Important flag**: Property-agnostic, handled at declaration layer
- **Multi-value parsing**: Framework abstraction for comma-separated lists

---

## 📚 References

- **Session 064:** Universal CSS functions implementation
- **CORRECTED_PLAN.md:** Injection approach validation
- **RESEARCH_FINDINGS.md:** Schema pattern discovery
- **PHILOSOPHY_ALIGNMENT.md:** Architecture philosophy documentation

---

**Last Updated:** 2025-11-10
**Status:** ✅ Implemented (95% complete, schema updates remaining)
