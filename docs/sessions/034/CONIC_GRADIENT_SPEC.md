# Conic Gradient CSS Spec Reference

**Date:** 2025-11-06  
**Session:** 035 Prep  
**Source:** CSS Images Module Level 4

---

## 📋 Full Syntax Definition

```
<conic-gradient()> = 
  conic-gradient( [ <conic-gradient-syntax> ] )  

<conic-gradient-syntax> = 
  [ [ [ from [ <angle> | <zero> ] ]? [ at <position> ]? ] || <color-interpolation-method> ]? , <angular-color-stop-list>  

<position> = 
  <position-one>   |
  <position-two>   |
  <position-four>  

<color-interpolation-method> = 
  in [ <rectangular-color-space> | <polar-color-space> <hue-interpolation-method>? | <custom-color-space> ]  

<angular-color-stop-list> = 
  <angular-color-stop> , [ <angular-color-hint>? , <angular-color-stop> ]#?  

<angular-color-stop> = 
  <color> <color-stop-angle>?  

<angular-color-hint> = 
  <angle-percentage>  |
  <zero>              

<color-stop-angle> = 
  [ <angle-percentage> | <zero> ]{1,2}  

<angle-percentage> = 
  <angle>       |
  <percentage>
```

---

## 🎯 Key Components

### 1. Starting Angle (Optional)

```
from [ <angle> | <zero> ]
```

**Requires explicit `from` keyword**

Valid angle units:
- `deg` - Degrees (360 per circle)
- `grad` - Gradians (400 per circle)
- `rad` - Radians (2π per circle)
- `turn` - Turns (1 per circle)
- `0` - Zero (unitless)

