# CssValue API Investigation

**Date:** 2025-11-19T13:32:10Z
**Session:** 080 - Post-Remediation Analysis
**Status:** 🔴 INVESTIGATING

---

## Issue Statement

**User Concern:**

> "do not like this API at all"
>
> ```typescript
> {
>   ok: true,
>   property: "perspective",
>   value: { kind: "value", value: valueResult.value }, // <--- value value value
>   issues: valueResult.issues,
> }
> ```

**Problem:** Repetitive nesting of `value.value` creates poor DX and code smell.

---

## Current State Analysis

### Pattern: `{ kind: "value"; value: CssValue }`

**Affected Properties:** 27 properties use this exact pattern

```typescript
// Example from perspective/types.ts
export type PerspectiveIR =
  | { kind: "keyword"; value: z.infer<typeof Keywords.cssWide> | "none" }
  | { kind: "value"; value: CssValue };
//   ^^^^^^^^ discriminator  ^^^^^ the actual value
```

**Usage in parser:**

```typescript
const valueResult = Parsers.Utils.parseNodeToCssValue(firstNode);
if (valueResult.ok) {
  return {
    ok: true,
    property: "perspective",
    value: { kind: "value", value: valueResult.value },
    //       ^^^^^^^^^^^^ IR wrapper  ^^^^^^^^^^^ actual CSS value
    issues: valueResult.issues,
  };
}
```

**The "value value" problem:**

1. IR discriminator: `kind: "value"` (to differentiate from `kind: "keyword"`)
2. Property name: `value: CssValue` (holds the actual CSS value)
3. Result: `ir.value.value` to access the actual value

---

## Why This Pattern Exists

### Discriminated Union Requirement

TypeScript discriminated unions require a common discriminator field:

```typescript
type PerspectiveIR = { kind: "keyword"; value: "inherit" | "none" } | { kind: "value"; value: CssValue };
//   ^^^^^^^^^^^^ discriminator enables type narrowing
```

This allows:

```typescript
if (ir.kind === "keyword") {
  // TypeScript knows: ir.value is a string
} else {
  // TypeScript knows: ir.value is CssValue
}
```

### Why Not Flatten?

**Can't do this:**

```typescript
// ❌ Invalid - no discriminator
type PerspectiveIR = string | CssValue;
```

**Can't do this:**

```typescript
// ❌ Ambiguous - both have same shape
type PerspectiveIR = { value: string } | { value: CssValue };
```

---

## Alternative Naming Options

### Option 1: Change Property Name

**Current:** `{ kind: "value"; value: CssValue }`
**Alternative:** `{ kind: "value"; cssValue: CssValue }`

```typescript
// Before
value: { kind: "value", value: valueResult.value }
// Access: ir.value.value ❌

// After
value: { kind: "value", cssValue: valueResult.value }
// Access: ir.value.cssValue ✅
```

**Pros:**

- Clearer semantics
- No "value value" repetition
- Type-safe

**Cons:**

- Breaking change to IR
- Inconsistent with keyword branch (`value` vs `cssValue`)
- 27 properties need updating + all tests

---

### Option 2: Change Discriminator Name

**Current:** `{ kind: "value"; value: CssValue }`
**Alternative:** `{ kind: "cssValue"; value: CssValue }`

```typescript
// Before
{ kind: "value", value: valueResult.value }

// After
{ kind: "cssValue", value: valueResult.value }
// Access: ir.value ✅ (when kind === "cssValue")
```

**Pros:**

- Descriptive discriminator
- Keeps property name consistent across branches
- Type-safe

**Cons:**

- Breaking change to IR
- 27 properties need updating + all tests
- Less generic (specific to CSS values)

---

### Option 3: Use Tagged Union with Data

**Current:** `{ kind: "value"; value: CssValue }`
**Alternative:** `{ kind: "value"; data: CssValue }`

```typescript
type PerspectiveIR = { kind: "keyword"; data: string } | { kind: "value"; data: CssValue };
```

**Pros:**

- Consistent property name across all branches
- Common pattern in Rust/functional programming
- Clear separation: `kind` = tag, `data` = payload

**Cons:**

- Breaking change to IR
- Unfamiliar pattern in TypeScript/CSS domain
- Still have `ir.data` which might not be clearer

---

### Option 4: Flatten with Type Narrowing

**Alternative:** Use type property instead of kind

```typescript
type PerspectiveIR = { type: "keyword"; keyword: string } | { type: "cssValue"; cssValue: CssValue };
```

**Pros:**

- No property name collision
- Clear semantics

**Cons:**

- Breaking change
- `type` might conflict with TypeScript's type system conceptually
- More verbose

---

## Other Projects' Approaches

### PostCSS

```typescript
// Uses different node types entirely
type Node = Declaration | Rule | AtRule | Comment;
type Value = { type: "word" | "string" | "function"; value: string };
```

### CSS Tree

