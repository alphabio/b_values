# Concrete Type Layer - TODO

**Session:** 081
**Date:** 2025-11-19
**Status:** 🔴 BLOCKED - Awaiting architectural decisions

---

## Priority 1: Time Properties ⏱️

**Pattern:** CSS time values (e.g., `1s`, `500ms`)

### animation-delay ❌ Type missing

- [ ] Update parser to use `Parsers.Time.parseTimeNode(node)` first
- [ ] Fallback to `parseNodeToCssValue` for var()/calc()
- [ ] Add tests for concrete time values
- [ ] Add tests for var()/calc() fallback

### animation-duration ❌ Type missing

- [ ] Add `{ kind: "time"; value: Type.Time }` to type
- [ ] Update parser (same as animation-delay)
- [ ] Add tests

### transition-delay ❌ Type missing

- [ ] Add `{ kind: "time"; value: Type.Time }` to type
- [ ] Update parser (same as animation-delay)
- [ ] Add tests

### transition-duration ❌ Type missing

- [ ] Add `{ kind: "time"; value: Type.Time }` to type
- [ ] Update parser (same as animation-delay)
- [ ] Add tests

---

## Priority 2: Length/Percentage Properties 📏

**Pattern:** CSS length/percentage values (e.g., `10px`, `50%`, `2rem`)

### Margins (4 properties)

- [ ] margin-bottom - Add concrete type + parser
- [ ] margin-left - Add concrete type + parser
- [ ] margin-right - Add concrete type + parser
- [ ] margin-top - Add concrete type + parser

### Paddings (4 properties)

- [ ] padding-bottom - Add concrete type + parser
- [ ] padding-left - Add concrete type + parser
- [ ] padding-right - Add concrete type + parser
- [ ] padding-top - Add concrete type + parser

### Border Widths (4 properties)

- [ ] border-bottom-width - Add concrete type + parser
- [ ] border-left-width - Add concrete type + parser
- [ ] border-right-width - Add concrete type + parser
- [ ] border-top-width - Add concrete type + parser

### Spacing (3 properties)

- [ ] letter-spacing - Add concrete type + parser
- [ ] text-indent - Add concrete type + parser
- [ ] word-spacing - Add concrete type + parser

### Other

- [ ] perspective - Add concrete type + parser
- [ ] font-size - Add concrete type + parser

**Available Parsers:**

- `Parsers.Length.parseLengthNode(node): ParseResult<Type.Length>`
- `Parsers.Length.parseLengthPercentageNode(node): ParseResult<Type.LengthPercentage>`
- Returns concrete type, does NOT handle CssValue internally
- Need explicit fallback to `parseNodeToCssValue`

---

## Priority 3: Numeric Properties 🔢

### animation-iteration-count

- [ ] Decide: Add `{ kind: "number"; value: number }` or keep as CssValue?
- [ ] Parser available: `Parsers.Length.parseNumberNode(node): ParseResult<number>` ✅
- [ ] Test: `animation-iteration-count: 3`

### opacity

- [ ] Decide: Use plain `number` (0-1 range, no validation per ADR-001)
- [ ] No AlphaValue type exists - use `Type.CSSNumber` (plain number)
- [ ] Parser available: `Parsers.Length.parseNumberNode(node)` ✅
- [ ] Test: `opacity: 0.5`

### font-weight

- [ ] Decide: Add `{ kind: "number"; value: number }` for 100-900?
- [ ] Parser available: `Parsers.Length.parseNumberNode(node)` ✅
- [ ] Or keep as keyword + CssValue?
- [ ] Test: `font-weight: 400`

### line-height

- [ ] Decide: Support both unitless number AND length-percentage?
- [ ] `{ kind: "number"; value: number }` for `line-height: 1.5`
- [ ] `{ kind: "length-percentage"; value: LengthPercentage }` for `line-height: 20px`
- [ ] Both parsers available ✅

---

