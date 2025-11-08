# Zod Usage Guidelines

**Date:** 2025-11-04
**Decision:** Clear protocol for when to use Zod vs plain TypeScript

---

## 🎯 Core Principle

**Zod is for IR (Intermediate Representation) schemas ONLY.**

Result types, helpers, and infrastructure use **plain TypeScript**.

---

## ✅ Use Zod For:

### 1. IR Type Schemas (Runtime Validation)

All CSS IR types must have Zod schemas because they:

- Will be validated at runtime (parsing CSS)
- Need to be serialized/deserialized
- Require runtime type guards
- Benefit from schema composition

**Pattern:**

```typescript
// ✅ IR types - ALWAYS use Zod
export const hexColorSchema = z.object({
  kind: z.literal("hex"),
  value: z.string().regex(/^#[0-9A-F]{6}([0-9A-F]{2})?$/),
});

export type HexColor = z.infer<typeof hexColorSchema>;
```

**Examples from b_value:**

- `hexColorSchema` → `HexColor`
- `linearGradientSchema` → `LinearGradient`
- `lengthSchema` → `Length`
- `angleSchema` → `Angle`

### 2. Keyword Enums (Runtime Validation)

CSS keyword values need runtime validation:

```typescript
// ✅ Keywords - use Zod for runtime validation
export const namedColorSchema = z.enum([
  "red",
  "blue",
  "green",
  "transparent",
  "currentColor",
  // ... more colors
]);

export type NamedColor = z.infer<typeof namedColorSchema>;
```

---

## ❌ Don't Use Zod For:

### 1. Result Types (Pure TypeScript)

Result types are compile-time only:

- Never validated at runtime
- Internal infrastructure
- TypeScript provides perfect type safety

**Pattern:**

```typescript
// ✅ Result types - plain TypeScript
export type Result<T, E = Error> = { ok: true; value: T; error: undefined } | { ok: false; value: undefined; error: E };

export type ParseResult<T = unknown> =
  | { ok: true; value: T; property?: string; issues: Issue[] }
  | { ok: false; value?: undefined; property?: string; issues: Issue[] };
```

**Why not Zod:**

- No runtime validation needed
- TypeScript discriminated unions are perfect
- Zod adds overhead with no benefit
- These types never cross runtime boundaries

### 2. Helper Functions (Pure TypeScript)

Functions that manipulate Result types don't need Zod:

```typescript
// ✅ Helpers - plain TypeScript
export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value, error: undefined };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, value: undefined, error };
}
```

### 3. Issue Types (Pure TypeScript)

Issue tracking is internal infrastructure:

```typescript
// ✅ Issue types - plain TypeScript
export type Issue = {
  code: IssueCode;
  severity: "error" | "warning" | "info";
  message: string;
  property?: string;
  // ...
};

export type IssueCode = "invalid-value" | "invalid-syntax";
// ...
```

**Why not Zod:**

- Issues are created by our code (trusted)
- Never validated from external input
- TypeScript unions are sufficient

### 4. Utility Types (Pure TypeScript)

Internal type manipulation doesn't need Zod:

```typescript
// ✅ Utility types - plain TypeScript
export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;
export type Pretty<T> = { [K in keyof T]: T[K] } & {};
```

---

## 📐 Architecture Pattern

```
packages/
├── b_types/
│   ├── result.ts          ← Plain TypeScript (Result, ParseResult, etc.)
│   ├── color.ts           ← Zod schemas (hexColorSchema, rgbColorSchema)
│   ├── gradient.ts        ← Zod schemas (linearGradientSchema, etc.)
│   └── length.ts          ← Zod schemas (lengthSchema, angleSchema)
│
├── b_keywords/
│   └── color.ts           ← Zod enums (namedColorSchema)
│
├── b_parsers/
│   └── color/
│       └── hex.ts         ← Uses Zod schemas for validation
│
└── b_generators/
    └── color/
        └── hex.ts         ← Uses Zod inferred types
```

---

## 🎯 Decision Tree

**Question:** Should this use Zod?

1. **Is it an IR type (CSS value representation)?**
   - YES → ✅ Use Zod
   - NO → Continue

2. **Is it a CSS keyword enum?**
   - YES → ✅ Use Zod
   - NO → Continue

3. **Does it need runtime validation from external input?**
   - YES → ✅ Use Zod
   - NO → Continue

4. **Is it infrastructure/helpers/results?**
   - YES → ❌ Plain TypeScript
   - NO → Reconsider (might be missing something)

---

## 🔍 Example Comparison

### IR Type (Use Zod) ✅

```typescript
// ✅ Needs runtime validation
export const lengthSchema = z.object({
  value: z.number(),
  unit: z.enum(["px", "rem", "em", "vh", "vw", "%"]),
});

export type Length = z.infer<typeof lengthSchema>;

// Parser validates CSS against schema
const result = lengthSchema.safeParse(parsed);
```

### Result Type (Plain TypeScript) ✅

```typescript
// ✅ Compile-time only, no runtime validation
export type ParseResult<T = unknown> =
  | { ok: true; value: T; property?: string; issues: Issue[] }
  | { ok: false; value?: undefined; property?: string; issues: Issue[] };

// Never validated at runtime - TypeScript ensures correctness
function parseOk<T>(value: T): ParseResult<T> {
  return { ok: true, value, issues: [] };
}
```

---

## 📝 Summary

**Rule of thumb:**

- **Zod = Data** (IR schemas, keywords, external input)
- **TypeScript = Infrastructure** (Result types, helpers, utilities)

**Benefits:**

1. ✅ Clear separation of concerns
2. ✅ Zod only where runtime validation needed
3. ✅ No Zod overhead for internal types
4. ✅ TypeScript discriminated unions for Result types (perfect)
5. ✅ Schema composition works (Zod IR types)

---

**Status:** Guideline established. Result system will use plain TypeScript.
