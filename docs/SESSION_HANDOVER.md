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

### ✅ Phase 0: Type Guards (COMPLETE)
- [x] `isCssValue()` with CssValue kind whitelist
- [x] `isUniversalFunction()` for AST nodes  
- [x] `isConcreteValue()` helper
- [x] 19 tests passing

### ✅ Phase 1: Declaration Layer Injection (COMPLETE)
- [x] Inject in `createMultiValueParser` (line 140-150)
- [x] Tests passing: background-clip, background-repeat, background-size

### ⏳ Phase 2: Schema Updates (~5 min)
1. Fix `background-image/types.ts` - Add `z.union([imageSchema, cssValueSchema])`
2. Check `background-attachment/types.ts` schema
3. Check `background-origin/types.ts` schema

### ⏳ Phase 3: Integration Tests (~5 min)
1. Fix test expectations for background-image with var()
2. Verify all background-* properties work
3. Test mixed concrete + universal values

### ⏳ Phase 4: Single-Value Properties (if needed)
1. Check if single-value properties need injection
2. Add to `parseDeclaration` if needed

---

## 💡 Key Decisions

### Architectural Pattern (Session 057 + 064)

**Universal concerns at declaration layer:**

- ✅ CSS-wide keywords (`inherit`, `initial`, etc.) - Session 057
- ✅ Universal CSS functions (`var()`, `calc()`, etc.) - Session 064

**Architecture Decision (2025-11-10):**
- **Parsers/Generators:** Pure domain logic (no var/calc knowledge)
- **Declaration layer:** Handles substitution (intercepts universal functions)
- **Type system:** Allows union of concrete OR CssValue
- **Pattern documented:** `docs/architecture/patterns/universal-css-values.md`

**Implementation:**

- CSS-wide keywords: Pre-check in `parseDeclaration` (entire value)
- Universal functions: Injection at `createMultiValueParser` (mixed with concrete)
- **Philosophy:** Pure parsers/generators. Declaration layer handles substitution.

### Critical Decisions (Architectural)

### Critical Decisions (Architectural)

1. **Type guard MUST use whitelist** - Both CssValue and property IR have `kind`
2. **Injection at declaration layer** - NOT wrapper pattern (avoids boilerplate)
3. **Schema unions at leaf values** - Union concrete type with cssValueSchema
4. **Parsers stay pure** - Zero per-property changes for universal functions

---

## 📁 Session Artifacts

1. `MASTER_PLAN.md` - Original 603-line plan (injection approach)
2. `FEEDBACK_RESPONSE.md` - Analysis of critical feedback (559 lines)
3. `REVISED_MASTER_PLAN.md` - Wrapper pattern approach (268 lines) ⚠️ SUPERSEDED
4. `CORRECTED_PLAN.md` - Back to injection approach (322 lines)
5. `RESEARCH_FINDINGS.md` - Schema pattern discovery
6. `ARCHITECTURE_COMPARISON.md` - Injection vs wrapper analysis
7. `PHILOSOPHY_ALIGNMENT.md` - Final architecture validation

**Architecture Decision:** Injection pattern (parsers pure, declaration handles substitution)
**Documented:** `docs/architecture/patterns/universal-css-values.md`

## 📦 Commits

1. **358e2f4** - `docs(session-064): universal CSS functions master plan`
   - Captured investigation, feedback analysis, planning
   - 4,623 insertions across session docs

2. **f635b1d** - `feat(b_declarations): implement Phase 0 type guards`
   - Type guards: `isCssValue()`, `isUniversalFunction()`, `isConcreteValue()`
   - 19 tests, all passing
   - Fixed broken test imports
   - 478 insertions

3. **73e9ad0** - `docs(architecture): document universal CSS values pattern`
   - Philosophy documented: Pure parsers, declaration handles substitution
   - Pattern in `docs/architecture/patterns/universal-css-values.md`
   - Analysis docs: research, alignment, comparison
   - 1,844 insertions

4. **[pending]** - `feat(b_declarations): complete Phase 2 schema updates`
   - Fix background-image schema (union with cssValueSchema)
   - Check background-attachment/origin schemas
   - Fix integration test expectations

---

## 🔗 Related Sessions

- **Session 057:** CSS-wide keywords (established universal concern pattern)
- **Session 030:** Added var()/calc() to gradients (partial implementation)
- **Session 063:** Feedback consolidation (identified this gap)

---

## 📊 Progress

**Phase 0:** ✅ Complete (type guards)
**Phase 1:** ✅ Complete (declaration layer injection) 
**Phase 2:** ⏳ Pending (schema updates - 3 properties)
**Phase 3:** ⏳ Pending (fix integration tests)
**Phase 4:** ⏳ Pending (single-value properties check)

**Total session time:** ~4 hours
**Lines of planning:** 1,627+ lines
**Code implemented:** 292 lines (type guards + injection + tests)
**Tests added:** 19 (all passing)
**Architecture documented:** ✅ `docs/architecture/patterns/universal-css-values.md`

---

**Remaining work:** ~10 minutes (schema fixes + test expectations)
