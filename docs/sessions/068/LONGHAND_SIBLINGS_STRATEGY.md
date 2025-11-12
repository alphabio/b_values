# Longhand Siblings: Strategic Decision

**Date:** 2025-11-12  
**Issue:** Should we support `background-position-x/y` and similar sibling properties?

---

## 🔍 The Question

**User insight:**
> "We're going to run into the exact same values with box model props like padding/margin/border/radius"

**Refined question:**
> Should our "longhand-only" policy include ALL longhand properties, even if they feel redundant with composite properties?

---

## 📊 Three Property Patterns

### Pattern A: Composite Longhand (background-position)

**Properties:**
- `background-position: center top` ← IMPLEMENT ✅
- `background-position-x: center` ← Optional sibling
- `background-position-y: top` ← Optional sibling

**Characteristics:**
- Composite property has structured IR (`Position2D`)
- Siblings are "views" into same data
- NO expansion relationship
- User chooses which to use

**Question:** Implement siblings?

### Pattern B: True Longhands (box model sides)

**Properties:**
- `padding-top: 10px` ← True longhand ✅
- `padding-right: 10px` ← True longhand ✅
- `padding-bottom: 10px` ← True longhand ✅
- `padding-left: 10px` ← True longhand ✅
- `padding: 10px` ← Shorthand (expands to above) ❌

**Characteristics:**
- Each side is independent property
- Each has simple value (not structured)
- Shorthand expands to all 4
- We implement the 4 longhands, NOT the shorthand

**Question:** This is clear-cut, right?

### Pattern C: Logical Properties (modern CSS)

**Properties:**
- `padding-block-start: 10px` ← Logical equivalent
- `padding-inline-end: 10px` ← Logical equivalent

**Characteristics:**
- Alternative names for same concepts
- Direction-aware (RTL, writing modes)
- Maps to physical properties in some specs

**Question:** Implement these too?

---

## 🎯 Strategic Analysis

### Scenario 1: Implement Everything (Maximalist)

**What we'd implement:**
```typescript
// Background position
background-position ✅
background-position-x ✅
background-position-y ✅

// Box model
padding-top ✅
padding-right ✅
padding-bottom ✅
padding-left ✅
// NO padding shorthand ❌

// Logical
padding-block-start ✅
padding-inline-end ✅
// ... all logical variants
```

**Pros:**
- ✅ Complete coverage
- ✅ User can use whichever property they prefer
- ✅ Matches CSS spec fully

**Cons:**
- ❌ MASSIVE scope (100+ properties just for box model)
- ❌ Redundancy (`padding-top` vs `padding: <top> 0 0 0`)
- ❌ User confusion (which one should I use?)
- ❌ Maintenance burden (more properties = more tests/docs)

### Scenario 2: Longhands Only (Pragmatic)

**What we'd implement:**
```typescript
// Background position (composite)
background-position ✅
// NO background-position-x/y ❌

// Box model (individual sides)
padding-top ✅
padding-right ✅
padding-bottom ✅
padding-left ✅
// NO padding shorthand ❌

// Logical (if needed)
padding-block-start ✅ (separate decision)
```

**Pros:**
- ✅ Clear, consistent policy
- ✅ Covers 95% of use cases
- ✅ Manageable scope
- ✅ Each property has clear purpose

**Cons:**
- ⚠️ `background-position-x/y` users must use composite
- ⚠️ Some "duplication" (could use siblings instead)

### Scenario 3: Composite Only (Minimalist)

**What we'd implement:**
```typescript
// Background position (composite)
background-position ✅
// NO background-position-x/y ❌

// Box model (composite for all sides)
padding: 10px 20px 30px 40px ✅  // Wait, this is a shorthand!
// OR implement all 4 longhands separately
```

**Pros:**
- ✅ Minimal property count
- ✅ Covers most use cases

**Cons:**
- ❌ Can't implement `padding` as composite (it's a shorthand!)
- ❌ Forces users to set all 4 sides even if they want one
- ❌ Doesn't work for box model pattern

---

## 🔬 The Fundamental Difference

### background-position vs padding

**background-position:**
```css
background-position: center top;
/* This is ONE property with TWO components */
/* Components: horizontal, vertical */
/* IR: { horizontal: "center", vertical: "top" } */
```

