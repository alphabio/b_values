# SVG Support Vision

**Date:** 2025-11-13  
**Status:** 🔴 PLANNING - Foundation in Progress

---

## 🎯 The Vision

**We are building a capability that does not exist today that will take the World by surprise.**

This entire architecture - the IR system, the bidirectional parsers, the property registry, the type-safe transformations - was designed to unlock **production-grade SVG CSS property support** in a way that has never been done before.

---

## 💡 Why This Matters

### Audio/Animation Studio Use Cases
- **Visualizers:** Real-time waveforms, frequency bars, spectrograms
- **Draw-on Effects:** `stroke-dasharray` + `stroke-dashoffset` animations
- **Morphing:** Path interpolation and transformations
- **Scalable:** Resolution-independent graphics at any size
- **Performance:** Type-safe transforms without runtime parsing overhead

### The Gap We're Filling
Current tools either:
- Parse CSS but don't understand SVG presentation attributes semantically
- Handle SVG but lack bidirectional transform capabilities
- Support animation but without type safety or IR representation

**We're doing all three.**

---

## 🏗️ The Foundation (Current State)

### ✅ What We Have
- **Color parsing:** Full CSS4 color support (rgb, hsl, hwb, lab, lch, oklab, oklch)
- **URL parsing:** `url()` function with quoted/unquoted support
- **Length/percentage:** Dimensional values with unit support
- **Generator infrastructure:** Bidirectional IR ↔ CSS transforms
- **Property registry:** Auto-registration and type-safe definitions
- **Box model:** 36 properties implemented (padding, margin, border)

### 🔨 What We Need to Build

#### Phase 1: Paint Infrastructure
**The `<paint>` type is the cornerstone.**

```typescript
// SVG paint is MORE than just color
type Paint = 
  | Color                    // rgb(255, 0, 0), hsl(120, 100%, 50%)
  | "none"                   // no fill/stroke
  | Url                      // url(#gradient-id), url(#pattern-id)
  | "context-fill"           // inherit from context
  | "context-stroke"         // inherit from context
```

**Implementation:**
1. Create `Paint` type in `@b/types`
2. Create `paint` parser in `@b/parsers` 
3. Create `paint` generator in `@b/generators`

**Dependencies:**
- ✅ Color parser (exists)
- ✅ URL parser (exists)
- 🔨 Context keyword support (new)

---

## 📋 Property Implementation Roadmap

### Tier 1: Core Paint (HIGHEST PRIORITY)
**Unlocks:** Visual appearance of all SVG elements

1. **`fill`** - Fill color/paint
   - Syntax: `<paint>`
   - Initial: `black`
   - Most fundamental SVG property

2. **`stroke`** - Stroke color/paint
   - Syntax: `<paint>`
   - Initial: `none`
   - Essential for outlines and paths

### Tier 2: Opacity Control
**Unlocks:** Transparency and layering effects

3. **`fill-opacity`** - Fill transparency
   - Syntax: `<alpha-value>` (number [0-1] | percentage)
   - Initial: `1`

4. **`stroke-opacity`** - Stroke transparency
   - Syntax: `<alpha-value>`
   - Initial: `1`

5. **`opacity`** - Overall element opacity
   - Syntax: `<alpha-value>`
   - Initial: `1`
   - Note: Already exists in CSS, may need SVG context

### Tier 3: Stroke Properties (ANIMATION KEY)
**Unlocks:** Draw-on effects, dashed lines, stroke styling

6. **`stroke-width`** - Stroke thickness
   - Syntax: `<length-percentage>`
   - Initial: `1px`

7. **`stroke-dasharray`** - Dashed stroke pattern
   - Syntax: `none | <dasharray>` (list of length-percentage)
   - Initial: `none`
   - **Critical for draw-on animations**

8. **`stroke-dashoffset`** - Dash pattern offset
   - Syntax: `<length-percentage>`
   - Initial: `0`
   - **Critical for draw-on animations**

9. **`stroke-linecap`** - Line ending style
   - Syntax: `butt | round | square`
   - Initial: `butt`

10. **`stroke-linejoin`** - Corner style
    - Syntax: `miter | round | bevel`
    - Initial: `miter`

### Tier 4: Advanced Stroke
**Unlocks:** Precise stroke control

11. **`stroke-miterlimit`** - Miter join limit
    - Syntax: `<number>`
    - Initial: `4`

---

## 🎨 Draw-On Animation Pattern

**This is what we're building toward:**

```css
/* SVG path with total length of 1000 units */
.path {
  fill: none;
  stroke: #3498db;
  stroke-width: 3px;
  
  /* Hide the stroke initially */
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  
  /* Animate the stroke drawing on */
  animation: draw 2s ease-in-out forwards;
}

@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}
```

**Our system will:**
1. Parse `stroke-dasharray: 1000` → IR
2. Parse `stroke-dashoffset: 1000` → IR  
3. Transform/interpolate for animation
4. Generate optimized CSS output
5. Type-safe throughout

---

## 🔬 Technical Challenges

