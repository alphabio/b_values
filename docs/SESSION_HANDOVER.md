# Session 064: Universal CSS Functions Support

**Date:** 2025-11-10  
**Focus:** Fix var()/calc() support via declaration layer interception  
**Status:** 🟡 CRITICAL INSIGHT - Test Expectations vs Architecture

---

## 🔑 CRITICAL DISCOVERY (Just Now)

### The calc() Architecture Question

**User:** "calc is a type right? Did we lose that?"  
**Answer:** NO! calc IS a CssValue type with discriminated union

```typescript
{
  kind: "calc",
  value: CssValue  // The expression inside
}
```

### The Real Issue

**background-size: calc(100% - 20px)**

**What we return (CORRECT):**
```typescript
{
  kind: "calc",
  value: { kind: "calc-operation", left: ..., right: ... }
}
```

**What old tests expect (QUESTIONABLE):**
```typescript
{
  kind: "explicit",
  width: { kind: "calc", ... },
  height: { kind: "keyword", value: "auto" }
}
```

### The Architecture Question

**Is calc() a valid background-size value?**  
YES per CSS spec - it resolves to a length.

**Should we wrap it in property structure?**  
- Option A (current): NO - calc IS the value, clean and atomic
- Option B (old tests): YES - expand shorthand to explicit structure

### For Consumer (CSS Animation Editor)

**User perspective:** "I want to manipulate CSS in a uniform way"

**Key requirement:** ALWAYS discriminated unions (`.kind` always exists)

**Critical issues found:**
1. ✅ calc is discriminated union - CORRECT
2. ❌ background-clip returns strings - BREAKS uniformity
3. ❌ Tests expect wrapped calc in background-size - WRONG?

---

## 🎯 Decision Needed

### Issue 1: Simple Keywords (background-clip)

**Current:** Returns `"border-box"` (string)  
**Should be:** `{ kind: "keyword", value: "border-box" }` (object)

**Why:** Uniform API. Every value has `.kind`. No typeof checks.

**Status:** AGREED - needs fixing

### Issue 2: calc() in background-size

**Current:** Returns `{ kind: "calc", ... }` directly  
**Tests expect:** Wrapped in `{ kind: "explicit", width: calc, height: auto }`

**The question:** Which is architecturally correct?

**Arguments for current (flat calc):**
- calc() IS a valid background-size value per CSS
- Clean, follows spec
- Calc is atomic (can't interpolate inside anyway)

**Arguments for wrapped:**
- Shows CSS shorthand expansion (calc = calc auto)
- More structure for tooling
- Consistent with explicit parsing

**Status:** User says "super important and very good catch" - AWAITING DECISION

---

## 🏗️ Current Architecture (Phase 3 Complete)

**Layer 1 (Concrete):**
- Pure property logic
- Returns discriminated unions
- Image: `{ kind: "url" | "gradient" | "none" }`

**Layer 2 (Declaration):**
- Universal function interception via `createMultiValueParser`
- `generateValue()` wrapper delegates to concrete
- Schema: `z.union([concreteType, cssValueSchema])`

**Pattern proven for 6 properties, ready to scale to 50+**

---

## ✅ What Works

- ✅ Complex nested var() with fallbacks
- ✅ Mixed properties (var + url + gradients)
- ✅ Calc/min/max/clamp parsed correctly
- ✅ All typecheck passes
- ✅ 10/10 integration tests passing
- ✅ Green field architecture - no hacks

---

## ❌ What Needs Decision

### 8 Test Failures (All Fixable Once Decided)

**3 failures:** background-clip expects objects, we return strings  
→ Fix: Wrap keywords in `{ kind: "keyword", value: "..." }`

**1 failure:** background-size calc() structure mismatch  
→ Decision needed: Flat calc or wrapped in explicit?

**4 failures:** background-clip parser unit tests (same keyword issue)

**All tests are fixable** - just need architectural decision.

---

## 🎓 Key Learnings

1. **calc IS a CssValue type** - discriminated union `{ kind: "calc", ... }`
2. **Uniformity matters** - Animation editors need `.kind` always present
3. **String values break uniformity** - Every value should be object with `.kind`
4. **Test expectations ≠ correct architecture** - Old tests may be wrong
5. **Consumer perspective is key** - "Manipulate CSS in uniform way"

---

## 🚀 Next Steps

**AWAITING USER DECISION:**

1. **Simple keywords:** Wrap in objects? (Leaning YES for uniformity)
2. **Calc structure:** Flat or wrapped? (Current is flat - is this right?)

**Once decided:**
- Update concrete parsers (keywords → objects)
- Decide calc structure pattern
- Fix 8 test failures
- Document final architecture
- Phase 4 complete → Production ready

---

## 📝 Session Files

**Analysis:**
- `/tmp/b_consumer_analysis.md` - CSS Animation Editor perspective
- `/tmp/b_api_evaluation.md` - String vs object trade-offs

**Architecture:**
- `packages/b_types/src/values/css-value.ts` - CssValue discriminated union
- `packages/b_declarations/src/utils/generate-value.ts` - Wrapper utility

---

**Status:** 🟡 Awaiting architectural decision on calc() structure  
**Quality:** All typecheck passes, architecture sound, just need API finalization  
**User:** "Super important and very good catch" - out of tokens, continuing next session

---

## 💡 The Insight

calc() IS correctly typed as discriminated union. The question isn't "did we lose the type" but "should background-size expand calc() into explicit structure or treat it as atomic value?"

**This impacts 50+ properties** - need to get it right now.
