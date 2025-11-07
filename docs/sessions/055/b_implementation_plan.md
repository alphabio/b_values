# Background Properties Implementation Plan

## Intel Summary

### ✅ Available Infrastructure

**Parsers (@b/parsers):**

- ✅ `Position.parsePosition2D()` - handles 1-4 value position syntax
- ✅ `Length.parseFromNode()` - parses length values
- ✅ `Url.parseUrlFromNode()` - parses url() functions

**Generators (@b/generators):**

- ✅ `Position.generate()` - generates position CSS
- ✅ `Length.generate()` - generates length CSS
- ✅ `Length.generateLengthPercentage()` - generates length-percentage CSS

**Types (@b/types):**

- ✅ `Position2D` - 2D position with horizontal/vertical
- ✅ `PositionEdgeOffset` - edge + offset for 3/4-value syntax
- ✅ `Length` - length value with unit
- ✅ `LengthPercentage` - length or percentage
- ✅ `CssValue` - generic CSS value (keyword, length, percentage, etc)

**Utils (@b/declarations/src/utils):**

- ✅ `createMultiValueParser` - factory for comma-separated multi-value properties
- ✅ `isCSSWideKeyword()` - checks for inherit/initial/unset/revert
- ✅ `parseCSSWideKeyword()` - parses CSS-wide keywords

**AST Utils (@b/utils):**

- ✅ `Ast.isIdentifier()` - type guard for identifier nodes
- ✅ `Ast.nodeListToArray()` - converts css-tree List to array
- ✅ `Ast.getNodeLocation()` - extracts location info
- ✅ `cssValueToCss()` - converts CssValue IR to CSS string

### 📋 Properties to Implement

#### Phase 1: Simple Keyword Properties (EASIEST - Start Here!)

**1. background-attachment**

- Syntax: `<attachment>#` where `<attachment> = scroll | fixed | local`
- Initial: `scroll`
- Multi-value: YES
- Complexity: ⭐ (Simple 3-keyword enum)

**2. background-clip**

- Syntax: `<box>#` where `<box> = border-box | padding-box | content-box | text`
- Initial: `border-box`
- Multi-value: YES
- Complexity: ⭐ (Simple 4-keyword enum)

**3. background-origin**

- Syntax: `<box>#` where `<box> = border-box | padding-box | content-box`
- Initial: `padding-box`
- Multi-value: YES
- Complexity: ⭐ (Simple 3-keyword enum, identical to clip minus "text")

#### Phase 2: Keyword Combinations

**4. background-repeat**

- Syntax: `<repeat-style>#` where `<repeat-style> = repeat-x | repeat-y | [repeat | space | round | no-repeat]{1,2}`
- Initial: `repeat`
- Multi-value: YES
- Complexity: ⭐⭐ (1-2 keyword combo)

#### Phase 3: Complex Values

**5. background-size**

- Syntax: `<bg-size>#` where `<bg-size> = [ <length-percentage [0,∞]> | auto ]{1,2} | cover | contain`
- Initial: `auto`
- Multi-value: YES
- Complexity: ⭐⭐⭐ (Keywords + length/percentage, 1-2 values)

**6. background-position**

- Syntax: `<position>#`
- Initial: `0% 0%`
- Multi-value: YES
- Complexity: ⭐⭐⭐⭐ (Most complex, but we have Position parser!)

---

## Implementation Strategy

### Phase 1: Simple Keywords (All 3 Together)

These are almost identical in structure - implement in one pass:

1. background-attachment
2. background-clip
3. background-origin

**Time estimate:** 30-45 minutes for all 3

**Structure for each:**

```typescript
// types.ts - Simple discriminated union
export type BackgroundAttachmentIR =
  | { kind: "keyword"; value: string } // CSS-wide keywords
  | { kind: "layers"; layers: AttachmentValue[] };

export type AttachmentValue = "scroll" | "fixed" | "local";

// generator.ts - Map layers to CSS
export function generateBackgroundAttachment(ir: BackgroundAttachmentIR): GenerateResult {
  if (ir.kind === "keyword") return generateOk(ir.value, "background-attachment");
  return generateOk(ir.layers.join(", "), "background-attachment");
}

// parser.ts - Use createMultiValueParser
export const parseBackgroundAttachment = createMultiValueParser({
  preParse: (value) => {
    if (isCSSWideKeyword(value)) {
      const result = parseCSSWideKeyword(value);
      if (result.ok) return parseOk({ kind: "keyword", value: result.value });
    }
    return null;
  },
  itemParser: (valueNode) => {
    const nodes = Ast.nodeListToArray(valueNode.children);
    const node = nodes[0];
    if (Ast.isIdentifier(node)) {
      const val = node.name.toLowerCase();
      if (["scroll", "fixed", "local"].includes(val)) {
        return parseOk(val as AttachmentValue);
      }
    }
    return parseErr(createError("invalid-value", `Invalid background-attachment value`));
  },
  aggregator: (layers) => ({ kind: "layers", layers }),
});
```

### Test Structure (TDD - Write Tests First!)

**Generator tests (write first):**

1. CSS-wide keywords (inherit, initial, unset, revert)
2. Single valid keyword
3. Multiple keywords (comma-separated)
4. All valid values

**Parser tests (write first):**

1. CSS-wide keywords
2. Single valid keyword
3. Multiple keywords
4. Invalid keywords (should error)
5. Round-trip (parse → generate → parse)

---

## Execution Order

### 1. background-attachment (FIRST - Simplest)

- ✅ Create directory structure
- ✅ Write types.ts
- ✅ Write generator.test.ts (TDD)
- ✅ Write generator.ts (implement to pass tests)
- ✅ Write parser.test.ts (TDD)
- ✅ Write parser.ts (implement to pass tests)
- ✅ Write definition.ts
- ✅ Export from index.ts
- ✅ Add to properties/index.ts

### 2. background-clip (SECOND - Copy pattern)

- Same structure as attachment
- 4 keywords instead of 3
- Almost identical code

### 3. background-origin (THIRD - Copy pattern)

- Same structure as attachment
- 3 keywords (same as attachment)
- Different initial value

### 4. Verify Phase 1

```bash
pnpm test background-attachment
pnpm test background-clip
pnpm test background-origin
just check
just build
```

### 5. background-repeat (PHASE 2)

- More complex: 1-2 keyword syntax
- Two-step parser: check shorthand (repeat-x, repeat-y) first, then 1-2 keywords
- More test cases

### 6. background-size (PHASE 3)

- Keywords (auto, cover, contain) + length-percentage
- 1-2 values (width, height)
- Use Length/LengthPercentage parsers

### 7. background-position (PHASE 3 - Most Complex)

- Use existing `Parsers.Position.parsePosition2D()`
- Wrapper for multi-value
- Leverage existing infrastructure

---

## File Structure Per Property

```
background-{property}/
├── types.ts              # IR types
├── generator.test.ts     # Generator tests (write first!)
├── generator.ts          # IR → CSS
├── parser.test.ts        # Parser tests (write first!)
├── parser.ts             # CSS → IR
├── definition.ts         # Registry definition
└── index.ts              # Barrel export
```

---

## Ready to Execute!

**Start with:** `background-attachment` (simplest, establishes pattern)

**Test count estimate:**

- background-attachment: ~15 tests
- background-clip: ~18 tests
- background-origin: ~15 tests
- Total Phase 1: ~48 new tests

**Current tests:** 2211
**After Phase 1:** ~2259