## Priority 4: Position Properties 📍

### background-position-x

- [ ] Investigate: What's the concrete type? `Position`? `LengthPercentage`?
- [ ] Check CSS spec for background-position-x syntax
- [ ] Check what `Parsers.Position.*` exports

### background-position-y

- [ ] Same as background-position-x

---

## Priority 5: Special Cases 🎨

### filter ✅ VERIFIED CORRECT

- [x] Has `filter-list` concrete type discriminator
- [x] Parser tries `Parsers.Filter.parseFilterList()` before CssValue fallback
- [x] No action needed - follows correct pattern

### backdrop-filter ✅ VERIFIED CORRECT

- [x] Has `filter-list` concrete type discriminator
- [x] Parser tries `Parsers.Filter.parseFilterList()` before CssValue fallback
- [x] No action needed - follows correct pattern

### border-radius (4 properties) ✅ VERIFIED CORRECT

- [x] Shape discrimination at IR level (`circular` vs `elliptical`)
- [x] CssValue as leaf is architecturally correct here
- [x] Discriminator provides semantic info, CssValue provides flexibility
- [x] No action needed - follows valid pattern

---

## Architectural Decisions Needed 🏗️

Before proceeding, we need clarity on:

1. **Number type strategy:**
   - Should properties like `opacity: 0.5` produce `{ kind: "number", value: 0.5 }`?
   - Or is CssValue (with literal) acceptable?

2. **line-height special case:**
   - Unitless `1.5` vs sized `20px` - one type or two?

3. **Border radius approach:**
   - Are circular/elliptical already correct by using CssValue?
   - Or should they use LengthPercentage instead?

4. **Position properties:**
   - What concrete type should background-position-x/y use?
   - Check CSS spec and available parsers

5. **General principle:**
   - When is CssValue as leaf acceptable?
   - When must we have concrete discriminated types?

---

## Implementation Template 📝

**For each property requiring fix:**

1. **Update types.ts:**

   ```typescript
   export type PropertyIR =
     | { kind: "keyword"; value: ... }
     | { kind: "concrete-type"; value: Type.ConcreteType }  // NEW
     | { kind: "value"; value: CssValue };
   ```

2. **Update parser.ts:**

   ```typescript
   // Try concrete type first
   const concreteResult = Parsers.ConcreteType.parse(firstNode);
   if (concreteResult.ok) {
     return {
       ok: true,
       property: "property-name",
       value: { kind: "concrete-type", value: concreteResult.value },
       issues: concreteResult.issues,
     };
   }

   // Fallback to CssValue
   const cssValueResult = Parsers.Utils.parseNodeToCssValue(firstNode);
   if (cssValueResult.ok) {
     return {
       ok: true,
       property: "property-name",
       value: { kind: "value", value: cssValueResult.value },
       issues: cssValueResult.issues,
     };
   }

   return cssValueResult as ParseResult<PropertyIR>;
   ```

3. **Add tests:**
   - Concrete value: `property: 1s` → `{ kind: "time", ... }`
   - CssValue fallback: `property: var(--x)` → `{ kind: "value", ... }`
   - Round-trip generation

4. **Update generator if needed:**
   - Handle new concrete type discriminator
   - Ensure it generates correct CSS

---

## Completion Metrics 📊

- **Total Properties Analyzed:** 32
- **Verified Correct:** 6 (filter, backdrop-filter, border-radius ×4) ✅
- **Need Type + Parser Fix:** 25
  - Time: 3 (animation-duration, transition-delay, transition-duration)
  - Length/Percentage: 16
  - Position: 2
  - Numeric: 4 (pending decisions)
- **Need Parser Only:** 1 (animation-delay - type exists)

**Estimate:** 2-3 sessions to complete all fixes

**All Required Infrastructure Exists:**

- ✅ All parsers available
- ✅ All types defined
- ✅ All keywords/units present
- ✅ No new packages needed
