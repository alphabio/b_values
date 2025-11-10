# Session 064: Universal CSS Functions Support

**Date:** 2025-11-10  
**Focus:** Fix var()/calc() support via declaration layer interception  
**Status:** 🔴 TDD RED PHASE - Tests Written, Ready for GREEN

---

## 🎯 THE BREAKTHROUGH: Parse Authorship, Not CSS Evaluation

### The Natural Law Discovered

**User guidance:** "Think greenfield / DX / UX / Step back and re-evaluate"

**The principle that emerged:**

**Parse what was authored. Not what CSS defaults to.**

```css
background-size: calc(100% - 20px);
```

User wrote **ONE value** (calc), not two (calc + auto).  
IR should reflect **authorship**, not CSS evaluation.

---

## 🏛️ The Architecture (Finalized)

### Rule 1: Parse What Was Authored

```typescript
// background-size: 100px
{ kind: "length", value: 100, unit: "px" }
// NOT: { kind: "explicit", width: {...}, height: auto }

// background-size: calc(100% - 20px)
{ kind: "calc", value: {...} }
// NOT: { kind: "explicit", width: calc, height: auto }

// background-size: 100px 200px
{
  kind: "explicit",
  width: { kind: "length", ... },
  height: { kind: "length", ... }
}
// YES - user wrote TWO values
```

**The structure reflects authorship.**

### Rule 2: Everything Has .kind

**ALWAYS discriminated union. No strings. No exceptions.**

```typescript
// Keywords
{ kind: "keyword", value: "border-box" }
{ kind: "keyword", value: "cover" }

// Universal functions
{ kind: "variable", name: "--x" }
{ kind: "calc", value: {...} }

// Property-specific
{ kind: "explicit", width: {...}, height: {...} }
{ kind: "url", url: "..." }
{ kind: "gradient", gradient: {...} }
```

**Consumer API: Uniform switch on `.kind`**

### Rule 3: Generators Apply Defaults

```typescript
// IR: { kind: "calc", ... }
// Generate: "calc(100% - 20px)"
// CSS applies "auto" for height - not our job
```

---

## 🔧 Implementation Plan

### Fix 1: Wrap Keywords in Objects

**background-clip (and similar):**

```typescript
// From:
parseOk("border-box");

// To:
parseOk({ kind: "keyword", value: "border-box" });
```

**Files to update:**

- `packages/b_parsers/src/background/clip.ts`
- `packages/b_parsers/src/background/attachment.ts`
- `packages/b_parsers/src/background/origin.ts`
- Similar simple keyword properties

**Generator update:**

```typescript
// From:
generateOk(value);

// To:
if (value.kind === "keyword") {
  return generateOk(value.value);
}
```

### Fix 2: Update Tests to Match Natural Pattern

**8 failing tests - ALL should be updated:**

1. **background-clip (4 tests):** Expect `{ kind: "keyword", value: "..." }`
2. **background-size calc (1 test):** Expect flat `{ kind: "calc", ... }` not wrapped
3. **var-support integration (3 tests):** Expect keyword objects not strings

**Why tests were wrong:**

- Expected structure expansion (calc → explicit with auto)
- Expected strings instead of discriminated unions
- Violated "parse authorship" principle

### Fix 3: Update Schemas

**background-clip types:**

```typescript
// From:
type BackgroundClip = "border-box" | "padding-box" | ...

// To:
type BackgroundClipKeyword = { kind: "keyword", value: "border-box" | ... }
type BackgroundClipValue = BackgroundClipKeyword | CssValue

// Schema:
const backgroundClipValueSchema = z.union([
  z.object({
    kind: z.literal("keyword"),
    value: z.enum(["border-box", "padding-box", "content-box", "text"])
  }),
  cssValueSchema
])
```

---

## ✅ What This Achieves

### For Consumers (Animation Editors)

```typescript
function manipulateValue(value: PropertyValue) {
  switch (value.kind) {
    case "keyword":
      return value.value;
    case "variable":
      return resolveVar(value.name);
    case "calc":
      return evaluateCalc(value);
    case "explicit":
      return interpolate(value.width, value.height);
    case "length":
      return `${value.value}${value.unit}`;
  }
}
```

**ONE code path. Clean. Uniform. Predictable.**

### For Maintainers

- No special cases
- Structure matches authorship
- Scales to 50+ properties
- Tests validate natural patterns

### For DX

Developer sees IR, instantly understands:

- One value? User wrote one value
- Two values? User wrote two values
- calc? User wrote calc (atomic, not expanded)

**No magic. No surprises.**

---

## 📊 Impact Analysis

### Changes Required

**Parsers (wrap keywords):**

- background-clip.ts
- background-attachment.ts
- background-origin.ts
- background-repeat.ts (keyword case)
- ~10 other keyword properties

