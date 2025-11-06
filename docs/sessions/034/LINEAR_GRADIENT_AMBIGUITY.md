# Linear Gradient Parser Ambiguity Problem

**Date:** 2025-11-06  
**Session:** 034

---

## 🔴 The Problem

The linear gradient parser is making **wild, brittle assumptions** about what a CSS value function means based on its position, leading to unpredictable behavior.

---

## 📋 Current State

### What Works

```css
/* RGB/HSL colors without var/calc */
linear-gradient(rgb(255, 0, 0), blue)          ✅ PASSES

/* var() as direction */
linear-gradient(var(--angle), red, blue)       ✅ PASSES

/* var() in position */
linear-gradient(red var(--pos), blue)          ✅ PASSES
```

### What Fails

```css
/* var() as first color stop */
linear-gradient(var(--color-1), var(--color-2)) ❌ FAILS
```

**Why it fails:** Parser treats `var(--color-1)` as a **direction** (angle), not a color.

---

## 🤡 Current "Solution" (Rejected)

> **"The right behavior is: if you want var() as a color, use explicit direction."**

This is **terrible** for these reasons:

1. **Not spec-compliant** - CSS gradients don't require explicit direction when using var()
2. **Brittle heuristics** - Position-based disambiguation is fragile
3. **User-hostile** - Forces workarounds: `linear-gradient(180deg, var(--c1), var(--c2))`
4. **Inconsistent** - Radial gradient has similar issue but different workaround

---

## 🧐 Root Cause Analysis

### The Ambiguity

`var()` and `calc()` can represent **multiple CSS value types** depending on context:

```css
/* var() as angle (direction) */
linear-gradient(var(--angle), red, blue)

/* var() as color */
linear-gradient(var(--color1), var(--color2))

/* var() as length/percentage (position) */
linear-gradient(red var(--stop-pos), blue)
```

**The parser cannot know what `var(--x)` represents without runtime evaluation.**

### Current Parser Logic (Broken)

```typescript
// In linear.ts fromFunction():
const firstNode = children[idx];
if (firstNode.type === "Function") {
  // Catches ALL functions including rgb/hsl/var
  const dirResult = parseDirection(children, idx);
  if (dirResult.ok) {
    direction = dirResult.value.direction;
    idx = dirResult.value.nextIdx; // Consumes the node!
  }
}

// In parseDirection():
if (node.type === "Function") {
  // Tries to parse ANY function as angle
  const angleResult = parseCssValueNodeEnhanced(node);
  if (angleResult.ok) {
    // var/calc always succeed!
    return parseOk({ direction: { kind: "angle", value: angleResult.value } });
  }
}
```

**Problem flow:**

1. Sees `var(--color-1)` as first node
2. Tries to parse as direction
3. `parseCssValueNodeEnhanced` succeeds (var is valid anywhere)
4. Consumes node as direction
5. Only `var(--color-2)` remains → "requires at least 2 color stops" error

---

## 📐 CSS Spec: linear-gradient Syntax

From [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient):

```
linear-gradient(
  [ <angle> | to <side-or-corner> ]? ,
  <color-stop-list>
)
```

**Key points:**

- Direction is **optional** (defaults to `to bottom`)
- Direction must be angle **OR** keyword (to ...)
- Color stop list requires **at least 2 stops**

### Valid Examples from Spec

```css
linear-gradient(red, blue)                           /* No direction */
linear-gradient(45deg, red, blue)                    /* Angle */
linear-gradient(to right, red, blue)                 /* Keyword */
linear-gradient(red 0%, yellow 50%, blue 100%)       /* With positions */
```

### Ambiguous Cases

```css
/* Is var(--x) a direction or first color? */
linear-gradient(var(--x), red, blue)

/* ANSWER: Depends on --x runtime value! */
/* If --x = 45deg  → direction */
/* If --x = red    → color */
```

---

## 🎯 What We Need: Spec-Compliant Lookahead

### Strategy

**Use lookahead to disambiguate:**

1. **If first node is:** Dimension/Number → **direction** (unambiguous)
2. **If first node is:** `to` keyword → **direction** (unambiguous)
3. **If first node is:** Function:
   - **Look at second node:**
     - If comma + more nodes → **Try direction, fallback to color**
     - Count remaining stops after trying direction
     - If < 2 color stops remain → **direction failed, treat as color**

4. **If first node is:** Identifier (not `to`) → **color** (unambiguous)
5. **If first node is:** Hash → **color** (unambiguous)

