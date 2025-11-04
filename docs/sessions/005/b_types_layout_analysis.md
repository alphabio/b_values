# Types Layout Analysis

## Current POC Structure (b_value)

```
src/core/types/
├── color.ts              # All color types in one file (12 variants)
├── color-stop.ts         # Color stop + list
├── gradient/
│   ├── linear.ts
│   ├── radial.ts
│   ├── conic.ts
│   ├── direction.ts
│   ├── radial-shape.ts
│   ├── radial-size.ts
│   └── index.ts
├── url.ts
└── ... (other types)
```

## Pattern from Existing Packages

### b_keywords (flat)

```
src/
├── named-colors.ts
├── named-colors.test.ts
├── color-interpolation.ts
├── color-interpolation.test.ts
└── index.ts
```

### b_units (flat)

```
src/
├── angle.ts
├── angle.test.ts
├── length.ts
├── length.test.ts
└── index.ts
```

## Key Observations

1. **POC uses subdirectory for gradients** - Complex types grouped together
2. **POC keeps all color variants in ONE file** - 525 lines, 12 color types
3. **Existing packages use FLAT structure** - Simple enums don't need nesting
4. **Tests are co-located** - Always next to implementation

## Decision Points

### Should we split color.ts into multiple files?

**Reasons to keep together:**

- All share common pattern (discriminated union on `kind`)
- Will be imported/used together frequently
- POC works well at 525 lines
- Single file for "all CSS color types" is intuitive

**Reasons to split:**

- Easier to navigate individual color spaces
- Better for PRs/diffs
- Clearer ownership of each color type
- Follows "one concept per file" principle

### Should we use subdirectories?

**For colors:**

- NO - Colors are flat enums that belong together
- Keep as `color/` subdirectory with separate files per color type

**For gradients:**

- YES - Gradients are complex with supporting types
- Keep gradient/ subdirectory from POC

**For supporting types:**

- NO - color-stop, url are standalone utilities
- Keep at root level

## Recommended Structure

```
packages/b_types/src/
├── result/                    # Existing
│   └── ...
├── color/                     # NEW: Split color types
│   ├── hex.ts
│   ├── hex.test.ts
│   ├── named.ts
│   ├── named.test.ts
│   ├── rgb.ts
│   ├── rgb.test.ts
│   ├── hsl.ts
│   ├── hsl.test.ts
│   ├── hwb.ts
│   ├── hwb.test.ts
│   ├── lab.ts
│   ├── lab.test.ts
│   ├── lch.ts
│   ├── lch.test.ts
│   ├── oklab.ts
│   ├── oklab.test.ts
│   ├── oklch.ts
│   ├── oklch.test.ts
│   ├── system.ts
│   ├── system.test.ts
│   ├── special.ts
│   ├── special.test.ts
│   ├── color-function.ts
│   ├── color-function.test.ts
│   ├── index.ts              # Union + exports
│   └── index.test.ts         # Union tests
├── color-stop.ts
├── color-stop.test.ts
├── gradient/                  # Keep POC structure
│   ├── direction.ts
│   ├── direction.test.ts
│   ├── linear.ts
│   ├── linear.test.ts
│   ├── radial.ts
│   ├── radial.test.ts
│   ├── radial-shape.ts
│   ├── radial-shape.test.ts
│   ├── radial-size.ts
│   ├── radial-size.test.ts
│   ├── conic.ts
│   ├── conic.test.ts
│   ├── index.ts              # Gradient union + exports
│   └── index.test.ts         # Gradient union tests
├── url.ts
├── url.test.ts
├── position.ts
├── position.test.ts
└── index.ts                   # Root exports
```

## Benefits of This Structure

1. **Discoverable** - Easy to find any color type
2. **Focused files** - Each file ~50-100 lines (maintainable)
3. **Testable** - Clear 1:1 mapping of impl to tests
4. **Logical grouping** - color/, gradient/ for complex types
5. **Consistent** - Follows Turborepo/monorepo best practices
6. **Scalable** - Easy to add new color spaces later

## Import Patterns

```typescript
// Consumer imports from package root
import { Color, hexColorSchema } from "@b/b_types";
import { LinearGradient } from "@b/b_types";

// Internal imports within b_types
import { hexColorSchema } from "./color/hex";
import { namedColorSchema } from "./color/named";
import { linearGradientSchema } from "./gradient/linear";
```

## Standard Pattern for Each Color Type

```typescript
// color/hex.ts
import { z } from "zod";

/**
 * CSS hex color value.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/hex-color}
 */
export const hexColorSchema = z.object({
  kind: z.literal("hex"),
  value: z.string().regex(/^#[0-9A-F]{6}([0-9A-F]{2})?$/),
});

export type HexColor = z.infer<typeof hexColorSchema>;
```

```typescript
// color/hex.test.ts
import { describe, expect, it } from "vitest";
import { hexColorSchema } from "./hex";

describe("hexColorSchema", () => {
  it("validates 6-digit hex", () => {
    // tests...
  });
});
```

```typescript
// color/index.ts
export * from "./hex";
export * from "./named";
// ... all color types

import { z } from "zod";
import { hexColorSchema } from "./hex";
import { namedColorSchema } from "./named";
// ... imports

export const colorSchema = z.union([
  hexColorSchema,
  namedColorSchema,
  // ... all variants
]);

export type Color = z.infer<typeof colorSchema>;
```

## Implementation Order

1. Start with **hex color** (simplest)
2. Add **named color** (uses keywords package)
3. Add **rgb, hsl** (common color spaces)
4. Complete remaining color spaces
5. Build color union in color/index.ts
6. Move to gradients (depends on colors)
7. Finally color-stop (depends on colors + gradients)
