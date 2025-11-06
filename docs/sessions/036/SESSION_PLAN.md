# Session 036: Implement color() Function Support

**Status:** READY TO START
**Priority:** P0 (High Impact - 3 failing tests)
**Estimated Time:** 2-3 hours

---

## 🎯 Goal

Implement CSS Color Module Level 4 `color()` function parser to fix 3 failing tests.

---

## 📋 CSS Spec

```
<color()> = 
  color( [ from <color> ]? <colorspace-params> [ / [ <alpha-value> | none ] ]? )  

<colorspace-params> = 
  <custom-params>          |
  <predefined-rgb-params>  |
  <xyz-params>             

<alpha-value> = 
  <number>      |
  <percentage>  

<custom-params> = 
  <dashed-ident> [ <number> | <percentage> | none ]+  

<predefined-rgb-params> = 
  <predefined-rgb> [ <number> | <percentage> | none ]{3}  

<xyz-params> = 
  <xyz-space> [ <number> | <percentage> | none ]{3}  

<predefined-rgb> = 
  srgb               |
  srgb-linear        |
  display-p3         |
  display-p3-linear  |
  a98-rgb            |
  prophoto-rgb       |
  rec2020            |
  rec2100-pq         |
  rec2100-hlg        |
  rec2100-linear     

<xyz-space> = 
  xyz      |
  xyz-d50  |
  xyz-d65  
```

---

## 🏗️ Implementation Protocol

Follow the established pattern: **keywords → units → types → tests → implementation**

### Phase 1: Keywords (b_keywords)

**File:** `packages/b_keywords/src/color-space.ts`

```typescript
// Add to existing or create new
export const PredefinedRgbColorSpace = [
  "srgb",
  "srgb-linear",
  "display-p3",
  "display-p3-linear",
  "a98-rgb",
  "prophoto-rgb",
  "rec2020",
  "rec2100-pq",
  "rec2100-hlg",
  "rec2100-linear",
] as const;

export const XyzColorSpace = [
  "xyz",
  "xyz-d50",
  "xyz-d65",
] as const;

export type PredefinedRgbColorSpace = typeof PredefinedRgbColorSpace[number];
export type XyzColorSpace = typeof XyzColorSpace[number];
```

**Co-located tests:** `packages/b_keywords/src/color-space.test.ts`

### Phase 2: Units (b_units)

**Check if needed:** Color space values use `<number>` or `<percentage>` - likely already exist.

Skip or verify existing units suffice.

### Phase 3: Types (b_types)

**File:** `packages/b_types/src/color.ts`

Add to existing color union:

```typescript
export type ColorFunction = 
  | NamedColor
  | HexColor
  | RgbColor
  | HslColor
  | HwbColor
  | LabColor
  | LchColor
  | OklabColor
  | OklchColor
  | ColorSpaceColor  // NEW
  | SpecialColor
  | CssValueFunction;

export interface ColorSpaceColor {
  kind: "color";
  colorSpace: PredefinedRgbColorSpace | XyzColorSpace | string; // custom with dashed-ident
  from?: ColorFunction; // relative color syntax
  values: Array<CssValue>; // 3+ values (number | percentage | none)
  alpha?: CssValue; // optional alpha
}
```

**Co-located tests:** `packages/b_types/src/color.test.ts`
- Validate Zod schema
- Test all color space values
- Test with/without alpha
- Test relative colors (from)

### Phase 4: Parser Tests (b_parsers)

**File:** `packages/b_parsers/src/color/color-function.test.ts` (NEW or extend existing)

Write comprehensive TDD tests FIRST:

```typescript
describe("color() Function Parser", () => {
  describe("Predefined RGB Color Spaces", () => {
    it("parses color(srgb 1 0 0)", () => { /* ... */ });
    it("parses color(display-p3 1 0 0)", () => { /* ... */ });
    it("parses color(srgb 1 0 0 / 0.5)", () => { /* ... */ }); // with alpha
    // ... all predefined-rgb spaces
  });

  describe("XYZ Color Spaces", () => {
    it("parses color(xyz 0.5 0.3 0.2)", () => { /* ... */ });
    it("parses color(xyz-d50 0.5 0.3 0.2)", () => { /* ... */ });
    it("parses color(xyz-d65 0.5 0.3 0.2)", () => { /* ... */ });
  });

  describe("Custom Color Spaces", () => {
    it("parses color(--custom 0.5 0.3 0.2)", () => { /* ... */ });
    it("parses custom with 4+ values", () => { /* ... */ });
  });

  describe("Relative Colors (from)", () => {
    it("parses color(from red srgb r g b)", () => { /* ... */ });
    it("parses color(from var(--base) display-p3 r g b)", () => { /* ... */ });
  });

  describe("None Values", () => {
    it("parses color(srgb none 0 0)", () => { /* ... */ });
    it("parses color(srgb 1 0 0 / none)", () => { /* ... */ });
  });

  describe("CSS Value Functions", () => {
    it("parses var() in color values", () => { /* ... */ });
    it("parses calc() in color values", () => { /* ... */ });
  });
});
```

**RUN TESTS** - They should ALL FAIL ✅

### Phase 5: Implementation (b_parsers)

**File:** `packages/b_parsers/src/color/color-function.ts` (NEW or extend existing)

Implement parser to make tests pass:

```typescript
export function parseColorFunction(node: FunctionNode): ParseResult<ColorSpaceColor> {
  // 1. Parse color space identifier
  // 2. Check for optional "from <color>"
  // 3. Parse 3+ values (number | percentage | none)
  // 4. Parse optional / alpha
  // 5. Return ColorSpaceColor
}
```

### Phase 6: Generator (b_generators)

**File:** `packages/b_generators/src/color/color-function.ts` (NEW)

**Co-located tests first:** `color-function.test.ts`

Then implement generator.

### Phase 7: Integration

Update main color parser to include `color()` function:
- `packages/b_parsers/src/color/index.ts`
- Add to color parser switch/chain

---

## ✅ Success Criteria

1. All 3 failing conic gradient tests pass:
   - `"conic-gradient(color(srgb 1 0 0), blue)"`
   - `"conic-gradient(color(srgb 1 0 0 / 0.5), blue)"`
   - `"conic-gradient(color(display-p3 1 0 0), blue)"`

2. New comprehensive color() tests added and passing

3. Generator roundtrip works (parse → generate → parse)

4. All existing tests still pass (no regressions)

---

## 📝 Notes

**TDD Approach:**
- Write tests FIRST for each module (keywords, types, parser, generator)
- Tests should FAIL initially
- Implement to make them pass
- Co-locate tests with source files

**Following Session 032-035 Pattern:**
- Intel gathering is done ✅ (this doc)
- Protocol established ✅
- Ready to execute

---

## 🚀 Ready for Session 036

Next agent: Follow the protocol above. Start with keywords, work through to implementation.
