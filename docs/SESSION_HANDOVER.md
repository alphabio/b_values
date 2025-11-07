# Session 058: Naming Convention & Atom-Molecule Pattern Alignment

**Date:** 2025-11-07
**Focus:** Finalize THE naming convention and type organization pattern

---

## ✅ Accomplished

- ✅ Reviewed `atom-vs-molecule-principle.md` architecture pattern
- ✅ Analyzed CSS spec for `<mask>` property (confirmed reusability)
- ✅ Identified reusable molecules: `<image>`, `<repeat-style>`, `<bg-size>`, `<position>`
- ✅ **FINALIZED** naming convention for entire codebase
- ✅ **Phase 1 COMPLETE:** Namespace import pattern refactor
  - Removed "Keyword" suffix from all @b/keywords exports
  - Updated all imports to `import * as Keywords from "@b/keywords"`
  - Updated all test files (2322 tests passing)
  - Build and typecheck verified
- ✅ **Phase 2 COMPLETE:** Created reusable molecule types
  - Created `@b/types/src/image.ts` (imageSchema, Image)
  - Created `@b/types/src/repeat-style.ts` (repeatStyleSchema, RepeatStyle, Repetition)
  - Added comprehensive tests (18 new tests)
  - All 2340 tests passing

---

## 💡 Key Decisions

### 1. Namespace Import Pattern for Keywords (Better DX)

**Decision:** Always import keywords as namespace

```typescript
// ✅ THE Pattern
import * as Keywords from "@b/keywords";

// Usage
Keywords.bgSize; // clean, contextual
Keywords.cssWide;
Keywords.repetition;
```

**Rationale:**

- Cleaner, shorter names at definition site (no "Keyword" suffix needed)
- Clear context at usage site via `Keywords.` prefix
- Better auto-complete experience
- Matches DX philosophy

### 2. THE Naming Convention (FINAL - Spec-Driven)

#### Keywords (`@b/keywords`)

```typescript
// File: @b/keywords/src/bg-size.ts
export const bgSize = z.union([...]);          // Match CSS <bg-size>
export const BG_SIZE = getLiteralValues(...);  // Constant array (uppercase)
export type BgSize = z.infer<typeof bgSize>;   // Type (PascalCase)
```

#### Reusable Types (`@b/types`) - Atoms & Molecules

```typescript
// File: @b/types/src/image.ts
export const imageSchema = z.discriminatedUnion(...);  // Match CSS <image>
export type Image = z.infer<typeof imageSchema>;

// File: @b/types/src/repeat-style.ts
export const repeatStyleSchema = z.discriminatedUnion(...);  // Match CSS <repeat-style>
export type RepeatStyle = z.infer<typeof repeatStyleSchema>;

// File: @b/types/src/bg-size.ts (already exists ✅)
export const bgSizeSchema = z.discriminatedUnion(...);  // Match CSS <bg-size>
export type BgSize = z.infer<typeof bgSizeSchema>;
```

#### Property Types (`@b/declarations`)

```typescript
// File: @b/declarations/properties/background-image/types.ts
export type BackgroundImage = { kind: "keyword"; ... } | { kind: "layers"; ... };
export type ImageLayer = Image | { kind: "none" };

// Pattern: PropertyName (PascalCase from property-name)
```

### 3. Reusability Matrix (from CSS Spec Analysis)

**Confirmed Reusable Molecules** (belong in `@b/types`):

- `<bg-size>` → Used by: `background-size`, `mask` ✅ Already in @b/types
- `<image>` → Used by: `background-image`, `mask-reference`, `border-image-source`, `list-style-image`, `cursor` ❌ NEEDS CREATION
- `<repeat-style>` → Used by: `background-repeat`, `mask` ❌ NEEDS CREATION
- `<position>` → Used by: `background-position`, `mask`, `object-position` ✅ Already in @b/types

**Property-Specific Types** (stay in `@b/declarations`):

- `BackgroundImage`, `BackgroundRepeat`, etc. (wrappers around reusable molecules)

---

## 📊 Current State

**Working:**

- ✅ All 2322 tests passing
- ✅ Naming convention finalized and documented
- ✅ Atom-molecule principle clearly understood
- ✅ Session 057 properly archived

**Ready to implement:**

- Refactor `@b/keywords` to remove "Keyword" suffix from exports
- Update all imports to namespace pattern `import * as Keywords`
- Create reusable molecules: `image.ts`, `repeat-style.ts`
- Refactor background properties to use new pattern

---

## 🎯 Next Steps

### ~~Phase 1: Keywords Refactor~~ ✅ COMPLETE

~~1. Remove "Keyword" suffix from all `@b/keywords` exports~~
~~2. Update all imports across codebase to namespace pattern~~
~~3. Run tests to verify~~

### ~~Phase 2: Create Reusable Molecules~~ ✅ COMPLETE

~~1. Create `@b/types/src/image.ts` with `imageSchema`, `Image` type~~
~~2. Create `@b/types/src/repeat-style.ts` with `repeatStyleSchema`, `RepeatStyle` type~~
~~3. Export from `@b/types/index.ts`~~

### Phase 3: Refactor Background Properties

1. Update `background-image` to import from `@b/types`
2. Update `background-repeat` to import from `@b/types`
3. Simplify property-level `types.ts` files to simple re-exports
4. Verify all tests pass

### Phase 4: Documentation

1. Update `HOW-TO-ADD-PROPERTY.md` with THE pattern
2. Document namespace import convention
3. Update any other affected docs

---

## 📁 Key Documents

- `docs/architecture/patterns/atom-vs-molecule-principle.md` - Foundation principle
- `docs/sessions/057/` - Previous session (CSS-wide keywords refactor + audit)
- `docs/sessions/058/` - This session (naming convention alignment)

---

## 🎨 The Rule

**Naming follows CSS spec production names:**

- `<bg-size>` → `bgSizeSchema` / `BgSize`
- `<image>` → `imageSchema` / `Image`
- `<repeat-style>` → `repeatStyleSchema` / `RepeatStyle`

**No suffixes needed when using namespace imports:**

- Keywords: `import * as Keywords from "@b/keywords"`
- Use: `Keywords.bgSize` (NOT `Keywords.bgSizeKeyword`)

**Consistency is paramount for scaling to 50+ properties.**

---

**Status:** 🟢 **Phase 2 Complete - Ready for Phase 3**  
**Commits:** 2 (namespace imports, reusable molecules)
**Next:** Refactor background properties to use reusable molecules
