# Session 057: CSS-Wide Keywords + Background Properties Audit

**Date:** 2025-11-08  
**Status:** ✅ Refactor complete, ⚠️ Pattern consistency issue discovered

---

## ✅ Accomplished

### Part 1: CSS-Wide Keywords Architecture
- ✅ Moved to `parseDeclaration` orchestrator (DRY)
- ✅ Simplified 6 property parsers (~80 lines removed)
- ✅ Updated documentation (HOW-TO-ADD-PROPERTY.md corrected)
- ✅ All 2322 tests passing

### Part 2: Background Properties Audit
- ✅ Audited 4 properties (repeat, origin, clip, attachment)
- ✅ Key insight: Not all properties need `cssValueSchema` (keyword-only)
- ✅ Recommendation: Refactor for package separation consistency
- ✅ Plan created for delete & recreate approach (~2.5 hours)

---

## ⚠️ CRITICAL: Pattern Inconsistency Discovered

**Problem:** background-size and background-image have different patterns

**background-size:**
```
@b/types/src/bg-size.ts       → BgSize, BgSizeList (Zod schemas)
@b/declarations/.../types.ts  → Just re-exports (pointless indirection)
```

**background-image:**
```
@b/types/src/                 → NO types (missing!)
@b/declarations/.../types.ts  → Types defined inline (WRONG location)
```

**User requirement:** "Consistency is paramount if we going to scale to 50+ properties"

---

## 🎯 THE Pattern (To Be Finalized)

**MUST decide for Session 058:**

1. **Where do types live?**
   - In `@b/types` only? (no local types.ts)
   - What gets re-exported in declarations?

2. **Naming convention:**
   - Component: `ImageLayer` or `BgImageLayer`?
   - Property: `BackgroundImage` or `BgImageList`?

3. **types.ts file in declarations:**
   - Delete entirely? (import directly from @b/types)
   - Keep for re-exports? (if so, what purpose?)

**Questions for next session:**
- Should `@b/declarations/properties/*/types.ts` exist at all?
- If yes, what should it contain?
- How do we ensure ONE pattern for all 50+ properties?

---

## 📊 Current State

- ✅ All tests passing, production build verified
- ✅ CSS-wide keywords architecture complete
- ⚠️ Pattern consistency needs alignment before continuing

---

## 🎯 Next Session 058

**MUST DO FIRST:**
1. Align on THE pattern (types location, naming, structure)
2. Document THE pattern clearly
3. Update HOW-TO-ADD-PROPERTY.md with THE pattern
4. THEN refactor all 4 background properties in single pass

**DO NOT proceed with refactor until pattern is 100% clear**

---

## 📁 Key Documents

- `docs/sessions/057/css-wide-keywords-refactor.md` - Architecture analysis
- `docs/sessions/057/background-properties-audit-COMPLETE.md` - Full audit
- `docs/sessions/057/refactor-plan.md` - Delete & recreate plan
- `docs/architecture/patterns/HOW-TO-ADD-PROPERTY.md` - Needs update

---

## 💭 Open Questions for Discussion

1. Should declarations have a `types.ts` file at all?
2. If yes, should it just be a single line re-export or serve a purpose?
3. Naming: `BgSize` vs `BackgroundSize` - which for component vs property?
4. Should property-level types be in `@b/types` or `@b/declarations`?

**User wants to discuss further to nail THE pattern before scaling to 50+ properties**

---

**Status:** 🟡 **Blocked - Need Pattern Alignment**  
**Commits:** 2 (CSS-wide keywords refactor + audit)  
**Next:** Session 058 - Align on pattern, then execute refactor

**Token usage:** Running low - ready for fresh session with pattern discussion
