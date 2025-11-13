# Utilities

**Reusable parsing/generation logic for CSS shorthands and complex structures.**

## Philosophy

This directory contains **utilities, not properties**. Code here:

- ✅ **IS** reusable parsing/generation logic
- ✅ **IS** useful for implementing other properties
- ✅ **CAN** parse shorthand syntax
- ❌ **NOT** registered in `PROPERTY_DEFINITIONS`
- ❌ **NOT** exposed as public property API

## When to Use Utilities vs Properties

### Use `utilities/` when:

1. **Shorthand Property**: Property expands to multiple longhands via `b_short`
   - Example: `background-position` → `-x`, `-y`
   - Keep parsing logic as utility, let `b_short` handle expansion

2. **Reusable Structure**: Parsing logic used by multiple properties
   - Example: `box-sides` (TRBL) used by `padding`, `margin`, `border-width`, etc.
   - Example: `box-corners` used by `border-radius`

3. **Complex Type**: Shared complex type that needs specialized parsing
   - Example: `position` (4-value syntax with edge+offset)

### Use `properties/` when:

1. **Longhand Property**: Atomic property that cannot be expanded further
   - Example: `background-color`, `padding-top`

2. **Registered**: Property should be in `PROPERTY_DEFINITIONS`

3. **Public API**: Property is part of the public parse/generate API

## Structure

Each utility follows similar structure to properties:

```
utilities/{name}/
├── types.ts       # IR types
├── parser.ts      # Parsing logic
├── generator.ts   # Generation logic
├── index.ts       # Exports
└── README.md      # Usage documentation
```

## Current Utilities

### `position/`

**Original**: `background-position` shorthand  
**Purpose**: Parse CSS `<position>` values with 1/2/3/4-value syntax  
**Used by**: Internal gradient position parsing, future position-based properties

**Why it's a utility:**

- `background-position` is a shorthand (expands to `-x`, `-y` via `b_short`)
- But parsing logic is valuable for gradients and other position values
- Should NOT be registered as a property

## Integration with b_short

**Workflow:**

1. User inputs: `background-position: top 20px left 15%`
2. `b_short.expand()` → `background-position-x: left 15%`, `background-position-y: top 20px`
3. `b_values` parses the **longhand** properties (future implementation)

**Utilities provide:**

- Internal parsing logic for complex types
- Shared code for multiple properties
- Foundation for future property implementations

## Future Utilities

### `box-sides/`

TRBL directional parsing (1-4 value syntax)  
Used by: `padding`, `margin`, `border-width`, `border-style`, `border-color`

### `box-corners/`

Corner-based parsing (1-4 value syntax with optional `/` for elliptical)  
Used by: `border-radius`

### `border-side/`

Border side parsing (width, style, color)  
Used by: `border-top`, `border-right`, `border-bottom`, `border-left`

## ADR

**Decision**: Separate utilities from properties to maintain clear boundary between shorthand expansion (b_short) and longhand parsing (b_values).

**Rationale**:

- **Single Responsibility**: b_values parses longhands only
- **No Duplication**: b_short already handles shorthand expansion
- **Reusability**: Parsing logic still available as utilities
- **Clear API**: Only longhands in `PROPERTY_DEFINITIONS`

**Trade-offs**:

- ✅ Clear separation of concerns
- ✅ Prevents shorthand/longhand confusion
- ✅ Reusable parsing logic
- ⚠️ Extra directory structure
- ⚠️ Need to document when to use utilities vs properties

**Status**: ✅ APPROVED (Session 071)
