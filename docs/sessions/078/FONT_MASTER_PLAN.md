# 🎯 Font Property Family - Master Implementation Plan

**Status:** Planning Phase
**Date:** 2025-11-15
**Scope:** Font-related CSS properties (NO SHORTHAND)

---

## 📋 Executive Summary

Font properties are a **large, interconnected family** requiring careful coordination across:

- **Keywords** (font-weight, font-style, font-variant, font-stretch, font-family)
- **Types** (font-size with absolute/relative/length-percentage, line-height with number/length-percentage)
- **Parsers** (numeric ranges, keyword parsing, family-name vs generic-family distinction)
- **Generators** (quote handling for family names with spaces, numeric precision)

**Key Challenge:** Font properties share many primitive types but have unique validation rules.

---

## 🚫 Out of Scope

**WE DO NOT SUPPORT SHORTHANDS** - Per ADR 001: Longhands Only

❌ `font` shorthand property - **NOT IMPLEMENTING**
✅ Individual longhand properties - **THIS IS THE PLAN**

---

## 📦 Property Inventory

### Phase 1: Core Font Properties (6 properties)

| Property       | Complexity | Dependencies                    | Priority |
| -------------- | ---------- | ------------------------------- | -------- |
| `font-family`  | ⭐⭐⭐     | New types, keywords             | P0       |
| `font-size`    | ⭐⭐⭐     | New keywords, length-percentage | P0       |
| `font-weight`  | ⭐⭐       | New keywords, number validation | P0       |
| `font-style`   | ⭐⭐       | New keywords, angle             | P0       |
| `font-stretch` | ⭐         | New keywords                    | P1       |
| `font-variant` | ⭐⭐       | New keywords (complex)          | P1       |

### Phase 2: Typography Support (1 property)

| Property      | Complexity | Dependencies              | Priority |
| ------------- | ---------- | ------------------------- | -------- |
| `line-height` | ⭐⭐       | Number, length-percentage | P1       |

### Phase 3: Advanced Font Features (Future)

| Property                  | Complexity | Notes                                  |
| ------------------------- | ---------- | -------------------------------------- |
| `font-feature-settings`   | ⭐⭐⭐⭐   | OpenType feature tags - complex syntax |
| `font-kerning`            | ⭐         | Simple keyword enum                    |
| `font-optical-sizing`     | ⭐         | Simple keyword enum                    |
| `font-variation-settings` | ⭐⭐⭐⭐   | Variable font axes - complex syntax    |

---

## 🔧 Required Infrastructure

### 1. Keywords (`packages/b_keywords/src/`)

**New files to create:**

```
b_keywords/src/
├── font-family.ts          ← generic-family keywords
├── font-size.ts            ← absolute-size, relative-size keywords
├── font-weight.ts          ← normal, bold keywords
├── font-style.ts           ← normal, italic, oblique keywords
├── font-stretch.ts         ← ultra-condensed...ultra-expanded keywords
├── font-variant.ts         ← normal, small-caps keywords
└── system-font.ts          ← caption, icon, menu, etc. (for reference only, not a property)
```

**Example schema structure:**

```typescript
// font-size.ts
export const absoluteSizeSchema = z.union([
  z.literal("xx-small"),
  z.literal("x-small"),
  z.literal("small"),
  z.literal("medium"),
  z.literal("large"),
  z.literal("x-large"),
  z.literal("xx-large"),
  z.literal("xxx-large"),
]);

export const relativeSizeSchema = z.union([z.literal("smaller"), z.literal("larger")]);
```

### 2. Types (`packages/b_types/src/`)

**New files to create:**

```
b_types/src/
├── font/
│   ├── index.ts
│   ├── family.ts           ← family-name vs generic-family distinction
│   ├── size.ts             ← font-size IR (absolute/relative/length-percentage/math)
│   ├── weight.ts           ← font-weight IR (keyword or number [1,1000])
│   └── style.ts            ← font-style IR (keyword or oblique with angle)
└── number.ts               ← Generic CSS number type (NEW - needed for line-height)
```

**Critical design decisions:**

#### Font-Family Types

