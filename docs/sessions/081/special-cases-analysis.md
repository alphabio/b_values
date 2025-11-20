# Special Cases Analysis - Session 081

**Date:** 2025-11-19
**Focus:** Verify filter, backdrop-filter, and border-radius properties

---

## ✅ filter & backdrop-filter - CORRECT

**Status:** These are implemented CORRECTLY and follow the proper pattern.

### Implementation Pattern

**Type Definition (filter):**

```typescript
export type FilterIR =
  | { kind: "keyword"; value: "initial" | "inherit" | ... | "none" }
  | { kind: "css-value"; value: Type.CssValue }
  | { kind: "filter-list"; value: Type.FilterList };
```

**Parser Flow:**

1. Check for keywords (cssWide, none) ✅
2. Try concrete type: `Parsers.Filter.parseFilterList(ast)` ✅
3. Fallback to CssValue for var()/calc() ✅

**Why it's correct:**

- Has concrete type discriminator: `{ kind: "filter-list" }`
- Parser tries concrete parsing BEFORE CssValue
- Proper fallback to `css-value` discriminator for var()/calc()

**Verification:**

```typescript
filter: blur(5px)           → { kind: "filter-list", value: [...] }
filter: var(--blur)         → { kind: "css-value", value: { kind: "var", ... } }
backdrop-filter: blur(5px)  → { kind: "filter-list", value: [...] }
```

**Action:** ✅ NO CHANGES NEEDED

---

## ✅ border-radius (4 properties) - CORRECT

**Status:** These are architecturally CORRECT. CssValue as leaf node is intentional.

### Properties

- border-bottom-left-radius
- border-bottom-right-radius
- border-top-left-radius
- border-top-right-radius

### Implementation Pattern

**Type Definition:**

```typescript
export type BorderBottomLeftRadiusIR =
  | { kind: "keyword"; value: "initial" | "inherit" | ... }
  | { kind: "circular"; radius: CssValue }       // ← CssValue as leaf
  | { kind: "elliptical"; horizontal: CssValue; vertical: CssValue };  // ← CssValue as leaf
```

**Parser Flow:**

1. Parse first value with `parseNodeToCssValue()` → always CssValue
2. Single value → `{ kind: "circular", radius: CssValue }`
3. Two values → `{ kind: "elliptical", horizontal: CssValue, vertical: CssValue }`

**Why CssValue is correct here:**

- The discriminator is at the **shape level** (`circular` vs `elliptical`), not the value level
- `CssValue` includes both concrete values (`literal`) AND CSS functions (`var`, `calc`)
- This is the correct abstraction: shape discrimination + flexible value system

**Comparison to incorrect pattern:**

```typescript
// ❌ WRONG: Missing shape discrimination
type BadRadius = { kind: "keyword" } | { kind: "value"; value: CssValue }; // Lost circular/elliptical info!

// ✅ CORRECT: Shape + flexible value
type GoodRadius =
  | { kind: "keyword" }
  | { kind: "circular"; radius: CssValue } // Shape info preserved
  | { kind: "elliptical"; horizontal: CssValue; vertical: CssValue };
```

**Verification:**

```typescript
border-radius: 5px              → { kind: "circular", radius: { kind: "literal", value: 5, unit: "px" } }
border-radius: 5px 10px         → { kind: "elliptical", horizontal: {...}, vertical: {...} }
border-radius: var(--r)         → { kind: "circular", radius: { kind: "var", ... } }
border-radius: calc(5px + 10%)  → { kind: "circular", radius: { kind: "calc", ... } }
```

**Action:** ✅ NO CHANGES NEEDED

---

## Available Parsers & Types Summary

### ✅ Parsers Available

**Time:**

- `Parsers.Time.parseTimeNode(node): ParseResult<Type.Time>`

**Length/Percentage:**

- `Parsers.Length.parseLengthNode(node): ParseResult<Type.Length>`
- `Parsers.Length.parseLengthPercentageNode(node): ParseResult<Type.LengthPercentage>`
- `Parsers.Length.parseNumberNode(node): ParseResult<number>` ← For unitless numbers!

**Angle:**

- `Parsers.Angle.parseAngleNode(node): ParseResult<Type.Angle>`

**Position:**

- `Parsers.Position.*` - Need to investigate exports

**Color:**

- `Parsers.Color.parseNode(node): ParseResult<Type.Color>` (handles concrete + CssValue internally)

**Filter:**

- `Parsers.Filter.parseFilterList(ast): ParseResult<Type.FilterList>`

**Image:**

- `Parsers.Image.*` - Already used by background-image

**Utils:**

- `Parsers.Utils.parseNodeToCssValue(node): ParseResult<CssValue>` - Generic fallback

---

### ✅ Types Available

**Concrete Types:**

