# Master Plan: CSS Property Implementation

**Created:** 2025-11-14
**Current:** 48 properties implemented
**Target:** Core visualization properties

---

## 🎯 Phase 1: Visual Effects Foundation (CRITICAL)

**Goal:** Enable 90% of music visualization effects

### Wave 1: Opacity + Color (3 properties) - 30 min

- `opacity` (number 0-1)
- `color` (reuse Color from background-color)
- `visibility` (keyword: visible, hidden, collapse)

**Why first:** Simplest, unlocks fading/color transitions

---

### Wave 2: Transform Core (4 properties) - 2 hours

- `transform` (transform-function list - COMPLEX)
- `transform-origin` (position value)
- `transform-style` (keyword: flat, preserve-3d)
- `backface-visibility` (keyword: visible, hidden)

**Infrastructure needed:**

- Transform function types (matrix, translate, rotate, scale, skew, perspective)
- Transform function parser/generator
- Position value support (already have for background-position)

**Why critical:** Movement, rotation, scaling = core animation primitives

---

### Wave 3: Filter Effects (2 properties) - 2 hours

- `filter` (filter-function list - COMPLEX)
- `backdrop-filter` (same as filter)

**Infrastructure needed:**

- Filter function types (blur, brightness, contrast, grayscale, hue-rotate, etc.)
- Filter function parser/generator
- Length/angle/number/percentage handling (mostly exists)

**Why critical:** Visual effects (blur, color shifts, distortion)

---

### Wave 4: 3D Perspective (2 properties) - 45 min

- `perspective` (length | none)
- `perspective-origin` (position value)

**Why:** Complete 3D transform capabilities

---

## 📊 Phase 1 Summary

**Total:** 11 properties
**Time estimate:** ~6 hours
**Impact:** Unlocks music visualization platform

**After Phase 1:**

- 59 properties total (48 + 11)
- Full visual effects stack
- Transform + filter + blend modes + transitions + animations = COMPLETE

---

## 🔄 Phase 2: Layout Essentials (Optional)

**Goal:** Structure for visualization containers

### Quick Wins (10 properties) - 2 hours

- `display` (keyword: block, inline, flex, grid, none, etc.)
- `position` (keyword: static, relative, absolute, fixed, sticky)
- `top`, `right`, `bottom`, `left` (length | percentage | auto)
- `z-index` (integer | auto)
- `width`, `height` (length | percentage | auto)
- `overflow` (keyword: visible, hidden, scroll, auto)

**Why:** Container positioning, layering, sizing

---

## 🎨 Phase 3: Font & Text (Optional)

**Goal:** Text overlays for visualizations

### Core Text (8 properties) - 2 hours

- `font-family` (font-family list)
- `font-size` (length | percentage | keyword)
- `font-weight` (number | keyword)
- `font-style` (keyword: normal, italic, oblique)
- `text-align` (keyword: left, right, center, justify)
- `text-transform` (keyword: none, uppercase, lowercase, capitalize)
- `letter-spacing` (length | normal)
- `line-height` (number | length | percentage | normal)

**Why:** Overlays, labels, artist names

---

## ⏸️ Phase 4: Advanced Layout (Deferred)

**Flexbox (12 properties)**
**Grid (18 properties)**

**Why deferred:** Visualizations need effects more than complex layouts

---

## 🚀 Execution Strategy

### Velocity Principles:

1. **Copy-paste-modify** from existing properties
2. **Reuse infrastructure** (Color, Position, Length, Angle already exist)
3. **No premature optimization** (architectural debt tracked, not blocking)
4. **Commit frequently** (every wave)
5. **Tests prove it works** (2484 passing, add more as we go)

### Complexity Tiers:

- **Tier 1 (30 min):** Simple keywords or existing types (opacity, visibility)
- **Tier 2 (1 hour):** Reuse complex types (color, position, length)
- **Tier 3 (2 hours):** New complex types (transform functions, filter functions)

### Session Breakdown:

- **Session 076:** Wave 1 (opacity, color, visibility) ✅ Quick win
- **Session 077:** Wave 2 (transform core) ⚡ Big lift
- **Session 078:** Wave 3 (filters) ⚡ Big lift
- **Session 079:** Wave 4 (perspective) ✅ Finish Phase 1

**Phase 1 complete = 59 properties = visualization platform ready**

---

## 📝 Notes

**Architectural debt (tracked, not urgent):**

- Redundant `property` field in parsers (40+ occurrences)
- CSS-wide keyword repetition (40+ occurrences)
- Fix at 100+ properties or when blocking

**Infrastructure assets:**

- ✅ Color (hex, rgb, hsl, named)
- ✅ Length (px, em, rem, %, etc.)
- ✅ Angle (deg, rad, grad, turn)
- ✅ Time (s, ms)
- ✅ Position (x/y with keywords)
- ✅ EasingFunction (cubic-bezier, steps, keywords)
- ✅ Gradient (linear, radial)
- ✅ Image (url, gradient)
- ⏸️ Transform functions (need to build)
- ⏸️ Filter functions (need to build)

---

**Last updated:** 2025-11-14 13:44 UTC
