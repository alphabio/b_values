# Architecture Improvements Roadmap

Based on comprehensive review (2025-01-11). Current state: **Production-ready foundation, 2414 tests passing**.

## Status: GOOD ✅

Architecture is solid and ready to scale to 50+ properties. Key wins:

- Clean layer separation (@b/types, @b/parsers, @b/generators, @b/declarations)
- PropertyRegistry + PropertyIRMap auto-generation
- Type-level contracts (_AssertMultiValueContract)
- Result/issues model is production-grade
- Universal functions + CssValue handling
- Contract test harness (runPropertyTests)

## Critical Improvements (Before Scaling)

### 1. Generator Responsibilities ⚠️ HIGH

**Problem:** Inconsistent responsibility for property field in issues.

**Solution:** Documented in `docs/GENERATOR_CONTRACT.md`

**Status:** ✅ Documented, 1 legacy case (background-image) is safe

**Action:** None required now, enforce for new properties

---

### 2. PropertyIRMap Type Safety 🔴 CRITICAL

**Problem:** No compile-time guarantee that:
- `defineProperty` calls match PropertyIRMap keys
- IR type `T` matches PropertyIRMap[name]

**Current:** Convention + auto-generation script

**Risk:** With 50+ properties, easy to:
- Forget to regenerate PropertyIRMap
- Mis-type property name
- Use wrong IR type

**Solutions (pick one):**

#### Option A: Stricter `defineProperty` Generic (Recommended)

```typescript
// In core/registry.ts
export function defineProperty<K extends keyof PropertyIRMap>(
  definition: PropertyDefinition<PropertyIRMap[K]> & { name: K }
): PropertyDefinition<PropertyIRMap[K]> {
  propertyRegistry.register(definition);
  return definition;
}
```

**Pros:**
- Compile-time check that name exists in PropertyIRMap
- Type inference from `name` ensures IR matches
- No manual type parameters needed

**Cons:**
- Must regenerate PropertyIRMap before adding property
- Chicken-egg: can't define property until it's in map

**Mitigation:**
- Add to PropertyIRMap manually first, use `unknown` temporarily
- Re-run generator after implementing types

#### Option B: Runtime Validation (Dev Mode)

```typescript
// In core/registry.ts
if (process.env.NODE_ENV === 'development') {
  // Validate IR against schema if available
  const schema = getSchemaFor(definition.name);
  if (schema && definition.generator) {
    // Test generator output matches schema
  }
}
```

**Pros:**
- No type gymnastics
- Catches mismatches at runtime

**Cons:**
- Only in dev mode
- Adds runtime cost

#### Option C: Meta-Test

```typescript
// In __tests__/property-registry.meta.test.ts
it("all registered properties exist in PropertyIRMap", () => {
  for (const name of propertyRegistry.getPropertyNames()) {
    type Check = typeof name extends keyof PropertyIRMap ? true : false;
    // This will fail if property not in map
  }
});
```

**Recommendation:** Start with Option C (meta-test), migrate to Option A when scaling.

---

### 3. ParseResult/GenerateResult Ergonomics 🟡 MEDIUM

**Problem:** Three-variant union is powerful but error-prone to narrow.

**Current:**
```typescript
type ParseResult<T> =
  | { ok: true; value: T; issues: Issue[]; property?: string }
  | { ok: false; value: T; issues: Issue[]; property: string }  // Partial
  | { ok: false; value?: never; issues: Issue[]; property: string }  // Total
```

**Issue:** Callers must check `ok` then `value !== undefined` for partial.

**Solutions:**

#### Option A: Helper Predicates
```typescript
export function isSuccess<T>(r: ParseResult<T>): r is SuccessResult<T>
export function isPartialFailure<T>(r: ParseResult<T>): r is PartialResult<T>
export function isTotalFailure<T>(r: ParseResult<T>): r is FailureResult<T>
```

