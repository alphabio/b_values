# Session 064: Universal CSS Functions Support

**Date:** 2025-11-10
**Focus:** Fix var()/calc() support via wrapper pattern
**Status:** 🟡 IN-PROGRESS

---

## ✅ Accomplished

- Created session 064
- Archived session 063 (Feedback Consolidation & Validation)
- **Investigated var() failure** in `background-image`
- **Validated architectural reasoning** with user
- **Received critical feedback** on wrapper implementation
- **Created revised master plan** incorporating feedback
- **✅ PHASE 0 COMPLETE:** Type guards implemented and tested
  - `isCssValue()` with CssValue kind whitelist ✅
  - `isUniversalFunction()` for AST nodes ✅
  - `isConcreteValue()` helper ✅
  - 19 tests passing ✅
  - Fixed broken test imports ✅
  - All quality checks passing ✅

---

## 📊 Current State

### Issue Discovered

```typescript
// FAILS:
parseDeclarationList(`
  background-image: var(--gradient), url("pattern.svg"), none;
`);
// Error: "Unsupported background-image value"
```

### Root Cause

`background-image` parser only checks for `url()` and gradients - rejects `var()`, `calc()`, etc.

### Initial Analysis (WRONG)

❌ Thought: Add `var()/calc()` handling at declaration layer (like CSS-wide keywords)  
❌ Would require: Changes to `createMultiValueParser` and `parseDeclaration`

### User's Insight (CORRECT)

✅ "Every property needs this - isn't this boilerplate?"  
✅ "Parser/generate are clean honest reps of CSS spec"  
✅ "Declaration layer understands wider CSS spec for all props"

### Revised Solution (APPROVED)

**Wrapper pattern at property level:**

- Parser wrapper: `parseValue(node, parseClipConcrete)`
- Generator wrapper: `withUniversalSupport(generateClipConcrete)`
- Schema wrapper: `substitutable(concreteSchema)`
- **Zero changes** to `parseDeclaration` or `createMultiValueParser`

---

## 🎯 Next Steps

### Phase 0: Type Guards ⭐ CRITICAL

1. Implement `isCssValue()` with CssValue kind whitelist
2. Implement `isUniversalFunction()` for AST nodes
3. Comprehensive tests (distinguishes CssValue from property IR)

### Phase 1-3: Wrappers

1. Parser wrapper (`parseValue`)
2. Generator wrapper (`withUniversalSupport` - curried)
3. Schema wrapper (`substitutable`)

### Phase 4: Proof of Concept

1. Refactor `background-clip` using wrapper pattern
2. Validate no changes needed elsewhere
3. Test user's failing case

### Phase 5+: Roll Out

1. Integration tests
2. Apply to all background-\* properties
3. Documentation + migration guide (v2.0.0)

---

## 💡 Key Decisions

### Architectural Pattern (Session 057 + 064)

**Universal concerns at declaration layer:**

- ✅ CSS-wide keywords (`inherit`, `initial`, etc.) - Session 057
- ✅ Universal CSS functions (`var()`, `calc()`, etc.) - Session 064

**Implementation:**

- CSS-wide keywords: Pre-check in `parseDeclaration` (entire value)
- Universal functions: Wrapper at property level (mixed with concrete values)

### Critical Feedback Incorporated

1. **Type guard MUST use whitelist** - Both CssValue and property IR have `kind`
2. **Apply Substitutable at leaf values only** - Not top-level containers
3. **Use currying for generators** - Cleaner call sites
4. **No parseDeclaration changes needed** - Wrapper pattern handles it

---

## 📁 Session Artifacts

1. `MASTER_PLAN.md` - Original 603-line plan (injection approach)
2. `FEEDBACK_RESPONSE.md` - Analysis of critical feedback (559 lines)
3. `REVISED_MASTER_PLAN.md` - Approved wrapper pattern approach (268 lines)

## 📦 Commits

1. **358e2f4** - `docs(session-064): universal CSS functions master plan`
   - Captured investigation, feedback analysis, revised plan
   - 4,623 insertions across session docs

2. **f635b1d** - `feat(b_declarations): implement Phase 0 type guards`
   - Type guards: `isCssValue()`, `isUniversalFunction()`, `isConcreteValue()`
   - 19 tests, all passing
   - Fixed broken test imports
   - 478 insertions

---

## 🔗 Related Sessions

- **Session 057:** CSS-wide keywords (established universal concern pattern)
- **Session 030:** Added var()/calc() to gradients (partial implementation)
- **Session 063:** Feedback consolidation (identified this gap)

---

## 📊 Progress

**Phase 0:** ✅ Complete (type guards)  
**Phase 1-3:** ⏳ Ready to implement (wrappers)  
**Phase 4:** ⏳ Pending (proof of concept)  
**Phase 5+:** ⏳ Pending (rollout)

**Total session time:** ~2 hours  
**Lines of planning:** 1,627 lines  
**Code implemented:** 292 lines (type guards + tests)  
**Tests added:** 19 (all passing)

---

**Ready for Phase 1 (parser wrapper) when user confirms.**
