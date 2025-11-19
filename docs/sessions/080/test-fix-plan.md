# Test Fix Plan - Session 080

**Date:** 2025-11-19T13:54:00Z
**Context:** Session 079 changed parsers to accept CssValue, breaking 17 tests

---

## 🎯 Core Philosophy (from ADR-001)

**We are a representation engine, not a validation engine.**

### What We DO Validate ✅

- **Structure** - IR must have correct shape
- **Types** - Values must be correct TypeScript types
- **Discriminated unions** - `kind` field must be valid

### What We DON'T Validate ❌

- **Value ranges** - No min/max enforcement
- **Unit correctness** - Accept any unit
- **CSS validity** - Browser's job

---

## 🔴 Current Test Failures (17)

### perspective parser (8 failures)

- `parses pixel length` - Expects specific structure, gets CssValue
- `parses em length` - Same
- `parses rem length` - Same
- `parses viewport units` - Same
- `warns on negative length` - Expects warning, none generated
- `rejects invalid keyword` - Expects rejection, now accepts as CssValue
- `rejects percentage` - Expects rejection, now accepts as CssValue
- `rejects unitless non-zero` - Expects rejection, now accepts as CssValue

### font-weight parser (9 failures)

- `parses valid weight 400` - Expects `kind: "number"`, gets CssValue
- `parses valid weight 700` - Same
- `parses minimum weight 1` - Same
- `parses maximum weight 1000` - Same
- `parses decimal weight 350.5` - Same
- `warns on weight below 1` - Expects warning, none generated
- `warns on weight above 1000` - Same
- `warns on negative weight` - Same
- `rejects invalid keyword` - Expects rejection, now accepts

---

## ✅ Correct Behavior

**Current parsers ARE correct.**

They accept ANY CssValue (literals, variables, calc, etc.) and wrap in:

```typescript
{ kind: "value", value: CssValue }
```

**Examples:**

```typescript
// ALL VALID
perspective: 100px;           // literal
perspective: var(--p);        // variable
perspective: calc(100vh - 50px); // calc
perspective: 100;             // unitless (browser decides validity)
perspective: 50%;             // percentage (browser decides validity)

font-weight: 400;             // literal
font-weight: var(--weight);   // variable
font-weight: calc(700 / 2);   // calc
font-weight: -100;            // negative (browser decides validity)
font-weight: 2000;            // out of range (browser decides)
```

---

## 🔧 Fix Strategy

### Option 1: Update Tests to Match Reality ✅ RECOMMENDED

Change tests to expect CssValue representation:

```typescript
// OLD (wrong)
it("parses pixel length", () => {
  const result = parsePerspective(ast);
  expect(result.value.kind).toBe("length");
  expect(result.value.value).toEqual({ value: 500, unit: "px" });
});

// NEW (correct)
it("parses pixel length", () => {
  const result = parsePerspective(ast);
  expect(result.value.kind).toBe("value");
  expect(result.value.value).toEqual({
    kind: "literal",
    value: 500,
    unit: "px",
  });
});
```

Remove validation tests entirely:

```typescript
// DELETE these - we don't validate
it("warns on negative length", ...);
it("rejects percentage", ...);
it("rejects unitless non-zero", ...);
it("warns on weight below 1", ...);
```

### Option 2: Keep Old Validation (Wrong) ❌

This violates ADR-001 and our core philosophy.

---

## 📋 Implementation Steps

1. **Update perspective tests** (8 tests)
   - Change 5 parsing tests to expect CssValue structure
   - Delete 3 validation tests (negative, percentage, unitless)

2. **Update font-weight tests** (9 tests)
   - Change 5 parsing tests to expect CssValue structure
   - Delete 4 validation tests (range warnings)

3. **Verify philosophy** - Ensure no other properties have validation tests

---

## 🎯 Expected Outcome

- All tests pass ✅
- No value validation in parsers ✅
- Accept any structurally valid CssValue ✅
- Browser handles validity ✅

---

## 📝 Notes

**User concern:** "We lost functionality relating to issues"

**Response:** The old validation was INCORRECT per ADR-001. Issues should be:

- **Structural errors** (missing required fields, wrong types)
- **Parsing failures** (malformed CSS syntax)
- NOT value range validation

**Exception:** If we want warnings, they should be opt-in semantic linting (future feature), not parsing errors.
