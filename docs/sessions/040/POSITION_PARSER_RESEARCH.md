# Position Parser Research

**Date:** 2025-11-06

---

## Current Implementation

### Type Definition (`packages/b_types/src/position.ts`)

```typescript
export const position2DSchema = z
  .object({
    horizontal: cssValueSchema,
    vertical: cssValueSchema,
  })
  .strict();
```

**Issue:** Only supports simple value pairs, no edge+offset structure.

---

### Parser (`packages/b_parsers/src/position.ts`)

**Current logic (lines 13-75):**

```typescript
export function parsePosition2D(nodes, startIdx) {
  // Parse first value
  const firstValue = parseCssValueNodeEnhanced(firstNode);
  positionValues.push(firstValue.value);

  // Parse second value if present
  const secondValue = parseCssValueNodeEnhanced(secondNode);
  positionValues.push(secondValue.value);

  // Build position (1 or 2 values only)
  if (positionValues.length === 1) {
    // Handle single keyword
  } else {
    position = { horizontal: first, vertical: second };
  }
}
```

**Problems:**

1. ❌ Only parses first 2 values
2. ❌ No handling for 3-value syntax: `left 15% top`
3. ❌ No handling for 4-value syntax: `left 15% top 20px`
4. ❌ Doesn't pair keywords with offsets
5. ❌ Can't represent edge+offset structure

**Example failure:**

```
Input:  at top 20px left 15%
Tokens: [top, 20px, left, 15%]
Parse:  Takes top (index 0) and 20px (index 1)
Result: { horizontal: top, vertical: 20px } ❌ WRONG
```

---

## CSS Spec Analysis

### Position Value Syntax

From CSS Backgrounds Level 3:

```
<position> =
  [ [ left | center | right ] || [ top | center | bottom ] ]
|
  [ [ left | center | right | <length-percentage> ]
    [ top | center | bottom | <length-percentage> ]? ]
|
  [ [ left | right ] <length-percentage> ] &&
    [ [ top | bottom ] <length-percentage> ]
```

### Syntax Breakdown

**1-value:**

- `center` → 50% 50%
- `left` → left center → 0% 50%
- `50%` → 50% center → 50% 50%

**2-value:**

- `left top` → 0% 0%
- `50% 75%` → 50% 75%
- `center bottom` → 50% 100%

**3-value:**

- `left 15% top` → 15% from left, top edge → (15%, 0%)
- `right 10% center` → 10% from right, center vertical → (90%, 50%)
- `center top 20px` → center horizontal, 20px from top → (50%, 20px)

**4-value:**

