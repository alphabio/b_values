# CSS Value Pattern Detection Guide

**Purpose:** Identify reusable CSS value patterns to ensure scalable architecture

**Date:** 2025-11-12

---

## 🎯 Core Principle

**CSS VALUE PATTERNS ARE REUSABLE ACROSS PROPERTIES**

When implementing a new property, we must identify if its values are:

1. **Reusable CSS value types** → Implement in shared packages
2. **Property-specific combinations** → Implement in property directory

---

## 📊 Pattern Detection Process

### Step 1: Extract CSS Value Types from Syntax

Given property syntax, identify the **CSS value type names** (in angle brackets):

```
background-blend-mode: <blend-mode>#
                       ^^^^^^^^^^^^^ CSS value type

mix-blend-mode: <blend-mode> | plus-lighter
                ^^^^^^^^^^^^^ Same CSS value type!

width: auto | <length-percentage> | min-content | max-content
              ^^^^^^^^^^^^^^^^^^^ CSS value type
```

### Step 2: Search for Reusability

**Question:** Is this `<value-type>` used by OTHER properties?

```bash
# Search CSS specs or MDN
# Example: <blend-mode>
# - Used in background-blend-mode ✅
# - Used in mix-blend-mode ✅
# → REUSABLE PATTERN
```

### Step 3: Classify the Pattern

| Pattern Category       | Location                                         | Examples                                                  |
| ---------------------- | ------------------------------------------------ | --------------------------------------------------------- |
| **REUSABLE Keywords**  | `@b/keywords/src/<type>.ts`                      | `<blend-mode>`, `<display-outside>`, `<position-keyword>` |
| **REUSABLE Types**     | `@b/types/src/<category>/<type>.ts`              | `<length>`, `<percentage>`, `<color>`                     |
| **REUSABLE Functions** | `@b/types/src/<category>/function.ts`            | `<transform-function>`, `<filter-function>`               |
| **Property-Specific**  | `@b/declarations/src/properties/<prop>/types.ts` | Custom unions, specific combos                            |

---

## 🔍 Pattern Classification Rules

### Rule 1: Pure Keyword Enums → @b/keywords

**If all values are simple identifiers (no functions, no units):**

```css
/* <blend-mode> */
normal | multiply | screen | overlay | darken | lighten

/* <display-outside> */
block | inline | run-in

/* <position-keyword> */
static | relative | absolute | fixed | sticky
```

**Implementation:**

```typescript
// @b/keywords/src/blend-mode.ts
export const blendMode = z.union([
  z.literal("normal"),
  z.literal("multiply"),
  // ... all literal keywords
]);

export const BLEND_MODE = getLiteralValues(blendMode);
export type BlendMode = z.infer<typeof blendMode>;
```

**Parser:**

```typescript
// @b/parsers/src/blend-mode.ts
export function parse(value: string): ParseResult<BlendMode> {
  const normalized = value.toLowerCase();
  if (BLEND_MODE.includes(normalized as BlendMode)) {
    return parseOk(normalized as BlendMode);
  }
  return parseErr("blend-mode", createError("invalid-value", `Invalid blend mode: ${value}`));
}
```

**Generator:**

```typescript
// @b/generators/src/blend-mode.ts
export function generate(value: BlendMode): GenerateResult {
  return generateOk(value);
}
```

---

### Rule 2: Complex Types with Units/Functions → @b/types

**If values include units, functions, or structured data:**

```css
/* <length> */
0 | 10px | 2em | 5rem | calc(100% - 20px)

/* <color> */
red | #ff0000 | rgb(255, 0, 0) | hsl(0, 100%, 50%)

/* <image> */
url("img.png") | linear-gradient(red, blue) | image-set(...)
```

**Implementation:**

```typescript
// @b/types/src/length/index.ts
export const lengthSchema = z.object({
  value: z.number(),
  unit: lengthUnitSchema,
});

export type Length = z.infer<typeof lengthSchema>;
```

---

