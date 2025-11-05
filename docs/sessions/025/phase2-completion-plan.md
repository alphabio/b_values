# Phase 2 Completion: Tasks 2.7 & 2.8

## What's Missing

ADR-002 promises semantic validation with warnings, but generators currently only do schema validation. We need to add **range checking** and **semantic warnings**.

## Implementation

### Task 2.7: Semantic Validation with Warnings

Add validation helpers that check semantic correctness and return warnings (not errors).

**Create:** `packages/b_utils/src/validation/semantic.ts`

```typescript
import { type Issue, createWarning } from "@b/types";

/**
 * Check if a numeric value is in expected range.
 * Returns warning if out of range, undefined if OK.
 */
export function checkRange(
  value: number,
  min: number,
  max: number,
  context: {
    field: string;
    unit?: string;
    typeName?: string;
  }
): Issue | undefined {
  if (value < min || value > max) {
    const unit = context.unit ?? "";
    return createWarning(
      "invalid-value",
      `${context.field} value ${value}${unit} is out of valid range ${min}-${max}${unit}`,
      {
        suggestion: `Use a value between ${min}${unit} and ${max}${unit}`,
        path: [context.field],
      }
    );
  }
  return undefined;
}

/**
 * Check if percentage is in 0-100 range.
 */
export function checkPercentageRange(value: number, field: string): Issue | undefined {
  return checkRange(value, 0, 100, { field, unit: "%" });
}

/**
 * Check if alpha is in 0-1 range.
 */
export function checkAlphaRange(value: number, field: string): Issue | undefined {
  return checkRange(value, 0, 1, { field });
}
```

### Task 2.8: Range Checking in Generators

Update generators to validate ranges and emit warnings.

**Pattern (RGB example):**

```typescript
export function generate(color: unknown): GenerateResult {
  // 1. Schema validation (existing)
  const validation = rgbColorSchema.safeParse(color);
  if (!validation.success) {
    return generateErr(
      zodErrorToIssues(validation.error, {
        typeName: "RGBColor",
        property: "color",
      }),
      "rgb-color"
    );
  }

  const { r, g, b, alpha } = validation.data;

  // 2. Semantic validation (NEW)
  const warnings: Issue[] = [];

  // Check RGB components
  if (r.kind === "literal") {
    const warning = checkRange(r.value, 0, 255, { field: "r", typeName: "RGBColor" });
    if (warning) warnings.push(warning);
  }
  if (g.kind === "literal") {
    const warning = checkRange(g.value, 0, 255, { field: "g", typeName: "RGBColor" });
    if (warning) warnings.push(warning);
  }
  if (b.kind === "literal") {
    const warning = checkRange(b.value, 0, 255, { field: "b", typeName: "RGBColor" });
    if (warning) warnings.push(warning);
  }

  // Check alpha if present
  if (alpha?.kind === "literal") {
    const warning = checkAlphaRange(alpha.value, "alpha");
    if (warning) warnings.push(warning);
  }

  // 3. Generate CSS (existing)
  const rgbPart = `${cssValueToCss(r)} ${cssValueToCss(g)} ${cssValueToCss(b)}`;

  let result: GenerateResult;
  if (alpha !== undefined) {
    result = generateOk(`rgb(${rgbPart} / ${cssValueToCss(alpha)})`);
  } else {
    result = generateOk(`rgb(${rgbPart})`);
  }

  // 4. Add warnings (NEW)
  for (const warning of warnings) {
    result = addGenerateIssue(result, warning);
  }

  return result;
}
```

## Generators to Update

1. **RGB** - r/g/b (0-255), alpha (0-1)
2. **HSL** - h (0-360), s/l (0-100%), alpha (0-1)
3. **HWB** - h (0-360), w/b (0-100%), alpha (0-1)
4. **LAB** - l (0-100), a/b (-125 to 125), alpha (0-1)
5. **LCH** - l (0-100), c (0-150), h (0-360), alpha (0-1)
6. **OKLCH** - l (0-1), c (0-0.4), h (0-360), alpha (0-1)
7. **OKLAB** - l (0-1), a/b (-0.4 to 0.4), alpha (0-1)
8. **Color** - (delegates to above, no changes needed)

## Tests

```typescript
it("should warn for out-of-range RGB values", () => {
  const result = generate({
    kind: "rgb",
    r: lit(-255),
    g: lit(128),
    b: lit(500),
  });

  expect(result.ok).toBe(true); // Still generates
  expect(result.value).toBe("rgb(-255 128 500)");
  expect(result.issues).toHaveLength(2);
  expect(result.issues[0]).toMatchObject({
    severity: "warning",
    code: "invalid-value",
    message: expect.stringContaining("out of valid range"),
    path: ["r"],
  });
});

it("should not warn for valid RGB values", () => {
  const result = generate({
    kind: "rgb",
    r: lit(255),
    g: lit(128),
    b: lit(0),
  });

  expect(result.ok).toBe(true);
  expect(result.issues).toHaveLength(0);
});
```

## Success Criteria

- [ ] semantic.ts validation helpers created
- [ ] RGB generator updated with range checks
- [ ] HSL generator updated
- [ ] Other color generators updated
- [ ] Tests pass for warnings
- [ ] `-255` generates with warning
- [ ] Valid values generate without warning
- [ ] All 953 tests still pass
