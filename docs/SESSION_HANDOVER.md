# Session 041: Position 4-Value Syntax Fix

**Date:** 2025-11-06
**Focus:** Fix radial/conic gradient 4-value position parsing (`at top 20px left 15%`)

---

## 🎯 Objective

Fix the position parser to correctly handle 4-value syntax where keyword-offset pairs define edge-relative positions.

**Current Issue:**

```css
radial-gradient(ellipse at top 20px left 15%, ...)
```

**Current Parse (WRONG):**

```json
{
  "horizontal": { "kind": "keyword", "value": "top" },
  "vertical": { "kind": "literal", "value": 20, "unit": "px" }
}
```

**Expected Parse (CORRECT):**

```json
{
  "horizontal": {
    "edge": "left",
    "offset": { "kind": "literal", "value": 15, "unit": "%" }
  },
  "vertical": {
    "edge": "top",
    "offset": { "kind": "literal", "value": 20, "unit": "px" }
  }
}
```

**CSS Spec:** `<position>` 4-value syntax:

- `[keyword] [offset] [keyword] [offset]`
- First pair: one axis (e.g., `top 20px` = vertical)
- Second pair: other axis (e.g., `left 15%` = horizontal)

---

## 📊 Current State

**Working:**

- All 1957 tests passing ✅
- All quality checks passing ✅
- Session 040 archived ✅
- Session 041 initialized ✅

**Not working:**

- 4-value position syntax incorrectly parsed
- Position IR needs edge + offset structure

---

## 🎯 Next Steps

1. Review current position parser implementation
2. Update position IR type to support edge+offset structure
3. Implement 4-value syntax parsing
4. Add tests for 4-value position syntax
5. Update generator to handle new IR structure
6. Ensure backwards compatibility with 2-value syntax

---

## 💡 Research Available

See previous session documentation:

- `docs/sessions/040/POSITION_4VALUE_ISSUE.md` - Issue description
- `docs/sessions/040/POSITION_PARSER_RESEARCH.md` - Implementation research

---

## ⏱️ Estimated Effort

7-11 hours (per previous research)