```typescript
// Also uses type discriminator
type Node = { type: "Identifier"; name: string } | { type: "Dimension"; value: number; unit: string };
```

### Prettier

```typescript
// Uses doc builders with explicit naming
type Doc = { type: "concat"; parts: Doc[] } | { type: "line" } | { type: "text"; text: string };
```

---

## Comparison Table

| Option       | Discriminator      | Property   | Access Pattern      | Breaking Change | DX Score   |
| ------------ | ------------------ | ---------- | ------------------- | --------------- | ---------- |
| **Current**  | `kind: "value"`    | `value`    | `ir.value.value`    | N/A             | ⭐⭐       |
| **Option 1** | `kind: "value"`    | `cssValue` | `ir.value.cssValue` | Yes             | ⭐⭐⭐⭐   |
| **Option 2** | `kind: "cssValue"` | `value`    | `ir.value`          | Yes             | ⭐⭐⭐⭐   |
| **Option 3** | `kind: "value"`    | `data`     | `ir.value.data`     | Yes             | ⭐⭐⭐     |
| **Option 4** | `type: "cssValue"` | `cssValue` | `ir.cssValue`       | Yes             | ⭐⭐⭐⭐⭐ |

---

## Filter Properties Special Case

**Current anomaly:**

```typescript
// filter & backdrop-filter
{
  kind: "css-value";
  value: Type.CssValue;
}
```

This already avoids the "value value" problem at the discriminator level!

**Comparison:**

```typescript
// Standard (27 properties)
if (ir.kind === "value") {
  const css = cssValueToCss(ir.value); // ir.value is CssValue
}

// Filter properties (2 properties)
if (ir.kind === "css-value") {
  const css = cssValueToCss(ir.value); // ir.value is Type.CssValue
}
```

**Observation:** The filter properties accidentally solved part of the problem with a more descriptive discriminator.

---

## Impact Analysis

### Scope of Change

**27 properties using `{ kind: "value"; value: CssValue }`:**

- animation-delay, animation-duration, animation-iteration-count
- transition-delay, transition-duration
- margin-top/right/bottom/left
- padding-top/right/bottom/left
- border-top/right/bottom/left-width
- letter-spacing, line-height, text-indent, word-spacing
- opacity, perspective, font-weight
- background-position-x, background-position-y

**Files per property:**

- types.ts (IR definition)
- parser.ts (construction)
- generator.ts (consumption)
- generator.test.ts (tests)

**Total files to modify:** ~108 files (27 properties × 4 files)

---

## Questions for User

1. **Which option do you prefer?**
   - Option 1: `{ kind: "value"; cssValue: CssValue }`
   - Option 2: `{ kind: "cssValue"; value: CssValue }`
   - Option 3: `{ kind: "value"; data: CssValue }`
   - Option 4: `{ type: "cssValue"; cssValue: CssValue }`
   - Other?

2. **Should we align filter properties** (`kind: "css-value"`) **with the chosen pattern?**

3. **What about border-radius properties?**

   ```typescript
   // These also use "value" in nested contexts
   | { kind: "circular"; radius: CssValue }
   | { kind: "elliptical"; horizontal: CssValue; vertical: CssValue }
   ```

4. **Breaking change acceptable?**
   - This is internal IR (not public API yet)
   - NO DEPRECATION CYCLES philosophy
   - Fix it now vs. live with it forever?

5. **Should we fix ALL properties at once, or phase it?**
   - Big bang: All 27+ properties in one session
   - Phased: New properties use new pattern, migrate old ones gradually
   - Hybrid: Fix the most egregious cases first

---

## Recommendation

**My Suggestion: Option 2** - `{ kind: "cssValue"; value: CssValue }`

**Rationale:**

1. **Most aligned with existing filter properties** (they use `kind: "css-value"`)
2. **Keeps property name consistent** across all union branches
3. **Clear discriminator** - immediately obvious it's a CSS value
4. **Best access pattern** - `if (ir.kind === "cssValue") cssValueToCss(ir.value)`
5. **Follows your philosophy** - "we break things to make them consistent"

**Implementation:**

```typescript
// Before
export type OpacityIR =
  | { kind: "keyword"; value: z.infer<typeof Keywords.cssWide> }
  | { kind: "value"; value: CssValue };

// After
export type OpacityIR =
  | { kind: "keyword"; value: z.infer<typeof Keywords.cssWide> }
  | { kind: "cssValue"; value: CssValue };
```

**Bonus:** Unifies with filter properties if we change their `"css-value"` to `"cssValue"` for camelCase consistency.

---

## Next Steps

**Awaiting user decision on:**

1. Preferred naming option
2. Scope (all properties or subset)
3. Timing (now or later)
4. Treatment of filter properties

**Once decided, execute:**

1. Update types.ts for all affected properties
2. Update parsers to use new discriminator
3. Update generators to use new discriminator
4. Update all tests
5. Run quality checks
6. Document breaking change

---

**Status:** 🟡 BLOCKED - Awaiting user input on API design
