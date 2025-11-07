# Phase 2 Complete: Reusable Molecule Types

**Date:** 2025-11-07  
**Commit:** 407ef2b

---

## 🎯 Objective

Create reusable molecule types for `<image>` and `<repeat-style>` in `@b/types` following the atom-vs-molecule principle.

---

## ✅ What Was Created

### 1. `@b/types/src/image.ts`

Implements CSS `<image>` production (reusable across multiple properties):

```typescript
export const imageSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("url"),
    url: z.string(),
  }).strict(),
  z.object({
    kind: z.literal("gradient"),
    gradient: z.lazy(() => z.any()) as z.ZodType<Gradient>,
  }).strict(),
]);

export type Image = z.infer<typeof imageSchema>;
```

**Spec-driven:**
- CSS Spec: `<image> = <url> | <gradient> | <image()> | <image-set()> | <cross-fade()> | <element()>`
- Currently supports: `<url>`, `<gradient>`
- Future support: `<image()>`, `<image-set()>`, `<cross-fade()>`, `<element()>`

**Key decision:**
- "none" keyword is NOT part of `<image>` production - it's property-specific
- Properties like `background-image` handle "none" separately

**Used by:**
- `background-image`
- `mask-reference` (future)
- `border-image-source` (future)
- `list-style-image` (future)
- `cursor` (future)

### 2. `@b/types/src/repeat-style.ts`

Implements CSS `<repeat-style>` and `<repetition>` productions:

```typescript
export const repetitionSchema = z.union([
  z.literal("repeat"),
  z.literal("space"),
  z.literal("round"),
  z.literal("no-repeat"),
]);

export const repeatStyleSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("shorthand"),
    value: z.union([z.literal("repeat-x"), z.literal("repeat-y")]),
  }).strict(),
  z.object({
    kind: z.literal("explicit"),
    horizontal: repetitionSchema,
    vertical: repetitionSchema,
  }).strict(),
]);
```

**Spec-driven:**
- CSS Spec: `<repeat-style> = repeat-x | repeat-y | <repetition>{1,2}`
- CSS Spec: `<repetition> = repeat | space | round | no-repeat`

**Used by:**
- `background-repeat`
- `mask` (future)

### 3. Comprehensive Tests

**image.test.ts (5 tests):**
- Validates url images
- Validates gradient images
- Rejects invalid kinds
- Rejects missing fields
- Rejects "none" (property-specific)

**repeat-style.test.ts (13 tests):**
- Validates all repetition keywords
- Validates shorthand forms (repeat-x, repeat-y)
- Validates explicit forms (horizontal + vertical)
- Rejects invalid values
- Rejects missing fields

---

## 📊 Results

- ✅ **2340 tests passing** (+18 from phase 1)
- ✅ **Typecheck passing**
- ✅ **No breaking changes**
- ✅ **Spec-compliant types**

---

## 💡 Key Insights

### 1. "none" is Property-Specific

The "none" keyword appears in many properties but is NOT part of the `<image>` production itself:

```css
/* Valid CSS */
background-image: none;        /* property-specific keyword */
background-image: url(...);    /* <image> */
background-image: linear-gradient(...);  /* <image> */
```

Properties must handle "none" separately in their IR:

```typescript
// Property IR (in @b/declarations)
export type BackgroundImage = 
  | { kind: "keyword"; value: string }  // Handles "none" and CSS-wide
  | { kind: "layers"; layers: Image[] }; // Uses reusable Image type
```

### 2. Lazy Loading for Circular Dependencies

The gradient type creates a circular dependency (image → gradient → image):

```typescript
gradient: z.lazy(() => z.any()) as z.ZodType<Gradient>
```

This is necessary and acceptable for complex type relationships.

### 3. Spec Names Drive Everything

Following CSS spec production names exactly:
- `<image>` → `imageSchema` / `Image`
- `<repeat-style>` → `repeatStyleSchema` / `RepeatStyle`
- `<repetition>` → `repetitionSchema` / `Repetition`

---

## 🔄 Where Types Live (Updated)

### Atoms (in `@b/keywords`)
- Simple keyword enums
- Example: `repetition` values

### Reusable Molecules (in `@b/types`)
- Complex, reusable across properties
- Examples: `Image`, `RepeatStyle`, `BgSize`, `Position`, `Gradient`

### Property-Specific (in `@b/declarations/properties/*/types.ts`)
- Wrappers around reusable types
- Property-specific combinations
- Example: `BackgroundImage` wraps `Image[]` with CSS-wide keywords

---

## 🎯 Next Steps

**Phase 3:** Refactor existing properties to use these new reusable types:
1. Update `background-image/types.ts` to import and use `Image` from `@b/types`
2. Update `background-repeat/types.ts` to import and use `RepeatStyle` from `@b/types`
3. Verify all tests still pass
4. Confirm pattern is clean and maintainable

---

## 📁 Files Changed

- `packages/b_types/src/image.ts` (new, 52 lines)
- `packages/b_types/src/image.test.ts` (new, 50 lines)
- `packages/b_types/src/repeat-style.ts` (new, 55 lines)
- `packages/b_types/src/repeat-style.test.ts` (new, 104 lines)
- `packages/b_types/src/index.ts` (updated, +2 exports)
- `docs/SESSION_HANDOVER.md` (updated)
