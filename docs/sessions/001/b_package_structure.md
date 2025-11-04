# b_values Package Structure

## Package Layout

```
packages/
├── b_keywords/          # CSS keyword enums and validators
├── b_types/             # Zod schemas for value types (Color, Length, Gradient, etc.)
├── b_units/             # Unit definitions and conversions
├── b_parsers/           # CSS string → IR parsers
├── b_generators/        # IR → CSS string generators
├── b_properties/        # Property-level schemas and parsers (NEW!)
├── b_values/            # Main umbrella package
└── typescript-config/   # Shared TS configs (already exists)
```

## Package Dependencies

```
b_keywords: zod
b_types: zod, b_keywords
b_units: zod
b_parsers: css-tree, b_types, b_keywords, b_units
b_generators: b_types, b_keywords, b_units
b_properties: zod, css-tree, b_types, b_parsers, b_generators
b_values: (re-exports all packages)
```

## Migration from b_value

### Phase 1: Core Infrastructure (Session 001)

1. Create all 7 packages with package.json
2. Set up internal dependencies
3. Create shared Result types

### Phase 2: Port Foundation (Session 001)

Port from b_value to new packages:

**b_keywords** ← `src/core/keywords/`

- All keyword files
- Keep test files
- Export index

**b_types** ← `src/core/types/`

- All type schemas
- Gradient schemas
- Color schemas
- Length, angle, etc.
- Export index

**b_units** ← `src/core/units/`

- Unit definitions
- Keep test files
- Export index

**Result system** → Share across packages

- Create `@b/result` or include in b_types
- ParseResult, GenerateResult
- Issue types

### Phase 3: background-image Full Stack (Session 001-002)

**b_parsers**
Port and adapt:

- `src/parse/gradient/` → gradient parsers
- `src/parse/color/` → color parsers (for color stops)
- `src/utils/` → shared parsing utilities
- Create `background-image` property parser

**b_generators**
Port and adapt:

- `src/generate/gradient/` → gradient generators
- `src/generate/color/` → color generators
- Create `background-image` property generator

**b_properties** (NEW!)
Create:

- `background-image/schema.ts` - Zod schema for property
- `background-image/parse.ts` - Parse declaration
- `background-image/generate.ts` - Generate declaration
- `declaration/parse.ts` - Generic declaration parser
- `declaration-block/parse.ts` - Parse multiple declarations
- `declaration-block/generate.ts` - Generate declaration block

**b_values** (umbrella)
Re-export everything:

```ts
export * as Keywords from "@b/keywords";
export * as Types from "@b/types";
export * as Units from "@b/units";
export * as Parse from "@b/parsers";
export * as Generate from "@b/generators";
export * as Properties from "@b/properties";
```

## API Surface

### Value Level (existing pattern)

```ts
import { Parse, Generate } from "@b/values";

// Parse individual gradient
const result = Parse.Gradient.Linear.parse("linear-gradient(red, blue)");

// Generate gradient
const css = Generate.Gradient.Linear.generate(linearGradientIR);
```

### Property Level (NEW pattern)

```ts
import { Properties } from "@b/values";

// Parse property declaration
const result = Properties.BackgroundImage.parse(
  "background-image: linear-gradient(red, blue), url(bg.png)"
);
// Returns: PropertyValue<BackgroundImageValue[]>

// Generate property declaration
const css = Properties.BackgroundImage.generate({
  property: "background-image",
  value: [gradientIR, urlIR],
});
// Returns: "background-image: linear-gradient(...), url(...)"
```

### Declaration Level (NEW pattern)

```ts
import { Properties } from "@b/values";

// Parse any declaration (auto-detect property)
const result = Properties.Declaration.parse("color: red");
// Returns: { property: "color", value: ColorIR }

const result2 = Properties.Declaration.parse(
  "background-image: linear-gradient(...)"
);
// Returns: { property: "background-image", value: [GradientIR] }
```

### Declaration Block Level (NEW pattern)

```ts
import { Properties } from "@b/values";

// Parse multiple declarations
const result = Properties.DeclarationBlock.parse(`
  background-color: #556;
  background-image: linear-gradient(...), radial-gradient(...);
  background-size: 80px 140px;
`);
// Returns: Map<CSSPropertyName, PropertyValueIR>

// Generate CSS from block
const css = Properties.DeclarationBlock.generate(blockIR);
```

## File Structure Example: background-image

```
packages/b_properties/src/background-image/
├── schema.ts           # Zod schema for BackgroundImageProperty
├── parse.ts            # Parse "background-image: ..."
├── generate.ts         # Generate from IR
├── parse.test.ts       # Tests
└── index.ts            # Exports
```

## Testing Strategy

Use `apps/basic` as playground:

```tsx
// apps/basic/src/routes/background-image.tsx
import { Properties } from "@b/values";

export default function BackgroundImageDemo() {
  const css =
    "background-image: linear-gradient(30deg, #445 12%, transparent 12.5%), url(pattern.png)";

  const parsed = Properties.BackgroundImage.parse(css);

  if (parsed.ok) {
    const generated = Properties.BackgroundImage.generate(parsed.value);
    // Round-trip test
    console.log({ original: css, generated });
  } else {
    console.error(parsed.issues);
  }
}
```

## Success Metrics

After Phase 3, we should have:

1. ✅ All 7 packages created
2. ✅ b_value code ported to new structure
3. ✅ background-image working end-to-end
4. ✅ Value, Property, Declaration, DeclarationBlock levels working
5. ✅ Tests passing
6. ✅ Playground app demonstrating usage
