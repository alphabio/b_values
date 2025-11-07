# Background Properties Refactor Plan

**Date:** 2025-11-08
**Approach:** Delete and recreate following established patterns

---

## Strategy

User insight: "It may be easier to delete them and recreate them following guidelines"

**Why this makes sense:**

- ✅ All 4 properties are simple (keyword-only)
- ✅ Clear patterns established (background-size as reference)
- ✅ Clean slate avoids migration complexity
- ✅ Forces strict adherence to new architecture
- ✅ Faster than careful migration

---

## Order of Operations

### Property 1: background-attachment (Simplest)

**Keywords:** scroll, fixed, local (3 values)
**Complexity:** Trivial - single keyword validation
**Time estimate:** 30 minutes

### Property 2: background-origin (Simple + Box Keywords)

**Keywords:** border-box, padding-box, content-box (3 values)
**Complexity:** Simple - introduces shared box keywords
**Time estimate:** 45 minutes (includes extracting box keywords)

### Property 3: background-clip (Uses Box Keywords)

**Keywords:** border-box, padding-box, content-box, text (4 values)
**Complexity:** Simple - extends box keywords with `text`
**Time estimate:** 30 minutes

### Property 4: background-repeat (Most Complex)

**Keywords:** repeat, space, round, no-repeat, repeat-x, repeat-y (6 values)
**Complexity:** Medium - shorthand forms (repeat-x, repeat-y) + explicit forms
**Time estimate:** 60 minutes

**Total estimated time:** ~2.5 hours

---

## Checklist Per Property

### Phase 1: Keywords (@b/keywords)

- [ ] Create keyword schema file (e.g., `bg-attachment.ts`)
- [ ] Define Zod union schema
- [ ] Export constant array (for runtime checks if needed)
- [ ] Export type
- [ ] Create test file
- [ ] Export from `index.ts`

### Phase 2: Types (@b/types)

- [ ] Create type schema file (e.g., `bg-attachment.ts`)
- [ ] Define value-level schema
- [ ] Define property-level schema (with CSS-wide keywords)
- [ ] Export types
- [ ] Create test file
- [ ] Export from `index.ts`

### Phase 3: Parser (@b/parsers)

- [ ] Create parser file (`background/attachment.ts`)
- [ ] Implement value parser (keyword validation)
- [ ] Use Zod schema from @b/keywords
- [ ] Export from `background/index.ts`
- [ ] Export from main `index.ts`

### Phase 4: Generator (@b/generators)

- [ ] Create generator file (`background/attachment.ts`)
- [ ] Implement value generator (trivial for keywords)
- [ ] Export from `background/index.ts`
- [ ] Export from main `index.ts`

### Phase 5: Property (@b/declarations)

- [ ] Update types.ts (re-export from @b/types)
- [ ] Update parser.ts (use createMultiValueParser, NO preParse for CSS-wide)
- [ ] Update generator.ts (thin orchestrator)
- [ ] Update tests (parser.test.ts, generator.test.ts)
- [ ] Verify definition.ts (should be unchanged)

### Phase 6: Validation

- [ ] Run tests: `just test`
- [ ] Run checks: `just check`
- [ ] Run build: `just build`
- [ ] Verify all green

---

## Deletion Steps

Before creating new versions:

1. **Delete old keyword/type files** (if they exist)

   ```bash
   # None exist currently - keywords/types are inline
   ```

2. **Keep these files** (will update, not delete)

   ```
   packages/b_parsers/src/background/attachment.ts
   packages/b_declarations/src/properties/background-attachment/
   ```

3. **Test before deleting**

   ```bash
   just test  # Ensure baseline is green
   ```

---

## Special Consideration: Box Keywords

**When doing background-origin (Property 2):**

Create shared box keywords:

```typescript
// packages/b_keywords/src/box.ts
export const boxKeywordSchema = z.union([z.literal("border-box"), z.literal("padding-box"), z.literal("content-box")]);
```

**Then:**

- `background-origin` uses `boxKeywordSchema` directly
- `background-clip` extends it: `z.union([boxKeywordSchema, z.literal("text")])`

**Future reuse:**

- `mask-origin`
- `mask-clip`
- Other box-related properties

---

## Success Criteria

For each property:

- ✅ Keywords in `@b/keywords` with Zod schema
- ✅ Types in `@b/types`
- ✅ Parser in `@b/parsers` using shared keywords
- ✅ Generator in `@b/generators`
- ✅ Property orchestrators thin and consistent
- ✅ All tests passing
- ✅ Follows HOW-TO-ADD-PROPERTY.md guide exactly

---

## Risk Mitigation

1. **Do one property at a time**
   - Commit after each successful property
   - Easy to rollback if issues

2. **Test continuously**
   - Run `just test` after each phase
   - Catch issues early

3. **Reference background-size**
   - Use as template for structure
   - Copy patterns, not code

4. **Keep generators simple**
   - Keywords → just return the keyword
   - No complex logic needed

---

## Commands to Run

```bash
# Before starting
just test && just check && just build

# After each property
just test
just check
git add -A
git commit -m "refactor(bg-attachment): recreate following patterns"

# Final validation
just test && just check && just build
```

---

**Status:** 📋 Plan Ready - Awaiting Go/No-Go Decision

**Estimated total time:** 2.5 hours
**Approach:** Delete and recreate (clean slate)
**Order:** attachment → origin (+ box keywords) → clip → repeat
