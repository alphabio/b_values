# Blend Mode Pattern Analysis

**Date:** 2025-11-12  
**Question:** Is background-blend-mode + mix-blend-mode a pattern? Or one-off?

---

## 🎯 The Properties

### background-blend-mode

```css
background-blend-mode: multiply, screen, overlay;
```

**MDN:** https://developer.mozilla.org/en-US/docs/Web/CSS/background-blend-mode

**Syntax:** `<blend-mode>#` (comma-separated list)

**Values:**
```
normal | multiply | screen | overlay | darken | lighten |
color-dodge | color-burn | hard-light | soft-light |
difference | exclusion | hue | saturation | color | luminosity
```

**Multi-value:** YES (one per background layer)

**Characteristics:**
- Part of background-* family
- Comma-separated (layers)
- Blends background layers with each other

### mix-blend-mode

```css
mix-blend-mode: multiply;
```

**MDN:** https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode

**Syntax:** `<blend-mode> | plus-lighter`

**Values:**
```
normal | multiply | screen | overlay | darken | lighten |
color-dodge | color-burn | hard-light | soft-light |
difference | exclusion | hue | saturation | color | luminosity |
plus-lighter
```

**Multi-value:** NO (single value)

**Characteristics:**
- Standalone compositing property
- Single value
- Blends element with backdrop (parent/siblings)

---

## 🔍 Pattern Recognition

### The Core Type: BlendMode

**Shared across both properties:**
```typescript
type BlendMode = 
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "darken"
  | "lighten"
  | "color-dodge"
  | "color-burn"
  | "hard-light"
  | "soft-light"
  | "difference"
  | "exclusion"
  | "hue"
  | "saturation"
  | "color"
  | "luminosity"
  | "plus-lighter"  // Only in mix-blend-mode
```

**Note:** `plus-lighter` is exclusive to `mix-blend-mode`

---

## 📊 Comparison: Background Family

### Multi-value (layers) vs Single value

| Property | Multi-value? | Pattern |
|----------|--------------|---------|
| `background-image` | ✅ YES | Comma-separated images |
| `background-position` | ✅ YES | Comma-separated positions |
| `background-size` | ✅ YES | Comma-separated sizes |
| `background-repeat` | ✅ YES | Comma-separated repeat styles |
| `background-blend-mode` | ✅ YES | Comma-separated blend modes |
| `background-attachment` | ✅ YES | Comma-separated attachment keywords |
| `background-clip` | ✅ YES | Comma-separated clip boxes |
| `background-origin` | ✅ YES | Comma-separated origin boxes |
| `background-color` | ❌ NO | Single color (bottom layer) |

**Pattern identified:**
- **background-color** = single value (special: bottom layer)
- **All other background-*** = multi-value (per layer)

**background-blend-mode fits the pattern perfectly.**

---

## 🎯 Is This a Pattern Beyond Backgrounds?

### Hypothesis: Layer-based vs Element-based

**Layer-based properties** (multi-value):
```
background-image
background-position
background-size
background-repeat
background-attachment
background-clip
background-origin
background-blend-mode
```

**Element-based properties** (single value):
```
background-color  (special case: bottom layer)
mix-blend-mode    (element blending)
isolation         (stacking context)
opacity           (element transparency)
```

**Pattern:** 
- If it applies **per background layer** → multi-value
- If it applies **to the element** → single value

---

## 🔍 Other "Dual" Properties?

### Searching for similar patterns...

#### 1. Filter Properties

**backdrop-filter:**
```css
backdrop-filter: blur(10px) brightness(150%);
```
- Single value (element backdrop)
- Function list (not comma-separated)

**filter:**
```css
filter: blur(10px) brightness(150%);
```
- Single value (element content)
- Function list (not comma-separated)

**Pattern:** Both are element-level, function lists (not multi-value layers)

#### 2. Mask Properties

**mask-image:**
```css
mask-image: url(mask1.png), url(mask2.png);
```
- Multi-value (comma-separated layers)

**mask-mode:**
```css
mask-mode: alpha, luminance;
```
- Multi-value (comma-separated, per mask layer)

**mask-position:**
```css
mask-position: center, top left;
```
- Multi-value (comma-separated, per mask layer)

**Pattern:** Same as background-* family!

**mask-* mirrors background-* exactly:**
- mask-image, mask-position, mask-size, mask-repeat, etc.
- All multi-value (per layer)

#### 3. Clip-path (single)

**clip-path:**
```css
clip-path: circle(50%);
```
- Single value (element clipping)

---

## 📋 The Pattern: Property Families

### Pattern 1: Layer-based Multi-value

**Families:**
- **background-*** (except background-color)
- **mask-*** (similar to background)

**Characteristics:**
- Comma-separated values
- One value per layer
- Layers stack/composite

**IR Pattern:**
```typescript
PropertyIR = 
  | { kind: "keyword", value: CssWide }
  | { kind: "list", values: ValueType[] }
```

