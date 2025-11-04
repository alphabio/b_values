# b_values Architecture Analysis

## Current State

### b_value (existing)

- **Purpose**: CSS values parser/generator (bidirectional)
- **Scope**: Individual CSS **values** (gradients, colors, lengths, etc.)
- **Architecture**:
  - `src/core/types/` - Zod schemas for IR types
  - `src/core/keywords/` - CSS keyword enums
  - `src/core/units/` - Length, angle, time units
  - `src/parse/` - CSS string → IR parsers
  - `src/generate/` - IR → CSS string generators
- **API**:

  ```ts
  Parse.Gradient.Radial.parse("radial-gradient(red, blue)");
  Generate.Gradient.Radial.generate(ir);
  ```

### b_style (consuming project)

- **Purpose**: CSS stylesheet editor/builder
- **Scope**: Full CSS **properties** and **declarations**
- **Current Problem**:
  - Parses entire declaration lists: `background-color: #556; background-image: ...;`
  - Needs to parse complex multi-value properties
  - Currently uses ad-hoc parsing (string manipulation + csstree)
  - No structured IR for property values

## The Gap

b_value handles **individual values**, but b_style needs to parse **entire properties**.

Example from your use case:

```css
div#el1 {
  background-color: #556;
  background-image: linear-gradient(...), linear-gradient(...);
  background-size: 80px 140px;
  background-position: 0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px;
}
```

Each property has:

- Multiple values (comma-separated layers)
- Different value types per property
- Shorthand/longhand resolution

## Solution: b_values

### Goal

**World-class CSS Values ↔ IR library** with strongly-typed Zod schemas for ALL CSS property values.

### Scope

1. **CSS Value Types** (from b_value):

   - Colors, lengths, angles, gradients, etc.
   - Keywords per property
   - Units and percentages

2. **CSS Property Schemas** (NEW):

   - Schema for EACH longhand property
   - Parse: property name + value string → typed IR
   - Generate: typed IR → CSS declaration
   - Handle multi-value (comma/space-separated)

3. **Context-Aware Parsing** (NEW):

   ```ts
   parse(CSS, {
     context: "value"           // Just parse a value
            | "declaration"      // Parse "prop: value"
            | "declarationList"  // Parse multiple declarations
            | "stylesheet"       // Parse full stylesheet
   }) -> IR
   ```

### API Design

```ts
// Value-level (from b_value)
Parse.Gradient.parse("linear-gradient(red, blue)");
Generate.Gradient.generate(ir);

// Property-level (NEW in b_values)
Parse.Property.parse("background-image: linear-gradient(red, blue)");
// Returns: { property: "background-image", value: [GradientIR] }

Generate.Property.generate({
  property: "background-image",
  value: [gradientIR1, gradientIR2],
});
// Returns: "background-image: linear-gradient(...), linear-gradient(...)"

// Declaration list (NEW in b_values)
Parse.DeclarationList.parse(`
  background-color: #556;
  background-image: linear-gradient(...);
`);
// Returns: Map<PropertyName, PropertyIR>

Generate.DeclarationList.generate(propertyMap);
// Returns: CSS declaration block string
```

### Monorepo Structure

```
b_values/
├── packages/
│   ├── b_keywords/        # CSS keywords (enums, sets)
│   ├── b_types/           # Core value types (color, length, angle)
│   ├── b_units/           # Unit definitions and conversions
│   ├── b_parsers/         # Value parsers (CSS → IR)
│   ├── b_generators/      # Value generators (IR → CSS)
│   ├── b_properties/      # Property schemas (NEW!)
│   └── b_values/          # Main export (umbrella)
│
└── apps/
    └── playground/        # Testing/demo app
```

### Why Monorepo?

1. **Clear Separation**: Keywords vs Types vs Units vs Parsers
2. **Tree-shakeable**: Import only what you need
3. **Independent Versioning**: Update parsers without touching types
4. **Shared Dependencies**: All packages use same Zod/css-tree versions

### Migration Path

1. **Phase 1**: Port b_value code into monorepo packages

   - `b_keywords` ← `src/core/keywords`
   - `b_types` ← `src/core/types`
   - `b_units` ← `src/core/units`
   - `b_parsers` ← `src/parse`
   - `b_generators` ← `src/generate`

2. **Phase 2**: Add property schemas (`b_properties`)

   - Schema for each longhand property
   - Multi-value handling (arrays)
   - Shorthand expansion logic

3. **Phase 3**: Add context-aware parsing

   - Declaration parser
   - DeclarationList parser
   - Stylesheet parser (optional)

4. **Phase 4**: Integrate into b_style
   - Replace ad-hoc parsing with b_values
   - Use typed IR throughout editor

### IR Design Consideration

**Question**: What should the IR look like?

**Option A**: Value-only IR (current b_value approach)

```ts
type IR = GradientIR | ColorIR | LengthIR | ...
```

**Option B**: Property-aware IR (needed for b_style)

```ts
type PropertyIR = {
  property: CSSPropertyName;
  value: ValueIR | ValueIR[]; // Single or multi-value
};

type DeclarationBlockIR = Map<CSSPropertyName, ValueIR[]>;
```

**Recommendation**: Support BOTH

- Value-level IR (for simple use cases)
- Property-level IR (for editor use cases)

### Next Steps

1. **Confirm approach** with you
2. **Set up monorepo packages** (copy structure from template)
3. **Port b_value code** into packages
4. **Design property schema system**
5. **Implement context-aware parsing**
6. **Test with b_style integration**

## Key Design Decisions

1. ✅ **Monorepo**: Clear separation, tree-shakeable
2. ✅ **Zod schemas**: Type-safe, runtime validation
3. ✅ **Bidirectional**: Parse AND generate
4. ⚠️ **Property schemas**: Need to define per-property types
5. ⚠️ **Context parsing**: Multi-level (value/decl/list/sheet)
6. ⚠️ **Shorthand handling**: Complex (e.g., `background` → longhands)

## Questions to Resolve

1. **Shorthand properties**: Parse only? Or also generate?
2. **Invalid CSS**: How much tolerance? Strict vs permissive?
3. **CSS Tree dependency**: Keep css-tree or build custom parser?
4. **Performance**: Priority? (b_value has benchmarks)
5. **Browser compatibility**: Target which CSS spec levels?