```typescript
// family.ts
export const familyNameSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("string"),
    value: z.string(),
  }),
  z.object({
    kind: z.literal("custom-ident"),
    value: z.string().array(), // ["Times", "New", "Roman"]
  }),
]);

export const genericFamilySchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("generic-complete"),
    value: z.enum(["serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui", "math"]),
  }),
  z.object({
    kind: z.literal("generic-incomplete"),
    value: z.enum(["ui-serif", "ui-sans-serif", "ui-monospace", "ui-rounded"]),
  }),
  z.object({
    kind: z.literal("generic-script-specific"),
    name: z.enum(["fangsong", "kai", "khmer-mul", "nastaliq"]),
  }),
]);
```

#### Font-Size Types

```typescript
// size.ts
export const fontSizeIRSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("absolute-size"), value: absoluteSizeSchema }),
  z.object({ kind: z.literal("relative-size"), value: relativeSizeSchema }),
  z.object({ kind: z.literal("length-percentage"), value: lengthPercentageSchema }),
  z.object({ kind: z.literal("math"), value: z.literal("math") }),
]);
```

#### Font-Weight Types

```typescript
// weight.ts
export const fontWeightIRSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("keyword"), value: z.enum(["normal", "bold", "bolder", "lighter"]) }),
  z.object({ kind: z.literal("number"), value: z.number().min(1).max(1000) }),
]);
```

### 3. Parsers (`packages/b_parsers/src/`)

**New directories/files:**

```
b_parsers/src/
├── font/
│   ├── index.ts
│   ├── family.ts           ← Parse font-family (complex: string vs ident+ vs generic)
│   ├── size.ts             ← Parse font-size
│   ├── weight.ts           ← Parse font-weight with numeric validation
│   └── style.ts            ← Parse font-style with optional angle
└── number.ts               ← Generic CSS number parser (NEW)
```

**Critical parsing challenges:**

#### Font-Family Parser

```typescript
// Distinguish between:
// "Times New Roman"        → string literal
// Times New Roman          → custom-ident sequence
// serif                    → generic-complete
// generic(fangsong)        → generic-script-specific

// Must handle:
// - Multiple families: "Arial", sans-serif
// - Quoted strings with spaces
// - Unquoted idents (no spaces, join with space)
// - Generic keywords vs family names
```

#### Font-Weight Parser

```typescript
// Accept:
// - Keywords: normal, bold, bolder, lighter
// - Numbers: 1-1000 (inclusive)
// - Invalid: 0, 1001, non-integers (depends on spec - check if decimals allowed)

// Numeric validation pattern:
const value = Number.parseFloat(node.value);
if (value < 1 || value > 1000) {
  return parseErr("font-weight", createError("invalid-value", `Font weight must be between 1 and 1000, got ${value}`));
}
```

### 4. Generators (`packages/b_generators/src/`)

**New directories/files:**

```
b_generators/src/
└── font/
    ├── index.ts
    ├── family.ts           ← Quote family names with spaces/special chars
    ├── size.ts
    ├── weight.ts
    └── style.ts
```

**Critical generation rules:**

#### Font-Family Generator

```typescript
// family-name (string) → always quoted: "Times New Roman"
// family-name (custom-ident) → join with space, quote if needed: Times New Roman (no quotes) or "Special Font!" (quotes)
// generic-family → never quoted: serif, sans-serif

// Quote rules for custom-ident:
// - Contains spaces → quote
// - Contains special chars → quote
// - Otherwise → no quotes
```

---

## 🏗️ Implementation Phases

### Phase 0: Foundation (1-2 hours)

**Goal:** Establish shared infrastructure

1. **Create number type** (`b_types/src/number.ts`)
   - Generic CSS number schema
   - No unit validation
   - Used by line-height and font-weight

2. **Create number parser** (`b_parsers/src/number.ts`)
   - Parse `csstree.Number` nodes
   - Return `{ value: number }`

3. **Add font keywords** (all files in `b_keywords/src/`)
   - font-family.ts
   - font-size.ts
   - font-weight.ts
   - font-style.ts
   - font-stretch.ts
   - font-variant.ts

4. **Update exports** (`b_keywords/src/index.ts`)

---

### Phase 1: Core Properties (3-4 hours each)

#### 1.1 `font-family` (Most Complex)

**Implementation order:**

1. Types: `b_types/src/font/family.ts`
2. Parser: `b_parsers/src/font/family.ts`
3. Generator: `b_generators/src/font/family.ts`
4. Property: `b_declarations/src/properties/font-family/`
5. Tests: Parser + Generator test suites

