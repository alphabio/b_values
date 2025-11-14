# @b/values

**World-class CSS property value parser and generator library.**

Bidirectional transformation between CSS text and strongly-typed IR (Intermediate Representation).

## Philosophy

**Longhands only. No shorthands. Ever.**

This library parses and generates **longhand CSS properties only**. We do not support shorthand properties like `margin`, `padding`, `background`, `border`, etc.

For shorthand expansion, use [`b_short`](https://github.com/master-co/css/tree/main/packages/short) before passing to this library.

## Installation

```bash
npm install @b/values
# or
pnpm add @b/values
```

## Quick Start

```typescript
import * as B from "@b/values";

// Parse single declaration
const result = B.Declarations.parseDeclaration("margin-top: 10px");
if (result.ok) {
  console.log(result.value.ir);
  // { kind: "list", values: [{ kind: "literal", value: 10, unit: "px" }] }
}

// Parse declaration list (inline styles)
const list = B.Declarations.parseDeclarationList(`
  color: red;
  margin-top: 10px;
  padding-left: 20px;
`);
```

## API

### Parse

```typescript
// Single declaration
B.Declarations.parseDeclaration(css: string): ParseResult<DeclarationResult>

// Declaration list (inline styles)
B.Declarations.parseDeclarationList(css: string): ParseResult<DeclarationResult[]>
```

### Generate

```typescript
// Single declaration
B.Declarations.generateDeclaration(ir: DeclarationResult): GenerateResult<string>

// Declaration list
B.Declarations.generateDeclarationList(irs: DeclarationResult[]): GenerateResult<string>
```

## Shorthand Handling

**We reject shorthands:**

```typescript
B.Declarations.parseDeclaration("margin: 10px");
// { ok: false, issues: [{ code: "invalid-value", message: "Unknown CSS property: margin" }] }
```

**Use b_short for expansion:**

```typescript
import { expand } from "b_short";
import * as B from "@b/values";

// 1. Expand shorthand → longhands
const expanded = expand("margin: 10px");
// "margin-top: 10px; margin-right: 10px; margin-bottom: 10px; margin-left: 10px"

// 2. Parse longhands
const result = B.Declarations.parseDeclarationList(expanded);
```

## Supported Properties

55+ longhand properties across:

- **Box Model**: `margin-*`, `padding-*`, `border-*-width/style/color`
- **Background**: `background-color`, `background-image`, `background-position-*`, `background-size`, etc.
- **Visual**: `color`, `opacity`, `visibility`
- **Transform**: `transform`, `transform-origin`, `transform-style`, `perspective`
- **Animation**: `animation-*` (8 longhands)
- **Transition**: `transition-*` (4 longhands)
- **Blend**: `mix-blend-mode`, `background-blend-mode`

See full list: [Property Definitions](./src/properties/)

## Universal CSS Functions

All properties support universal CSS functions:

- `var()` - CSS Variables
- `calc()` - Math expressions
- `min()`, `max()`, `clamp()` - Math functions
- `attr()` - Attribute references
- `env()` - Environment variables

```typescript
B.Declarations.parseDeclaration("margin-top: var(--spacing, 10px)");
// ✅ Parsed as CssValue with fallback
```

## Architecture

```
@b/values (umbrella package)
  ├─ @b/keywords      → CSS keyword enums
  ├─ @b/types         → Zod schemas + IR types
  ├─ @b/units         → Unit definitions
  ├─ @b/parsers       → CSS → IR (low-level)
  ├─ @b/generators    → IR → CSS (low-level)
  └─ @b/declarations  → Property registry + parse/generate (high-level)
```

## Direct Package Imports

You can also import packages directly:

```typescript
import * as decl from "@b/declarations";
decl.parseDeclarationList("color: red; margin-top: 10px");
```

This is what we do internally and is fully supported.

## Why Longhands Only?

See [ADR 001: Longhands Only](../../docs/architecture/decisions/001-longhands-only.md)

**TLDR:** Shorthands have ambiguous parsing rules, cascade complexity, and maintenance burden. Longhands are explicit, composable, and precisely specified.

We built this library for clarity and correctness. If you need shorthands, expand them first with `b_short`.

## License

MIT