**padding:**
```css
padding: 10px 20px;
/* This EXPANDS to FOUR properties */
/* padding-top: 10px */
/* padding-right: 20px */
/* padding-bottom: 10px */
/* padding-left: 20px */
```

**Key insight:**
- `background-position` components are **inseparable** (you always have x AND y)
- `padding` sides are **independent** (you can set just padding-top)

**Therefore:**
- `background-position-x/y` are **redundant** (composite always has both)
- `padding-top/right/bottom/left` are **essential** (independent values)

---

## 💡 Recommended Policy

### Rule 1: Implement Independent Longhands

**YES to:**
- `padding-top`, `padding-right`, `padding-bottom`, `padding-left`
- `margin-top`, `margin-right`, `margin-bottom`, `margin-left`
- `border-top-width`, `border-right-width`, etc.
- `border-top-left-radius`, `border-top-right-radius`, etc.

**Why:** These are **independent properties**. Each can be set separately. Essential for granular control.

### Rule 2: Skip Redundant Siblings

**NO to:**
- `background-position-x`, `background-position-y`

**Why:** `background-position` already provides both values. Siblings are **redundant views** into same data.

**Rationale:**
```css
/* If you want to set just X, you still need to specify Y */
background-position-x: center;
/* But Y defaults to... what? Still need to think about it */

/* With composite, intent is explicit */
background-position: center top;
```

### Rule 3: Skip ALL Shorthands

**NO to:**
- `padding` (expands to 4 properties)
- `margin` (expands to 4 properties)
- `border` (expands to width, style, color × 4 sides)
- `background` (expands to 8 properties)

**Why:** Expansion logic violates "no shorthand" principle.

### Rule 4: Logical Properties (Future)

**DEFER:**
- `padding-block-start`, `padding-inline-end`, etc.

**Why:** 
- Can be added later
- Separate architectural decision
- Not urgent for v1

---

## 🎯 Concrete Decision Matrix

| Property Type | Example | Implement? | Reason |
|---------------|---------|------------|--------|
| Independent longhands | `padding-top` | ✅ YES | Essential, no redundancy |
| Composite longhands | `background-position` | ✅ YES | Natural grouping |
| Redundant siblings | `background-position-x` | ❌ NO | Composite covers it |
| Shorthands | `padding` | ❌ NO | Expansion logic |
| Logical properties | `padding-block-start` | 🟡 FUTURE | Separate decision |

---

## 📋 Box Model Implementation Plan

### Phase 1: Individual Sides (40 properties)

**Padding (4):**
- `padding-top`, `padding-right`, `padding-bottom`, `padding-left`

**Margin (4):**
- `margin-top`, `margin-right`, `margin-bottom`, `margin-left`

**Border Width (4):**
- `border-top-width`, `border-right-width`, `border-bottom-width`, `border-left-width`

**Border Style (4):**
- `border-top-style`, `border-right-style`, `border-bottom-style`, `border-left-style`

**Border Color (4):**
- `border-top-color`, `border-right-color`, `border-bottom-color`, `border-left-color`

**Border Radius (4):**
- `border-top-left-radius`, `border-top-right-radius`, `border-bottom-right-radius`, `border-bottom-left-radius`

**Width/Height (2):**
- `width`, `height`

**Min/Max (4):**
- `min-width`, `max-width`, `min-height`, `max-height`

**Others:**
- `box-sizing`
- `display`
- ... etc

**Characteristics:**
- Each property: Simple value (length, percentage, keyword)
- No composite structures
- No expansion logic
- Straightforward manifest entries

### Phase 2: Composite Properties (As Needed)

**Position/Size with structure:**
- `background-position` (already done)
- `background-size` (already done)
- `transform-origin` (future: 2D/3D position)
- `perspective-origin` (future: 2D position)

**Characteristics:**
- Composite values (Position2D, Size, etc.)
- Single property with structure
- NO redundant siblings

### Phase 3: Logical Properties (Future)

**Only if user demand:**
- `padding-block-start`, `padding-inline-end`, etc.
- `margin-block-start`, `margin-inline-end`, etc.

---

## 🚀 Manifest System Impact

### Simple Longhands (Easy)

