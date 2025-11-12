# STRICT BOUNDARY: Composite Longhand vs True Shorthand

**Date:** 2025-11-12
**Critical:** Define the EXACT distinction with zero ambiguity

---

## 🎯 THE CORE RULE

**The ONLY test that matters:**

```
Does setting this property name automatically set OTHER property names?

YES → TRUE SHORTHAND (reject)
NO → LONGHAND (accept, may be composite)
```

**That's it. Nothing else matters.**

---

## 📋 The Test: Property Name Cascade

### Test 1: `padding` Property

```css
/* User writes: */
padding: 10px;

/* Question: Does this set these properties? */
padding-top: ???
padding-right: ???
padding-bottom: ???
padding-left: ???
```

**CSS Spec Answer:**

- According to CSS cascade spec: **YES, it does**
- `padding` is defined as a shorthand that sets all 4 side properties
- Browser applies values to `padding-top`, `padding-right`, etc.

**Our Answer:**

- **TRUE SHORTHAND**
- **REJECT**

### Test 2: `background-position` Property

```css
/* User writes: */
background-position: center top;

/* Question: Does this set these properties? */
background-position-x: ???
background-position-y: ???
```

**CSS Spec Answer:**

- According to CSS cascade spec: **YES, it does**
- `background-position` sets `background-position-x` and `background-position-y`
- These are separate longhands in the cascade

**Our Answer:**

- **TRUE SHORTHAND**
- **REJECT**

### Test 3: `background` Property

```css
/* User writes: */
background: red url(img.png) no-repeat;

/* Question: Does this set these properties? */
background-color: ???
background-image: ???
background-repeat: ???
/* ... + 5 more */
```

**CSS Spec Answer:**

- **YES, it does**
- `background` sets all 8 background-\* longhands

**Our Answer:**

- **TRUE SHORTHAND**
- **REJECT**

---

## 🚨 THE PROBLEM

**By the strict test, ALL of these are shorthands:**

- `padding` → sets 4 properties
- `margin` → sets 4 properties
- `background-position` → sets 2 properties
- `border-width` → sets 4 properties
- `background` → sets 8 properties

**If we reject shorthands, we reject ALL of them.**

---

## 💭 The Dilemma

### Option A: Pure Longhand (Strict Test)

**Reject ALL shorthands:**

```
❌ background
❌ background-position
❌ padding
❌ margin
❌ border-width
```

**Implement ONLY atomic longhands:**

```
✅ background-color
✅ background-image
✅ background-position-x
✅ background-position-y
✅ padding-top
✅ padding-right
✅ padding-bottom
✅ padding-left
```

**Consistency:** Perfect ✅
**DRY:** Terrible ❌
**Scope:** 50+ atomic properties

### Option B: Accept "Small" Shorthands (Arbitrary)

**Accept shorthands that set ≤4 properties:**

```
✅ background-position (→ 2 properties, ok)
✅ padding (→ 4 properties, ok)
✅ border-width (→ 4 properties, ok)
❌ background (→ 8 properties, too many)
```

**Consistency:** Arbitrary ❌
**DRY:** Good ✅
**Scope:** Medium

**Problem:** Where's the line? 2 ok? 4 ok? 5 not ok? 8 not ok?

### Option C: Accept "Logical Group" Shorthands (Semantic)

**Accept shorthands for logically unified concepts:**

```
✅ padding (4 sides of same concept)
✅ background-position (x/y are inseparable)
✅ border-width (4 sides of same concept)
❌ background (8 heterogeneous properties)
❌ border (width + style + color = different concepts)
```

**Consistency:** Semantic rule ⚠️
**DRY:** Good ✅
**Scope:** Medium

**Problem:** "Logical group" is subjective. Who decides?

---

## 🔍 Let's Be Honest About What We're Really Doing

### The Truth:

**We want to implement properties that:**

1. Feel like "one thing" conceptually
2. Avoid unnecessary repetition
3. Match common CSS usage patterns
4. Don't cross major semantic boundaries

**We want to reject properties that:**

1. Bundle unrelated concepts
2. Require complex expansion logic
3. Are rarely used in their shorthand form
4. Cross major semantic boundaries

### Examples:

**`padding` - feels like one thing:**

```css
padding: 10px; /* "Add padding all around" */
```

Conceptually unified: spacing around an element.

**`background-position` - feels like one thing:**

```css
background-position: center top; /* "Position the background" */
```

Conceptually unified: 2D position is inherently x+y.

**`background` - feels like multiple things:**

```css
background: red url(img.png) no-repeat center scroll border-box content-box;
```

