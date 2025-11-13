# Utilities Pattern

**CRITICAL: Utilities are NOT properties. They must NOT call `defineProperty()`.**

---

## The Rule

```typescript
// ❌ WRONG - This registers the shorthand in runtime registry
export const backgroundPosition = defineProperty<BackgroundPositionIR>({
  name: "background-position",
  parser: parseBackgroundPosition,
  generator: generateBackgroundPosition,
  // ...
});

// ✅ CORRECT - Export plain functions, no registration
export { parseBackgroundPosition } from "./parser";
export { generateBackgroundPosition } from "./generator";
export type { BackgroundPositionIR } from "./types";
```

---

## Why This Matters

### The Architecture

```
b_short (shorthands)  →  b_values (longhands)
    ↓                         ↓
utilities/            →  properties/
(NOT registered)         (registered in PROPERTY_DEFINITIONS)
```

### The Problem We Avoid

**If utilities call `defineProperty()`:**

1. ✅ Shorthand registered in **runtime** registry (`propertyRegistry`)
2. ❌ Shorthand NOT in **compile-time** type system (`PROPERTY_DEFINITIONS`)
3. ❌ **Two sources of truth** → type system lies
4. ❌ `parseDeclaration("background-position: ...")` works at runtime but TypeScript doesn't know

**With correct pattern:**

1. ✅ Utilities export plain functions
2. ✅ Only longhands in `PROPERTY_DEFINITIONS`
3. ✅ Single source of truth
4. ✅ Type system matches runtime

---

## Utility Structure

### Directory Layout

```
utilities/{name}/
├── types.ts       # IR types (NO keyword union needed)
├── parser.ts      # Export plain function: parse{Name}
├── generator.ts   # Export plain function: generate{Name}
├── index.ts       # Re-exports (NO definition.ts export)
└── README.md      # Usage docs
```

### Example: box-sides Utility

```typescript
// utilities/box-sides/types.ts
export type BoxSides<T> = {
  top: T;
  right: T;
  bottom: T;
  left: T;
};

// utilities/box-sides/parser.ts
export function parseBoxSides(
  ast: csstree.Value,
  itemParser: (node: csstree.CssNode) => ParseResult<T>
): ParseResult<BoxSides<T>> {
  // Parse 1-4 value syntax
  // Return { top, right, bottom, left }
}

// utilities/box-sides/generator.ts
export function generateBoxSides<T>(sides: BoxSides<T>, itemGenerator: (value: T) => GenerateResult): GenerateResult {
  // Generate shortest form (1-4 values)
}

// utilities/box-sides/index.ts
export * from "./types";
export * from "./parser";
export * from "./generator";
// ❌ NO: export * from "./definition";
```

---

## Usage in Longhands

```typescript
// properties/padding-top/parser.ts
import * as Parsers from "@b/parsers";

export function parsePaddingTop(ast: csstree.Value): ParseResult<PaddingTopIR> {
  const firstNode = ast.children.first;
  if (!firstNode) return parseErr(...);

  // Use core parser, not utility (utilities are for shorthands)
  const result = Parsers.Length.parseNode(firstNode);
  // ...
}
```

**Utilities are used by:**

- `b_short` expansion logic
- Internal parsing (gradients use position)
- Future property implementations

**Utilities are NOT used by:**

- Longhand property parsers (use `@b/parsers` directly)

---

## Scaling: Box Model Properties

### Future Utilities

#### `box-sides/`

**Shorthands:** `padding`, `margin`, `border-width`, `border-style`, `border-color`  
**Longhands:** `padding-top`, `padding-right`, `padding-bottom`, `padding-left` (×5 property groups)

```typescript
// utilities/box-sides/parser.ts
export function parseBoxSides(
  ast: csstree.Value,
  itemParser: (node: csstree.CssNode) => ParseResult<T>
): ParseResult<BoxSides<T>>;

// Usage in b_short:
import { parseBoxSides } from "@b/declarations/utilities/box-sides";

// Expand padding: 10px 20px → padding-top: 10px; padding-right: 20px; ...
```

#### `box-corners/`

**Shorthand:** `border-radius`  
**Longhands:** `border-top-left-radius`, `border-top-right-radius`, etc.

```typescript
// utilities/box-corners/parser.ts
export function parseBoxCorners(ast: csstree.Value): ParseResult<BoxCorners<T>>;
```

#### `border-side/`

**Shorthands:** `border-top`, `border-right`, `border-bottom`, `border-left`  
**Longhands:** `border-top-width`, `border-top-style`, `border-top-color`

```typescript
// utilities/border-side/parser.ts
export function parseBorderSide(ast: csstree.Value): ParseResult<{ width: T; style: T; color: T }>;
```

---

## Checklist: Adding New Utility

- [ ] Directory: `utilities/{name}/`
- [ ] Files: `types.ts`, `parser.ts`, `generator.ts`, `index.ts`, `README.md`
- [ ] ❌ **NO `definition.ts`** - do not call `defineProperty()`
- [ ] ✅ Export plain functions only
- [ ] ✅ Document why it's a utility in README.md
- [ ] ✅ Document which shorthands/longhands use it
- [ ] ✅ Add comment in `utilities/index.ts` about new utility

---

## Reference Implementation

See: `packages/b_declarations/src/utilities/position/`

- ✅ NO `definition.ts`
- ✅ Exports plain functions
- ✅ Clear README documenting shorthand vs longhand
- ✅ Not in `PROPERTY_DEFINITIONS`

---

## ADR Reference

**Session 071**: Established utilities pattern - shorthands vs longhands

**Decision**: Utilities do NOT call `defineProperty()`. They export parsing/generation logic only.

**Rationale**: Maintain single source of truth (`PROPERTY_DEFINITIONS`), prevent runtime/compile-time divergence.
