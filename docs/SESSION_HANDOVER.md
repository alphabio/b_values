# Session 064: Universal CSS Functions Support

**Date:** 2025-11-10  
**Focus:** Fix var()/calc() support via declaration layer interception  
**Status:** 🟢 COMPLETE - Production Ready

---

## ✅ All Phases Complete

**Phase 0:** Type guards ✅  
**Phase 1:** Declaration layer interception ✅  
**Phase 2:** Schema updates + naming convention ✅  
**Phase 3:** Generator wrapper utility ✅  
**Phase 4:** API refinement (discriminated union) ✅

---

## 🎯 Final Architecture

### Green Field Design

User guidance: **"Think green field"** → Rethought from first principles

**Layer 1 (Concrete):**
- `@b/types`: Image as discriminated union `{ kind: "url" | "gradient" | "none" }`
- `@b/parsers`: Pure property logic, no universal function knowledge
- `@b/generators`: Pure CSS generation

**Layer 2 (Declaration):**
- Universal function interception via `createMultiValueParser`
- `generateValue()` wrapper delegates to concrete generators
- Schema: `z.union([concreteType, cssValueSchema])`

### The Pattern (Scales to 50+ Properties)

```typescript
// Schema
backgroundClipValueSchema = z.union([
  z.literal("border-box"),
  cssValueSchema  // var(), calc()
])

// Parser (automatic via createMultiValueParser)
if (isUniversalFunction(node)) {
  return parseCssValue(node);     // → CssValue
}
return concreteParser(node);      // → "border-box"

// Generator  
generateValue(value, concreteGenerator)
// If CssValue → cssValueToCss()
// Else → concreteGenerator()
```

---

## 🔑 Key Decision: Discriminated Union

### The Pivot

Initially used: `Image = { kind: "url" } | { kind: "gradient" } | "none"` (string)

**Problem:** Broke discriminated union, required type guards everywhere

**Fix:** `Image = { kind: "url" } | { kind: "gradient" } | { kind: "none" }` (object)

**Result:**
- Concrete layer: +3 lines
- Consumer layer: No type guards needed
- API: Clean, consistent, TypeScript-friendly

### Trade-off Analysis

**Internal complexity** (maintainers control, small surface area)  
vs  
**External complexity** (users/tests, large surface area)

**Choice:** Absorb complexity internally, deliver simple API

---

## ✅ Testing Status

**Integration tests:** 10/10 passing
- var() with nested fallbacks ✅
- calc(), min(), max(), clamp() ✅
- Mixed var() + concrete values ✅
- var() in gradient color stops ✅
- All properties (background-image, -clip, -repeat, -size, etc.) ✅

**Unit tests:** All passing ✅

**Quality checks:** Fully green ✅
```bash
just check  # ✅ Format, lint, typecheck all pass
```

---

## 📚 Key Files

### Created
```
packages/b_declarations/src/utils/
├── generate-value.ts        # Wrapper utility
├── type-guards.ts           # isCssValue() with whitelist
└── index.ts                 # Barrel exports
```

### Modified (Concrete Layer)
```
packages/b_types/src/
└── image.ts                 # Discriminated union

packages/b_parsers/src/background/
├── clip.ts                  # Return strings
└── image.ts                 # Return { kind: "none" }

packages/b_generators/src/background/
└── image.ts                 # Handle { kind: "none" }
```

### Modified (Declaration Layer)
```
packages/b_declarations/src/properties/
├── background-attachment/generator.ts
├── background-clip/generator.ts
├── background-clip/parser.ts
├── background-image/generator.ts
├── background-image/types.ts
├── background-origin/generator.ts
├── background-repeat/generator.ts
└── background-size/generator.ts
```

---

## 🎊 User Validation

**"This is so good"**

Tested complex nested structures:
```json
{
  "kind": "variable",
  "name": "--bg-repeat",
  "fallback": {
    "kind": "variable",
    "name": "--fallback-repeat",
    "fallback": {
      "kind": "keyword",
      "value": "no-repeat"
    }
  }
}
```

Mixed `background-image` with var(), url(), gradients with var() in color stops - **all working perfectly**.

---

## 📝 Commits

1. **358e2f4** - docs: universal CSS functions master plan
2. **f635b1d** - feat: implement Phase 0 type guards
3. **73e9ad0** - docs: document universal CSS values pattern
4. **58a8f50** - feat: add CssValue unions to property schemas
5. **c4d89a2** - docs: update handover Phase 2 complete
6. **7fd7eb6** - feat: complete Phase 3 - generator wrapper utility
7. **8e76512** - docs: Phase 3 complete - clean architecture achieved
8. **52580cd** - docs: user validates Phase 3 architecture
9. **62c6db7** - refactor: use discriminated union for Image type ⭐

---

## 🚀 What's Next (Phase 5 - Optional)

### Automation for 50+ Properties

The pattern is established. To scale:

1. **Create automation script** (~2 hours)
   - Generate schema updates
   - Add `generateValue()` wrapper calls
   - Update types with `ValueSchema` naming

2. **Batch update properties** (~1 hour)
   - Run script on remaining 44+ properties
   - Test automation output
   - Commit in batches

3. **CI validation** (~30 min)
   - Add check for universal function support
   - Ensure all properties follow pattern

**OR** apply on-demand as properties are used/modified.

---

## 📊 Architecture Quality

✅ **KISS** - No hacks, no special cases  
✅ **Separation of Concerns** - Clean layer boundaries  
✅ **Scalability** - Pattern proven for 6 properties, ready for 50+  
✅ **Type Safety** - Full discriminated unions, no `any`  
✅ **Maintainability** - Consistent, predictable, well-documented  
✅ **API Design** - Consumer-friendly discriminated unions

---

## 🎓 Key Learnings

1. **Green field thinking** > incremental hacks
2. **Trade-offs matter** - Internal vs external complexity
3. **Discriminated unions** are core TypeScript patterns - don't break them
4. **Layer separation** enables clean scaling
5. **User feedback validates** architectural decisions

**This is production-ready architecture.** ✨

---

**Session 064 Status:** 🟢 COMPLETE  
**Ready for:** Phase 5 automation (optional) or real-world usage
