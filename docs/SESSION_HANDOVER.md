# Session 064: Universal CSS Functions Support

**Date:** 2025-11-10  
**Focus:** Fix var()/calc() support via declaration layer interception  
**Status:** 🟢 Phase 3 Complete → Ready for Phase 4

---

## ✅ Phase 3 Complete - Clean Architecture

### What We Accomplished

**GREEN FIELD THINKING:**
- Rethought architecture from first principles
- Eliminated all hacks and special cases
- Established clean layer separation

**Layer 1 (Concrete):**
- `@b/types`: Added `"none"` to Image type (clean union)
- `@b/parsers`: Parse `"none"` → return string
- `@b/generators`: Generate `"none"` string → CSS

**Layer 2 (Declaration):**
- Created `generateValue()` wrapper utility
- Updated 6 property generators to use wrapper
- Fixed `background-clip` parser (returns strings, not CssValue objects)
- Consistent pattern: `z.union([concreteType, cssValueSchema])`

### The Clean Pattern

```typescript
// Concrete layer: Property-specific logic
parseBackgroundClipValue(ast) → "border-box" | "padding-box" | ...

// Declaration layer: Universal function interception  
if (isCssValue(value)) {
  return cssValueToCss(value);  // var(--x)
}
return concreteGenerator(value);  // border-box
```

### Key Files Created/Modified

```
packages/b_declarations/src/
├── utils/
│   ├── generate-value.ts         ✨ NEW - Wrapper utility
│   └── index.ts                   (exports added)
└── properties/
    ├── background-attachment/generator.ts
    ├── background-clip/generator.ts
    ├── background-clip/parser.ts
    ├── background-image/generator.ts
    ├── background-image/parser.ts
    ├── background-image/types.ts
    ├── background-origin/generator.ts
    ├── background-repeat/generator.ts
    └── background-size/generator.ts

packages/b_types/src/
└── image.ts                      (Added "none" to union)

packages/b_parsers/src/background/
├── clip.ts                        (Return strings, not CssValue)
└── image.ts                       (Handle "none" keyword)

packages/b_generators/src/background/
└── image.ts                       (Handle "none" string)
```

---

## 🎯 Next: Phase 4 - Test Fixes

### Current State

- ✅ Integration tests: 10/10 passing
- ❌ Unit tests: Type errors (Image now includes "none")

### Tasks

1. Fix background-image parser tests (~20 min)
   - Add type guards for "none" string case
   - Update assertions to match clean design

2. Run full test suite (~5 min)
   - Verify no regressions
   - All packages green

---

## 📚 Documentation

**Created:**
- `/tmp/b_greenfield_design.md` - Clean architecture from first principles ⭐
- `/tmp/b_architecture_analysis.md` - Problem analysis
- `/tmp/b_generator_solution.md` - Initial approach (superseded)

**See handover backup:** `docs/SESSION_HANDOVER.md.bak`

---

## 📊 Progress

✅ Phase 0: Type guards  
✅ Phase 1: Interception + bug fix  
✅ Phase 2: Schemas + naming  
✅ **Phase 3: Generators + clean architecture** ⭐  
⏳ Phase 4: Test fixes (NEXT)  
⏳ Phase 5: Automation

---

## 🔑 Key Insights (Session 064)

### The Breakthrough

**User:** "Think green field <-- that is where we are"

This shifted everything. Stopped hacking around edges, went back to first principles:

1. **Concrete layer** handles ALL property-specific logic (including "none")
2. **Declaration layer** handles ONLY universal functions (var, calc)
3. **No overlap. No special cases.**

### Architecture Principles

**Layer separation:**
```
@b/parsers, @b/generators  → Pure property logic
@b/declarations            → Universal function interception
```

**Type design:**
```typescript
// ✅ Clean: "none" is part of Image
type Image = { kind: "url", ... } | { kind: "gradient", ... } | "none"

// ❌ Hack: "none" handled separately  
type Image = ...
type BackgroundImageValue = Image | { kind: "keyword", value: "none" }
```

### The Pattern for 50+ Properties

1. Schema: `z.union([concreteType, cssValueSchema])`
2. Parser: Universal check → delegate
3. Generator: `generateValue(value, concreteGenerator)`

**Scales cleanly. No per-property special cases.**

---

## 📝 Commits

1. **358e2f4** - docs(session-064): universal CSS functions master plan
2. **f635b1d** - feat(b_declarations): implement Phase 0 type guards
3. **73e9ad0** - docs(architecture): document universal CSS values pattern
4. **58a8f50** - feat(b_declarations): add CssValue unions to property schemas
5. **c4d89a2** - docs(session-064): update handover with Phase 2 complete
6. **7fd7eb6** - feat(b_declarations): complete Phase 3 - generator wrapper utility ⭐

---

**Next:** Fix unit test type errors (~30 min) → Phase 5 automation