### Rule 3: Multi-Property Functions → @b/types/<category>/function.ts

**If values are function-based and used by multiple properties:**

```css
/* <transform-function> */
translate(10px, 20px) | rotate(45deg) | scale(2) | matrix(...)

/* <filter-function> */
blur(10px) | brightness(150%) | contrast(200%)
```

**Implementation:**

```typescript
// @b/types/src/transform/function.ts
export const transformFunctionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("translate"), x: lengthSchema, y: lengthSchema }),
  z.object({ type: z.literal("rotate"), angle: angleSchema }),
  // ... etc
]);
```

---

### Rule 4: Property-Specific Combinations → Property Directory

**If the pattern is UNIQUE to one property:**

```css
/* background-position (composite longhand with special 2D/3D/4-value syntax) */
<position> =
  [ left | center | right | <length-percentage> ]
  [ top | center | bottom | <length-percentage> ]

/* This specific combination is ONLY for background-position */
```

**Implementation:**

```typescript
// @b/declarations/src/properties/background-position/types.ts
export const positionIRSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("keyword"), value: cssWide }),
  z.object({
    kind: z.literal("value"),
    value: z.object({
      x: positionValueSchema,
      y: positionValueSchema,
    }),
  }),
]);
```

---

## 🎯 Decision Tree

```
New Property Implementation
         |
         ↓
Extract CSS value types from syntax
         |
         ↓
For each <value-type>:
         |
         ├─→ Used by 2+ properties?
         |   YES → Implement as REUSABLE
         |   NO  → Property-specific
         |
         ↓ (If REUSABLE)
         |
         ├─→ Pure keywords only?
         |   YES → @b/keywords + @b/parsers + @b/generators
         |
         ├─→ Complex type (units/structured)?
         |   YES → @b/types + @b/parsers + @b/generators
         |
         └─→ Functions?
             YES → @b/types/<category>/function.ts + parsers + generators
```

---

## 📋 Examples by Category

### Category 1: Reusable Keywords (Pure Enums)

| CSS Value Type   | Properties Using It                                 | Location                          |
| ---------------- | --------------------------------------------------- | --------------------------------- |
| `<blend-mode>`   | `background-blend-mode`, `mix-blend-mode`           | `@b/keywords/src/blend-mode.ts`   |
| `<repeat-style>` | `background-repeat`, `mask-repeat`                  | `@b/keywords/src/repeat-style.ts` |
| `<attachment>`   | `background-attachment`                             | `@b/keywords/src/attachment.ts`   |
| `<box>`          | `background-clip`, `background-origin`, `mask-clip` | `@b/keywords/src/box.ts`          |

### Category 2: Reusable Types

| CSS Value Type        | Properties Using It                                         | Location                            |
| --------------------- | ----------------------------------------------------------- | ----------------------------------- |
| `<length-percentage>` | `width`, `height`, `margin-*`, `padding-*`, 50+ properties  | `@b/types/src/length/percentage.ts` |
| `<color>`             | `background-color`, `color`, `border-color`, 30+ properties | `@b/types/src/color/index.ts`       |
| `<image>`             | `background-image`, `list-style-image`, `mask-image`        | `@b/types/src/image/index.ts`       |

### Category 3: Reusable Functions

| CSS Value Type         | Properties Using It          | Location                             |
| ---------------------- | ---------------------------- | ------------------------------------ |
| `<transform-function>` | `transform`                  | `@b/types/src/transform/function.ts` |
| `<filter-function>`    | `filter`, `backdrop-filter`  | `@b/types/src/filter/function.ts`    |
| `<basic-shape>`        | `clip-path`, `shape-outside` | `@b/types/src/shape/basic.ts`        |

### Category 4: Property-Specific

| Property              | Why Property-Specific                                           | Location                                              |
| --------------------- | --------------------------------------------------------------- | ----------------------------------------------------- |
| `background-position` | Composite longhand with special 2D/3D/4-value positioning logic | `@b/declarations/src/properties/background-position/` |
| `font`                | Shorthand with complex ordering rules (rarely used in this lib) | N/A (shorthand rejected)                              |

