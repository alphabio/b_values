# Session 016 TODO: Test Coverage & Co-location

## Outstanding Items

### 1. Add Test Coverage for Gradient Generators

**Files needing tests:**

- `packages/b_generators/src/gradient/radial.ts` - No tests yet
- `packages/b_generators/src/gradient/conic.ts` - No tests yet
- `packages/b_generators/src/gradient/color-stop.ts` - No tests yet

**Current:**

- ✅ `linear.test.ts` - 6 tests (simple, angle, to-side, to-corner, repeating, positions)

**Needed:**

- ⚠️ `radial.test.ts` - Test shape, size (keyword/explicit), position, interpolation
- ⚠️ `conic.test.ts` - Test from-angle, position, interpolation
- ⚠️ `color-stop.test.ts` - Test color only, single position, double position, angle position

### 2. Co-locate Test Files

**AST Utilities need tests:**

- `packages/b_parsers/src/utils/ast/split-by-comma.ts` - No test file
- `packages/b_parsers/src/utils/ast/functions.ts` - No test file

**Action Required:**

- Create `split-by-comma.test.ts` next to implementation
- Create `functions.test.ts` next to implementation
- Follow co-location pattern from existing codebase

### 3. Gradient Parser Tests (Future)

When implementing parsers:

- ⚠️ `packages/b_parsers/src/gradient/linear.ts` + `.test.ts`
- ⚠️ `packages/b_parsers/src/gradient/radial.ts` + `.test.ts`
- ⚠️ `packages/b_parsers/src/gradient/conic.ts` + `.test.ts`
- ⚠️ `packages/b_parsers/src/gradient/color-stop.ts` + `.test.ts`

**Remember:**

- Co-locate tests with implementation
- Round-trip tests: parse → generate → parse
- Use generator test cases as expectations

---

## Priority

1. **High**: Radial & conic generator tests (complete the generator phase)
2. **Medium**: Color-stop generator tests
3. **Medium**: AST utility tests
4. **Future**: Parser tests (when implementing parsers)

---

**Created:** 2025-11-05  
**Session:** 016
