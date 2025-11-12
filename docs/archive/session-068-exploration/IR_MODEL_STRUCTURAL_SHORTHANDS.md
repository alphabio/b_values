# IR Model for Structural Shorthands

**Date:** 2025-11-12
**Focus:** Define IR architecture for structural shorthands (padding, margin, background-position, etc.)

---

## 🎯 Current State: background-position

### Property IR

```typescript
// packages/b_declarations/src/properties/background-position/types.ts

type BackgroundPositionIR = { kind: "keyword"; value: CssWide } | { kind: "list"; values: Position2D[] };
```

### Core Type: Position2D

```typescript
// packages/b_types/src/position.ts

type Position2D = {
  horizontal: CssValue | PositionEdgeOffset;
  vertical: CssValue | PositionEdgeOffset;
};

type PositionEdgeOffset = {
  edge: "left" | "right" | "top" | "bottom";
  offset: CssValue;
};
```

### Parser

```typescript
// Parses: "center top" or "left 10px top 20px"
// Returns: Position2D

parsePosition2D(nodes, 0);
// → { horizontal: CssValue, vertical: CssValue }
```

### Generator

```typescript
// Takes: Position2D
// Returns: "center top"

Generators.Position.generate(position2D);
```

---

## 🔍 Analysis: What Works Well

### ✅ Strengths

**1. Clean separation:**

- Property IR (`BackgroundPositionIR`) - property-level concerns (multi-value, keywords)
- Core type (`Position2D`) - reusable 2D position concept
- Parser/Generator in `@b/parsers` and `@b/generators` - shared logic

**2. Multi-value support:**

```typescript
background-position: center top, left bottom;
// → { kind: "list", values: [Position2D, Position2D] }
```

**3. CSS function support:**

```typescript
background-position: var(--x) calc(50% + 10px);
// → Both horizontal and vertical support CssValue
```

**4. Reusability:**

- `Position2D` can be used by other properties
- `parsePosition2D` and `generate` are shared utilities

---

## 🎯 The Question: How to Model Box Model Shorthands?

### Properties to Model:

```
padding: 10px 20px 30px 40px;
margin: 10px 20px 30px 40px;
border-width: 1px 2px 3px 4px;
border-style: solid dashed dotted double;
border-color: red blue green yellow;
border-radius: 10px 20px 30px 40px;
```

**Key difference from background-position:**

- background-position: Multi-value (comma-separated layers)
- padding/margin: Single value with 1-4 components

---

## 📊 Option 1: Unified Structure (Like Position2D)

### Core Type

```typescript
// packages/b_types/src/box-sides.ts

/**
 * Represents values for all 4 sides of a box.
 * Used by padding, margin, border-width, etc.
 */
export const boxSides4Schema = z
  .object({
    top: cssValueSchema,
    right: cssValueSchema,
    bottom: cssValueSchema,
    left: cssValueSchema,
  })
  .strict();

export type BoxSides4 = z.infer<typeof boxSides4Schema>;
```

### Property IR

```typescript
// packages/b_declarations/src/properties/padding/types.ts

export const paddingIRSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("keyword"),
    value: Keywords.cssWide,
  }),
  z.object({
    kind: z.literal("sides"),
    value: boxSides4Schema, // Always 4 sides
  }),
]);

export type PaddingIR = z.infer<typeof paddingIRSchema>;
```

### Parser

```typescript
// packages/b_parsers/src/box-sides.ts

/**
 * Parse 1-4 values into BoxSides4 structure.
 *
 * CSS spec expansion:
 * - 1 value: all sides
 * - 2 values: top/bottom, left/right
 * - 3 values: top, left/right, bottom
 * - 4 values: top, right, bottom, left
 */
export function parseBoxSides4(
  nodes: CSSNode[],
  startIndex: number
): ParseResult<{ sides: BoxSides4; consumed: number }> {
  // Parse 1-4 values
  const values: CssValue[] = [];
  let index = startIndex;

  while (values.length < 4 && index < nodes.length) {
    const result = parseCssValue(nodes[index]);
    if (!result.ok) break;
    values.push(result.value);
    index++;
  }

  if (values.length === 0) {
    return parseErr("box-sides", createError("invalid-value", "Expected at least one value"));
  }

  // Expand to 4 sides per CSS spec
  let top, right, bottom, left;

  if (values.length === 1) {
    top = right = bottom = left = values[0];
  } else if (values.length === 2) {
    top = bottom = values[0];
    right = left = values[1];
  } else if (values.length === 3) {
    top = values[0];
    right = left = values[1];
    bottom = values[2];
  } else {
    top = values[0];
    right = values[1];
    bottom = values[2];
    left = values[3];
  }

  return parseOk({
    sides: { top, right, bottom, left },
    consumed: values.length,
  });
}
```

