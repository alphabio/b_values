# Minimal JSDoc Guidelines

**Philosophy:** Let the code speak. Docs should add value, not noise.

---

## ✅ Use JSDoc For

**External documentation links only:**

```typescript
/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/angle
 */
export const angleUnitSchema = z.union([
  z.literal("deg"),
  z.literal("rad"),
  z.literal("turn"),
  z.literal("grad"),
]);
```

**Why:** MDN and W3C specs are authoritative, maintained, and comprehensive.

---

## ❌ Don't Use JSDoc For

**Descriptions that repeat the code:**

```typescript
// ❌ Bad - just noise
/**
 * Angle unit schema.
 * 
 * Accepts valid angle units.
 * Can be deg, rad, turn, or grad.
 * 
 * @example
 * angleUnitSchema.parse("deg") // "deg"
 */
export const angleUnitSchema = z.union([...]);
```

**Examples that are obvious:**

```typescript
// ❌ Bad - example adds nothing
/**
 * @example
 * const color = namedColorSchema.parse("red"); // "red"
 */
```

**Verbose explanations:**

```typescript
// ❌ Bad - too much text
/**
 * CSS viewport-percentage length unit identifiers.
 * 
 * Viewport-percentage length units are relative to the size 
 * of the initial containing block. They provide different 
 * sizing strategies for responsive design across various 
 * viewport states.
 * 
 * Includes default (large), small, large (explicit), 
 * and dynamic viewport units.
 */
```

---

## 🎯 Rationale

**Token efficiency:**
- Every JSDoc line costs tokens
- LLMs read ALL documentation in files
- Verbose docs slow down development

**Maintenance burden:**
- Code changes → docs become stale
- Out-of-date docs are worse than no docs
- MDN links never go stale

**Readability:**
- Good names > comments
- `angleUnitSchema` is self-documenting
- Type signatures show what's valid

---

## 📋 Guidelines

1. **Link to specs** - MDN or W3C only
2. **No examples** - unless truly non-obvious
3. **No descriptions** - if the name is clear
4. **No parameter docs** - types are the docs
5. **No return docs** - return type is the doc

---

## ✅ Good Examples

```typescript
/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/named-color
 */
export const namedColorSchema = z.union([...]);

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/length
 */
export const lengthUnitSchema = z.union([...]);
```

---

**Decision Date:** 2025-11-04  
**Session:** 004
