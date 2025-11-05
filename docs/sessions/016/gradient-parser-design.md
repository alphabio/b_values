# Gradient Parser Design

## Analysis from Reference Implementation

### Key Learnings from `/b_value` Reference

**Architecture Patterns:**

1. **AST-first parsing** - Use `css-tree` for robust parsing, avoid regex
2. **Shared utilities** - Extract common patterns (comma splitting, function finding)
3. **Node-level parsing** - Parse directly from AST nodes, no string round-trips
4. **Incremental index tracking** - Parse sequentially with index management
5. **Strict error handling** - Fail fast with descriptive errors

**Quality Attributes:**

- Comprehensive JSDoc with examples
- Edge case handling (optional params, whitespace, validators)
- Type-safe with Zod schemas for validation
- Pure functions, no side effects

### Design Decisions

**DO:**

- ✅ Parse from `css-tree` AST nodes (no regex)
- ✅ Create utility layer for common operations (comma split, skip, find)
- ✅ Parse color stops from nodes (delegate to color parser)
- ✅ Handle optional parameters gracefully (direction, interpolation)
- ✅ Support both regular and repeating variants
- ✅ Comprehensive error messages
- ✅ Export both `parse()` (string) and `fromFunction()` (AST node)

**DON'T:**

- ❌ String manipulation / regex parsing
- ❌ Duplicate code between parsers
- ❌ Silent failures
- ❌ Incomplete error messages

## Implementation Plan

### Phase 1: Utility Layer

Create `@b/parsers/src/utils/ast/` with:

- `split-by-comma.ts` - Split nodes by comma operators
- `functions.ts` - Find function nodes, skip operators
- `index.ts` - Barrel export

### Phase 2: Color Stop Parser

Create `@b/parsers/src/gradient/color-stop.ts`:

- Parse color + optional position from nodes
- Delegate color parsing to existing parsers
- Handle length/percentage positions

### Phase 3: Linear Gradient

Create `@b/parsers/src/gradient/linear.ts`:

- Parse direction (angle, to-side, to-corner)
- Parse optional color interpolation
- Parse color stops
- Handle repeating variant

### Phase 4: Radial Gradient

Create `@b/parsers/src/gradient/radial.ts`:

- Parse shape (circle, ellipse)
- Parse size (keywords, explicit)
- Parse position
- Parse optional color interpolation
- Parse color stops

### Phase 5: Conic Gradient

Create `@b/parsers/src/gradient/conic.ts`:

- Parse from angle
- Parse at position
- Parse optional color interpolation
- Parse color stops

### Phase 6: Integration

- Export from `@b/parsers/src/gradient/index.ts`
- Export from `@b/parsers/src/index.ts`
- Update `background-image.ts` to use parsers
- Update `ImageLayer` type with proper gradient IR

## Quality Standards

- Every function has JSDoc with examples
- Edge cases tested
- Error messages are actionable
- Code follows existing patterns
- No TypeScript `any`
- No disabled lint rules
- All tests pass before commit
