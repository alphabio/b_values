# Shorthand Pattern: The DRY Dilemma

**Date:** 2025-11-12  
**Issue:** Should we keep shorthand pattern for repetition avoidance?

---

## 🎯 The Core Insight

**User said:**
> "I do think the pattern is OK though it's avoiding repetition"

**The truth:**
```typescript
// Shorthand (DRY):
background-position: center top;

// Longhands (WET):
background-position-x: center;
background-position-y: top;

// Box model (WET × 4):
padding-top: 10px;
padding-right: 10px;
padding-bottom: 10px;
padding-left: 10px;
```

**The pattern DOES avoid repetition.** That's a legitimate value.

---

## 📊 Two Competing Values

### Value 1: STRICT Longhand Only

**Principle:** Pure separation of concerns

**Benefits:**
- ✅ Clean architecture (expansion ≠ parsing)
- ✅ @b/declarations stays simple
- ✅ @b/short handles complexity
- ✅ Clear boundaries

**Cost:**
- ❌ Verbose for common cases
- ❌ Client must always expand
- ❌ More integration complexity

### Value 2: DRY (Don't Repeat Yourself)

**Principle:** Avoid unnecessary repetition

**Benefits:**
- ✅ Concise property setting
- ✅ Natural CSS patterns
- ✅ Less boilerplate for clients
- ✅ Better DX (developer experience)

**Cost:**
- ❌ Mixes concerns (expansion + parsing)
- ❌ Blurs architectural boundaries
- ❌ More complex internals

**The question:** Which value wins?

---

## 🔍 The Box Model Problem

### What We Face:

**Without shorthand pattern:**
```typescript
// Set uniform padding
parseDeclaration("padding-top: 10px")
parseDeclaration("padding-right: 10px")
parseDeclaration("padding-bottom: 10px")
parseDeclaration("padding-left: 10px")

// 4 calls for one logical operation
```

**With shorthand pattern (if we allow it):**
```typescript
// Set uniform padding
parseDeclaration("padding: 10px")
// → Internally represents as 4 separate longhand IRs
```

**The DRY benefit is UNDENIABLE.**

---

## 💡 The Hybrid Solution: Composite Longhands

### Redefine What "Longhand" Means

**Current thinking:**
- Longhand = does NOT expand to other properties

**New thinking:**
- Longhand = has ONE IR representation
- May have structured value (Position2D, Padding4Sides)
- Parsing may produce MULTIPLE component values
- But IR is UNIFIED

### Example: Padding as Composite Longhand

**IR Design:**
```typescript
type PaddingIR = {
  kind: "value";
  top: LengthPercentage;
  right: LengthPercentage;
  bottom: LengthPercentage;
  left: LengthPercentage;
}

// OR alternative:
type PaddingIR = {
  kind: "uniform";
  value: LengthPercentage;
} | {
  kind: "separate";
  top: LengthPercentage;
  right: LengthPercentage;
  bottom: LengthPercentage;
  left: LengthPercentage;
}
```

**Property definition:**
```typescript
defineProperty({
  name: "padding",
  syntax: "<length-percentage>{1,4}",
  parser: parsePadding,  // Parses 1-4 values
  generator: generatePadding,
  inherited: false,
  initial: "0"
})
```

**Key insight:** We're not implementing `padding` shorthand. We're implementing `padding` composite longhand that happens to accept 1-4 values.

---

## 🎯 The Distinction

### TRUE Shorthand (We DON'T implement):

**`background` property:**
```css
background: red url(img.png) no-repeat center;
```

**Expands to DIFFERENT property names:**
- background-color
- background-image
- background-repeat
- background-position

**Each has SEPARATE IR type.**

**Characteristics:**
- ❌ Multiple property names
- ❌ Multiple IR types
- ❌ Requires cascade to OTHER properties
- ❌ Expansion logic crosses property boundaries

### Composite Longhand (We COULD implement):

**`padding` property:**
```css
padding: 10px 20px;
```

**Represents SINGLE logical concept with structured IR:**
```typescript
{
  kind: "padding",
  top: 10px,
  right: 20px,
  bottom: 10px,
  left: 20px
}
```

**Characteristics:**
- ✅ Single property name
- ✅ Single IR type (though structured)
- ✅ No cascade to other properties
- ✅ Self-contained

---

## 📋 The New Classification

### Category 1: Simple Longhands

**Example:** `color`, `background-color`

```typescript
{
  kind: "value",
  value: Color
}
```

**One property → One simple value**

### Category 2: Composite Longhands

**Example:** `padding`, `background-position`

```typescript
// padding
{
  kind: "value",
  top: Length,
  right: Length,
  bottom: Length,
  left: Length
}

// background-position
{
  kind: "value",
  horizontal: LengthPercentage,
  vertical: LengthPercentage
}
```

**One property → One structured value**

### Category 3: Multi-Value Longhands

**Example:** `background-image`, `background-position` (layers)

```typescript
{
  kind: "list",
  values: [Position2D, Position2D, Position2D]
}
```

**One property → Array of values (layers)**

### Category 4: TRUE Shorthands (We DON'T implement)

**Example:** `background`, `border`

**Expands to:**
- Multiple different property names
- Multiple different IR types
- Requires expansion across property boundaries

**We reject these.**

---

## 🎯 The Proposal: Accept Composite Longhands

### New Policy:

**We implement COMPOSITE LONGHANDS.**

**Definition:**
- Property with SINGLE name
- Property with SINGLE IR type
- May accept multiple values (1-4 for padding)
- May have structured representation
- Does NOT expand to OTHER property names

**Examples we ACCEPT:**
```typescript
✅ padding (1-4 values → PaddingIR)
✅ margin (1-4 values → MarginIR)
✅ background-position (2 values → Position2D)
✅ border-radius (1-4 values → BorderRadiusIR)
```

**Examples we REJECT:**
```typescript
❌ background (expands to 8 different properties)
❌ border (expands to width, style, color)
❌ font (expands to size, family, weight, etc.)
```

---

## 💭 What About background-position-x/y?

### The Question:

If we accept `padding` as composite longhand, do we also implement `padding-top`?

**Two approaches:**

### Approach A: Composite Only (Minimal)

**Implement:**
- ✅ `padding` (composite, accepts 1-4 values)

**Skip:**
- ❌ `padding-top`, `padding-right`, etc.

**Rationale:** `padding` covers all use cases.

**Problem:** Users want granular control sometimes.

### Approach B: Both (Complete)

**Implement:**
- ✅ `padding` (composite, accepts 1-4 values)
- ✅ `padding-top`, `padding-right`, `padding-bottom`, `padding-left` (individual)

**Rationale:** Maximum flexibility.

**Problem:** Which one should user use? When?

### Approach C: Individual Only (Pure Longhand)

**Implement:**
- ✅ `padding-top`, `padding-right`, `padding-bottom`, `padding-left`

**Skip:**
- ❌ `padding` composite

**Rationale:** Pure longhand architecture.

**Problem:** Verbose for common case.

---

## 🎯 Recommended: Approach B (Both)

### Why Both?

**Different use cases:**

```typescript
// Scenario 1: Set all sides at once (composite)
defineRule({
  padding: "10px"
})

// Scenario 2: Override one side (individual)
defineRule({
  padding: "10px",
  "padding-top": "20px"  // Override
})

// Scenario 3: Set only specific sides (individual)
defineRule({
  "padding-left": "20px",
  "padding-right": "20px"
})
```

**Both patterns are legitimate.**

### IR Representation:

**Composite `padding`:**
```typescript
{
  property: "padding",
  ir: {
    kind: "composite",
    top: 10px,
    right: 10px,
    bottom: 10px,
    left: 10px
  }
}
```

**Individual `padding-top`:**
```typescript
{
  property: "padding-top",
  ir: {
    kind: "value",
    value: 20px
  }
}
```

**Different properties, different IRs, no conflict.**

---

## 📊 Implementation Strategy

### Phase 1: Composite Longhands

**Implement 1-4 value syntax properties:**
```typescript
defineProperty("padding")       // 1-4 values
defineProperty("margin")        // 1-4 values
defineProperty("border-width")  // 1-4 values
defineProperty("border-style")  // 1-4 values
defineProperty("border-color")  // 1-4 values
defineProperty("border-radius") // 1-4 values
```

**Parser handles multiple values:**
```typescript
// padding: 10px         → all 4 sides = 10px
// padding: 10px 20px    → top/bottom=10px, left/right=20px
// padding: 10px 20px 30px → top=10px, left/right=20px, bottom=30px
// padding: 10px 20px 30px 40px → each side explicit
```

### Phase 2: Individual Longhands

**Implement side-specific properties:**
```typescript
defineProperty("padding-top")
defineProperty("padding-right")
defineProperty("padding-bottom")
defineProperty("padding-left")
// ... same for margin, border-width, etc.
```

### Phase 3: Both Coexist

**User chooses which pattern:**
```typescript
// Composite (concise)
parse("padding: 10px")

// Individual (explicit)
parse("padding-top: 10px")
parse("padding-right: 10px")
parse("padding-bottom: 10px")
parse("padding-left: 10px")

// Mixed (override pattern)
parse("padding: 10px")
parse("padding-top: 20px")
```

---

## 🏆 Final Classification

| Property | Type | Implement? | Reason |
|----------|------|------------|--------|
| `background` | True shorthand | ❌ NO | Expands to 8 different properties |
| `padding` | Composite longhand | ✅ YES | Single property, structured IR |
| `padding-top` | Simple longhand | ✅ YES | Granular control |
| `background-position` | Composite longhand | ✅ YES | Single property, Position2D IR |
| `background-position-x` | Simple longhand | ✅ YES | Granular control |

---

## ✅ The Answer

**Should we keep `background-position`?**

**YES.** It's a composite longhand, not a true shorthand.

**Should we add `background-position-x/y`?**

**YES.** Both patterns are useful.

**Should we implement `padding`?**

**YES.** As composite longhand (1-4 values).

**Should we implement `padding-top/right/bottom/left`?**

**YES.** For granular control.

**Should we implement `background`?**

**NO.** True shorthand (expands to 8 properties).

---

## 🎯 The New Definition

**We implement LONGHAND properties:**

1. **Simple longhands** - One property, one value
2. **Composite longhands** - One property, structured value (1-4 components)
3. **Multi-value longhands** - One property, array of values (layers)

**We REJECT true shorthands:**
- Properties that expand to DIFFERENT property names
- Properties that cross property boundaries
- Properties requiring expansion cascade

**Composite longhand ≠ Shorthand**

**This is DRY without blurring lines. 🎯**