### Pattern 2: Element-based Single value

**Examples:**
- mix-blend-mode
- opacity
- isolation
- clip-path
- filter
- backdrop-filter

**Characteristics:**
- Single value
- Applies to entire element
- No layering

**IR Pattern:**
```typescript
PropertyIR = 
  | { kind: "keyword", value: CssWide }
  | { kind: "value", value: ValueType }
```

---

## 🎯 Core Type: BlendMode

### Where does it live?

```typescript
// packages/b_types/src/blend-mode.ts

/**
 * CSS <blend-mode> type
 * @see https://drafts.fxtf.org/compositing/#ltblendmodegt
 */
export const blendModeSchema = z.enum([
  "normal",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "hard-light",
  "soft-light",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
  "plus-lighter",  // mix-blend-mode only
]);

export type BlendMode = z.infer<typeof blendModeSchema>;
```

**Why separate type?**
- ✅ Reusable across background-blend-mode and mix-blend-mode
- ✅ Keyword enum (like other CSS types)
- ✅ Can be extended if spec adds more modes
- ✅ Type safety for blend mode values

---

## 📊 Implementation: background-blend-mode

### Property IR

```typescript
// packages/b_declarations/src/properties/background-blend-mode/types.ts

import { z } from "zod";
import { blendModeSchema, cssValueSchema } from "@b/types";
import * as Keywords from "@b/keywords";

/**
 * background-blend-mode value with universal CSS function support.
 */
const backgroundBlendModeValueSchema = z.union([
  blendModeSchema,
  cssValueSchema,  // var(), attr(), etc.
]);

/**
 * The final IR for the entire `background-blend-mode` property.
 */
export const backgroundBlendModeIRSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("keyword"),
    value: Keywords.cssWide,
  }),
  z.object({
    kind: z.literal("list"),
    values: z.array(backgroundBlendModeValueSchema).min(1),
  }),
]);

export type BackgroundBlendModeIR = z.infer<typeof backgroundBlendModeIRSchema>;
```

### Parser

```typescript
// packages/b_declarations/src/properties/background-blend-mode/parser.ts

import type { ParseResult, BlendMode } from "@b/types";
import * as Parsers from "@b/parsers";
import { createMultiValueParser } from "../../utils";
import type { BackgroundBlendModeIR } from "./types";
import type * as csstree from "@eslint/css-tree";

export const parseBackgroundBlendMode = createMultiValueParser<
  BlendMode | CssValue,
  BackgroundBlendModeIR
>({
  propertyName: "background-blend-mode",

  itemParser(valueNode: csstree.Value): ParseResult<BlendMode | CssValue> {
    const nodes = Array.from(valueNode.children);
    const node = nodes[0];
    
    // Try to parse as blend mode keyword
    if (node.type === "Identifier") {
      const result = Parsers.BlendMode.parse(node.name);
      if (result.ok) return result;
    }
    
    // Fall back to CSS value (var, attr, etc.)
    return Parsers.CssValue.parse(node);
  },

  aggregator(values: (BlendMode | CssValue)[]): BackgroundBlendModeIR {
    return { kind: "list", values };
  },
});
```

### Generator

```typescript
// packages/b_declarations/src/properties/background-blend-mode/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import { generateValue } from "../../utils";
import type { BackgroundBlendModeIR } from "./types";

export function generateBackgroundBlendMode(
  ir: BackgroundBlendModeIR
): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const layerStrings: string[] = [];
  for (const value of ir.values) {
    const result = generateValue(value, (v) => {
      if (typeof v === "string") return generateOk(v);  // BlendMode keyword
      return Generators.CssValue.generate(v);  // CssValue
    });
    if (!result.ok) return result;
    layerStrings.push(result.value);
  }

  return generateOk(layerStrings.join(", "));
}
```

---

## 📊 Implementation: mix-blend-mode

### Property IR

```typescript
// packages/b_declarations/src/properties/mix-blend-mode/types.ts

import { z } from "zod";
import { blendModeSchema, cssValueSchema } from "@b/types";
import * as Keywords from "@b/keywords";

/**
 * mix-blend-mode value with universal CSS function support.
 */
const mixBlendModeValueSchema = z.union([
  blendModeSchema,
  cssValueSchema,  // var(), attr(), etc.
]);

/**
 * The final IR for the entire `mix-blend-mode` property.
 */
export const mixBlendModeIRSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("keyword"),
    value: Keywords.cssWide,
  }),
  z.object({
    kind: z.literal("value"),
    value: mixBlendModeValueSchema,
  }),
]);

export type MixBlendModeIR = z.infer<typeof mixBlendModeIRSchema>;
```

### Parser

