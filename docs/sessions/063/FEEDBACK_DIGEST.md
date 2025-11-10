# Feedback Digest & Action Plan - Session 063

**Date:** 2025-11-10
**Status:** 🟡 ANALYZING

---

## Overview

**Total Feedback:** 4 documents, ~1,900 lines, 57KB
**Sources:** Multiple comprehensive code reviews
**Common Verdict:** ✅ "Solid foundation, architecturally strong enough to scale to 50+ properties"

---

## Phase 1: Consolidation & Deduplication

### High-Priority Issues (Consolidated)

#### 🔴 CRITICAL - Fix Before Scaling

1. **`createMultiValueParser` drops warnings on success**
   - **Status:** 🔴 NEEDS FIX
   - **Source:** FEEDBACK_01, FEEDBACK_04 (patch provided)
   - **Issue:** Success path returns `issues: []` instead of `allIssues`
   - **Impact:** Loses non-fatal warnings from nested parsers
   - **Validation needed:** Check current implementation
   - **Patch:** Available in FEEDBACK_04

2. **`PropertyIRMap` manually maintained**
   - **Status:** 🔴 NEEDS AUTOMATION
   - **Source:** All feedbacks
   - **Issue:** Marked "auto-generated" but isn't
   - **Impact:** At 50+ properties, will fall out of sync
   - **Priority:** HIGHEST (all agree)
   - **Solution:** Code generator script needed

3. **Duplicate types in `@b/declarations/src/types.ts`**
   - **Status:** 🔴 NEEDS VALIDATION
   - **Source:** FEEDBACK_04 (complete replacement provided)
   - **Issue:** `CSSDeclaration`, `DeclarationResult` defined twice
   - **Impact:** Confusion, potential for misuse
   - **Action:** Compare current file with clean version

4. **CSS-wide keywords hijack custom properties**
   - **Status:** 🔴 NEEDS FIX
   - **Source:** FEEDBACK_04 (patch provided)
   - **Issue:** `--foo: initial` treated as keyword instead of raw value
   - **Impact:** Incorrect parsing per spec
   - **Patch:** Add `!isCustomProperty()` guard

5. **OKLCH lightness validation bug**
   - **Status:** 🟠 NEEDS VALIDATION
   - **Source:** FEEDBACK_04 (complete fix provided)
   - **Issue:** Uses `checkAlpha` for lightness, wrong ranges (0-1% vs 0-100%)
   - **Test failure:** Documented
   - **Fix:** New `checkOKLCHLightness` helper provided

#### 🟠 HIGH - Address Soon

6. **`rawValue` flag unused in `parseDeclaration`**
   - **Status:** 🟠 NEEDS FIX
   - **Source:** FEEDBACK_01, FEEDBACK_04 (patch provided)
   - **Issue:** Routes via `isCustomProperty()` only, `rawValue` ignored
   - **Impact:** Future raw-value properties won't work
   - **Patch:** Available

7. **`parseErr` misuse with "InvalidSyntax" property**
   - **Status:** 🟠 NEEDS VALIDATION
   - **Source:** FEEDBACK_01
   - **Issue:** Property field becomes "InvalidSyntax" instead of actual property name
   - **Impact:** Downstream expects property name
   - **Action:** Locate usage, verify issue exists

8. **Warning deduplication inconsistent**
   - **Status:** 🟠 NEEDS INVESTIGATION
   - **Source:** FEEDBACK_01
   - **Issue:** Some helpers dedupe, others don't
   - **Impact:** Noisy duplicate warnings
   - **Solution:** `dedupeIssues` utility

9. **`parseBackgroundImage` inconsistent with pattern**
   - **Status:** 🟠 NEEDS REFACTOR
   - **Source:** FEEDBACK_02
   - **Issue:** Custom parser for `none` instead of using `preParse`
   - **Impact:** Inconsistency multiplies with scale
   - **Refactor:** Use `createMultiValueParser` with `preParse`

#### 🟡 MEDIUM - Consistency & Polish

10. **Naming inconsistency: `backgroundSizeIRS` vs `*IRSchema`**
    - **Status:** 🟡 POLISH
    - **Source:** FEEDBACK_01
    - **Impact:** Minor, but multiplies with 50+ properties
    - **Fix:** Rename to `backgroundSizeIRSchema`

11. **Property definition file inconsistencies**
    - **Status:** 🟡 NEEDS VALIDATION
    - **Source:** FEEDBACK_02
    - **Example:** `background-size/definition.ts` doesn't export constant
    - **Impact:** Pattern drift
    - **Action:** Survey all definition files

12. **Generator return shape inconsistency**
    - **Status:** 🟡 NEEDS DOCUMENTATION
    - **Source:** FEEDBACK_04
    - **Issue:** Some set `property` internally, some don't
    - **Impact:** Redundancy but not breaking
    - **Solution:** Document contract clearly