- `Type.Time` - `{ value: number, unit: TimeUnit }`
- `Type.Length` - `{ value: number, unit: LengthUnit }`
- `Type.LengthPercentage` - Union of Length | Percentage
- `Type.Percentage` - `{ value: number, unit: "%" }`
- `Type.Angle` - `{ value: number, unit?: AngleUnit }`
- `Type.CSSNumber` - Plain `number` (for unitless values)
- `Type.Color` - Discriminated union (hex, rgb, hsl, etc.)
- `Type.FilterList` - Array of filter functions
- `Type.Position` - Position type (need to check structure)

**Generic Type:**

- `Type.CssValue` - Universal type for var(), calc(), literals, etc.

---

## Missing Types/Keywords/Units? ❌ NONE

### Units - All Present ✅

From `@b/units`:

- `TIME_UNITS`: s, ms
- `ANGLE_UNITS`: deg, grad, rad, turn
- `ABSOLUTE_LENGTH_UNITS`: px, cm, mm, in, pt, pc
- `FONT_LENGTH_UNITS`: em, rem, ex, ch, etc.
- `VIEWPORT_LENGTH_UNITS`: vw, vh, vmin, vmax, etc.
- `PERCENTAGE_UNIT`: %

### Keywords - All Present ✅

From `@b/keywords`:

- `cssWide` - inherit, initial, unset, revert, revert-layer
- `none` - none keyword
- `absoluteSizeSchema` - xx-small, x-small, small, medium, large, x-large, xx-large
- `relativeSizeSchema` - larger, smaller
- `fontWeightKeywordSchema` - normal, bold, lighter, bolder
- `lineWidthKeywordSchema` - thin, medium, thick
- Many others...

### Types - All Present ✅

From `@b/types`:

- All concrete types listed above
- `CssValue` with discriminated union for var/calc/literals
- Result types: ParseResult, GenerateResult
- Issue types: Issue, Severity

**Conclusion:** No new keywords, units, or types need to be added.

---

## Architectural Patterns

### Pattern 1: Concrete Type at Discriminator Level (RECOMMENDED)

**Use when:** Property values are semantically different types

```typescript
// Type
type PropertyIR =
  | { kind: "keyword"; value: ... }
  | { kind: "time"; value: Type.Time }      // Concrete type here
  | { kind: "value"; value: CssValue };     // Fallback

// Parser
const timeResult = Parsers.Time.parseTimeNode(node);
if (timeResult.ok) {
  return { kind: "time", value: timeResult.value };
}
const cssValueResult = Parsers.Utils.parseNodeToCssValue(node);
return { kind: "value", value: cssValueResult.value };
```

**Examples:** animation-delay, margins, paddings

---

### Pattern 2: Shape Discrimination + CssValue Leaves (VALID)

**Use when:** Shape/structure matters more than value type

```typescript
// Type
type PropertyIR =
  | { kind: "keyword"; value: ... }
  | { kind: "circular"; radius: CssValue }           // Shape discriminator
  | { kind: "elliptical"; horizontal: CssValue; vertical: CssValue };

// Parser
const radiusResult = Parsers.Utils.parseNodeToCssValue(node);
if (singleValue) {
  return { kind: "circular", radius: radiusResult.value };
} else {
  return { kind: "elliptical", horizontal: h, vertical: v };
}
```

**Examples:** border-radius properties

---

### Pattern 3: Parser-Level Concrete Handling (VALID)

**Use when:** Concrete parser handles CssValue internally

```typescript
// Type
type PropertyIR =
  | { kind: "keyword"; value: ... }
  | { kind: "value"; value: ConcreteType };  // ConcreteType = Concrete | CssValue

// Parser
const concreteResult = Parsers.Concrete.parseNode(node);  // Handles var/calc internally
return { kind: "value", value: concreteResult.value };
```

**Examples:** background-color (Color parser handles concrete + CssValue), filter (FilterList parser)

---

## Final Verdict

### ✅ No Changes Needed (6 properties)

1. filter - Correct discriminated union with filter-list
2. backdrop-filter - Correct discriminated union with filter-list
3. border-bottom-left-radius - Correct shape discrimination
4. border-bottom-right-radius - Correct shape discrimination
5. border-top-left-radius - Correct shape discrimination
6. border-top-right-radius - Correct shape discrimination

### ❌ Need Fixes (26 properties)

See main TODO.md for full list:

- Time (4): animation-delay (type exists), animation-duration, transition-delay, transition-duration
- Length/Percentage (16): margins, paddings, border-widths, spacing, perspective, font-size
- Position (2): background-position-x/y
- Numeric (4+): opacity, animation-iteration-count, font-weight, line-height

---

## Key Takeaways

1. **CssValue as leaf is valid** when shape/structure is discriminated at IR level
2. **All needed parsers exist** - no new infrastructure needed
3. **No missing types/keywords/units** - everything is already defined
4. **Three valid patterns** for handling concrete types + CssValue
5. **Filter properties are exemplars** of correct implementation