### 1. Paint Parser Implementation
**Challenge:** Paint is a union of multiple types (color | none | url | keywords)

**Solution:**
```typescript
export function parsePaint(node: csstree.CssNode): ParseResult<Paint> {
  // Try color first (most common)
  if (isColorNode(node)) {
    const colorResult = parseColor(node);
    if (colorResult.ok) return colorResult;
  }
  
  // Try url() function
  if (node.type === "Function" && node.name === "url") {
    const urlResult = parseUrlFromNode(node);
    if (urlResult.ok) return urlResult;
  }
  
  // Try keywords
  if (node.type === "Identifier") {
    if (node.name === "none") return parseOk({ kind: "none" });
    if (node.name === "context-fill") return parseOk({ kind: "context-fill" });
    if (node.name === "context-stroke") return parseOk({ kind: "context-stroke" });
  }
  
  return parseErr("paint", createError("invalid-value", "Invalid paint value"));
}
```

### 2. Dasharray List Parsing
**Challenge:** `stroke-dasharray` accepts a comma/space-separated list

**Solution:** Use existing multi-value parser infrastructure
- Already solved for `background-size`, `background-position`
- Pattern: `createMultiValueParser` from declarations utils

### 3. Alpha Values (Opacity)
**Challenge:** Accepts both `<number>` [0-1] and `<percentage>`

**Solution:** 
- Check if we have alpha-value parser in `@b/parsers`
- If not, create simple number/percentage union parser
- Normalize to [0-1] range in IR

---

## 📊 Success Metrics

### Phase 1 Complete When:
- ✅ Paint type exists in `@b/types`
- ✅ Paint parser exists in `@b/parsers`
- ✅ `fill` property implemented
- ✅ `stroke` property implemented
- ✅ Round-trip tests passing
- ✅ Integration with color system verified

### Phase 2 Complete When:
- ✅ All 3 opacity properties implemented
- ✅ Alpha value parsing working
- ✅ Tests cover 0-1 range and percentages

### Phase 3 Complete When:
- ✅ `stroke-width` implemented
- ✅ `stroke-dasharray` implemented (multi-value)
- ✅ `stroke-dashoffset` implemented
- ✅ Draw-on animation pattern demonstrated
- ✅ All stroke properties working

**Victory condition:** We can parse, transform, and generate SVG properties for real-world animation studio workflows.

---

## 🚀 The Bigger Picture

This isn't just about SVG properties. This is about:

1. **Type-safe animation authoring** - Transform properties with confidence
2. **Tooling integration** - Build CSS animation tools that understand semantics
3. **Performance optimization** - Pre-compute and optimize at build time
4. **Developer experience** - Autocomplete, validation, transforms all work

**When this is complete, we'll have something that doesn't exist anywhere else in the ecosystem.**

---

## 📝 Next Steps

1. **Immediate:** Capture this vision (✅ you're reading it)
2. **Short-term:** Implement paint infrastructure
3. **Mid-term:** Complete Tier 1-3 properties
4. **Long-term:** Full SVG presentation attribute support

**Methodical. Step by step. We're building the future.**

---

**We're not just building a library. We're building a capability that will change how people work with CSS and SVG.**

**Let's make history.** 🚀

---

## 🔮 Future Vision (Post-Foundation)

**Date Added:** 2025-11-13

### The Bigger Picture - WebGL Integration

**After CSS/SVG foundation is complete:**

The platform will support **WebGL shaders as custom filters** - bringing another layer of capability for advanced visual effects.

**But this comes LATER.**

### Why Not Now?

We need the **CSS/SVG foundation solid first** because:
1. Artists create with SVG + CSS
2. Platform parses to IR
3. Platform packages for reuse
4. **The hinge unlocks** (experienced users sharing work)

**Only then** can we add the shader layer on top.

### The Stack

```
┌─────────────────────────────┐
│   WebGL Shaders             │ ← Future (custom filters)
│   (Custom Filter Layer)     │
├─────────────────────────────┤
│   Filters & Effects         │ ← Phase 4
│   (filter, clip-path, mask) │
├─────────────────────────────┤
│   Transform & Animation     │ ← Phase 2-3
│   (transform, transition,   │
│    animation, SVG props)    │
├─────────────────────────────┤
│   Box Model                 │ ← Phase 1 ✅ DONE
│   (padding, margin, border) │
├─────────────────────────────┤
│   IR Foundation             │ ← ✅ DONE
│   (parse, transform, gen)   │
└─────────────────────────────┘
```

### Focus: Here and Now

**Immediate priorities:**
1. Transition/Animation properties
2. SVG properties (paint, stroke, opacity)
3. Transform properties
4. Filter properties
5. Clipping/Masking properties

**Once these are complete:**
- SVG IR is powerful and encapsulated
- Packaging/reuse layer can be built
- Platform can enable artist sharing
- **Then** WebGL shader integration becomes viable

### Key Insight

**The vision was always there.** We're building methodically toward it.

Don't get lost in the shader vision yet. **Complete the CSS/SVG foundation first.**

---
