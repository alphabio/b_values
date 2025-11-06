# Position 4-Value Syntax Issue

**Date:** 2025-11-06
**Status:** 🔴 **TO FIX**

---

## Problem

The current position parser incorrectly interprets the 4-value position syntax for gradients.

### Current Behavior

For `at top 20px left 15%`:

```json
"position": {
  "horizontal": { "kind": "keyword", "value": "top" },
  "vertical": { "kind": "literal", "value": 20, "unit": "px" }
}
```

This is **WRONG** - it's mixing up the keyword-offset pairs.

---

## CSS Spec

**4-value syntax:** `[keyword] [offset] [keyword] [offset]`

Each keyword-offset pair belongs together:
- First pair: edge + offset
- Second pair: edge + offset

For `at top 20px left 15%`:
- `top 20px` → vertical position (from top edge, offset by 20px)
- `left 15%` → horizontal position (from left edge, offset by 15%)

---

## Correct IR Structure

```json
"position": {
  "horizontal": {
    "edge": "left",
    "offset": { "kind": "literal", "value": 15, "unit": "%" }
  },
  "vertical": {
    "edge": "top",
    "offset": { "kind": "literal", "value": 20, "unit": "px" }
  }
}
```

---

## Full CSS Position Syntax

From CSS spec:

```
<position> = 
  [ left | center | right ] || [ top | center | bottom ] |
  [ left | center | right | <length-percentage> ] 
    [ top | center | bottom | <length-percentage> ]? |
  [ [ left | right ] <length-percentage> ] && 
    [ [ top | bottom ] <length-percentage> ]
```

**Syntax variants:**

1. **1-value:** `center`, `left`, `50%`
2. **2-value:** `left top`, `50% 50%`, `center 25%`
3. **3-value:** `left 15% top`, `right 10% bottom`
4. **4-value:** `left 15% top 20px` (each pair is edge + offset)

---

## Impact

**Affected:**
- Radial gradients: `radial-gradient(at top 20px left 15%, ...)`
- Conic gradients: `conic-gradient(at top 20px left 15%, ...)`
- Background positions: `background-position: top 20px left 15%`

**Not affected:**
- 2-value syntax: `at 50% 50%` (works correctly)
- 1-value syntax: `at center` (works correctly)

---

## Files to Fix

1. **Type Definition:**
   - `packages/b_types/src/position.ts` - Update Position type to support edge+offset structure

2. **Parser:**
   - `packages/b_parsers/src/position.ts` - Fix 4-value parsing logic

3. **Generator:**
   - `packages/b_generators/src/position.ts` - Update to generate edge+offset syntax

4. **Tests:**
   - Add comprehensive tests for 4-value position syntax
   - Test all variants: `left X top Y`, `right X bottom Y`, etc.

---

## Implementation Notes

### Type Schema

```typescript
// Current (incorrect)
export type Position = {
  horizontal: CssValue;
  vertical: CssValue;
}

// Proposed (correct)
export type Position = {
  horizontal: CssValue | { edge: "left" | "right"; offset: CssValue };
  vertical: CssValue | { edge: "top" | "bottom"; offset: CssValue };
}
```

### Parser Strategy

1. Parse all tokens in position
2. Detect syntax variant:
   - 1 token → single keyword or value
   - 2 tokens → horizontal + vertical
   - 3 tokens → keyword + offset + keyword
   - 4 tokens → keyword + offset + keyword + offset
3. For 4-value: pair keywords with their following offsets
4. Determine which pairs are horizontal vs vertical based on keyword

### Edge Cases

- `left 10px top` (3-value: horizontal with offset, vertical keyword only)
- `top 20px` (2-value: could be vertical with offset, or keyword + value)
- `center 50px` (2-value: center horizontally, 50px vertically)

---

## Test Cases Needed

```typescript
// 4-value syntax
"at left 15% top 20px"     → left 15% from left, 20px from top
"at right 10% bottom 30px" → 10% from right, 30px from bottom  
"at top 20px left 15%"     → 20px from top, 15% from left (order matters!)

// 3-value syntax  
"at left 15% top"          → 15% from left, top edge
"at right 10% center"      → 10% from right, center vertically

// 2-value syntax (already works)
"at 50% 50%"               → center
"at left top"              → top-left corner

// 1-value syntax (already works)
"at center"                → center both axes
```

---

## Backward Compatibility

This is a **breaking change** to the IR structure. Migration needed:

```typescript
// Old position
if (position.horizontal.kind === "literal") {
  // horizontal is a value
}

// New position  
if ("edge" in position.horizontal) {
  // 4-value syntax: edge + offset
  console.log(position.horizontal.edge);    // "left" | "right"
  console.log(position.horizontal.offset);  // CssValue
} else {
  // 2-value syntax: just a value
  console.log(position.horizontal);  // CssValue
}
```

---

## Priority

**Medium-High** - This affects correctness of position interpretation, but:
- Many gradients use simpler 2-value syntax (works correctly)
- 4-value syntax is less common
- Generator will still output valid CSS (but with wrong semantics)

---

## References

- CSS Backgrounds and Borders Module Level 3: https://www.w3.org/TR/css-backgrounds-3/#the-background-position
- CSS Images Module Level 4: https://www.w3.org/TR/css-images-4/#gradients
- MDN: https://developer.mozilla.org/en-US/docs/Web/CSS/position_value

---

## Next Steps

1. Research current position parser implementation
2. Design new type schema with edge+offset support
3. Update parser to correctly handle 4-value syntax
4. Update generator to output new structure
5. Add comprehensive tests
6. Document breaking change in CHANGELOG
