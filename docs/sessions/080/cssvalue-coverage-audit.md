# CssValue Coverage Audit

**Date:** 2025-11-19T13:38:00Z
**Session:** 080

---

## 📊 Summary

**Total Properties:** 79
**With CssValue:** 32 (40.5%)
**Without CssValue:** 47 (59.5%)

---

## 🎯 What is CssValue?

`CssValue` represents **authored CSS values** that may contain:

- **Literals:** `10px`, `0.5`, `100%`
- **Keywords:** `auto`, `none`, `inherit`
- **Variables:** `var(--my-color)`
- **Functions:** `calc(100% - 20px)`, `min()`, `max()`, `clamp()`
- **Colors:** `#ff0000`, `rgb()`, `hsl()`, etc.
- **Strings:** `"Hello World"`
- **URLs:** `url(image.png)`
- **Lists:** `10px 20px`, `red, blue, green`

**CssValue = Any value that can contain var() or calc()**

---

## ✅ Properties WITH CssValue Support (32)

### Animation (3)
- animation-delay
- animation-duration
- animation-iteration-count

### Background (9)
- backdrop-filter
- background-attachment
- background-clip
- background-origin
- background-position-x
- background-position-y
- background-repeat
- background-size
- filter

### Border (9)
- border-bottom-left-radius
- border-bottom-right-radius
- border-bottom-width
- border-left-width
- border-right-width
- border-top-left-radius
- border-top-right-radius
- border-top-width

### Font (4)
- font-size
- font-weight
- letter-spacing
- line-height

### Spacing (8)
- margin-bottom
- margin-left
- margin-right
- margin-top
- padding-bottom
- padding-left
- padding-right
- padding-top

### Transform/Transition (2)
- perspective
- transition-delay
- transition-duration

### Text (2)
- text-indent
- word-spacing

### Other (1)
- opacity

---

## ❌ Properties WITHOUT CssValue Support (47)

### Animation (5)
- animation-direction ⚠️ KEYWORD ONLY
- animation-fill-mode ⚠️ KEYWORD ONLY
- animation-name ⚠️ IDENTIFIER (special)
- animation-play-state ⚠️ KEYWORD ONLY
- animation-timing-function ⚠️ FUNCTION/KEYWORD (needs CssValue?)

### Background (3)
- background-blend-mode ⚠️ KEYWORD ONLY
- background-color 🔴 MISSING (colors support var!)
- background-image 🔴 MISSING (images support var!)

### Border (12)
- border-bottom-color 🔴 MISSING (colors support var!)
- border-bottom-style ⚠️ KEYWORD ONLY
- border-left-color 🔴 MISSING
- border-left-style ⚠️ KEYWORD ONLY
- border-right-color 🔴 MISSING
- border-right-style ⚠️ KEYWORD ONLY
- border-top-color 🔴 MISSING
- border-top-style ⚠️ KEYWORD ONLY
- color 🔴 MISSING (primary color property!)

### Custom (1)
- custom-property 🔴 SPECIAL CASE (already IS CssValue)

### Font (7)
- font-family ⚠️ IDENTIFIER LIST (special)
- font-kerning ⚠️ KEYWORD ONLY
- font-optical-sizing ⚠️ KEYWORD ONLY
- font-stretch ⚠️ KEYWORD/PERCENTAGE (needs CssValue?)
- font-style ⚠️ KEYWORD/ANGLE (needs CssValue?)
- font-variant ⚠️ KEYWORD ONLY
- font-variant-caps ⚠️ KEYWORD ONLY
- font-variant-ligatures ⚠️ KEYWORD/LIST (special)
- font-variant-numeric ⚠️ KEYWORD/LIST (special)

### Blend (1)
- mix-blend-mode ⚠️ KEYWORD ONLY

### Transform (4)
- perspective-origin 🔴 MISSING (positions support var!)
- transform 🔴 MISSING (functions support var!)
- transform-origin 🔴 MISSING (positions support var!)
- transform-style ⚠️ KEYWORD ONLY

### Transition (2)
- transition-property ⚠️ IDENTIFIER (special)
- transition-timing-function ⚠️ FUNCTION/KEYWORD (needs CssValue?)

