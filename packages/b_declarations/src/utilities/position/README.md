# Position Utility

**Parse CSS `<position>` values with full 1/2/3/4-value syntax support.**

## Why This Is a Utility

`background-position` is a **shorthand property** that expands to:

- `background-position-x`
- `background-position-y`

Via `b_short`:

```typescript
expand("background-position: top 20px left 15%");
// → "background-position-x: left 15%;\nbackground-position-y: top 20px;"
```

**This utility provides the parsing logic without registering as a property.**

## Usage

```typescript
import { parseBackgroundPosition } from "@b/declarations/utilities/position";

// Parse position value
const result = parseBackgroundPosition(cssValue);
// result: { kind: "list", values: [Position2D, Position2D, ...] }
```

## Syntax Support

Supports full CSS `<position>` syntax:

### 1-value

```css
center         → { horizontal: center, vertical: center }
left           → { horizontal: left, vertical: center }
top            → { horizontal: center, vertical: top }
50%            → { horizontal: 50%, vertical: center }
```

### 2-value

```css
left top       → { horizontal: left, vertical: top }
50% 75%        → { horizontal: 50%, vertical: 75% }
center bottom  → { horizontal: center, vertical: bottom }
```

### 3-value (edge-offset)

```css
left 15% top   → { horizontal: { edge: left, offset: 15% }, vertical: top }
center top 20px → { horizontal: center, vertical: { edge: top, offset: 20px } }
```

### 4-value (full edge-offset)

```css
left 15% top 20px    → { horizontal: { edge: left, offset: 15% }, vertical: { edge: top, offset: 20px } }
top 20px left 15%    → { horizontal: { edge: left, offset: 15% }, vertical: { edge: top, offset: 20px } }
right 10% bottom 5px → { horizontal: { edge: right, offset: 10% }, vertical: { edge: bottom, offset: 5px } }
```

**Note**: 4-value syntax is **order-independent** - the parser determines which pair is horizontal vs vertical based on the edge keywords.

## Implementation History

- **Session 040**: Implemented 4-value syntax with edge+offset structure
- **Session 068**: Identified as shorthand, documented need to move to utilities
- **Session 071**: Moved to utilities, removed from property registry

## Integration with b_short

**Correct workflow:**

1. User: `background-position: top 20px left 15%`
2. **b_short**: Expands to longhands
   - `background-position-x: left 15%`
   - `background-position-y: top 20px`
3. **b_values**: Parses individual longhand properties (future)

**This utility:**

- Provides parsing logic for `<position>` type
- Can be used internally for gradients, masks, etc.
- **Not exposed as a registered property**

## Future

When implementing `background-position-x` and `background-position-y`:

- Create proper longhand properties in `properties/`
- Can reference this utility for shared logic
- Or implement directly with simpler single-axis parsing

## See Also

- [CSS Backgrounds Level 3 - Position](https://www.w3.org/TR/css-backgrounds-3/#typedef-bg-position)
- [MDN: position_value](https://developer.mozilla.org/en-US/docs/Web/CSS/position_value)
- `@b/parsers/src/position.ts` - Core position parser
- `@b/generators/src/position.ts` - Core position generator