#### Option B: Add `kind` Field
```typescript
type ParseResult<T> =
  | { kind: "success"; ok: true; value: T; ... }
  | { kind: "partial"; ok: false; value: T; ... }
  | { kind: "failure"; ok: false; ... }
```

**Recommendation:** Option A (helpers). Less breaking, opt-in.

---

## Medium Priority

### 4. allowedKeywords Duplication 🟡 MEDIUM

**Problem:** `definition.allowedKeywords` AND property parser both validate.

**Risk:** Drift if they disagree.

**Solutions:**
- Remove `allowedKeywords` validation from parser.ts (single source)
- OR: Generate property parsers from `allowedKeywords` (DRY)
- OR: Document as "pre-pass hint only"

**Recommendation:** Document current behavior, revisit when generating parsers.

---

### 5. generateValue String Escape Hatch 🟡 MEDIUM

**Problem:** `generateValue<T>(value: T | CssValue | string)` accepts raw strings.

**Risk:** Silent type mismatches get through.

**Solution:** Restrict to known call sites, document escape hatch.

**Recommendation:** Add JSDoc warning, revisit if issues arise.

---

## Low Priority (Polish)

### 6. isCssValue Whitelist 🟢 LOW

**Current:** Whitelist of CssValue kinds.

**Risk:** Non-CssValue IR using same `kind` names.

**Mitigation:** Already documented, low risk.

---

### 7. createMultiValueParser Property Label 🟢 LOW

**Current:** Returns `property: "multi-value"` in issues.

**Better:** Take `propertyName` config param.

**Status:** Not urgent, declaration layer already stamps correct property.

---

### 8. Color/Gradient Complexity 🟢 LOW

**Observation:** Background properties are heavy.

**Future:** Extract standard patterns as you add more properties.

**Recommendation:** Wait for 3-5 more properties, then refactor common patterns.

---

## Phase 1: Lock Down (Before Scaling)

1. ✅ Generator contract documented
2. ⏳ Add PropertyIRMap meta-test (Option C)
3. ⏳ Add ParseResult helper predicates
4. ⏳ Document allowedKeywords behavior

**ETA:** 2-3 hours

## Phase 2: Property Auto-Generation

Once Phase 1 complete:

1. Create property module template
2. Script: `new-property <name>` generates:
   - `types.ts` (IR schema)
   - `parser.ts` (using createMultiValueParser or similar)
   - `generator.ts` (following contract)
   - `definition.ts` (wired to registry)
   - `*.contract.test.ts` (using runPropertyTests)
3. Auto-update PropertyIRMap

**ETA:** 4-6 hours

## Phase 3: Scale to 50+

With template and contract enforcement, onboard:
- Font properties
- Border properties
- Flex/Grid properties
- Transform/Animation properties

**ETA:** 1-2 weeks (with automation)

---

## Decision Log

### Why Not Enforce Type Safety Now?

**Reason:** 2414 tests passing, architecture validated. Adding stricter types is risky before confirming patterns across more properties.

**Plan:** Add meta-tests first (low risk), migrate to strict types once we have 10-15 properties as validation.

### Why Document Generator Contract Instead of Enforcing?

**Reason:** Only 1 legacy case, new properties follow it. Enforcement would require changing GenerateResult type, high risk for low gain.

**Plan:** Enforce in template, validate in runPropertyTests.

---

## Success Criteria

**Phase 1 Complete When:**
- [ ] Meta-test validates PropertyIRMap alignment
- [ ] ParseResult helpers added
- [ ] allowedKeywords behavior documented
- [ ] All 2414+ tests still passing

**Phase 2 Complete When:**
- [ ] `new-property` script works
- [ ] Generated properties follow all contracts
- [ ] PropertyIRMap auto-updates

**Phase 3 Complete When:**
- [ ] 50+ properties implemented
- [ ] No architectural drift
- [ ] Type safety enforced at scale
