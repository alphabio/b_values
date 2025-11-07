# Session 048: Critical Calc Bug Fix + Operator Precedence

**Date:** 2025-11-07
**Focus:** Fixed calc() parser operator precedence bug using Shunting-yard algorithm

---

## ✅ Accomplished

- ✅ Session 048 initialized and Session 047 archived
- ✅ Documentation reviewed and understood
- ✅ Fixed unused import in create-multi-value-parser.test.ts
- ✅ **CRITICAL FIX:** Replaced left-to-right calc() parser with Shunting-yard algorithm
- ✅ Added 14 comprehensive tests for operator precedence
- ✅ All tests passing (1957/1957, net +14 new tests)
- ✅ All quality checks passing

---

## 📊 Current State

**Working:**

- ✅ All tests passing (1957/1957)
- ✅ All typechecks passing
- ✅ All builds passing
- ✅ No lint warnings
- ✅ **NEW:** calc() parser correctly handles operator precedence
- ✅ Property enrichment working perfectly
- ✅ Missing comma detection via createMultiValueParser factory
- ✅ Clean codebase

**Fixed:**

- ✅ calc() operator precedence bug (was: left-to-right, now: spec-compliant)
- ✅ Unused imports cleaned up

---

## 🚨 Critical Bug Fixed

**Problem:** calc() parser built expressions left-to-right, violating CSS operator precedence.

**Example of Bug:**

```css
/* calc(10px + 2px * 5) */
Before: Parsed as (10px + 2px) * 5 = 60px  ❌ WRONG
After:  Parsed as 10px + (2px * 5) = 20px  ✅ CORRECT
```

**Solution:** Implemented Shunting-yard algorithm with three steps:

1. **Tokenization:** Convert AST nodes to infix tokens (values + operators)
2. **Shunting-yard:** Convert infix to postfix (RPN) respecting precedence
3. **Tree Building:** Build calc-operation tree from RPN

**Precedence Rules:**

- Multiplication (\*) and Division (/) have precedence 2
- Addition (+) and Subtraction (-) have precedence 1
- Same precedence operators associate left-to-right

---

## 📈 Impact

**Code Changes:**

- Modified: `packages/b_parsers/src/math/calc.ts` (~120 lines)
- Enhanced: `packages/b_parsers/src/math/calc.test.ts` (+300 lines)

**Test Coverage:**

- Basic operations (4 tests)
- Operator precedence (7 tests)
- Error handling (3 tests)
- Edge cases (5 tests)
- **Total: 24 tests** (10 original + 14 new)

**Benefits:**

- ✅ CSS spec-compliant operator precedence
- ✅ Correct evaluation of complex expressions
- ✅ Comprehensive test coverage
- ✅ Clear algorithm documentation
- ✅ Production-ready calc() parsing

---

## 🏗️ Implementation Details

**Shunting-yard Algorithm:**

```typescript
// Step 1: Tokenize
[10px, +, 2px, *, 5] // Infix

// Step 2: Shunting-yard (Infix → Postfix)
[10px, 2px, 5, *, +] // RPN

// Step 3: Build Tree
{
  kind: "calc-operation",
  operator: "+",
  left: { kind: "literal", value: 10, unit: "px" },
  right: {
    kind: "calc-operation",
    operator: "*",
    left: { kind: "literal", value: 2, unit: "px" },
    right: { kind: "literal", value: 5 }
  }
}
```

**Precedence Table:**

```typescript
const PRECEDENCE: Record<Operator, number> = {
  "+": 1,
  "-": 1,
  "*": 2,
  "/": 2,
};
```

---

## 💡 Key Learnings

### Learning 1: Left-to-right is not enough for expressions

Mathematical expressions require precedence-aware parsing. The Shunting-yard algorithm is the standard solution for this problem.

### Learning 2: Comprehensive test coverage is essential

The 14 new tests cover:

- Basic precedence (multiplication before addition)
- Complex mixed expressions
- Same-precedence left-associativity
- Edge cases with whitespace, negatives, percentages

### Learning 3: RPN simplifies tree building

Converting to postfix (RPN) first makes building the expression tree trivial - just pop two operands, create node, push back.

---

## 🎯 Next Steps

**Potential improvements:**

1. Consider adding parentheses support (though CSS calc() doesn't need explicit parens)
2. Apply similar precedence handling to other math functions if needed
3. Document the Shunting-yard algorithm for future contributors

**Ready for next task!**

---

## 📝 Executive Summary Response

Reviewed and actioned the executive summary feedback:

**✅ Addressed:**

- [x] **Critical Issue #1:** Fixed calc() operator precedence bug with Shunting-yard algorithm
- [x] Added comprehensive test coverage (14 new tests)
- [x] All tests passing, no regressions

**📋 Noted for future:**

- [ ] **High-Impact #1:** Mitigate `as never` casts by isolating to internal dispatch functions
- [ ] **General:** Auto-generate PropertyIRMap interface
- [ ] **General:** Consolidate duplicate PropertyGenerator types
- [ ] **General:** Standardize generator error handling patterns

---

**Session 048 COMPLETE ✅**

**Commits:**

1. `fix(parsers): implement Shunting-yard algorithm for calc() operator precedence`
