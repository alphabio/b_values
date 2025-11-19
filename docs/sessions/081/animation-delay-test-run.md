# Animation-Delay Test Run - Learnings

**Date:** 2025-11-19
**Status:** INCOMPLETE - Reverted, needs intelligence gathering first

---

## What We Did

Attempted to implement concrete Time type for animation-delay:
1. ✅ Added `{ kind: "time"; value: Type.Time }` to types
2. ✅ Updated parser to call `Parsers.Time.parseTimeNode()` first
3. ✅ Updated generator to handle time discriminator
4. ❌ Created tests without understanding CssValue structure

---

## Failures Encountered

### 1. CssValue Discriminator Unknown
**Test:** Expected `{ kind: "var" }`, got `{ kind: "variable" }`
**Issue:** Didn't check actual CssValue schema discriminators before writing tests
**Need:** Audit `packages/b_types/src/values/index.ts` for correct discriminators

### 2. Error Cases Misunderstood
**Test:** Expected "invalid" to be rejected
**Reality:** Per ADR-001, we represent not validate - "invalid" becomes literal
**Need:** Understand representation vs validation boundary

### 3. Other Unit Failures
**Tests:** "1px", "1" (unitless non-zero) still failing
**Need:** Check what these actually produce vs expectations

---

## Critical Intelligence Needed BEFORE Next Attempt

### 1. CssValue Schema Structure ⚠️ REQUIRED
**Location:** `packages/b_types/src/values/index.ts`
**Questions:**
- What are the actual discriminator values? (`"var"` vs `"variable"`?)
- What does `"literal"` look like?
- What does `"calc"` produce?
- How are custom identifiers represented?

### 2. Example Property Pattern 🔍 REQUIRED
**Find a working property that:**
- Uses concrete type discriminator (like `background-color`)
- Has tests showing CssValue fallback
- Shows round-trip parse → generate

**Candidate:** `background-color` - uses Color which handles concrete + CssValue

### 3. Error Behavior Understanding 📋 REQUIRED
**Questions:**
- What does Time parser return for "1px" (wrong unit)?
- What does Time parser return for "1" (unitless)?
- Does parseNodeToCssValue accept these? What does it produce?
- Where do errors vs representations live?

### 4. Generator Patterns 🔧 REQUIRED
**Questions:**
- How does `cssValueToCss()` work?
- Does it handle all CssValue discriminators?
- Are there edge cases in generation?

---

## Correct Approach for Next Session

### Step 0: Intelligence Gathering (30 minutes)
1. **Read CssValue schema completely**
   ```bash
   cat packages/b_types/src/values/index.ts
   ```

2. **Find working example with tests**
   ```bash
   ls packages/b_declarations/src/properties/background-color/
   cat packages/b_declarations/src/properties/background-color/*.test.ts
   ```

3. **Test parsers manually**
   ```bash
   # Create small test script to see actual output
   # - Time parser with valid/invalid inputs
   # - parseNodeToCssValue with various inputs
   ```

4. **Document discriminators and patterns**
   - Create reference: "CssValue discriminators: variable, calc, literal, ..."
   - Create reference: "Time parser error cases produce: ..."

### Step 1: Implementation (15 minutes)
- Copy working pattern exactly
- Use documented discriminators
- Follow established conventions

### Step 2: Tests (15 minutes)
- Copy test structure from working example
- Use correct discriminators
- Test concrete + CssValue + errors

### Step 3: Verify (5 minutes)
- Run tests
- Run full suite
- Check for regressions

---

## Estimated Scope per Property

**With intelligence gathering complete:**
- **Time properties (4):** 15 min each = 1 hour
- **Length/Percentage (16):** 10 min each = 2.5 hours (can batch)
- **Others:** TBD after decisions

**First time (animation-delay):** 45-60 minutes including intelligence

**Pattern established:** 10-15 minutes per property

---

## Key Learnings

1. **Don't assume discriminator names** - Check the actual schema
2. **Don't guess error behavior** - Test it first
3. **Copy working examples** - Don't invent patterns
4. **Intel before implementation** - Saves token budget
5. **One working example** = template for all 26 properties

---

## Next Session TODO

1. ✅ Read CssValue schema (`packages/b_types/src/values/index.ts`)
2. ✅ Read working example (`background-color` tests)
3. ✅ Create test harness to verify Time parser behavior
4. ✅ Document findings in this file
5. → THEN implement animation-delay
6. → Use as template for remaining 25 properties

---

## Token Budget Note

**This session:** ~112k tokens used on trial-and-error
**More efficient:** 20k tokens for intel, 10k tokens per property
**Lesson:** Measure twice, cut once