**Acceptance criteria:**

- ✅ Parses `"Times New Roman", serif`
- ✅ Parses `Times New Roman, serif` (unquoted multi-word)
- ✅ Parses `generic(fangsong)`
- ✅ Generates quoted strings when needed
- ✅ Never quotes generic families

#### 1.2 `font-size` (Medium Complexity)

**Implementation order:**

1. Types: `b_types/src/font/size.ts`
2. Parser: `b_parsers/src/font/size.ts` (reuse Length parser)
3. Generator: `b_generators/src/font/size.ts`
4. Property: `b_declarations/src/properties/font-size/`
5. Tests

**Acceptance criteria:**

- ✅ Parses absolute sizes: `medium`, `x-large`
- ✅ Parses relative sizes: `smaller`, `larger`
- ✅ Parses length-percentage: `16px`, `1.5rem`, `120%`
- ✅ Parses `math` keyword
- ✅ Handles universal functions: `calc()`, `var()`

#### 1.3 `font-weight` (Medium Complexity)

**Implementation order:**

1. Types: `b_types/src/font/weight.ts`
2. Parser: `b_parsers/src/font/weight.ts` (numeric validation!)
3. Generator: `b_generators/src/font/weight.ts`
4. Property: `b_declarations/src/properties/font-weight/`
5. Tests

**Acceptance criteria:**

- ✅ Parses keywords: `normal`, `bold`, `bolder`, `lighter`
- ✅ Parses valid numbers: `400`, `700`, `1`, `1000`
- ✅ Rejects invalid numbers: `0`, `1001`, `-100`
- ✅ Handles universal functions: `var(--weight)`

#### 1.4 `font-style` (Medium Complexity)

**Implementation order:**

1. Types: `b_types/src/font/style.ts`
2. Parser: `b_parsers/src/font/style.ts` (oblique with optional angle)
3. Generator: `b_generators/src/font/style.ts`
4. Property: `b_declarations/src/properties/font-style/`
5. Tests

**Acceptance criteria:**

- ✅ Parses keywords: `normal`, `italic`
- ✅ Parses `oblique` alone (default to no angle)
- ✅ Parses `oblique 15deg` (angle between -90deg and 90deg)
- ✅ Validates angle range

#### 1.5 `font-stretch` (Simple)

**Implementation order:**

1. Keywords already in `b_keywords/src/font-stretch.ts`
2. Property: `b_declarations/src/properties/font-stretch/`
   - Simple keyword enum (like border-style)
3. Tests

**Acceptance criteria:**

- ✅ Parses all stretch keywords: `normal`, `condensed`, `expanded`, etc.

#### 1.6 `font-variant` (Medium - Complex Spec)

**Note:** CSS3 added many sub-properties (font-variant-ligatures, font-variant-caps, etc.)
For MVP, support **CSS2 only**: `normal | small-caps`

**Implementation order:**

1. Keywords: `b_keywords/src/font-variant.ts` (simple for CSS2)
2. Property: `b_declarations/src/properties/font-variant/`
3. Tests

**Acceptance criteria:**

- ✅ Parses `normal`
- ✅ Parses `small-caps`

---

### Phase 2: Typography Support (1-2 hours)

#### 2.1 `line-height`

**Implementation order:**

1. Types: Use existing `lengthPercentageSchema` + new `numberSchema`
2. Parser: `b_parsers/src/length.ts` (extend existing, or new file)
3. Property: `b_declarations/src/properties/line-height/`
4. Tests

**Acceptance criteria:**

- ✅ Parses `normal`
- ✅ Parses unitless number: `1.5`, `2`
- ✅ Parses length-percentage: `20px`, `120%`
- ✅ Validates non-negative: reject `-1`, `-10px`

---

### Phase 3: Advanced Features (Future)

**Out of scope for MVP.** These require significant research and complex parsers:

- `font-feature-settings` (OpenType features, string + number syntax)
- `font-variation-settings` (Variable font axes, tag + number syntax)
- `font-kerning` (simple enum - low priority)
- `font-optical-sizing` (simple enum - low priority)

---

## 🎯 Testing Strategy

### Test Categories

1. **Keyword tests** (all properties)
   - All valid keyword values
   - Case-insensitivity
   - Invalid keywords

