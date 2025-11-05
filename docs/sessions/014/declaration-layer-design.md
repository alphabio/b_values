# CSS Declaration Layer Design

**Created:** 2025-11-04
**Package:** `@b/declarations`
**Status:** Planning

## Overview

The `@b/declarations` package is the final layer in the b_values architecture, responsible for parsing complete CSS declarations (property-value pairs) into strongly-typed intermediate representations (IR).

## Core Concept

A **CSS declaration** consists of:

- A **property** (e.g., `background-image`, `color`, `margin`)
- A **value** (e.g., `linear-gradient(...)`, `red`, `10px`)

This package maps property names to their appropriate value parsers and schemas.

## Architecture

```
CSS Declaration → Property Router → Value Parser(s) → Typed IR
```

### Dependencies

- `@b/parsers` - Value-level parsers (gradients, colors, lengths, etc.)
- `@b/types` - IR type definitions
- `@b/keywords` - Global and property-specific keyword handling
- `@b/generators` - IR → CSS string generation

## Package Structure

```
packages/b_declarations/
├── src/
│   ├── index.ts                 # Main exports
│   ├── router.ts                # Property name → parser mapping
│   ├── properties/              # Individual property implementations
│   │   ├── background-image.ts
│   │   ├── color.ts
│   │   ├── margin.ts
│   │   └── ...
│   └── utils/
│       ├── shorthand.ts         # Shorthand property expansion
│       └── validation.ts        # Cross-property validation
```

## API Design

### Basic Usage

```typescript
import { parseDeclaration } from "@b/declarations";

// Parse a complete declaration
const result = parseDeclaration({
  property: "background-image",
  value: "linear-gradient(45deg, red, blue)",
});

// Result type
type DeclarationResult = {
  property: string;
  ir: BackgroundImageIR;
  original: string;
};
```

### Property-Specific Parsers

```typescript
import { parseBackgroundImage } from "@b/declarations/properties";

const ir = parseBackgroundImage("linear-gradient(45deg, red, blue)");
// Returns: BackgroundImageIR (already defined in @b/types)
```

## Implementation Strategy

### Phase 1: Core Infrastructure

1. Property router/registry system
2. Base declaration parser
3. Error handling and validation framework

### Phase 2: Property Implementations

Start with high-value properties:

- `background-image` (already have gradient parsers)
- `color` properties (already have color parsers)
- Box model properties (`margin`, `padding`, `width`, `height`)
- Position properties

### Phase 3: Advanced Features

- Shorthand property expansion
- CSS-wide keywords (`inherit`, `initial`, `unset`, `revert`)
- Custom property handling (`--*`)
- Vendor prefix handling

## Key Design Decisions

### 1. Property Registration

```typescript
// Each property registers itself
export const backgroundImageProperty = defineProperty({
  name: "background-image",
  syntax: "<bg-image>#",
  parser: parseBackgroundImage,
  generator: generateBackgroundImage,
  inherited: false,
  initial: "none",
});
```

### 2. Shorthand Handling

```typescript
// Shorthands expand to longhands
parseDeclaration({
  property: "background",
  value: "red url(img.jpg) no-repeat",
});
// Returns multiple declarations:
// - background-color: red
// - background-image: url(img.jpg)
// - background-repeat: no-repeat
```

### 3. Global Keywords

All properties must handle:

- `inherit` - Use parent's computed value
- `initial` - Use property's initial value
- `unset` - Reset to inherited/initial
- `revert` - Roll back cascade

### 4. Type Safety

```typescript
// Strongly typed property-value pairs
type Declaration<P extends PropertyName> = {
  property: P;
  value: PropertyValueType<P>;
};

// Example
const decl: Declaration<"background-image"> = {
  property: "background-image",
  value: linearGradientIR, // Type-checked!
};
```

## Integration with Existing Packages

### With @b/parsers

```typescript
import { parseLinearGradient } from "@b/parsers/gradients";
import { parseColor } from "@b/parsers/color";

// Declaration layer composes these
export function parseBackgroundImage(value: string) {
  // Route to appropriate parser based on function name
  if (value.startsWith("linear-gradient")) {
    return parseLinearGradient(value);
  }
  // ... other image types
}
```

### With @b/types

```typescript
import type { BackgroundImageIR, ColorIR } from "@b/types";

// Declaration layer uses these types directly
export function parseColor(value: string): ColorIR {
  // Implementation
}
```

### With @b/generators

```typescript
import { generateLinearGradient } from "@b/generators";

// Generate CSS from IR
export function generateDeclaration(property: string, ir: any): string {
  return `${property}: ${generateValue(ir)};`;
}
```

## Testing Strategy

```typescript
describe("parseDeclaration", () => {
  it("parses background-image gradient", () => {
    const result = parseDeclaration({
      property: "background-image",
      value: "linear-gradient(red, blue)",
    });

    expect(result.ir.type).toBe("linear-gradient");
  });

  it("handles global keywords", () => {
    const result = parseDeclaration({
      property: "color",
      value: "inherit",
    });

    expect(result.ir.type).toBe("keyword");
    expect(result.ir.value).toBe("inherit");
  });
});
```

## Future Considerations

1. **CSS Custom Properties**: How to handle `var()` references
2. **Calculation**: Integration with `calc()`, `min()`, `max()`
3. **Container Queries**: Context-dependent values
4. **CSS Nesting**: Scoped property resolution
5. **Performance**: Caching frequently-parsed declarations

## Success Metrics

- Parse 100+ CSS properties accurately
- Type-safe property-value pairing
- Composable with existing parser/generator layers
- Clear error messages for invalid declarations
- Performance: <1ms per declaration parse

## Next Steps

1. Define property registry system
2. Implement core router
3. Create first property implementation (background-image)
4. Build test suite
5. Document property addition process