```typescript
// packages/b_declarations/src/properties/mix-blend-mode/parser.ts

import type { ParseResult, BlendMode } from "@b/types";
import * as Parsers from "@b/parsers";
import type { MixBlendModeIR } from "./types";
import type * as csstree from "@eslint/css-tree";

export function parseMixBlendMode(
  valueNode: csstree.Value
): ParseResult<MixBlendModeIR> {
  const nodes = Array.from(valueNode.children);
  const node = nodes[0];
  
  // Try to parse as blend mode keyword
  if (node.type === "Identifier") {
    const result = Parsers.BlendMode.parse(node.name);
    if (result.ok) {
      return parseOk({
        kind: "value",
        value: result.value
      });
    }
  }
  
  // Fall back to CSS value (var, attr, etc.)
  const result = Parsers.CssValue.parse(node);
  if (!result.ok) return result as ParseResult<MixBlendModeIR>;
  
  return parseOk({
    kind: "value",
    value: result.value
  });
}
```

### Generator

```typescript
// packages/b_declarations/src/properties/mix-blend-mode/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import type { MixBlendModeIR } from "./types";

export function generateMixBlendMode(ir: MixBlendModeIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  if (typeof ir.value === "string") {
    return generateOk(ir.value);  // BlendMode keyword
  }
  
  return Generators.CssValue.generate(ir.value);
}
```

---

## 📋 Shared Utilities

### BlendMode Parser

```typescript
// packages/b_parsers/src/blend-mode.ts

import { parseOk, parseErr, createError, type ParseResult } from "@b/types";
import type { BlendMode } from "@b/types";

const BLEND_MODES = new Set([
  "normal",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "hard-light",
  "soft-light",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
  "plus-lighter",
]);

export function parse(value: string): ParseResult<BlendMode> {
  const normalized = value.toLowerCase();
  
  if (BLEND_MODES.has(normalized)) {
    return parseOk(normalized as BlendMode);
  }
  
  return parseErr(
    "blend-mode",
    createError("invalid-value", `Invalid blend mode: ${value}`)
  );
}

// Export namespace
export const BlendMode = { parse };
```

---

## 🎯 Pattern Summary

### The Pattern: background-* Multi-value Family

**Properties that fit:**
```
✅ background-image
✅ background-position  
✅ background-size
✅ background-repeat
✅ background-attachment
✅ background-clip
✅ background-origin
✅ background-blend-mode  ← NEW
```

**IR Pattern:**
```typescript
PropertyIR = 
  | { kind: "keyword", value: CssWide }
  | { kind: "list", values: ValueType[] }
```

**Parser Pattern:**
- Use `createMultiValueParser()` utility
- Parse comma-separated values
- Support CSS functions (var, calc, etc.)

**Generator Pattern:**
- Iterate list
- Generate each value
- Join with ", "

### The Pattern: Element-level Single Value

**Properties that fit:**
```
✅ background-color  (special: bottom layer)
✅ mix-blend-mode
✅ opacity
✅ isolation
```

**IR Pattern:**
```typescript
PropertyIR = 
  | { kind: "keyword", value: CssWide }
  | { kind: "value", value: ValueType }
```

**Parser Pattern:**
- Parse single value
- Support CSS functions

**Generator Pattern:**
- Generate single value

---

## 🎯 Is This a Pattern?

### YES. This is a FUNDAMENTAL pattern.

**Layer-based Multi-value:**
- All background-* properties (except background-color)
- All mask-* properties (similar structure)
- Comma-separated, one per layer

**Element-based Single value:**
- Properties that apply to the element as a whole
- Single value
- No layering

**This is NOT a one-off.**

**This is a CORE architectural pattern** for all layered properties.

---

## ✅ Implementation Checklist

### Phase 1: Core Type
```
□ Create @b/types/src/blend-mode.ts (BlendMode enum)
□ Export from @b/types
```

### Phase 2: Parser Utility
```
□ Create @b/parsers/src/blend-mode.ts (parse function)
□ Export from @b/parsers
□ Add tests
```

### Phase 3: Properties
```
□ Implement background-blend-mode (multi-value, list)
□ Implement mix-blend-mode (single value)
□ Tests for both
```

### Future: Mask Properties
```
□ mask-image (multi-value)
□ mask-position (multi-value)
□ mask-size (multi-value)
□ mask-repeat (multi-value)
□ mask-mode (multi-value)
□ ... etc (same pattern as background-*)
```

---

## 🔥 Final Answer

**Is background-blend-mode + mix-blend-mode a one-off?**

**NO.**

**This is a FUNDAMENTAL pattern:**

1. **Layer-based properties** → Multi-value list (background-*, mask-*)
2. **Element-based properties** → Single value (mix-blend-mode, opacity, etc.)

**The pattern scales:**
- background-* family: 8 properties, 7 multi-value + 1 special (color)
- mask-* family: Similar structure (future implementation)
- Blend modes: Shared core type across properties

**This is the layering pattern. Lock it in. 🎯**