```json
{
  "padding-top": {
    "mode": "single",
    "requirements": {
      "types": ["length-percentage"],
      "parser": "Length.parseLengthPercentage",
      "generator": "Length.generateLengthPercentage",
      "cssValues": "auto"
    }
  }
}
```

**Scaffold generates:**
- Simple parser delegation
- Simple generator delegation
- Simple IR: `{ kind: "value", value: LengthPercentage }`

### Composite Longhands (Structured)

```json
{
  "background-position": {
    "mode": "multi",
    "requirements": {
      "types": ["position"],
      "parser": "Position.parsePosition2D",
      "generator": "Position.generate",
      "cssValues": "auto"
    }
  }
}
```

**Scaffold generates:**
- Structured parser delegation
- Structured generator delegation
- Structured IR: `{ kind: "list", values: Position2D[] }`

**No special cases for redundant siblings!**

---

## 📊 Scope Analysis

### If We Implement Siblings

**background-position + siblings:**
- `background-position` ✅
- `background-position-x` ✅
- `background-position-y` ✅

**Total: 3 properties (1 composite + 2 siblings)**

**Box model with siblings?**
- `padding` ❌ (shorthand)
- `padding-top`, `padding-right`, `padding-bottom`, `padding-left` ✅
- `padding-block`, `padding-inline` ✅? (logical composites)
- `padding-block-start`, `padding-block-end` ✅? (logical sides)
- `padding-inline-start`, `padding-inline-end` ✅? (logical sides)

**Total: 4 physical + 2 logical composites + 4 logical sides = 10 properties!**

**Multiply by 4 (padding, margin, border-width, border-color):**
- **40 properties → 100+ properties with siblings and logical variants**

### If We Skip Redundant Siblings

**background-position only:**
- `background-position` ✅

**Total: 1 property**

**Box model (physical only):**
- 4 × padding, margin, border-width, border-style, border-color
- 4 × border-radius
- **Total: 24 properties**

**Scope difference: 24 vs 100+**

---

## 🏆 Final Recommendation

### DO implement:

1. ✅ **Independent longhands** (padding-top, margin-left, etc.)
   - Essential for granular control
   - No redundancy
   - Each has clear purpose

2. ✅ **Composite longhands** (background-position, background-size)
   - Natural grouping of inseparable values
   - Structured IR
   - No expansion

### DON'T implement:

3. ❌ **Redundant siblings** (background-position-x/y)
   - Composite property already has both values
   - Creates confusion (which one to use?)
   - Adds scope without value

4. ❌ **Shorthands** (padding, margin, border, background)
   - Require expansion logic
   - Violate core principles
   - Complexity explosion

### DEFER:

5. 🟡 **Logical properties** (padding-block-start, etc.)
   - Future enhancement
   - Requires writing-mode awareness
   - Not urgent for v1

---

## 📝 Policy Statement

**Our "Longhand-Only" Policy:**

1. We implement **independent longhand properties**
2. We implement **composite longhands** with structured values
3. We **skip redundant siblings** of composite properties
4. We **skip all shorthands** that expand to multiple properties
5. We **defer logical properties** to future phases

**Rationale:**

- **Independent longhands** = essential for granular control
- **Composite longhands** = natural grouping of inseparable values
- **Redundant siblings** = unnecessary duplication
- **Shorthands** = architectural complexity
- **Logical properties** = future enhancement

**Result:**
- Clear, consistent policy
- Manageable scope (24 box model properties vs 100+)
- Covers 95%+ of use cases
- Automation-friendly (no special cases)

---

## ✅ Answer to Your Question

**"Should we not support background-position-x/y?"**

**CORRECT. We should NOT support them.**

**Why:**
- They're redundant with `background-position`
- `background-position` always has both x and y values
- Supporting siblings creates confusion without adding value
- Scope management: skip redundancy

**But we SHOULD support:**
- `padding-top`, `padding-right`, `padding-bottom`, `padding-left` ✅
- These are **independent** properties, not redundant siblings
- Each can be set separately
- No composite "padding with 4 values" alternative (that's a shorthand!)

**The pattern:**
- **Composite with inseparable values** → NO siblings
- **Independent values** → YES, implement as separate properties

**This distinction is CRUCIAL for scope management and automation. 🎯**
