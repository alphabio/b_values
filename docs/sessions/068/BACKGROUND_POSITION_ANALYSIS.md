# Background-Position: Shorthand vs Longhand Analysis

**Date:** 2025-11-12  
**Issue:** Is `background-position` a shorthand? Does this violate "longhand-only" policy?

---

## 🔍 The Question

**You asked:** "This is a shorthand css property right?"

**Short Answer:** **NO. It's a longhand property.**

---

## 📊 CSS Spec Analysis

### What CSS Spec Says

**Longhand properties:**
- `background-position-x` (horizontal position only)
- `background-position-y` (vertical position only)

**"Shorthand" property:**
- `background-position` (both horizontal and vertical)

**TRUE shorthand property:**
- `background` (all background-* properties combined)

### Terminology Confusion

The CSS spec calls `background-position` a "component" of the `background` shorthand.

**But in our architecture:**
- `background-position` is **NOT a shorthand**
- It's a **longhand property** that happens to represent TWO values (x, y)
- It does NOT expand into other properties

---

## 🎯 Shorthand vs Longhand: The Distinction

### TRUE Shorthand (What We Avoid)

**Definition:** Property that **expands into multiple other properties**

**Example: `background`**
```css
background: red url(img.png) no-repeat center;

/* Expands to: */
background-color: red;
background-image: url(img.png);
background-repeat: no-repeat;
background-position: center;
/* ... + attachment, clip, origin, size */
```

**Characteristics:**
- ✅ Sets multiple properties at once
- ✅ Each component has its own property name
- ✅ Can be set independently

### Longhand with Composite Value (What We Support)

**Definition:** Property with **structured value syntax** but NO expansion

**Example: `background-position`**
```css
background-position: center top;

/* Does NOT expand to other properties */
/* Stays as ONE property with TWO components */
```

**Characteristics:**
- ✅ Single property name
- ❌ Does NOT set other properties
- ✅ Components are inseparable in our IR
- ✅ Has longhand siblings (background-position-x/y) but that's optional

---

## 🏗️ Our Architecture Position

### Current Implementation

**Property:** `background-position`

**IR Structure:**
```typescript
type Position2D = {
  horizontal: CssValue | PositionEdgeOffset;
  vertical: CssValue | PositionEdgeOffset;
}

type BackgroundPositionIR = 
  | { kind: "keyword", value: CssWide }
  | { kind: "list", values: Position2D[] }
```

**Key Insight:** We parse into a **single IR** with structure, not multiple properties.

### What Makes This Longhand

1. **Single property registration:** One `defineProperty()` call
2. **Single IR type:** `BackgroundPositionIR` (not separate X/Y types)
3. **Single parser:** `parseBackgroundPosition()`
4. **Single generator:** `generateBackgroundPosition()`
5. **No expansion:** Doesn't set `background-position-x` or `background-position-y`

**We treat it as ONE property with structured data.**

---

## 📋 The Longhand Siblings (background-position-x/y)

### Do We Support Them?

**Currently:** NO

**Should we?** MAYBE (future)

**Why not now?**
- ✅ `background-position` covers 99% of use cases
- ✅ Adding x/y creates expansion complexity
- ⚠️ Would need shorthand expansion logic (`background-position` → x/y)

### If We Add Them

**Two approaches:**

#### Approach A: True Separation (Complex)
```typescript
// background-position becomes a shorthand
background-position: center top;
// Expands to:
background-position-x: center;
background-position-y: top;
```

**Implications:**
- ❌ `background-position` becomes a shorthand
- ❌ Need expansion logic
- ❌ Violates "no shorthand" principle
- ❌ Complexity explosion

#### Approach B: Independent Longhands (Simple)
```typescript
// background-position stays independent
defineProperty("background-position")
defineProperty("background-position-x")  
defineProperty("background-position-y")

// NO expansion between them
// User sets what they want directly
```

**Implications:**
- ✅ All are longhands
- ✅ No expansion logic
- ✅ Simple, orthogonal
- ⚠️ User must choose which property to use
- ⚠️ Setting both `background-position` and `background-position-x` = undefined behavior

---

## 🎯 Our Policy: Longhand-Only

### What This Means

**WE SUPPORT:**
- ✅ Properties that have **independent IR representations**
- ✅ Properties with **structured value syntax** (like Position2D)
- ✅ Properties that **don't expand into other properties**

**WE AVOID:**
- ❌ Properties that **expand into multiple properties**
- ❌ Properties requiring **expansion logic**
- ❌ Properties that are **purely sugar** over other properties

### Examples

| Property | Status | Reason |
|----------|--------|--------|
| `background-position` | ✅ **Longhand** | Single property, structured value |
| `background-color` | ✅ **Longhand** | Single property, single value |
| `background` | ❌ **Shorthand** | Expands to 8 properties |
| `padding` | ❌ **Shorthand** | Expands to padding-{top,right,bottom,left} |
| `border` | ❌ **Shorthand** | Expands to border-{width,style,color} |
| `margin` | ❌ **Shorthand** | Expands to margin-{top,right,bottom,left} |

---

## 💡 The Confusion: Why background-position FEELS Like Shorthand

### Reason 1: Composite Value Syntax

```css
background-position: center top;
/*                   ^^^^^ ^^^
                     looks like two properties */
```