Multiple concepts: color, image, repeat, position, size, attachment, clip, origin.

**`border` - feels like multiple things:**

```css
border: 1px solid red;
```

Multiple concepts: width (measurement), style (visual pattern), color (appearance).

---

## 🎯 STRICT RULE (Refined)

### Test 1: Single Concept Test

**Question:** Does this property represent a SINGLE semantic concept?

**Single concept examples:**

- `padding` → "space around element" (one concept, 4 directional values)
- `margin` → "space outside element" (one concept, 4 directional values)
- `background-position` → "where background is located" (one concept, x/y coordinates)
- `border-radius` → "corner rounding" (one concept, 4 corner values)

**Multiple concepts examples:**

- `background` → color + image + repeat + position + size + attachment + clip + origin (8 concepts)
- `border` → width + style + color (3 concepts)
- `font` → size + family + weight + style + variant + line-height (6 concepts)

**Rule:** Accept single-concept shorthands, reject multi-concept shorthands.

### Test 2: Homogeneous Values Test

**Question:** Do all the longhand properties use the SAME type of value?

**Homogeneous examples:**

- `padding` → All 4 sides use `<length-percentage>`
- `margin` → All 4 sides use `<length-percentage>`
- `border-width` → All 4 sides use `<line-width>`
- `border-color` → All 4 sides use `<color>`

**Heterogeneous examples:**

- `background` → color, image, keyword, position, size, keyword, box, box (8 different types)
- `border` → line-width, line-style, color (3 different types)
- `font` → font-size, font-family, font-weight, font-style, font-variant (5 different types)

**Rule:** Accept homogeneous shorthands, reject heterogeneous shorthands.

### Test 3: Structural Coherence Test

**Question:** Are the values structurally related (directional, coordinate, etc.)?

**Structurally coherent examples:**

- `padding` → 4 directional values (top, right, bottom, left) - spatial structure
- `background-position` → 2 coordinate values (x, y) - coordinate structure
- `border-radius` → 4 corner values (TL, TR, BR, BL) - spatial structure

**Structurally incoherent examples:**

- `background` → Mix of color, image, keywords, position - no structural relationship
- `border` → Mix of width, style, color - no structural relationship

**Rule:** Accept structurally coherent shorthands, reject incoherent shorthands.

---

## ✅ STRICT RULES (All 3 Must Pass)

A shorthand is acceptable IF AND ONLY IF:

1. ✅ **Single Concept:** Represents ONE semantic concept
2. ✅ **Homogeneous:** All longhands use same/similar value types
3. ✅ **Structural Coherence:** Values are structurally related (spatial, coordinate, etc.)

**ALL THREE must be true. If ANY fail, reject.**

---

## 📊 Applying the Rules

### `padding` Shorthand

1. **Single Concept?** ✅ YES - "space around element"
2. **Homogeneous?** ✅ YES - All `<length-percentage>`
3. **Structural Coherence?** ✅ YES - 4 directional values (TRBL)

**Result:** **ACCEPT** (passes all 3 tests)

### `background-position` Shorthand

1. **Single Concept?** ✅ YES - "2D position"
2. **Homogeneous?** ✅ YES - Both `<position>` values
3. **Structural Coherence?** ✅ YES - X/Y coordinates

**Result:** **ACCEPT** (passes all 3 tests)

### `border-width` Shorthand

1. **Single Concept?** ✅ YES - "border thickness"
2. **Homogeneous?** ✅ YES - All `<line-width>`
3. **Structural Coherence?** ✅ YES - 4 directional values (TRBL)

**Result:** **ACCEPT** (passes all 3 tests)

### `background` Shorthand

1. **Single Concept?** ❌ NO - 8 different concepts (color, image, repeat, position, size, attachment, clip, origin)
2. **Homogeneous?** ❌ NO - 8 different value types
3. **Structural Coherence?** ❌ NO - No structural relationship

**Result:** **REJECT** (fails all 3 tests)

### `border` Shorthand

1. **Single Concept?** ❌ NO - 3 concepts (width, style, color)
2. **Homogeneous?** ❌ NO - 3 different value types
3. **Structural Coherence?** ❌ NO - Width, style, color unrelated structurally

**Result:** **REJECT** (fails all 3 tests)

### `font` Shorthand

1. **Single Concept?** ❌ NO - 6 concepts (size, family, weight, style, variant, line-height)
2. **Homogeneous?** ❌ NO - 6 different value types
3. **Structural Coherence?** ❌ NO - No structural relationship

**Result:** **REJECT** (fails all 3 tests)

