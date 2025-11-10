# Session 064: Universal CSS Functions - REVISED Master Plan

**Date:** 2025-11-10  
**Status:** ✅ APPROVED after critical feedback incorporation  
**Version:** 2.0 (Wrapper Pattern with Type Guards)

---

## 🎯 Core Strategy

**Use wrapper pattern at property level** - no changes to parseDeclaration or createMultiValueParser needed.

---

## 📋 Implementation Phases

### Phase 0: Type Guards Foundation ⭐ CRITICAL

Create proper type guards to distinguish CssValue from property IR.

**Files:**
- `packages/b_declarations/src/utils/type-guards.ts` (NEW)
- `packages/b_declarations/src/utils/type-guards.test.ts` (NEW)

**Key exports:**
```typescript
export function isCssValue(value: unknown): value is CssValue;
export function isUniversalFunction(node: csstree.CssNode): boolean;
export function isConcreteValue<T>(value: T | CssValue): value is T;
```

**Success criteria:**
- [ ] `isCssValue()` uses whitelist of CssValue kinds
- [ ] Correctly rejects property IRs with `kind` field
- [ ] All type guard tests passing

---

### Phase 1: Parser Wrapper

**File:** `packages/b_declarations/src/utils/parse-wrapper.ts` (NEW)

```typescript
export type Substitutable<T> = T | CssValue;

export function parseValue<T>(
  node: csstree.CssNode,
  specificParser: (node: csstree.CssNode) => ParseResult<T>
): ParseResult<Substitutable<T>>;
```

**Pattern:**
```typescript
// Concrete parser (property-specific)
function parseClipConcrete(node): ParseResult<BackgroundClipConcrete> {
  // Only keywords
}

// Exported parser (with universal support)
export const parseBackgroundClipValue = (node) =>
  parseValue(node, parseClipConcrete);
```

---

### Phase 2: Generator Wrapper (Curried)

**File:** `packages/b_declarations/src/utils/generate-wrapper.ts` (NEW)

```typescript
export function withUniversalSupport<T>(
  specificGenerator: (value: T) => string
): (value: Substitutable<T>) => string;
```

**Pattern:**
```typescript
// Concrete generator
const generateClipConcrete = (value: BackgroundClipConcrete): string => value;

// Exported generator (curried)
export const generateBackgroundClipValue = withUniversalSupport(generateClipConcrete);
```

---

### Phase 3: Schema Wrapper

**File:** `packages/b_declarations/src/utils/schema-wrapper.ts` (NEW)

```typescript
export function substitutable<T extends z.ZodTypeAny>(
  concreteSchema: T
): z.ZodUnion<[T, typeof cssValueSchema]>;
```

**Usage:**
```typescript
// Apply at LEAF VALUES only, not top-level containers
const valueSchema = substitutable(Keywords.backgroundClip);
```

---

### Phase 4: Proof of Concept (background-clip)

Refactor ONE property to validate pattern.

**Changes:**
1. Update schema: `substitutable(Keywords.backgroundClip)`
2. Split parser: `parseClipConcrete` + wrapper
3. Split generator: `generateClipConcrete` + wrapper
4. Update types: export `Substitutable<BackgroundClipValue>`

**Validation:**
- [ ] Existing tests still pass
- [ ] New test: `background-clip: var(--x)` works
- [ ] No changes to createMultiValueParser needed
- [ ] No changes to parseDeclaration needed

---

### Phase 5: Integration Tests

**File:** `packages/b_declarations/src/__tests__/universal-css-functions.integration.test.ts` (NEW)

Test user's original case:
```typescript
it("should parse var() in background-image", () => {
  const result = parseDeclaration(
    "background-image: var(--gradient), url(img.png), none"
  );
  expect(result.ok).toBe(true);
});
```

---

### Phase 6: Roll Out to All Properties

Apply pattern to remaining background-* properties:
- background-image
- background-size
- background-repeat
- background-attachment
- background-origin

---

### Phase 7: Documentation & Migration

**Version:** Bump to 2.0.0 (breaking change)

**Migration guide:**
```markdown
## IR Structure Changes

Property values can now be CssValue (var, calc, etc.):

**Before:**
{ values: ["border-box"] }

**After:**
{ values: ["border-box"] }  // Still valid
{ values: [{ kind: "variable", name: "--x" }] }  // NEW!
```

---

## 🎯 Success Criteria

- [ ] Phase 0: Type guards with tests passing
- [ ] Phase 1-3: Wrappers implemented with tests
- [ ] Phase 4: background-clip refactored and working
- [ ] Phase 5: Integration tests passing
- [ ] Phase 6: All background-* properties refactored
- [ ] Phase 7: Migration guide complete
- [ ] User's test case works
- [ ] All 944+ existing tests still pass

---

## 🔥 Critical Decisions from Feedback

### 1. Type Guard Must Use Whitelist

**WHY:** Both CssValue and property IR use `kind` field.

**SOLUTION:** Explicit whitelist of CssValue kinds:
```typescript
const CSS_VALUE_KINDS = [
  "literal", "keyword", "variable", "list",
  "calc", "calc-operation", "min", "max", "clamp",
  "url", "attr", "function", "string", "hex-color"
];
```

### 2. Apply Substitutable at Leaf Values Only

**WHY:** Top-level application would allow nonsensical IR.

**CORRECT:**
```typescript
z.object({
  kind: z.literal("explicit"),
  width: substitutable(lengthPercentageSchema),  // ← Here
})
```

**INCORRECT:**
```typescript
substitutable(z.discriminatedUnion(...))  // ← Not here
```

### 3. Use Currying for Generators

**WHY:** Cleaner call sites, better composability.

**PATTERN:**
```typescript
export const generate = withUniversalSupport(generateConcrete);
```

### 4. No Changes to parseDeclaration/createMultiValueParser

**WHY:** Wrapper pattern at property level handles everything.

**IMPACT:** Simpler implementation, fewer touch points.

---

## 📊 Architecture Diagram

```
Property Layer (PUBLIC API)
├── parseValue(node, parseClipConcrete)      ← Wrapper adds universal support
├── withUniversalSupport(generateConcrete)   ← Wrapper adds universal support
└── substitutable(concreteSchema)            ← Schema supports both

Concrete Layer (INTERNAL)
├── parseClipConcrete(node)                  ← Property-specific only
├── generateClipConcrete(value)              ← Property-specific only
└── concreteSchema                           ← Property-specific only

Type Guards (UTILITIES)
├── isCssValue(value)                        ← Distinguishes IR types
├── isUniversalFunction(node)                ← Identifies var/calc/etc
└── isConcreteValue(value)                   ← For consumers
```

---

## ⚠️ Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Type guard false positives | Use explicit whitelist |
| Breaking changes | Version bump + migration guide |
| Incorrect Substitutable application | Document "leaf values only" |
| Test maintenance | Validate with proof of concept first |

---

## 🚀 Next Action

**Start with Phase 0** - Implement type guards with comprehensive tests.

This is the foundation. Get it right before proceeding.