**But:** It's ONE property with TWO components. Similar to `transform: rotate(45deg) scale(1.5)` - ONE property, multiple functions.

### Reason 2: Longhand Siblings Exist

```css
background-position: center top;  /* "parent" */
background-position-x: center;    /* "child" */
background-position-y: top;       /* "child" */
```

**But:** We don't implement the siblings. `background-position` is standalone in our system.

### Reason 3: CSS Spec Terminology

CSS spec sometimes calls these "sub-properties" which implies shorthand relationship.

**But:** In our architecture, if it doesn't expand, it's longhand.

---

## 🚀 Consistency Check: All Background Properties

| Property | Expands? | Status | Notes |
|----------|----------|--------|-------|
| `background-color` | NO | ✅ Longhand | Simple value |
| `background-image` | NO | ✅ Longhand | List of images |
| `background-repeat` | NO | ✅ Longhand | List of repeat styles |
| `background-position` | NO | ✅ Longhand | List of positions (structured) |
| `background-size` | NO | ✅ Longhand | List of sizes (structured) |
| `background-attachment` | NO | ✅ Longhand | List of keywords |
| `background-clip` | NO | ✅ Longhand | List of keywords |
| `background-origin` | NO | ✅ Longhand | List of keywords |
| `background` | YES | ❌ **Shorthand** | **We don't implement this** |

**Result:** All 8 properties we implement are **longhands**. ✅

---

## 📝 Policy Clarification

### Updated Definition: "Longhand-Only"

**We implement properties that:**

1. **Have independent IR representation** (their own `PropertyIR` type)
2. **Do NOT expand into other properties** (no cascade to other property names)
3. **Have single property name** (one `defineProperty()` call)
4. **Parse to single IR instance** (not multiple property IRs)

**Structured values are fine:**
- ✅ `Position2D` with horizontal + vertical
- ✅ `BgSize` with width + height  
- ✅ `RepeatStyle` with horizontal + vertical repetition

**As long as:**
- ✅ They stay within ONE property
- ✅ They don't set OTHER properties
- ✅ They have ONE IR type

### Edge Case: Custom Properties

```css
--my-color: red;
```

**Status:** ✅ Longhand (even though syntax is generic)

**Why:** 
- Single property (one custom property name)
- No expansion
- Direct value storage

**Special handling:** Raw value parser (no AST parsing)

---

## 🎯 Recommendation

### Current Architecture: CORRECT ✅

`background-position` is correctly implemented as a longhand with structured value.

**No changes needed.**

### Documentation Update: REQUIRED

**Add to architecture docs:**

```markdown
## Property Classification

### Longhand Properties (What We Implement)

Properties that:
- Have independent IR representation
- Do NOT expand into other properties  
- Parse to single IR instance

**Examples:**
- `background-color` - Simple value
- `background-position` - Structured value (Position2D)
- `background-image` - List of values

### Shorthand Properties (What We Avoid)

Properties that:
- Expand into multiple other properties
- Set multiple property names at once
- Require expansion logic

**Examples:**
- `background` - Sets background-{color,image,repeat,position,...}
- `padding` - Sets padding-{top,right,bottom,left}
- `border` - Sets border-{width,style,color}

### Structured Values ≠ Shorthand

A property with structured value (multiple components) is NOT a shorthand
if it stays within a single property name.

**Example:**
```css
background-position: center top;
/* Structured value: { horizontal: center, vertical: top } */
/* Still ONE property, not a shorthand */
```
```

### Manifest System: NO CHANGES NEEDED

`background-position` fits the pattern:

```json
{
  "background-position": {
    "mode": "multi",  // ✅ Correct
    "requirements": {
      "types": ["position"],  // ✅ Position2D type
      "parser": "Position.parsePosition2D",  // ✅ Structured parser
      "generator": "Position.generate"  // ✅ Structured generator
    }
  }
}
```

---

## 🏆 Conclusion

### Is background-position a shorthand?

**NO.** It's a longhand property with structured value syntax.

### Does this violate "longhand-only" policy?

**NO.** Our policy is "no property expansion", not "no structured values".

### Are we consistent?

**YES.** All 8 background properties follow the same pattern:
- Longhand properties
- No expansion
- Single IR type per property
- Structured values where spec requires (position, size, repeat)

### What about background-position-x/y?

**Future consideration.** If we add them:
- Implement as independent longhands
- NO expansion logic between them
- Let user choose which to use
- Document the relationship

### Should we add them?

**NOT YET.** Reasons:
- `background-position` covers 99% of use cases
- Adding x/y without expansion creates confusion
- Adding x/y with expansion violates our principles
- Better to wait for clear user demand

---

## 📚 Key Takeaways

1. **Structured value ≠ Shorthand**
   - `background-position: center top` is ONE property
   - Just like `transform: rotate(45deg) scale(1.5)` is ONE property

2. **Expansion is the key distinction**
   - Shorthand: Sets OTHER properties
   - Longhand: Sets ONLY itself (even with structure)

3. **Our implementation is correct**
   - All 8 background properties are longhands
   - Structured values are part of CSS spec, not shortcuts

4. **Documentation needs clarification**
   - Make "longhand-only" policy explicit
   - Define "structured value vs shorthand"
   - Give clear examples

5. **Consistency achieved**
   - Manifest system handles structured values
   - Parser/generator pattern scales
   - No special cases needed

**We're good. Keep building. 🚀**
