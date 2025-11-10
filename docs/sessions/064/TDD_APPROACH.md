# TDD Approach - Session 064 Implementation

**Date:** 2025-11-10  
**Status:** 🔴 RED PHASE COMPLETE

---

## 🎯 TDD Process

### Phase 1: RED ✅ (Complete)

**Created test files capturing expected behavior:**

- `packages/b_parsers/src/background/clip.test.ts` - 12 tests
- `packages/b_parsers/src/background/attachment.test.ts` - 5 tests
- `packages/b_parsers/src/background/origin.test.ts` - 5 tests

**Test Results:**

```
Test Files  3 failed (3)
      Tests  18 failed | 4 passed (22)
```

**Existing declaration tests also failing:**

```
packages/b_declarations/src/properties/background-clip/parser.test.ts
  - 5 tests expecting { kind: "keyword", value } ❌

packages/b_declarations/src/__tests__/var-support.integration.test.ts
  - 3 tests expecting keyword objects ❌
```

**Total:** 26 tests expecting correct behavior (all currently RED)

---

### Phase 2: GREEN 🟢 (Next)

**Implementation:**

1. Update 3 parser files (1 line each)
2. Update type schemas (validate)
3. Run tests → expect 2414 passing (26 newly fixed)

---

## 📊 Test Coverage

### Parser-Level Tests (New)

**clip.test.ts** - Comprehensive coverage:

- ✅ Valid keywords (border-box, padding-box, content-box, text)
- ✅ Case insensitivity
- ✅ Invalid values
- ✅ Architecture alignment (discriminated union)
- ✅ Consumer API (switch on .kind)
- ✅ Parse authorship principle

**attachment.test.ts** - Core coverage:

- ✅ Valid keywords (scroll, fixed, local)
- ✅ Invalid values
- ✅ Architecture alignment

**origin.test.ts** - Core coverage:

- ✅ Valid keywords (border-box, padding-box, content-box)
- ✅ Invalid values
- ✅ Architecture alignment

### Declaration-Level Tests (Existing)

**background-clip/parser.test.ts:**

- ✅ Single value parsing
- ✅ Multiple values
- ✅ Round-trip (parse → generate)

**var-support.integration.test.ts:**

- ✅ Regular keywords alongside var()
- ✅ Mixed usage patterns

---

## 🎓 Test Philosophy

### What We're Testing

**Principle: "Parse Authorship, Not Evaluation"**

User writes:

```css
background-clip: border-box;
```

Parser returns:

```ts
{
  kind: "keyword",
  value: "border-box"
}
```

**NOT:**

```ts
"border-box"; // ❌ Bare string - inconsistent
```

### Why It Matters

**Uniform Consumer API:**

```ts
switch (value.kind) {
  case "keyword":
    return value.value;
  case "variable":
    return resolveVar(value.name);
  case "calc":
    return evaluateCalc(value);
}
```

**Consistency with bg-size:**

```ts
// bg-size already does this
{ kind: "keyword", value: "cover" }
{ kind: "explicit", width: {...}, height: {...} }
```

---

## 🚦 Current Test Status

### RED (Expected to Pass After Implementation)

**Parser tests:** 18 failing

- clip.test.ts: 10/12 failing
- attachment.test.ts: 4/5 failing
- origin.test.ts: 4/5 failing

**Declaration tests:** 8 failing

- background-clip/parser.test.ts: 5 failing
- var-support.integration.test.ts: 3 failing

**Total:** 26 tests RED ✅

### GREEN (Already Passing)

**Parser tests:** 4 passing

- Invalid value handling (parsers already do this correctly)

**Existing tests:** 2388 passing

- All other properties
- All gradient tests
- All color tests
- All utility tests

---

## 📋 Implementation Checklist

When implementing (GREEN phase):

- [ ] Update `packages/b_parsers/src/background/clip.ts:28`
- [ ] Update `packages/b_parsers/src/background/attachment.ts:26`
- [ ] Update `packages/b_parsers/src/background/origin.ts:26`
- [ ] Run parser tests: `pnpm test clip.test attachment.test origin.test`
- [ ] Run declaration tests: `pnpm test background-clip/parser.test`
- [ ] Run integration tests: `pnpm test var-support.integration.test`
- [ ] Run full suite: `just test` (expect 2414 passing)
- [ ] Run typecheck: `just typecheck` (expect all green)

---

## 🎯 Success Criteria

**After implementation:**

- ✅ Parser tests: 22/22 passing
- ✅ Declaration tests: 13/13 passing (5 newly fixed)
- ✅ Integration tests: 12/12 passing (3 newly fixed)
- ✅ Total: 2414/2414 passing (26 newly fixed)
- ✅ Typecheck: All green
- ✅ No regressions

---

## 🔬 Test-Driven Benefits

1. **Clear specification** - Tests document expected behavior
2. **Confidence** - 26 tests validate the change
3. **No surprises** - We know exactly what will pass/fail
4. **Regression prevention** - Tests stay as documentation
5. **Refactor safety** - Can refactor with confidence

---

## 📝 Running Tests

**Individual parser tests:**

```bash
pnpm test clip.test.ts
pnpm test attachment.test.ts
pnpm test origin.test.ts
```

**Declaration tests:**

```bash
pnpm test background-clip/parser.test.ts
pnpm test var-support.integration.test.ts
```

**Full suite:**

```bash
just test
```

---

## 🎓 Key Insight

**The existing declaration tests were RIGHT all along.**

They expected:

```ts
{ kind: "keyword", value: "border-box" }
```

Parsers were returning:

```ts
"border-box";
```

**Tests weren't wrong - parsers were inconsistent with the architecture.**

---

**Next:** Implement changes → GREEN phase