**Generators (unwrap keywords):**

- Same properties - handle `{ kind: "keyword" }` case

**Tests (update expectations):**

- 8 failing tests → expect natural patterns
- ~50 other tests → likely already correct

**Estimated time:** 2-3 hours

### No Breaking Changes to Architecture

- Universal function interception ✅ stays
- createMultiValueParser ✅ stays
- generateValue() wrapper ✅ stays
- Layer separation ✅ stays

**Only change:** Keyword representation (strings → objects)

---

## 🎓 Key Insights

1. **Parse authorship, not evaluation** - Revolutionary principle
2. **Uniformity > convenience** - Everything has `.kind`
3. **Old tests can be wrong** - Don't let them drive architecture
4. **Consumer perspective wins** - Animation editor needs uniform API
5. **calc is atomic** - Don't expand structure that wasn't authored

---

## 📝 Session Files

**Deep analysis:**

- `/tmp/b_greenfield_rethink.md` - The breakthrough document ⭐
- `/tmp/b_consumer_analysis.md` - Animation editor perspective
- `/tmp/b_api_evaluation.md` - Trade-off analysis

**Architecture proven:**

- Green field design complete
- All typecheck passes
- 10/10 integration tests passing
- Pattern scales to 50+ properties

---

## 🚀 Next Session

### Implementation Plan (30-45 minutes) ⚡

**📖 Start Here:**
- `docs/sessions/064/QUICK_START.md` - TL;DR (read this first!)
- `docs/sessions/064/FINAL_IMPLEMENTATION_PLAN.md` - Complete details

**🎯 The Work:**

**Step 1: Update 3 Parsers** (1 line each)
- `packages/b_parsers/src/background/clip.ts:28`
- `packages/b_parsers/src/background/attachment.ts:26`
- `packages/b_parsers/src/background/origin.ts:26`

Change: `return parseOk(val as Type);`  
To: `return parseOk({ kind: "keyword", value: val as Type });`

**Step 2: Update Schemas** (check if needed)
- `packages/b_declarations/src/properties/background-clip/types.ts`
- Ensure keyword schema wraps in object (may already be correct)

**Step 3: Validate**
```bash
just test    # Expect: 2396 passing (8 newly fixed)
just check   # Expect: All green
```

**Step 4: Document (~30 min)**

1. Update architecture docs with "parse authorship" principle
2. Add API examples for consumers
3. Create migration guide if needed

---

## 💡 The Insight That Changed Everything

**User:** "calc is a type right? Did we lose that?"

This question revealed:

- calc IS properly typed (discriminated union)
- Question wasn't "did we lose it"
- Question was "should we wrap it"

**Answer:** NO - parse what was authored.

If user writes `calc(...)` → IR is calc.  
If user writes `calc(...) auto` → IR is explicit with calc and auto.

**Structure reflects authorship.**

This principle applies to ALL properties.

---

## 📈 Quality Status

✅ **Architecture:** Green field, clean layers, scales  
✅ **Type Safety:** Full discriminated unions, no `any`  
✅ **Integration Tests:** 10/10 passing  
✅ **Typecheck:** All packages green  
🟡 **Unit Tests:** 8 failing (expect wrong patterns - will fix)  
🟡 **API:** Keywords need wrapping for uniformity

---

## 🎯 Success Criteria

**After next session:**

1. ✅ All tests passing (`just test`)
2. ✅ All checks green (`just check`)
3. ✅ Keywords wrapped in discriminated unions
4. ✅ Tests validate natural patterns
5. ✅ Documentation updated
6. ✅ Ready for Phase 5 (automation) OR production use

---

**Session 064 Status:** 🟢 DESIGN FINALIZED  
**Next:** Implementation (3 hours estimated)  
**User:** "Write it up .. let's pick this up in the next session"

---

## 🏆 Achievement Unlocked

**"Parse Authorship, Not Evaluation"** - A principle that will guide 50+ property implementations.

Green field thinking + user perspective + deep introspection = Natural, scalable architecture.

**This is production-ready design.** ✨

---

## 🧪 TDD Status

**Phase:** 🔴 RED (Tests written, implementation pending)

**Test files created:**
- `packages/b_parsers/src/background/clip.test.ts` - 12 tests
- `packages/b_parsers/src/background/attachment.test.ts` - 5 tests
- `packages/b_parsers/src/background/origin.test.ts` - 5 tests

**Test results:**
```
Parser tests:    18 failing | 4 passing  (22 total)
Declaration tests: 8 failing | 0 passing  (8 total)
Total NEW tests:  26 RED ✅ (expected - capturing correct behavior)
```

**See:** `docs/sessions/064/TDD_APPROACH.md` for complete test strategy