### Algorithm

```typescript
function disambiguateFirstNode(children: CssNode[]): "direction" | "color" {
  const first = children[0];

  // Unambiguous cases
  if (first.type === "Dimension" || first.type === "Number") return "direction";
  if (first.type === "Identifier" && first.name === "to") return "direction";
  if (first.type === "Hash") return "color";
  if (first.type === "Identifier" && first.name !== "to") return "color";

  // Ambiguous: Function (var/calc/rgb/hsl)
  if (first.type === "Function") {
    const funcName = first.name.toLowerCase();

    // Color functions are unambiguous
    if (["rgb", "rgba", "hsl", "hsla", "hwb", "lab", "lch", "oklab", "oklch"].includes(funcName)) {
      return "color";
    }

    // var/calc/clamp/min/max are ambiguous
    // Strategy: Try parsing as direction, check if enough stops remain
    const tryDirection = parseDirection(children, 0);
    if (tryDirection.ok) {
      const remainingGroups = splitNodesByComma(children, { startIndex: tryDirection.value.nextIdx });
      if (remainingGroups.length >= 2) {
        return "direction"; // Valid: direction + 2+ color stops
      }
    }

    // Direction parse failed OR not enough stops → treat as color
    return "color";
  }

  return "color"; // Default to color
}
```

---

## ✅ Expected Behavior After Fix

```css
/* var as direction (explicit with 2+ colors) */
linear-gradient(var(--angle), red, blue)
→ direction: var(--angle), stops: [red, blue]  ✅

/* var as color (2 var stops) */
linear-gradient(var(--c1), var(--c2))
→ direction: undefined, stops: [var(--c1), var(--c2)]  ✅

/* var as color with 3rd color */
linear-gradient(var(--c1), red, blue)
→ direction: undefined, stops: [var(--c1), red, blue]  ✅

/* Ambiguous resolved by count */
linear-gradient(var(--x), red)
→ direction: var(--x), stops: [red]  ❌ (< 2 stops, invalid)
→ Falls back: direction: undefined, stops: [var(--x), red]  ✅

/* rgb as color (unambiguous) */
linear-gradient(rgb(255,0,0), blue)
→ direction: undefined, stops: [rgb(...), blue]  ✅
```

---

## 🔧 Implementation Plan

1. **Create disambiguation function** in `linear.ts`
2. **Update `fromFunction()`** to use lookahead logic
3. **Keep `parseDirection()`** but make it non-consuming on failure
4. **Add comprehensive tests** for all ambiguous cases
5. **Document the disambiguation strategy** in code comments

---

## 📚 References

- [CSS Images Module Level 3: linear-gradient](https://drafts.csswg.org/css-images-3/#linear-gradients)
- [MDN: linear-gradient()](https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient)
- Session 033: Radial gradient faced similar issue with `var(--radius)`

---

## 🚨 Next Steps

1. Design spec-compliant disambiguation algorithm
2. Write failing tests for all edge cases
3. Implement lookahead logic
4. Verify all tests pass
5. Document the approach for future maintainers

---

## 🎨 What About Conic Gradient?

**Answer: Conic gradient does NOT have this ambiguity problem.**

### Syntax Comparison

```css
/* Linear - direction is OPTIONAL and unkeyed */
linear-gradient(45deg, red, blue)           /* angle */
linear-gradient(to right, red, blue)        /* keyword */
linear-gradient(red, blue)                  /* no direction */
linear-gradient(var(--x), red, blue)        /* AMBIGUOUS! */

/* Conic - angle requires "from" keyword */
conic-gradient(from 45deg, red, blue)       /* angle with keyword */
conic-gradient(red, blue)                   /* no angle */
conic-gradient(var(--angle), red, blue)     /* color stop (no "from") */
conic-gradient(from var(--angle), red, blue) /* angle with keyword */
```

### Why Conic Is Safe

The conic gradient syntax requires **explicit keywords** for optional parameters:
- `from <angle>` - angle requires "from" keyword
- `at <position>` - position requires "at" keyword

Without these keywords, the first node **must be a color stop**. No ambiguity!

### Conic Parser Status

✅ **No changes needed** - The current conic gradient parser is already correct and unambiguous.

The only potential issue is if `var()/calc()` are used AFTER the keywords:
```css
conic-gradient(from var(--angle), ...)  /* OK - unambiguous */
conic-gradient(at var(--x) var(--y), ...) /* OK - unambiguous */
```

These work correctly because the keywords have already been consumed, so the context is clear.
