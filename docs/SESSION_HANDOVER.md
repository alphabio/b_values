# Session 056: Architecture Refinement - Atom vs. Molecule

**Date:** 2025-11-07
**Focus:** Refactoring background properties to follow correct architecture

---

## ✅ Accomplished

### Critical Architecture Breakthrough

- ✅ Identified "Atom vs. Molecule" principle
- ✅ Clarified package roles (keywords/types/parsers/generators/declarations)
- ✅ **COMPLETED** background-size refactor
- ✅ **COMPLETED** background-attachment refactor
- ✅ **COMPLETED** background-clip refactor
- ✅ **COMPLETED** background-origin refactor
- ✅ **COMPLETED** background-repeat refactor

### Key Insight: Multi-Layer API

**Every value type needs parsers AND generators in their own packages!**

```
b_declarations (Property-level)  ← "background-size: cover, contain"
b_parsers/generators (Value-level) ← parse/generate single <bg-size>
b_types (Type schemas)           ← IR definitions
b_keywords (Lexicon)             ← Keyword sets
```

---

## 🎉 Refactor Complete

### What Was Done:

**1. background-size:**

- ✅ Created `b_parsers/src/background-size/` (value-level parser)
- ✅ Created `b_generators/src/background-size/` (value-level generator)
- ✅ Updated `b_declarations` to use value-level functions
- ✅ All tests passing

**2. background-attachment:**

- ✅ Created `b_parsers/src/background-attachment/` (value-level parser)
- ✅ Created `b_generators/src/background-attachment/` (value-level generator)
- ✅ Updated `b_declarations` to use value-level functions
- ✅ All tests passing

**3. background-clip:**

- ✅ Created `b_parsers/src/background-clip/` (value-level parser)
- ✅ Created `b_generators/src/background-clip/` (value-level generator)
- ✅ Updated `b_declarations` to use value-level functions
- ✅ All tests passing

**4. background-origin:**

- ✅ Created `b_parsers/src/background-origin/` (value-level parser)
- ✅ Created `b_generators/src/background-origin/` (value-level generator)
- ✅ Updated `b_declarations` to use value-level functions
- ✅ All tests passing

**5. background-repeat:**

- ✅ Created `b_parsers/src/background-repeat/` (value-level parser)
- ✅ Created `b_generators/src/background-repeat/` (value-level generator)
- ✅ Updated `b_declarations` to use value-level functions
- ✅ All tests passing

---

## 📊 Current State

**Working:**

- ✅ All background properties refactored to correct architecture
- ✅ Value-level parsers in `b_parsers`
- ✅ Value-level generators in `b_generators`
- ✅ Declaration-level thin orchestrators in `b_declarations`
- ✅ All tests passing (2381 tests)
- ✅ All quality checks passing (typecheck, lint, format)
- ✅ Production build successful

**Architecture is now consistent:**

- keywords → types → parsers/generators → declarations
- Pure separation of concerns
- Reusable value-level functions

---

## 🎯 Next Steps

1. **Apply same pattern to remaining properties:**
   - Audit other CSS properties in `b_declarations`
   - Identify properties that need value-level parsers/generators
   - Refactor systematically

2. **Document the pattern:**
   - Create ADR for Atom vs. Molecule principle
   - Update architecture docs
   - Add examples for future properties

3. **Consider adding:**
   - Integration tests across all layers
   - Performance benchmarks
   - Documentation generation

---

## 💡 Key Decisions

### Package Roles (Definitive):

**`b_keywords`** - Lexicon

- Sets of keyword string literals
- Example: `BACKGROUND_SIZE_KEYWORDS = ["cover", "contain", "auto"]`

**`b_types`** - Atoms + Reusable Molecules

- Universal building blocks (Length, Percentage, Angle)
- Reusable molecules (Gradient, Shadow, Url)
- Property-specific molecules IF they need parsers/generators

**`b_parsers`** - Value-level parsing

- Parse single values from AST nodes
- NOT comma-separated lists (that's b_declarations)

**`b_generators`** - Value-level generation

- Generate single values to CSS strings
- NOT comma-separated lists (that's b_declarations)

**`b_declarations`** - Property orchestration

- Uses value-level parsers/generators
- Handles comma-separated lists (multi-value properties)
- Handles CSS-wide keywords
- Thin glue layer

---

## 📁 Session Artifacts

Created files:

- `packages/b_parsers/src/background-size/parser.ts`
- `packages/b_parsers/src/background-size/index.ts`
- `packages/b_parsers/src/background-attachment/parser.ts`
- `packages/b_parsers/src/background-attachment/index.ts`
- `packages/b_parsers/src/background-clip/parser.ts`
- `packages/b_parsers/src/background-clip/index.ts`
- `packages/b_parsers/src/background-origin/parser.ts`
- `packages/b_parsers/src/background-origin/index.ts`
- `packages/b_parsers/src/background-repeat/parser.ts`
- `packages/b_parsers/src/background-repeat/index.ts`
- `packages/b_generators/src/background-size/generator.ts`
- `packages/b_generators/src/background-size/index.ts`
- `packages/b_generators/src/background-attachment/generator.ts`
- `packages/b_generators/src/background-attachment/index.ts`
- `packages/b_generators/src/background-clip/generator.ts`
- `packages/b_generators/src/background-clip/index.ts`
- `packages/b_generators/src/background-origin/generator.ts`
- `packages/b_generators/src/background-origin/index.ts`
- `packages/b_generators/src/background-repeat/generator.ts`
- `packages/b_generators/src/background-repeat/index.ts`

Updated files:

- `packages/b_parsers/src/index.ts` (added all background exports)
- `packages/b_generators/src/index.ts` (added all background exports)
- `packages/b_declarations/src/properties/background-size/parser.ts` (now thin)
- `packages/b_declarations/src/properties/background-size/generator.ts` (now thin)
- `packages/b_declarations/src/properties/background-attachment/parser.ts` (now thin)
- `packages/b_declarations/src/properties/background-attachment/generator.ts` (now thin)
- `packages/b_declarations/src/properties/background-clip/parser.ts` (now thin)
- `packages/b_declarations/src/properties/background-clip/generator.ts` (now thin)
- `packages/b_declarations/src/properties/background-origin/parser.ts` (now thin)
- `packages/b_declarations/src/properties/background-origin/generator.ts` (now thin)
- `packages/b_declarations/src/properties/background-repeat/parser.ts` (now thin)
- `packages/b_declarations/src/properties/background-repeat/generator.ts` (now thin)

---

**Status:** ✅ **COMPLETE - All background properties refactored**

**Next Session:** Audit remaining properties and apply same pattern

---

## 🔄 Structure Improvement (Nov 7, 16:07)

**Reorganized background parsers/generators:**

Before:
```
b_parsers/src/
├── background-attachment/
├── background-clip/
├── background-origin/
├── background-repeat/
└── background-size/
```

After:
```
b_parsers/src/background/
├── attachment.ts
├── clip.ts
├── origin.ts
├── repeat.ts
├── size.ts
└── index.ts
```

**Benefits:**
- Single namespace: `Parsers.Background.*` and `Generators.Background.*`
- Cleaner directory structure
- Easier to maintain and extend
- Follows pattern of other modules (color, gradient, etc.)

**Updated imports in declarations:**
- `Parsers.BackgroundSize.*` → `Parsers.Background.*`
- `Generators.BackgroundSize.*` → `Generators.Background.*`

✅ All tests passing (2363 tests)
✅ All quality checks passing
✅ Build successful
