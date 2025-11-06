# Session 031: Gradient Deep Dive Plan

**Date:** 2025-11-06
**Focus:** Complete gradient coverage for CSS Editor support
**Priority:** HIGH - Gradients are one of the most powerful CSS Editor tools

---

## 🎯 Objectives

Ensure **full, production-ready coverage** of all three gradient types:

1. Linear gradients
2. Radial gradients
3. Conic gradients

**Goal:** Rock-solid parsing, generation, validation, and testing for background-image gradients.

---

## 📊 Current State Assessment

### Implementation Coverage

**Files per gradient type:**

- **Types:** 6 schema files (linear, radial, conic, direction, radial-size, color-stop)
- **Parsers:** 5 parser files (linear, radial, conic, color-stop, index)
- **Generators:** 5 generator files (linear, radial, conic, color-stop, index)

**Test Coverage:**

- 12 test files across types/parsers/generators
- ~892 lines of test code
- ~58 test cases

### What Works ✅

From Session 030:

- ✅ var() and calc() support in angles, positions, color stops
- ✅ Complex gradients parse correctly
- ✅ All existing tests passing (993 total)

---

## 🔍 Deep Dive Checklist

### 1. Feature Completeness

For each gradient type, verify support for:

#### Linear Gradients

- [ ] Direction syntax variations:
  - [ ] Angle values (45deg, 0.5turn, 100grad, 1.57rad)
  - [ ] Side/corner keywords (to top, to bottom right, etc.)
  - [ ] Default (no direction = to bottom)