### Generator

```typescript
// packages/b_generators/src/box-sides.ts

/**
 * Generate BoxSides4 back to CSS.
 * Optimize: if all sides equal, emit 1 value.
 */
export function generate(sides: BoxSides4): GenerateResult {
  // Generate each side
  const topResult = generateCssValue(sides.top);
  if (!topResult.ok) return topResult;

  const rightResult = generateCssValue(sides.right);
  if (!rightResult.ok) return rightResult;

  const bottomResult = generateCssValue(sides.bottom);
  if (!bottomResult.ok) return bottomResult;

  const leftResult = generateCssValue(sides.left);
  if (!leftResult.ok) return leftResult;

  const top = topResult.value;
  const right = rightResult.value;
  const bottom = bottomResult.value;
  const left = leftResult.value;

  // Optimize output
  if (top === right && right === bottom && bottom === left) {
    return generateOk(top); // 1 value
  }

  if (top === bottom && right === left) {
    return generateOk(`${top} ${right}`); // 2 values
  }

  if (right === left) {
    return generateOk(`${top} ${right} ${bottom}`); // 3 values
  }

  return generateOk(`${top} ${right} ${bottom} ${left}`); // 4 values
}
```

### Property Implementation

```typescript
// packages/b_declarations/src/properties/padding/parser.ts

export function parsePadding(valueNode: csstree.Value): ParseResult<PaddingIR> {
  const nodes = Array.from(valueNode.children);

  const result = Parsers.BoxSides.parseBoxSides4(nodes, 0);
  if (!result.ok) return result as ParseResult<PaddingIR>;

  return parseOk({
    kind: "sides",
    value: result.value.sides,
  });
}

// packages/b_declarations/src/properties/padding/generator.ts

export function generatePadding(ir: PaddingIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  return Generators.BoxSides.generate(ir.value);
}
```

---

## 📊 Option 2: Preserve Original Values (Explicit)

### Core Type

```typescript
// packages/b_types/src/box-sides.ts

/**
 * Preserves the original 1-4 value syntax.
 */
export type BoxSides4 =
  | { form: "one"; all: CssValue }
  | { form: "two"; vertical: CssValue; horizontal: CssValue }
  | { form: "three"; top: CssValue; horizontal: CssValue; bottom: CssValue }
  | { form: "four"; top: CssValue; right: CssValue; bottom: CssValue; left: CssValue };
```

**Pros:**

- ✅ Preserves original author intent
- ✅ Round-trip fidelity (parse → generate → same output)
- ✅ No ambiguity

**Cons:**

- ❌ More complex to work with
- ❌ Harder to query "what's the top padding?"
- ❌ More code in generators

---

## 📊 Option 3: Both (Canonical + Original)

### Core Type

```typescript
export type BoxSides4 = {
  // Canonical form (always expanded)
  top: CssValue;
  right: CssValue;
  bottom: CssValue;
  left: CssValue;

  // Original form (for round-trip)
  originalForm?: {
    valueCount: 1 | 2 | 3 | 4;
    values:
      | [CssValue]
      | [CssValue, CssValue]
      | [CssValue, CssValue, CssValue]
      | [CssValue, CssValue, CssValue, CssValue];
  };
};
```

**Pros:**

- ✅ Easy to query canonical values
- ✅ Can preserve original intent
- ✅ Round-trip fidelity (if originalForm preserved)

**Cons:**

- ❌ More memory overhead
- ❌ Redundancy
- ❌ More complex

---

## 🎯 RECOMMENDATION: Option 1 (Unified/Canonical)

### Why?

**1. Consistency with Position2D:**

```typescript
Position2D: {
  (horizontal, vertical);
} // Always 2 components
BoxSides4: {
  (top, right, bottom, left);
} // Always 4 components
```

**2. Simple to work with:**