- `left 15% top 20px` → 15% from left, 20px from top
- `right 10% bottom 30px` → 10% from right, 30px from bottom
- `top 20px left 15%` → 20px from top, 15% from left (order doesn't matter for axes)

---

## Keyword-Offset Pairing Rules

### 4-Value Syntax

Pattern: `[edge1] [offset1] [edge2] [offset2]`

**Key insight:** Keywords come in pairs with their offsets!

```
left 15% top 20px
└────┬────┘ └────┬────┘
  pair 1    pair 2

Pair 1: horizontal (left + 15%)
Pair 2: vertical (top + 20%)
```

**Order independence:**

```
left 15% top 20px  ≡  top 20px left 15%
```

Both mean: 15% from left, 20px from top

**Axis determination:**

- `left`/`right` → horizontal
- `top`/`bottom` → vertical
- First pair determines its axis by keyword
- Second pair must be the other axis

---

## Proposed Type Structure

### Option 1: Union Type (Flexible)

```typescript
export type Position2D = {
  horizontal: CssValue | PositionEdgeOffset;
  vertical: CssValue | PositionEdgeOffset;
};

export type PositionEdgeOffset = {
  edge: "left" | "right" | "top" | "bottom";
  offset: CssValue;
};
```

**Pros:**

- Backward compatible with simple values
- Clear representation of 4-value syntax
- Easy to detect which variant is being used

**Cons:**

- Consumer code needs to check which variant
- Slightly more complex type checking

### Option 2: Separate Fields

```typescript
export type Position2D = {
  horizontal: CssValue;
  vertical: CssValue;
  horizontalEdge?: "left" | "right";
  verticalEdge?: "top" | "bottom";
};
```

**Pros:**

- Always has simple horizontal/vertical values
- Optional edge fields for 4-value

**Cons:**

- Less clear that edge+offset are paired
- Values have different meanings depending on edge presence

### Recommendation: Option 1

Use union type for clarity and correct pairing representation.

---

## Parser Algorithm

### Step 1: Collect All Position Values

```typescript
const values: Type.CssValue[] = [];
let idx = startIdx;

while (idx < nodes.length && !isCommaOrEnd(nodes[idx])) {
  const val = parseCssValueNodeEnhanced(nodes[idx]);
  if (val.ok) {
    values.push(val.value);
    idx++;
  } else {
    break;
  }
}
```

### Step 2: Determine Syntax Variant

```typescript
switch (values.length) {
  case 1:
    return parse1Value(values);
  case 2:
    return parse2Value(values);
  case 3:
    return parse3Value(values);
  case 4:
    return parse4Value(values);
  default:
    return error;
}
```

### Step 3: Parse 4-Value (Most Complex)

```typescript
function parse4Value(values: CssValue[]): Position2D {
  // Pattern: [keyword] [offset] [keyword] [offset]
  // Validate: values[0] and values[2] must be edge keywords

  const edge1 = getEdgeKeyword(values[0]);
  const offset1 = values[1];
  const edge2 = getEdgeKeyword(values[2]);
  const offset2 = values[3];

  if (!edge1 || !edge2) {
    return error("Expected edge keywords");
  }

  // Determine which pair is horizontal vs vertical
  const isHorizontal1 = edge1 === "left" || edge1 === "right";
  const isHorizontal2 = edge2 === "left" || edge2 === "right";

  if (isHorizontal1 === isHorizontal2) {
    return error("Both pairs on same axis");
  }

  if (isHorizontal1) {
    return {
      horizontal: { edge: edge1, offset: offset1 },
      vertical: { edge: edge2, offset: offset2 },
    };
  } else {
    return {
      horizontal: { edge: edge2, offset: offset2 },
      vertical: { edge: edge1, offset: offset1 },
    };
  }
}
```

---

## Test Cases

### 4-Value Syntax

```typescript
test("left 15% top 20px", () => {
  expect(result.horizontal).toEqual({ edge: "left", offset: { value: 15, unit: "%" } });
  expect(result.vertical).toEqual({ edge: "top", offset: { value: 20, unit: "px" } });
});

test("top 20px left 15%", () => {
  // Same result - order doesn't matter
  expect(result.horizontal).toEqual({ edge: "left", offset: { value: 15, unit: "%" } });
  expect(result.vertical).toEqual({ edge: "top", offset: { value: 20, unit: "px" } });
});

test("right 10% bottom 30px", () => {
  expect(result.horizontal).toEqual({ edge: "right", offset: { value: 10, unit: "%" } });
  expect(result.vertical).toEqual({ edge: "bottom", offset: { value: 30, unit: "px" } });
});
```

### 3-Value Syntax

```typescript
test("left 15% top", () => {
  expect(result.horizontal).toEqual({ edge: "left", offset: { value: 15, unit: "%" } });
  expect(result.vertical).toEqual({ value: "top" }); // Just keyword
});

test("center top 20px", () => {
  expect(result.horizontal).toEqual({ value: "center" });
  expect(result.vertical).toEqual({ edge: "top", offset: { value: 20, unit: "px" } });
});
```

### 2-Value Syntax (Already Works)

```typescript
test("50% 75%", () => {
  expect(result.horizontal).toEqual({ value: 50, unit: "%" });
  expect(result.vertical).toEqual({ value: 75, unit: "%" });
});
```

---

## Generator Changes

### Current Generator

```typescript
export function generate(position: Type.Position2D): string {
  const h = cssValueToCss(position.horizontal);
  const v = cssValueToCss(position.vertical);
  return `${h} ${v}`;
}
```

### Updated Generator

```typescript
export function generate(position: Type.Position2D): string {
  let css = "";

  // Horizontal
  if ("edge" in position.horizontal) {
    css += `${position.horizontal.edge} ${cssValueToCss(position.horizontal.offset)}`;
  } else {
    css += cssValueToCss(position.horizontal);
  }

  css += " ";

  // Vertical
  if ("edge" in position.vertical) {
    css += `${position.vertical.edge} ${cssValueToCss(position.vertical.offset)}`;
  } else {
    css += cssValueToCss(position.vertical);
  }

  return css;
}
```

---

## Migration Impact

### Breaking Changes

1. **Type Structure:** `Position2D` horizontal/vertical can now be edge+offset
2. **Consumer Code:** Need to check if value is plain or edge+offset

### Migration Example

```typescript
// Before
const x = position.horizontal;
const y = position.vertical;

// After
const x = "edge" in position.horizontal ? position.horizontal.offset : position.horizontal;
const y = "edge" in position.vertical ? position.vertical.offset : position.vertical;
```

### Affected Areas

- Radial gradient parser/generator
- Conic gradient parser/generator
- Background-position property
- Any code that consumes Position2D

---

## Implementation Priority

**High** - This affects semantic correctness of position interpretation.

### Phased Approach

1. **Phase 1:** Add new type structure (union with edge+offset)
2. **Phase 2:** Update parser to handle 3/4-value syntax
3. **Phase 3:** Update generator
4. **Phase 4:** Add comprehensive tests
5. **Phase 5:** Update documentation and migration guide

---

## Estimated Effort

- Type updates: 1-2 hours
- Parser implementation: 3-4 hours
- Generator implementation: 1-2 hours
- Tests: 2-3 hours
- Total: **7-11 hours**

---

## References

- [CSS Backgrounds Level 3 - Position](https://www.w3.org/TR/css-backgrounds-3/#typedef-bg-position)
- [MDN: position_value](https://developer.mozilla.org/en-US/docs/Web/CSS/position_value)
- [CSS Images Level 4 - Gradient Positioning](https://www.w3.org/TR/css-images-4/#radial-gradients)