**Default:** `0deg` (12 o'clock position, pointing up)

**Examples:**
```css
conic-gradient(from 90deg, red, blue)
conic-gradient(from 0.25turn, red, blue)
conic-gradient(from 100grad, red, blue)
conic-gradient(from 1.57rad, red, blue)
conic-gradient(from 0, red, blue)
```

### 2. Center Position (Optional)

```
at <position>
```

**Requires explicit `at` keyword**

Position syntax same as `radial-gradient`:
- Single keyword: `center`, `top`, `left`, `right`, `bottom`
- Two keywords: `top left`, `center right`, etc.
- Length/percentage: `at 50% 50%`, `at 100px 200px`
- Mixed: `at center 25%`, `at left 10px`

**Default:** `at center center` (50% 50%)

**Examples:**
```css
conic-gradient(at top left, red, blue)
conic-gradient(at 75% 25%, red, blue)
conic-gradient(at center, red, blue)
```

### 3. Color Interpolation Method (Optional)

```
<color-interpolation-method>
```

Same as linear/radial gradients:
- `in srgb`, `in display-p3`, `in oklch`, etc.
- Can include hue interpolation: `in oklch shorter hue`

**Examples:**
```css
conic-gradient(in oklch, red, blue)
conic-gradient(in lch longer hue, red, blue)
```

### 4. Angular Color Stops (Required)

```
<angular-color-stop-list>
```

**Minimum 2 color stops required**

Each stop:
- Color value (named, hex, rgb, hsl, var, etc.)
- Optional angle/percentage position(s)

**Angular positions:**
- Angles: `0deg` to `360deg` (wraps around)
- Percentages: `0%` to `100%` (0% = start angle, 100% = start + 360deg)
- Can have 1 or 2 positions (like linear gradient)

**Examples:**
```css
/* No positions (evenly distributed) */
conic-gradient(red, yellow, blue)

/* With angles */
conic-gradient(red 0deg, yellow 120deg, blue 240deg)

/* With percentages */
conic-gradient(red 0%, yellow 33%, blue 67%)

/* Mixed */
conic-gradient(red 0deg, yellow 90deg, blue 50%)

/* Double positions */
conic-gradient(red 0deg 90deg, blue 90deg 180deg)
```

### 5. Angular Color Hints (Optional)

```
<angular-color-hint>
```

Transition midpoint between stops (like linear/radial):

**Examples:**
```css
conic-gradient(red, 45deg, blue)  /* Hint at 45deg */
conic-gradient(red, 25%, blue)    /* Hint at 25% */
```

---

## 🔍 Conic-Specific Behaviors

### Angle Wrapping

Angles wrap around 360deg:
```css
/* These are equivalent */
conic-gradient(red 0deg, blue 360deg)
conic-gradient(red 0deg, blue 0deg)

/* Negative angles */
conic-gradient(red -90deg, blue 0deg)
/* = */ conic-gradient(red 270deg, blue 0deg)
```

### Percentage to Angle Conversion

Percentages are relative to 360deg arc:
```css
0%   = 0deg
25%  = 90deg
50%  = 180deg
75%  = 270deg
100% = 360deg
```

**With custom starting angle:**
```css
conic-gradient(from 45deg, red 0%, blue 100%)
/* 0% = 45deg, 100% = 405deg (wraps to 45deg) */
```

### Default Starting Angle

`0deg` points **upward** (12 o'clock), like clock hands:
```
        0deg (12:00)
           ↑
   270deg ← + → 90deg
           ↓
       180deg (6:00)
```

Different from typical math coordinates where 0deg is rightward.

---

## 📐 Order of Operations

The `||` operator means components can appear in any order:

```css
/* Valid orderings */
conic-gradient(from 45deg at center, red, blue)
conic-gradient(at center from 45deg, red, blue)
conic-gradient(in oklch from 45deg, red, blue)
conic-gradient(from 45deg in oklch at center, red, blue)

/* Invalid - interpolation must come before stops */
conic-gradient(red, blue, in oklch)  ❌
```

---

## 🎨 Complete Examples

### Basic
```css
conic-gradient(red, blue)
```

### With Starting Angle
```css
conic-gradient(from 90deg, red, blue)
```

### With Position
```css
conic-gradient(at top left, red, blue)
```

### With Both
```css
conic-gradient(from 45deg at center, red, blue)
```

### With Interpolation
```css
conic-gradient(from 0deg at center in oklch, red, blue)
```

### With Angular Positions
```css
conic-gradient(
  red 0deg,
  yellow 90deg,
  lime 180deg,
  blue 270deg,
  red 360deg
)
```

### With Percentages
```css
conic-gradient(
  red 0%,
  yellow 25%,
  lime 50%,
  blue 75%,
  red 100%
)
```

### With Hints
```css
conic-gradient(red, 45deg, yellow, 135deg, blue)
```

### With Color Functions
```css
conic-gradient(
  rgb(255, 0, 0),
  hsl(120, 100%, 50%),
  oklch(0.5 0.2 240)
)
```

### With Dynamic Values
```css
conic-gradient(
  from var(--start-angle),
  var(--color-1),
  var(--color-2)
)
```

### Repeating
```css
repeating-conic-gradient(
  red 0deg 10deg,
  blue 10deg 20deg
)
```

---

## 🚨 Edge Cases to Test

### Angle Wrapping
- Angles > 360deg
- Negative angles
- Very large angles (720deg, 1080deg)

### Zero Values
- Unitless `0` vs `0deg`
- `0%` vs `0deg`

### Position Edge Cases
- All position syntaxes (one/two/four value)
- Physical vs logical keywords
- Percentage positions
- Calc in positions

### Stop Order
- Out-of-order stops (180deg before 90deg)
- Duplicate positions
- Stops beyond 360deg/100%

### Dynamic Values
- `var()` in angles
- `calc()` in angles/percentages
- `var()` in colors
- `var()` in positions

### Color Functions
- rgb/rgba/hsl/hsla
- Modern color functions (oklch, lab, etc.)
- Color-mix
- currentColor, transparent

---

## 📊 Comparison with Linear/Radial

| Feature | Linear | Radial | Conic |
|---------|--------|--------|-------|
| Direction/Angle | Optional, no keyword | N/A | Optional, **requires `from`** |
| Position | N/A | Optional, **requires `at`** | Optional, **requires `at`** |
| Stop Positions | Length/% | Length/% | **Angle/%** |
| Default Direction | 180deg (down) | N/A | 0deg (up) |
| Wrapping | No | No | **Yes (360deg)** |
| Ambiguity | Yes (session 034) | No | **No (explicit keywords)** |

---

## ✅ Key Takeaways for Testing

1. **No Ambiguity:** `from` and `at` keywords are mandatory, so no disambiguation needed
2. **Angular Positions:** Stop positions use angles/percentages, not lengths
3. **Wrapping Behavior:** Must test 360deg+ and negative angles
4. **Default Angle:** 0deg = upward (12 o'clock), not rightward
5. **Same Position System:** Uses same position syntax as radial gradient
6. **Same Interpolation:** Uses same color interpolation as linear/radial
7. **Angular Hints:** Transition hints use angles/percentages

---

**Ready for Intel Doc Creation:** This spec will guide CONIC_GRADIENT_INTEL.md