```typescript
// Query: What's the top padding?
paddingIR.value.top;

// Set: Change top padding
paddingIR.value.top = newValue;
```

**3. Generator optimizes output:**

```typescript
{ top: 10px, right: 10px, bottom: 10px, left: 10px }
// → Generates: "10px"

{ top: 10px, right: 20px, bottom: 10px, left: 20px }
// → Generates: "10px 20px"
```

**4. DRY for multiple properties:**

```typescript
// All use same BoxSides4 type:
padding: BoxSides4
margin: BoxSides4
border-width: BoxSides4
// (+ specialized parsers for value type constraints)
```

---

## 📋 Complete Type Hierarchy

```typescript
// ===========================
// CORE REUSABLE TYPES
// ===========================

// packages/b_types/src/box-sides.ts
export type BoxSides4 = {
  top: CssValue;
  right: CssValue;
  bottom: CssValue;
  left: CssValue;
};

// packages/b_types/src/box-corners.ts
export type BoxCorners4 = {
  topLeft: CssValue;
  topRight: CssValue;
  bottomRight: CssValue;
  bottomLeft: CssValue;
};

// packages/b_types/src/position.ts (existing)
export type Position2D = {
  horizontal: CssValue | PositionEdgeOffset;
  vertical: CssValue | PositionEdgeOffset;
};

// ===========================
// PROPERTY IR TYPES
// ===========================

// Padding
export type PaddingIR = { kind: "keyword"; value: CssWide } | { kind: "sides"; value: BoxSides4 };

// Margin
export type MarginIR = { kind: "keyword"; value: CssWide } | { kind: "sides"; value: BoxSides4 };

// Border-width
export type BorderWidthIR = { kind: "keyword"; value: CssWide } | { kind: "sides"; value: BoxSides4 };

// Border-style
export type BorderStyleIR = { kind: "keyword"; value: CssWide } | { kind: "sides"; value: BoxSides4 };

// Border-color
export type BorderColorIR = { kind: "keyword"; value: CssWide } | { kind: "sides"; value: BoxSides4 };

// Border-radius
export type BorderRadiusIR = { kind: "keyword"; value: CssWide } | { kind: "corners"; value: BoxCorners4 };

// Background-position (existing)
export type BackgroundPositionIR = { kind: "keyword"; value: CssWide } | { kind: "list"; values: Position2D[] };

// ===========================
// INDIVIDUAL LONGHAND IR TYPES
// ===========================

// padding-top (and right, bottom, left)
export type PaddingTopIR = { kind: "keyword"; value: CssWide } | { kind: "value"; value: CssValue };

// background-position-x (and y)
export type BackgroundPositionXIR = { kind: "keyword"; value: CssWide } | { kind: "value"; value: CssValue };
```

---

## 🎯 Parser Architecture

### Shared Utilities

```typescript
// packages/b_parsers/src/box-sides.ts

export function parseBoxSides4(nodes, startIndex): ParseResult<BoxSides4>;
export function parseBoxCorners4(nodes, startIndex): ParseResult<BoxCorners4>;

// packages/b_parsers/src/position.ts (existing)

export function parsePosition2D(nodes, startIndex): ParseResult<Position2D>;
```

### Property Parsers

```typescript
// packages/b_declarations/src/properties/padding/parser.ts

export function parsePadding(valueNode): ParseResult<PaddingIR> {
  const result = Parsers.BoxSides.parseBoxSides4(nodes, 0);
  // Wrap in property IR
  return parseOk({ kind: "sides", value: result.value });
}

// packages/b_declarations/src/properties/padding-top/parser.ts

export function parsePaddingTop(valueNode): ParseResult<PaddingTopIR> {
  const result = Parsers.Length.parseLengthPercentage(nodes, 0);
  // Wrap in property IR
  return parseOk({ kind: "value", value: result.value });
}
```

---

## 🎯 Generator Architecture

### Shared Utilities

```typescript
// packages/b_generators/src/box-sides.ts

export function generate(sides: BoxSides4): GenerateResult;
// Optimizes: { 10px, 10px, 10px, 10px } → "10px"

// packages/b_generators/src/box-corners.ts

export function generate(corners: BoxCorners4): GenerateResult;

// packages/b_generators/src/position.ts (existing)

export function generate(position: Position2D): GenerateResult;
```

