# 🏆 The Gold Standard: Property Implementation

**Status:** ACTIVE
**Purpose:** Define the rigorous, non-negotiable standard for a "perfect" property implementation.

## 1. Architecture & Separation of Concerns

### 1.1. Keywords (`@b/keywords`)

- **Source of Truth:** All keyword enums MUST be defined in `@b/keywords`.
- **⛔ Anti-Pattern:** Defining `z.union` or `z.enum` in `types.ts` or `parser.ts`.
  - _Exception:_ Property-specific keywords used _only_ by this property (rare).
- **Schema Naming:** Must use `camelCase` + `Schema` suffix (e.g., `textAlignKeywordSchema`).
- **Export:** Must export both the Zod schema and the inferred TypeScript type.

### 1.2. Types (`types.ts`)

- **IR Schema:** Must define a Zod schema for the property's Intermediate Representation (IR).
- **Discriminated Unions:** If the property has multiple modes (e.g., keyword vs. length), use `z.discriminatedUnion("kind", ...)`.
- **CssValue Integration:** For values like lengths, percentages, or numbers, MUST use `CssValue` from `@b/types`.
- **⛔ Anti-Pattern:** Using `string` or `number` primitives for complex CSS values instead of `CssValue`.
- **Type Inference:** Must use `z.infer<typeof ...>` for all IR types.

### 1.3. Parsers (`parser.ts`)

- **Signature:** `(ast: csstree.Value) => ParseResult<PropertyIR>`
- **Delegation:** MUST delegate complex value parsing to `@b/parsers`.
- **⛔ Anti-Pattern:** Manually checking `node.type === "Dimension"` or parsing hex codes. Use `Parsers.Length` or `Parsers.Color`.
- **Utils Usage:** MUST use `Parsers.Utils.parseNodeToCssValue` for generic values (handles `var()`, `calc()`, `attr()` automatically).
- **Error Handling:** Must return `ok: false` with specific error codes for invalid input.
- **CSS-Wide Keywords:** Must handle `initial`, `inherit`, `unset`, `revert`, `revert-layer` (via `Keywords.cssWide`).

### 1.4. Generators (`generator.ts`)

- **Signature:** `(ir: PropertyIR) => GenerateResult`
- **Delegation:** MUST delegate value generation to `@b/generators` or `cssValueToCss` utility.
- **⛔ Anti-Pattern:** Manual string concatenation (e.g., `` `${val}px` ``). Use `Generators.Length.generate` or `cssValueToCss`.
- **Round Trip:** `generate(parse(input))` MUST produce semantically equivalent CSS.

### 1.5. Definitions (`definition.ts`)

- **`defineProperty`:** Must use the `defineProperty` helper.
- **Metadata:** Must include correct `syntax`, `inherited`, and `initial` values matching the CSS spec.

## 2. Code Patterns & Style

### 2.1. Parser Pattern (Keyword + Value)

```typescript
export function parseFoo(ast: csstree.Value): ParseResult<FooIR> {
  const node = ast.children.first;
  // 1. Validate node existence
  if (!node) return error...

  // 2. Try Keywords
  if (node.type === "Identifier") {
    // 2a. CSS-wide keywords
    if (Keywords.cssWide.safeParse(node.name).success) ...
    // 2b. Property-specific keywords
    if (Keywords.fooSchema.safeParse(node.name).success) ...
  }

  // 3. Try Values (Delegation)
  return Parsers.Utils.parseNodeToCssValue(node);
}
```

### 2.2. Generator Pattern

```typescript
export function generateFoo(ir: FooIR): GenerateResult {
  // 1. Handle Keywords
  if (ir.kind === "keyword") return generateOk(ir.value);

  // 2. Handle Values (Delegation)
  return generateOk(cssValueToCss(ir.value));
}
```

## 3. Testing Standards

- **Co-location:** Tests MUST be in `parser.test.ts` and `generator.test.ts` next to the source.
- **Coverage:**
  - ✅ Valid keywords
  - ✅ Valid values (lengths, colors, etc.)
  - ✅ CSS-wide keywords (`inherit`, etc.)
  - ✅ CSS Variables (`var(--foo)`) - via `CssValue` support
  - ❌ Invalid values (returns error)
  - ❌ Empty values (returns error)

## 4. File Structure

```
packages/b_declarations/src/properties/<property>/
├── definition.ts
├── generator.test.ts
├── generator.ts
├── index.ts
├── parser.test.ts
├── parser.ts
└── types.ts
```

## 5. Nuance Checklist (For Auditors)

Use this checklist to verify deep compliance:

- **[ ] No Local Enums:** Check `types.ts` for `z.union` or `z.enum`.
- **[ ] Schema Naming:** Check imports for `*Schema`.
- **[ ] Parser Delegation:** Check `parser.ts` for manual AST inspection of `Dimension`, `HexColor`, etc.
- **[ ] Generator Delegation:** Check `generator.ts` for template literals constructing CSS values.
- **[ ] Zero Handling:** Check if unitless `0` is handled correctly (via `CssValue`).
- **[ ] Index Exports:** Check `index.ts` exports `*` from all files.