### Text (5)
- text-align ⚠️ KEYWORD ONLY
- text-overflow ⚠️ KEYWORD/STRING (needs CssValue?)
- text-transform ⚠️ KEYWORD ONLY
- white-space ⚠️ KEYWORD ONLY

### Other (1)
- visibility ⚠️ KEYWORD ONLY

---

## 🔍 Analysis: Which Properties SHOULD Support CssValue?

### 🔴 Critical Missing (11) - Colors, Images, Transforms, Positions

These **definitely need CssValue** because they support `var()` and `calc()`:

1. **background-color** - Color (var support)
2. **background-image** - Image (var support)
3. **border-*-color (8 props)** - Colors (var support)
4. **color** - Color (var support)
5. **perspective-origin** - Position (var/calc support)
6. **transform** - Transform functions (var support)
7. **transform-origin** - Position (var/calc support)

### ⚠️ Maybe Need CssValue (6) - Functions/Mixed Types

These have function/mixed syntax that might benefit:

1. **animation-timing-function** - `cubic-bezier()`, `steps()` (var support?)
2. **font-stretch** - `<percentage>` (calc support)
3. **font-style** - `oblique <angle>` (calc support?)
4. **text-overflow** - `<string>` (var support for strings?)
5. **transition-timing-function** - `cubic-bezier()`, `steps()` (var support?)
6. **font-variant-ligatures** - Keyword list (var support?)
7. **font-variant-numeric** - Keyword list (var support?)

### ✅ Correctly WITHOUT CssValue (24) - Pure Keywords

These are keyword-only or identifiers (no var/calc):

1. **animation-direction** - Pure keyword (`normal`, `reverse`, etc.)
2. **animation-fill-mode** - Pure keyword (`none`, `forwards`, etc.)
3. **animation-name** - Identifier (not a value)
4. **animation-play-state** - Pure keyword (`running`, `paused`)
5. **background-blend-mode** - Pure keyword (`multiply`, etc.)
6. **border-*-style (4 props)** - Pure keyword (`solid`, `dashed`, etc.)
7. **font-family** - Identifier list (special case)
8. **font-kerning** - Pure keyword (`auto`, `normal`, `none`)
9. **font-optical-sizing** - Pure keyword (`auto`, `none`)
10. **font-variant** - Pure keyword (`normal`, `small-caps`)
11. **font-variant-caps** - Pure keyword
12. **mix-blend-mode** - Pure keyword
13. **text-align** - Pure keyword (`left`, `right`, etc.)
14. **text-transform** - Pure keyword (`uppercase`, etc.)
15. **transform-style** - Pure keyword (`flat`, `preserve-3d`)
16. **transition-property** - Identifier (property name)
17. **visibility** - Pure keyword (`visible`, `hidden`)
18. **white-space** - Pure keyword (`normal`, `nowrap`, etc.)

### 🤔 Special Cases (1)

1. **custom-property** - Already stores raw CssValue

---

## 🎯 Recommendations

### Priority 1: Add CssValue Support (11 properties)

**Colors (9):**
- background-color
- border-bottom-color
- border-left-color
- border-right-color
- border-top-color
- color

**Images (1):**
- background-image

**Transforms/Positions (4):**
- perspective-origin
- transform
- transform-origin

### Priority 2: Investigate & Decide (6 properties)

Need to verify if these support var() in real CSS:
- animation-timing-function
- font-stretch
- font-style
- text-overflow
- transition-timing-function
- font-variant-ligatures
- font-variant-numeric

### Priority 3: Document as Correct (24 properties)

These are intentionally keyword-only and should NOT have CssValue.

---

## 🚨 Architecture Issue: The "value.value" Problem

**Current pattern in 32 properties:**

```typescript
{
  kind: "value";
  value: CssValue;  // ← "value.value" repetition
}
```

**Options:**
1. Keep as-is (accept repetition)
2. Rename field: `cssValue`, `data`, `payload`
3. Rename discriminator: `kind: "cssValue"`

**Decision pending user input.**

---

## 📋 Next Steps

1. **Decide on API redesign** (value.value issue)
2. **Add CssValue to 11 critical properties**
3. **Research Priority 2 properties** (var() support in spec)
4. **Document patterns** (when to use CssValue vs keyword-only)