- [ ] Color stops:
  - [ ] Basic colors (red, #ff0000, rgb(), hsl(), lch(), etc.)
  - [ ] With single position (red 20%)
  - [ ] With double position (red 20% 30%)
  - [ ] Without position
- [ ] Color interpolation methods:
  - [ ] in srgb, in oklab, in oklch, etc.
  - [ ] With hue interpolation (shorter, longer, increasing, decreasing)
- [ ] Repeating variants (repeating-linear-gradient)

#### Radial Gradients

- [ ] Shape: circle, ellipse (default)
- [ ] Size keywords: closest-side, farthest-side, closest-corner, farthest-corner
- [ ] Explicit size:
  - [ ] Circle with radius (50px)
  - [ ] Ellipse with x/y radii (50px 100px)
- [ ] Position: at center, at top left, at 20% 30%, at calc(...)
- [ ] Color stops (same as linear)
- [ ] Color interpolation methods
- [ ] Repeating variants

#### Conic Gradients

- [ ] From angle: from 45deg, from var(--angle)
- [ ] Position: at center, at 50% 50%, at calc(...)
- [ ] Color stops with angles (red 0deg 45deg)
- [ ] Color interpolation methods
- [ ] Repeating variants

### 2. Edge Cases & Error Handling

- [ ] **Invalid syntax:**
  - [ ] Missing required parameters
  - [ ] Invalid color values
  - [ ] Malformed positions/angles
- [ ] **Boundary cases:**
  - [ ] Single color stop (invalid, needs 2+)
  - [ ] 100+ color stops (stress test)
  - [ ] Very long CSS strings
- [ ] **Dynamic values:**
  - [ ] var() in all positions ✅ (done in session 030)
  - [ ] calc() in all positions ✅ (done in session 030)
  - [ ] Nested functions (calc(var(...)))
- [ ] **Whitespace handling:**
  - [ ] No spaces, extra spaces, newlines
  - [ ] Tabs vs spaces

### 3. Round-Trip Testing

For each gradient type, ensure:

- [ ] Parse → Generate → Parse produces identical IR
- [ ] Generate → Parse → Generate produces identical CSS
- [ ] Preservation of var() and calc()
- [ ] Preservation of color format (don't convert rgb→hex)

### 4. Real-World Examples

Test with actual CSS Editor use cases:

- [ ] **Simple gradients:**

  ```css
  linear-gradient(red, blue)
  radial-gradient(circle, red, blue)
  conic-gradient(red, yellow, green, blue, red)
  ```

- [ ] **Complex gradients:**

  ```css
  linear-gradient(45deg, rgba(255,0,0,0.5) 0%, transparent 100%)
  radial-gradient(ellipse at top left, red, yellow 20%, blue 40%, green)
  ```

- [ ] **Design system gradients:**

  ```css
  linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)
  repeating-radial-gradient(circle at center, var(--ring-color) 0px, transparent 10px)
  ```

- [ ] **Animated gradients:**

  ```css
  conic-gradient(from var(--angle) at 50% 50%,
    var(--color-1) 0deg,
    var(--color-2) 120deg,
    var(--color-3) 240deg,
    var(--color-1) 360deg)
  ```

### 5. Documentation & Examples

- [ ] Add comprehensive gradient examples to README
- [ ] Document all supported features
- [ ] Add JSDoc examples to parser functions
- [ ] Create visual test gallery (if applicable)

### 6. Performance

- [ ] Benchmark parsing performance on complex gradients
- [ ] Ensure no exponential complexity issues
- [ ] Memory usage reasonable for large gradient lists

---

## 🧪 Testing Strategy

### Test Organization

```
packages/
├── b_types/src/gradient/
│   ├── *.test.ts         ← Schema validation tests
├── b_parsers/src/gradient/
│   ├── *.test.ts         ← Parsing tests (edge cases, errors)
└── b_generators/src/gradient/
    ├── *.test.ts         ← Generation + round-trip tests
```

### Test Categories

1. **Unit Tests** (current: ~58 tests)
   - Each parser function independently
   - Each generator function independently
   - Schema validation

2. **Integration Tests** (add if missing)
   - Full parse → generate → parse cycle
   - Integration with background-image property
   - Multiple gradients in a list

3. **Snapshot Tests** (consider adding)
   - Compare generated CSS against known-good examples
   - Catch unexpected format changes

---

## 🚀 Action Plan for Session 031

### Phase 1: Assessment (30 min)

1. Review all gradient test files
2. Identify coverage gaps
3. List missing edge cases
4. Check error handling completeness

### Phase 2: Feature Audit (45 min)

1. Test each feature from checklist above
2. Document what works vs what's missing
3. Find any parsing bugs
4. Check generator output quality

### Phase 3: Fill Gaps (variable time)

1. Add missing tests for uncovered features
2. Fix any bugs discovered
3. Add edge case handling
4. Improve error messages

### Phase 4: Documentation (30 min)

1. Update gradient documentation
2. Add usage examples
3. Document known limitations
4. Create ADR if needed

---

## 📋 Success Criteria

Session 031 is complete when:

✅ All checklist items verified
✅ Test coverage >90% for gradient code
✅ All edge cases have tests
✅ Round-trip works for 100+ real-world examples
✅ Error messages are clear and actionable
✅ Documentation is comprehensive
✅ No known bugs in gradient parsing/generation

---

## 📚 Reference Materials

**CSS Specifications:**

- [CSS Images Module Level 3](https://drafts.csswg.org/css-images-3/#gradients)
- [CSS Images Module Level 4](https://drafts.csswg.org/css-images-4/)

**MDN Documentation:**

- [linear-gradient()](https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient)
- [radial-gradient()](https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/radial-gradient)
- [conic-gradient()](https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/conic-gradient)
- [repeating-\*-gradient()](https://developer.mozilla.org/en-US/docs/Web/CSS/gradient)

**Test Resources:**

- Real gradient examples from popular design systems
- CSS gradient generators (cssgradient.io, etc.)
- Browser developer tools gradient picker outputs

---

## 🎨 CSS Editor Requirements

For a CSS Editor, gradients need:

1. **Visual Editing Support**
   - Parse any valid gradient
   - Preserve author intent (var names, calc expressions)
   - Generate clean, readable CSS

2. **Live Preview**
   - Fast parsing (< 1ms for typical gradients)
   - Accurate generation (pixel-perfect match)

3. **Error Recovery**
   - Graceful handling of invalid syntax
   - Clear error messages for debugging
   - Partial results when possible

4. **Format Preservation**
   - Don't change color format (rgb stays rgb)
   - Preserve whitespace style
   - Keep var() and calc() intact

---

**Next agent:** Use this plan as a roadmap for the deep dive. Start with Phase 1 assessment.