2. **Numeric validation** (font-weight, line-height)
   - Boundary values (1, 1000 for weight)
   - Out-of-range values
   - Non-numeric inputs

3. **Complex syntax** (font-family, font-style)
   - Quoted vs unquoted
   - Multiple families
   - Generic keywords
   - Oblique with/without angle

4. **Universal functions** (all properties)
   - `var()`, `calc()`, etc.
   - Mixed with property-specific syntax

5. **Error recovery** (all properties)
   - Invalid syntax handling
   - Partial success scenarios

---

## 🔍 Research Tasks

### Before Implementation

- [ ] **Font-weight decimals**: Does CSS spec allow `400.5`? Check MDN + W3C spec
- [ ] **Font-family quoting rules**: Exact algorithm for when to quote custom-ident sequences
- [ ] **Generic function syntax**: Is `generic(fangsong)` widely supported? Check browser compat
- [ ] **Oblique angle defaults**: If no angle specified, what's the effective angle? (typically 14deg)
- [ ] **Line-height unitless**: Confirm unitless numbers are multipliers (not px)

### Specification References

- CSS Fonts Module Level 4: https://www.w3.org/TR/css-fonts-4/
- CSS Values and Units Level 4: https://www.w3.org/TR/css-values-4/
- MDN font-family: https://developer.mozilla.org/en-US/docs/Web/CSS/font-family
- MDN font-weight: https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight

---

## 📊 Complexity Estimates

| Component      | Time Est. | Risk Level | Notes                           |
| -------------- | --------- | ---------- | ------------------------------- |
| Keywords setup | 0.5h      | Low        | Straightforward enums           |
| Number type    | 0.5h      | Low        | Simple schema                   |
| font-family    | 4h        | High       | Quote logic, generic vs custom  |
| font-size      | 2h        | Medium     | Multiple union branches         |
| font-weight    | 2h        | Medium     | Numeric validation              |
| font-style     | 2h        | Medium     | Oblique angle parsing           |
| font-stretch   | 1h        | Low        | Simple keyword enum             |
| font-variant   | 1h        | Low        | CSS2 only (simple)              |
| line-height    | 2h        | Medium     | Number vs length-percentage     |
| **Total**      | **15h**   | -          | Spread across multiple sessions |

---

## 🚀 Execution Checklist

### Pre-Implementation

- [x] Read this master plan
- [ ] Review ADR 001 (Longhands Only)
- [ ] Review Property Creation Handbook
- [ ] Check existing parsers for similar patterns (length, color, background)

### Per Property

- [ ] Create types in b_types
- [ ] Create parser in b_parsers
- [ ] Create generator in b_generators
- [ ] Create keywords in b_keywords (if needed)
- [ ] Create property in b_declarations
- [ ] Write parser tests (>90% coverage)
- [ ] Write generator tests (>90% coverage)
- [ ] Update manifests and exports
- [ ] Run `just check` (build + lint + test)

### Post-Implementation

- [ ] Update SESSION_HANDOVER.md
- [ ] Update docs if needed
- [ ] Commit with conventional commit message
- [ ] Celebrate! 🎉

---

## 🎯 Success Criteria

**Phase 1 Complete when:**

- ✅ All 6 core font properties registered
- ✅ All tests passing (>90% coverage per property)
- ✅ `just check` passes
- ✅ Properties work in integration tests

**MVP Complete when:**

- ✅ Phase 1 + line-height implemented
- ✅ Documentation updated
- ✅ No regressions in existing properties

---

## ⚠️ Known Challenges

1. **Font-family quoting algorithm**: Complex rules for when to quote
2. **Generic family detection**: Avoid false positives (e.g., `serif` as custom-ident)
3. **Font-weight numeric range**: Browser behavior at boundaries (0.5, 1000.5)
4. **Oblique angle range**: Validation at parse vs generate time
5. **Line-height unitless**: Ensure number is not confused with length

---

## 📝 Notes

- **Start with font-stretch or font-variant** (simplest) to establish workflow
- **Then tackle font-weight** (numeric validation pattern)
- **Then font-size** (multiple union branches)
- **Save font-family for last** (most complex quoting logic)

**Remember:** We break inconsistency, we don't work around it. If you find a pattern that doesn't fit, STOP and propose a refactor.