---

## Phase 2: Validation Against Codebase

### Validation Checklist

- [ ] Read current `packages/b_declarations/src/types.ts`
- [ ] Check `createMultiValueParser` implementation
- [ ] Verify `parseDeclaration` CSS-wide keyword handling
- [ ] Check `rawValue` usage in `parseDeclaration`
- [ ] Locate `parseErr("InvalidSyntax", ...)` calls
- [ ] Review `@b_generators/src/color/oklch.ts`
- [ ] Survey property definition files for consistency
- [ ] Check `background-image/parser.ts` structure
- [ ] Review `types.map.ts` generation status

---

## Phase 3: Automation Opportunities

### Priority Matrix

| Automation | Priority | Effort | ROI | Source |
|------------|----------|--------|-----|--------|
| PropertyIRMap codegen | 🔥 CRITICAL | 2-4h | ⭐⭐⭐⭐⭐ | All |
| Property scaffolding CLI | 🔥 CRITICAL | 4-6h | ⭐⭐⭐⭐⭐ | F02, F03, F04 |
| Export index generator | 🟢 HIGH | 1-2h | ⭐⭐⭐ | F03 |
| Test generator | 🟢 HIGH | 6-8h | ⭐⭐⭐⭐ | F03, F04 |
| Alignment validator | 🟡 MEDIUM | 3-4h | ⭐⭐⭐ | F04 |

### Implementation Status

**PropertyIRMap Codegen:**
- Approach detailed in F03, F04
- Uses `ts-morph` or `babel` to parse `defineProperty`
- Scans `properties/**/definition.ts`
- Extracts property name + IR type
- Generates type map

**Property Scaffolding CLI:**
- F04 provides FULL IMPLEMENTATION (250+ lines)
- Command: `pnpm b:new-prop <name> [flags]`
- Modes: single, multi, raw, keyword-list
- **`--from` flag:** Clone existing property ("EXCELLENT IDEA")
- Auto-generates: types, parser, generator, definition, index
- Auto-updates: properties/index.ts, types.map.ts
- Rails-like DX

**Test Framework (TDD):**
- F04 provides comprehensive strategy
- 3 standard tests per property: parse, generate, roundtrip
- Template provided
- Generator creates test files
- `--from` clones tests too

---

## Phase 4: Design Improvements

### Organizational Recommendations

**Property Grouping (at 50+ properties):**
```
properties/
  ├── background/
  ├── border/
  ├── box-model/
  └── typography/
```
- Benefits: easier navigation, logical grouping, feature ownership
- Source: FEEDBACK_03

**Reusable Component Library:**
- Extract shared value types: `boxValueSchema`, `lengthPercentageSchema`
- Reduce duplication across properties
- Source: FEEDBACK_03

**Property Definition Meta-Schema:**
- Zod validation for definition structure
- Runtime checks for consistency
- Source: FEEDBACK_03

---

## Phase 5: Priority Order

### Week 1: Critical Fixes
1. ✅ Fix `createMultiValueParser` issue propagation
2. ✅ Fix CSS-wide keyword handling for custom properties
3. ✅ Fix `rawValue` flag usage
4. ✅ Clean up `types.ts` duplicates
5. ✅ Fix OKLCH validation

### Week 2: Automation Foundation
1. ✅ Implement PropertyIRMap codegen
2. ✅ Implement property scaffolding CLI
3. ✅ Add `--from` flag
4. ✅ Create test templates

### Week 3-4: Validation & Polish
1. ⚠️ Refactor `parseBackgroundImage`
2. ⚠️ Standardize definition files
3. ⚠️ Add export index generator
4. ⚠️ Implement test generator
5. ⚠️ Document contracts

### Month 2+: Scale
1. ⚠️ Add 5 properties using new tools (validate)
2. ⚠️ Generate remaining properties (in batches)
3. ⚠️ Consider property grouping

---

## Next Actions

1. **Validate Current State**
   - Read files mentioned in feedback
   - Check which issues already resolved
   - Assess resolution quality

2. **Prioritize Fixes**
   - Critical: before any new properties
   - High: before scaling
   - Medium: during scaling

3. **Implement Automation**
   - Start with PropertyIRMap (highest impact)
   - Then scaffolding CLI (highest DX improvement)
   - Test framework alongside

4. **Document Patterns**
   - Clear contracts for parsers/generators
   - Property creation protocol
   - Testing strategy

---

## Questions to Resolve

- [ ] Are any critical issues already fixed?
- [ ] Which automation should we prioritize first?
- [ ] Should we group properties now or later?
- [ ] TDD: full adoption or gradual?
- [ ] Command naming: which variant to use?

---

**Status:** Ready for Phase 2 (Validation)