---

## 🎯 The Renamed Categories

### ✅ Acceptable: "Structural Shorthands"

**Definition:** Shorthand that represents a SINGLE concept with structurally related values.

**Properties we implement:**

```
padding         (spatial structure: TRBL)
margin          (spatial structure: TRBL)
background-position  (coordinate structure: XY)
border-width    (spatial structure: TRBL)
border-style    (spatial structure: TRBL)
border-color    (spatial structure: TRBL)
border-radius   (spatial structure: TL-TR-BR-BL)
```

**Characteristics:**

- One semantic concept
- Homogeneous value types
- Structural coherence (directional, coordinate)
- DRY without complexity

### ❌ Unacceptable: "Bundling Shorthands"

**Definition:** Shorthand that bundles MULTIPLE unrelated concepts.

**Properties we reject:**

```
background      (8 heterogeneous properties)
border          (width + style + color)
font            (6 heterogeneous properties)
flex            (grow + shrink + basis)
animation       (name + duration + timing + delay + iteration + direction + fill-mode + play-state)
transition      (property + duration + timing + delay)
```

**Characteristics:**

- Multiple semantic concepts
- Heterogeneous value types
- No structural coherence
- Complexity explosion

---

## 📋 Complete Property List

### ✅ Structural Shorthands (We Implement)

| Property              | Expands To | Concept          | Homogeneous?             | Structure      |
| --------------------- | ---------- | ---------------- | ------------------------ | -------------- |
| `padding`             | 4 sides    | Space around     | ✅ `<length-percentage>` | ✅ TRBL        |
| `margin`              | 4 sides    | Space outside    | ✅ `<length-percentage>` | ✅ TRBL        |
| `border-width`        | 4 sides    | Border thickness | ✅ `<line-width>`        | ✅ TRBL        |
| `border-style`        | 4 sides    | Border pattern   | ✅ `<line-style>`        | ✅ TRBL        |
| `border-color`        | 4 sides    | Border color     | ✅ `<color>`             | ✅ TRBL        |
| `border-radius`       | 4 corners  | Corner rounding  | ✅ `<length-percentage>` | ✅ TL-TR-BR-BL |
| `background-position` | x, y       | 2D position      | ✅ `<position>`          | ✅ XY          |

### ❌ Bundling Shorthands (We Reject)

| Property     | Expands To            | Why Reject                             |
| ------------ | --------------------- | -------------------------------------- |
| `background` | 8 properties          | Multiple concepts, heterogeneous types |
| `border`     | width + style + color | Multiple concepts, heterogeneous types |
| `border-top` | width + style + color | Multiple concepts, heterogeneous types |
| `font`       | 6 properties          | Multiple concepts, heterogeneous types |
| `flex`       | grow + shrink + basis | Multiple concepts, heterogeneous types |
| `animation`  | 8 properties          | Multiple concepts, heterogeneous types |
| `transition` | 4 properties          | Multiple concepts, heterogeneous types |

---

## 🎯 STRICT TERMINOLOGY

### Stop saying "Composite Longhand"

**Wrong term.** These ARE shorthands by CSS spec definition.

**Call them what they are:**

**"Structural Shorthands"** - Shorthands we accept
**"Bundling Shorthands"** - Shorthands we reject

### Policy Statement:

**We implement STRUCTURAL SHORTHANDS.**

**We reject BUNDLING SHORTHANDS.**

**Clear. Unambiguous. Enforceable.**

---

## ✅ Final Rules (Lock These In)

### Rule 1: The Three Tests (ALL must pass)

1. **Single Concept Test** - One semantic concept only
2. **Homogeneous Test** - Same/similar value types for all longhands
3. **Structural Coherence Test** - Values are spatially/coordinately related

### Rule 2: Classification

- **Structural Shorthand** - Passes all 3 tests → IMPLEMENT
- **Bundling Shorthand** - Fails any test → REJECT

### Rule 3: Implementation

**For Structural Shorthands:**

- Implement the shorthand (padding, margin, etc.)
- ALSO implement individual longhands (padding-top, etc.)
- Both coexist, user chooses

**For Bundling Shorthands:**

- Client must use @b/short to expand before parsing
- We provide helpful error message

---

## 🔥 THE STRICT BOUNDARY (Final Answer)

**Structural Shorthand:**

```
Single concept + Homogeneous types + Structural coherence = ACCEPT
```

**Bundling Shorthand:**

```
Multiple concepts OR Heterogeneous types OR No structure = REJECT
```

**Zero ambiguity. Zero wiggle room. Crystal clear. 🎯**