---

## 🚀 Practical Application: background-blend-mode

### Step 1: Extract CSS Value Type

```
Syntax: <blend-mode>#
        ^^^^^^^^^^^^
        CSS value type
```

### Step 2: Check Reusability

```
Properties using <blend-mode>:
- background-blend-mode ✅
- mix-blend-mode ✅
→ REUSABLE!
```

### Step 3: Classify Pattern

```
Values: normal | multiply | screen | overlay | darken | lighten | ...
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        All keywords, no units, no functions

→ Category: REUSABLE KEYWORDS
→ Location: @b/keywords
```

### Step 4: Implementation Plan

```
1. Create @b/keywords/src/blend-mode.ts (keyword enum + BLEND_MODE array)
2. Export from @b/keywords/src/index.ts
3. Create @b/parsers/src/blend-mode.ts (parse function)
4. Export from @b/parsers/src/index.ts (as BlendMode namespace)
5. Create @b/generators/src/blend-mode.ts (generate function)
6. Export from @b/generators/src/index.ts (as BlendMode namespace)
7. Use in property: import from shared packages
```

### Step 5: Property Implementation

```typescript
// @b/declarations/src/properties/background-blend-mode/types.ts
import { z } from "zod";
import * as Keywords from "@b/keywords";

const backgroundBlendModeValueSchema = z.union([
  Keywords.blendMode, // ← Reuse from @b/keywords
  cssValueSchema, // var(), attr(), etc.
]);

export const backgroundBlendModeIRSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("keyword"), value: Keywords.cssWide }),
  z.object({ kind: z.literal("list"), values: z.array(backgroundBlendModeValueSchema).min(1) }),
]);
```

```typescript
// @b/declarations/src/properties/background-blend-mode/parser.ts
import * as Parsers from "@b/parsers";

export const parseBackgroundBlendMode = createMultiValueParser({
  itemParser(valueNode) {
    // Try blend mode
    const result = Parsers.BlendMode.parse(node.name); // ← Reuse parser
    if (result.ok) return result;

    // Fall back to CSS value
    return Parsers.CssValue.parse(node);
  },
  // ... rest
});
```

---

## 🎯 Key Takeaways

1. **Always check for reusability FIRST** - prevents duplication
2. **CSS value types in `<angle-brackets>` are your clue** - they indicate spec-defined types
3. **Pure keyword enums → @b/keywords** - simple, no units
4. **Complex types → @b/types** - units, structured data, functions
5. **Property-specific only if truly unique** - rare, document extensively
6. **Parsers/generators follow their types** - same package structure

---

## ⚠️ Common Mistakes

### ❌ WRONG: Property-specific when reusable

```typescript
// @b/declarations/src/properties/background-blend-mode/blend-mode.ts
// ❌ Don't create blend-mode logic in property directory!
```

### ✅ RIGHT: Reusable in shared packages

```typescript
// @b/keywords/src/blend-mode.ts
// ✅ Create in shared package for reuse
```

---

### ❌ WRONG: Switching on property name

```typescript
// @b/parsers/src/blend-mode.ts
export function parse(value: string, propertyName: string) {
  if (propertyName === "background-blend-mode") {
    // ❌ Don't switch on property name!
  }
}
```

### ✅ RIGHT: Pure value parsing

```typescript
// @b/parsers/src/blend-mode.ts
export function parse(value: string): ParseResult<BlendMode> {
  // ✅ Parse the VALUE, not the property
  if (BLEND_MODE.includes(value as BlendMode)) {
    return parseOk(value as BlendMode);
  }
  return parseErr("blend-mode", ...);
}
```

---

## 🎯 This Is The Foundation for Scaling to 50+ Properties

**Every property implementation must start with CSS value pattern detection.**

**Get this right → Clean architecture.**
**Get this wrong → Technical debt × 50 properties.**