### Property Generators

```typescript
// packages/b_declarations/src/properties/padding/generator.ts

export function generatePadding(ir: PaddingIR): GenerateResult {
  if (ir.kind === "keyword") return generateOk(ir.value);
  return Generators.BoxSides.generate(ir.value);
}

// packages/b_declarations/src/properties/padding-top/generator.ts

export function generatePaddingTop(ir: PaddingTopIR): GenerateResult {
  if (ir.kind === "keyword") return generateOk(ir.value);
  return Generators.Length.generateLengthPercentage(ir.value);
}
```

---

## 📊 Summary Table

| Property                | Core Type     | Property IR             | Parser Utility          | Generator Utility                 |
| ----------------------- | ------------- | ----------------------- | ----------------------- | --------------------------------- |
| `padding`               | `BoxSides4`   | `PaddingIR`             | `parseBoxSides4`        | `BoxSides.generate`               |
| `margin`                | `BoxSides4`   | `MarginIR`              | `parseBoxSides4`        | `BoxSides.generate`               |
| `border-width`          | `BoxSides4`   | `BorderWidthIR`         | `parseBoxSides4`        | `BoxSides.generate`               |
| `border-style`          | `BoxSides4`   | `BorderStyleIR`         | `parseBoxSides4`        | `BoxSides.generate`               |
| `border-color`          | `BoxSides4`   | `BorderColorIR`         | `parseBoxSides4`        | `BoxSides.generate`               |
| `border-radius`         | `BoxCorners4` | `BorderRadiusIR`        | `parseBoxCorners4`      | `BoxCorners.generate`             |
| `background-position`   | `Position2D`  | `BackgroundPositionIR`  | `parsePosition2D`       | `Position.generate`               |
| `padding-top`           | `CssValue`    | `PaddingTopIR`          | `parseLengthPercentage` | `Length.generateLengthPercentage` |
| `background-position-x` | `CssValue`    | `BackgroundPositionXIR` | `parseLengthPercentage` | `Length.generateLengthPercentage` |

---

## 🔥 Key Decisions

### 1. Canonical Representation

**Always expand to full structure:**

- `padding: 10px` → `{ top: 10px, right: 10px, bottom: 10px, left: 10px }`
- Generator optimizes output automatically

**Why:** Simplicity, queryability, consistency with Position2D

### 2. Reusable Core Types

**Shared across properties:**

- `BoxSides4` used by padding, margin, border-width, border-style, border-color
- `BoxCorners4` used by border-radius
- `Position2D` used by background-position (multi-value list)

**Why:** DRY, consistency, easier to maintain

### 3. Property IR Wraps Core Type

**Pattern:**

```typescript
PropertyIR = Keyword | { kind: "sides" / "corners" / "value", value: CoreType };
```

**Why:** Uniform handling of css-wide keywords, clear structure

### 4. Generator Optimization

**Always optimize output:**

- `{ 10px, 10px, 10px, 10px }` → `"10px"`
- `{ 10px, 20px, 10px, 20px }` → `"10px 20px"`

**Why:** Concise output, matches CSS best practices

---

## ✅ Implementation Checklist

### Phase 1: Core Types (1 day)

```
□ Create @b/types/src/box-sides.ts (BoxSides4)
□ Create @b/types/src/box-corners.ts (BoxCorners4)
□ Export from @b/types/src/index.ts
```

### Phase 2: Parsers (1 day)

```
□ Create @b/parsers/src/box-sides.ts (parseBoxSides4)
□ Create @b/parsers/src/box-corners.ts (parseBoxCorners4)
□ Export from @b/parsers/src/index.ts
□ Add tests
```

### Phase 3: Generators (1 day)

```
□ Create @b/generators/src/box-sides.ts (generate with optimization)
□ Create @b/generators/src/box-corners.ts (generate with optimization)
□ Export from @b/generators/src/index.ts
□ Add tests
```

### Phase 4: Properties (2-3 days)

```
□ Implement padding (structural shorthand)
□ Implement padding-top/right/bottom/left (individual longhands)
□ Implement margin (structural shorthand)
□ Implement margin-top/right/bottom/left (individual longhands)
□ Implement border-width, border-style, border-color
□ Implement border-radius
```

---

## 🎯 This is the pattern. Lock it in. 🔥
