# ADR 002: Rich Error Reporting - Implementation Plan

**Date:** 2025-11-05
**Session:** 023
**Status:** Ready for Implementation
**Priority:** CRITICAL - High DX Impact

---

## Executive Summary

This plan implements rich, actionable error reporting for the b_values library. We'll enhance error messages with precise context, visual source pointers, and helpful suggestions while staying true to our core principle: **we are a representation engine, not a validator**.

### Core Philosophy (Session 008)

```typescript
// THE GOLDEN RULE
ok = canRepresent(input); // ✅ Can we transform this?

// NOT
ok = isValidCSS(input); // ❌ Not our job
ok = willBrowserAccept(input); // ❌ Not our job
```

**What this means:**

- **`ok: true`** = Successfully represented as IR/CSS (even if semantically "invalid")
- **`ok: false`** = Cannot represent (syntax error, unknown structure, schema violation)
- **`issues`** = Helpful warnings and context (doesn't affect `ok` for warnings)

---

## What We're Building

### Before

```typescript
parseDeclaration("color: notarealcolor");
// → { ok: false, issues: [{ code: "invalid-value", message: "Unknown color" }] }

generate({ kind: "rgb", names: "red" }); // Typo
// → { ok: false, issues: [{ code: "invalid-ir", message: "Required" }] }
```

### After

```typescript
parseDeclaration("color: notarealcolor");
// → {
//   ok: true,  // ✅ We CAN represent this (it's a keyword)
//   value: { kind: "keyword", value: "notarealcolor" },
//   issues: [{
//     severity: "warning",  // Just a warning, not a failure
//     code: "unknown-keyword",
//     message: "Unknown color keyword: 'notarealcolor'",
//     suggestion: "Did you mean 'orange'?",
//     property: "color"
//   }]
// }

generate({ kind: "rgb", names: "red" }); // Typo
// → {
//   ok: false,  // ❌ Invalid IR structure
//   issues: [{
//     severity: "error",
//     code: "unrecognized_keys",
//     message: "Unrecognized key(s) in object: 'names'",
//     path: ["names"],
//     suggestion: "Did you mean 'name'?",
//     expected: "Valid keys: kind, name"
//   }]
// }
```

---

## Current State

### ✅ Foundation Complete

- **Session 022:** Zod validation in all generators
- **Session 023:** `.strict()` on all 24 schemas
- **Existing:** `zodErrorToIssues` utility in `b_utils`
- **Existing:** `validate.ts` with source formatting logic

### 🎯 Implementation Phases

1. **Phase 2 First** (Highest ROI) - Enhanced generator errors
2. **Phase 1 Second** - Source-aware parser errors
3. **Phase 3 Last** - Nested path propagation

---

## Phase 2: Rich Generator Errors (START HERE)

**Priority:** HIGHEST - Best ROI, foundation already in place
**Estimated Time:** 2-3 hours
**Complexity:** Low (mostly enhancement of existing code)

### Why This First?

- ✅ Foundation already exists (Zod + `.strict()`)
- ✅ Immediate value (catches typos, shows paths)
- ✅ No parser complexity
- ✅ Clear success criteria

---

### Task 2.1: Define Enhanced Issue Interface

**File:** `packages/b_types/src/result/issue.ts`

**Changes:**

```typescript
export interface Issue {
  code: IssueCode;
  severity: "error" | "warning" | "info";
  message: string;

  // NEW: Context fields (all optional for backward compatibility)
  property?: string; // CSS property name
  path?: (string | number)[]; // Path to error in IR
  suggestion?: string; // How to fix it
  expected?: string; // Expected type/value
  received?: string; // Actual type/value received
}
```

**Test:**

```typescript
// Verify all existing code still compiles
// New fields are optional
```

---

### Task 2.2: Enhance zodErrorToIssues

**File:** `packages/b_utils/src/zod/error.ts`

**Current:**

```typescript
export function zodErrorToIssues(error: ZodError): Issue[] {
  return error.issues.map((zodIssue) => ({
    code: "invalid-ir",
    message: zodIssue.message,
    severity: "error",
  }));
}
```

**Enhanced:**

```typescript
export interface ZodErrorContext {
  typeName?: string; // e.g., "RGBColor"
  property?: string; // e.g., "background-color"
  parentPath?: (string | number)[]; // For nested structures
}

export function zodErrorToIssues(error: ZodError, context?: ZodErrorContext): Issue[] {
  return error.issues.map((zodIssue) => {
    const fullPath = [...(context?.parentPath ?? []), ...zodIssue.path];

    return {
      code: mapZodCode(zodIssue.code),
      severity: "error",
      message: formatZodMessage(zodIssue, context),
      property: context?.property,
      path: fullPath.length > 0 ? fullPath : undefined,
      suggestion: generateSuggestion(zodIssue, context),
      expected: extractExpected(zodIssue),
      received: extractReceived(zodIssue),
    };
  });
}

// Helper: Map Zod codes to our Issue codes
function mapZodCode(zodCode: string): IssueCode {
  const mapping: Record<string, IssueCode> = {
    invalid_type: "invalid-ir",
    unrecognized_keys: "unrecognized-keys",
    invalid_union: "invalid-union",
    too_small: "missing-value",
    too_big: "invalid-value",
  };
  return mapping[zodCode] ?? "invalid-ir";
}

// Helper: Format message with context
function formatZodMessage(issue: ZodIssue, context?: ZodErrorContext): string {
  const pathStr = issue.path.length > 0 ? ` at '${issue.path.join(".")}'` : "";
  const typeStr = context?.typeName ? ` in ${context.typeName}` : "";

  switch (issue.code) {
    case "invalid_type":
      if (issue.received === "undefined") {
        return `Missing required field${pathStr}${typeStr}`;
      }
      return `Invalid type${pathStr}${typeStr}: expected ${issue.expected}, got ${issue.received}`;

    case "unrecognized_keys":
      return `Unrecognized key(s)${typeStr}: ${issue.keys.map((k) => `'${k}'`).join(", ")}`;

    default:
      return `${issue.message}${pathStr}${typeStr}`;
  }
}

// Helper: Generate actionable suggestions
function generateSuggestion(issue: ZodIssue, context?: ZodErrorContext): string | undefined {
  switch (issue.code) {
    case "invalid_type":
      if (issue.received === "undefined") {
        const field = issue.path[issue.path.length - 1];
        return `'${field}' is required${context?.typeName ? ` in ${context.typeName}` : ""}`;
      }
      return `Expected ${issue.expected}, received ${issue.received}`;

    case "unrecognized_keys":
      const unknownKey = issue.keys[0];
      // TODO Task 2.4: Use Levenshtein for "Did you mean?"
      return `Check for typos in '${unknownKey}'`;

    default:
      return undefined;
  }
}

// Helper: Extract expected value/type
function extractExpected(issue: ZodIssue): string | undefined {
  if ("expected" in issue) return String(issue.expected);
  return undefined;
}

// Helper: Extract received value/type
function extractReceived(issue: ZodIssue): string | undefined {
  if ("received" in issue) return String(issue.received);
  return undefined;
}
```

**Tests:**

```typescript
describe("zodErrorToIssues", () => {
  it("should map invalid_type error", () => {
    const zodError = new ZodError([
      {
        code: "invalid_type",
        expected: "string",
        received: "undefined",
        path: ["name"],
        message: "Required",
      },
    ]);

    const issues = zodErrorToIssues(zodError, { typeName: "RGBColor" });

    expect(issues[0]).toMatchObject({
      code: "invalid-ir",
      severity: "error",
      message: expect.stringContaining("Missing required field"),
      path: ["name"],
      suggestion: expect.stringContaining("'name' is required"),
    });
  });

  it("should map unrecognized_keys error", () => {
    const zodError = new ZodError([
      {
        code: "unrecognized_keys",
        keys: ["positon"],
        path: [],
        message: "Unrecognized key(s): positon",
      },
    ]);

    const issues = zodErrorToIssues(zodError);

    expect(issues[0]).toMatchObject({
      code: "unrecognized-keys",
      message: expect.stringContaining("positon"),
    });
  });
});
```

---

### Task 2.3: Update All Generators to Use Enhanced Error Translation

**Pattern (apply to all generators):**

```typescript
// packages/b_generators/src/color/rgb.ts
export function generate(color: unknown): GenerateResult {
  const validation = rgbColorSchema.safeParse(color);

  if (!validation.success) {
    return generateErr(
      zodErrorToIssues(validation.error, {
        typeName: "RGBColor",
        property: "rgb-color",
      })
    );
  }

  const validated = validation.data;
  // ... generation logic ...
}
```

**Files to Update:**

- `packages/b_generators/src/color/*.ts` (7 files - already have pattern from Session 022)
- `packages/b_generators/src/gradient/*.ts` (3 files)
- `packages/b_generators/src/length.ts`
- `packages/b_generators/src/angle.ts`
- `packages/b_generators/src/percentage.ts`
- `packages/b_generators/src/url.ts`
- `packages/b_generators/src/position.ts`

**Validation:**

```typescript
// For each generator, add test
it("should provide rich error context for invalid IR", () => {
  const result = generate({ kind: "rgb", r: lit(255) }); // Missing g, b

  expect(result.ok).toBe(false);
  expect(result.issues[0]).toMatchObject({
    code: "invalid-ir",
    message: expect.stringContaining("Missing required field"),
    path: expect.arrayContaining(["g"]),
    suggestion: expect.stringContaining("required"),
  });
});
```

---

### Task 2.4: Add Levenshtein Distance for "Did You Mean?" Suggestions

**File:** `packages/b_utils/src/string/levenshtein.ts` (NEW)

```typescript
/**
 * Calculate Levenshtein distance between two strings.
 * Used for "Did you mean X?" suggestions.
 *
 * @see https://en.wikipedia.org/wiki/Levenshtein_distance
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  // Initialize first column and row
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Find closest match from a list of valid options.
 * Returns undefined if no close match found.
 *
 * @param input - The string to match
 * @param validOptions - List of valid options
 * @param maxDistance - Maximum distance to consider (default: 3)
 */
export function findClosestMatch(input: string, validOptions: string[], maxDistance = 3): string | undefined {
  let closestMatch: string | undefined;
  let minDistance = Number.POSITIVE_INFINITY;

  for (const option of validOptions) {
    const distance = levenshteinDistance(input.toLowerCase(), option.toLowerCase());

    if (distance < minDistance && distance <= maxDistance) {
      minDistance = distance;
      closestMatch = option;
    }
  }

  return closestMatch;
}
```

**Tests:**

```typescript
describe("levenshteinDistance", () => {
  it("should calculate distance correctly", () => {
    expect(levenshteinDistance("kitten", "sitting")).toBe(3);
    expect(levenshteinDistance("hello", "hello")).toBe(0);
    expect(levenshteinDistance("", "test")).toBe(4);
  });
});

describe("findClosestMatch", () => {
  const validColors = ["red", "blue", "green", "orange", "purple"];

  it("should find close match for typo", () => {
    expect(findClosestMatch("gren", validColors)).toBe("green");
    expect(findClosestMatch("ornge", validColors)).toBe("orange");
    expect(findClosestMatch("bleu", validColors)).toBe("blue");
  });

  it("should return undefined for distant strings", () => {
    expect(findClosestMatch("xyz", validColors)).toBeUndefined();
  });

  it("should handle case insensitivity", () => {
    expect(findClosestMatch("GREN", validColors)).toBe("green");
  });
});
```

**Update `zodErrorToIssues` to use it:**

```typescript
import { findClosestMatch } from "../string/levenshtein";

function generateSuggestion(issue: ZodIssue, context?: ZodErrorContext): string | undefined {
  switch (issue.code) {
    case "unrecognized_keys":
      const unknownKey = issue.keys[0];
      // Get valid keys from schema shape (if available in context)
      // For now, just suggest checking spelling
      // TODO: Pass valid keys in context
      return `Check for typos in '${unknownKey}'`;

    // ... other cases
  }
}
```

---

### Task 2.5: Integration Tests

**File:** `packages/b_declarations/src/integration.test.ts`

```typescript
describe("Rich Error Integration", () => {
  it("should provide rich error for invalid IR in generation", () => {
    const invalidColor = {
      kind: "rgb",
      r: { kind: "literal", value: 255 },
      g: { kind: "literal", value: 128 },
      // Missing 'b'
    };

    const result = RGB.generate(invalidColor);

    expect(result).toMatchObject({
      ok: false,
      issues: [
        {
          severity: "error",
          code: "invalid-ir",
          message: expect.stringContaining("Missing required field"),
          path: ["b"],
          suggestion: expect.stringContaining("required"),
          expected: expect.any(String),
          received: "undefined",
        },
      ],
    });
  });

  it("should provide helpful suggestion for typos", () => {
    const typoColor = {
      kind: "rgb",
      r: { kind: "literal", value: 255 },
      g: { kind: "literal", value: 128 },
      b: { kind: "literal", value: 0 },
      alphas: { kind: "literal", value: 0.5 }, // Typo: alphas → alpha
    };

    const result = RGB.generate(typoColor);

    expect(result).toMatchObject({
      ok: false,
      issues: [
        {
          code: "unrecognized-keys",
          message: expect.stringContaining("alphas"),
          path: ["alphas"],
        },
      ],
    });
  });
});
```

---

### Phase 2 Success Criteria

- [ ] `Issue` interface updated with new optional fields
- [ ] `zodErrorToIssues` enhanced with helper functions
- [ ] All generators (15+) use enhanced error translation
- [ ] Levenshtein distance implemented and tested
- [ ] Integration tests pass
- [ ] All 944 existing tests still pass
- [ ] Documentation updated with examples

**Expected Outcome:**
Users get rich, actionable error messages when IR is malformed:

- Clear paths to the problem
- "Did you mean?" suggestions for typos
- Expected vs received information

---

## Phase 1: Rich Parser Errors

**Priority:** HIGH - Great DX improvement
**Estimated Time:** 3-4 hours
**Complexity:** Medium (requires threading context)

### Why Second?

- More complex than Phase 2 (source context threading)
- High value but can be done incrementally
- Benefits from learnings in Phase 2

---

### Task 1.1: Create Source Context Formatter

**File:** `packages/b_utils/src/format/source-context.ts` (NEW)

Extract and refine logic from existing `validate.ts`:

```typescript
export interface SourceLocation {
  offset: number; // Character offset from start
  length: number; // Length of error region
}

export interface FormatOptions {
  contextLines?: number; // Lines before/after (default: 2)
  maxLineWidth?: number; // Max line length (default: 80)
}

/**
 * Format source code with visual pointer to error location.
 *
 * Example output:
 *   1 | .my-class {
 *   2 |   color: #gg0000;
 *     |          ^^^^^^^
 *   3 | }
 */
export function formatSourceContext(source: string, location: SourceLocation, options: FormatOptions = {}): string {
  const { contextLines = 2, maxLineWidth = 80 } = options;

  // 1. Convert offset to line/column
  const { line, column } = offsetToLineColumn(source, location.offset);

  // 2. Extract context window
  const lines = source.split("\n");
  const startLine = Math.max(0, line - contextLines);
  const endLine = Math.min(lines.length, line + contextLines + 1);
  const contextWindow = lines.slice(startLine, endLine);

  // 3. Format with line numbers and pointer
  const lineNumWidth = String(endLine).length;
  const formatted: string[] = [];

  for (let i = 0; i < contextWindow.length; i++) {
    const currentLine = startLine + i;
    const lineNum = String(currentLine + 1).padStart(lineNumWidth);
    let lineContent = contextWindow[i];

    // Truncate long lines intelligently
    if (lineContent.length > maxLineWidth) {
      lineContent = truncateLine(lineContent, column, maxLineWidth);
    }

    formatted.push(`  ${lineNum} | ${lineContent}`);

    // Add pointer line if this is the error line
    if (currentLine === line) {
      const pointerPadding = " ".repeat(lineNumWidth + 3 + column);
      const pointerChars = "^".repeat(Math.min(location.length, lineContent.length - column));
      formatted.push(`  ${" ".repeat(lineNumWidth)} | ${pointerPadding}${pointerChars}`);
    }
  }

  return formatted.join("\n");
}

function offsetToLineColumn(source: string, offset: number): { line: number; column: number } {
  const lines = source.substring(0, offset).split("\n");
  return {
    line: lines.length - 1,
    column: lines[lines.length - 1].length,
  };
}

function truncateLine(line: string, errorColumn: number, maxWidth: number): string {
  // Keep error position visible, truncate around it
  const padding = 10;
  const start = Math.max(0, errorColumn - padding);
  const end = Math.min(line.length, errorColumn + maxWidth - padding);

  let result = line.substring(start, end);
  if (start > 0) result = "..." + result;
  if (end < line.length) result = result + "...";

  return result;
}
```

**Tests:**

```typescript
describe("formatSourceContext", () => {
  it("should format single line error", () => {
    const source = "color: #gg0000;";
    const location = { offset: 7, length: 7 };

    const result = formatSourceContext(source, location);

    expect(result).toContain("#gg0000");
    expect(result).toContain("^^^^^^^");
  });

  it("should show context lines", () => {
    const source = `.class {\n  color: #gg0000;\n}`;
    const location = { offset: 20, length: 7 };

    const result = formatSourceContext(source, location, { contextLines: 1 });

    expect(result).toContain(".class");
    expect(result).toContain("color:");
    expect(result).toContain("}");
  });

  it("should truncate long lines", () => {
    const longLine = "color: " + "x".repeat(200);
    const location = { offset: 7, length: 10 };

    const result = formatSourceContext(longLine, location, { maxLineWidth: 80 });

    expect(result.split("\n")[0].length).toBeLessThan(90);
    expect(result).toContain("...");
  });
});
```

---

### Task 1.2: Update Issue Interface for Parser Errors

**File:** `packages/b_types/src/result/issue.ts`

Add internal field for source location:

```typescript
export interface Issue {
  // ... existing fields ...

  sourceContext?: string; // Formatted source with pointer (public)

  // Internal: For parser use only (not exposed to users)
  _location?: SourceLocation; // Private: stripped before returning to user
}

export interface SourceLocation {
  offset: number;
  length: number;
}
```

---

### Task 1.3: Update Property Parser Interface

**File:** `packages/b_declarations/src/types.ts`

```typescript
export interface PropertyParserOptions {
  sourceOffset?: number; // Offset of value in full source
}

export type PropertyParser<T = unknown> = (value: string, options?: PropertyParserOptions) => ParseResult<T>;
```

---

### Task 1.4: Update parseDeclaration to Format Source Context

**File:** `packages/b_declarations/src/parser.ts`

```typescript
import { formatSourceContext } from "@b/utils";

export function parseDeclaration(input: string | CSSDeclaration): ParseResult<DeclarationResult> {
  let property: string;
  let value: string;
  let fullSource: string;
  let valueOffset = 0;

  // Parse input
  if (typeof input === "string") {
    fullSource = input;
    const parsed = parseDeclarationString(input);

    if (!parsed.ok) {
      // Format errors with source context
      return {
        ...parsed,
        issues: formatIssues(parsed.issues, fullSource),
      };
    }

    property = parsed.value.property;
    value = parsed.value.value;
    valueOffset = fullSource.indexOf(value);
  } else {
    property = input.property;
    value = input.value;
    fullSource = `${property}: ${value}`;
    valueOffset = property.length + 2;
  }

  // Get property definition
  const definition = propertyRegistry.get(property);
  if (!definition) {
    return parseErr(createError("unknown-property", `Unknown CSS property: ${property}`));
  }

  // Parse with source offset
  const parseResult = definition.parser(value, { sourceOffset: valueOffset });

  if (!parseResult.ok) {
    return {
      ...parseResult,
      issues: formatIssues(parseResult.issues, fullSource, property),
    };
  }

  return parseOk({
    property,
    ir: parseResult.value,
    original: value,
  });
}

// Helper: Format issues with source context
function formatIssues(issues: Issue[], source: string, property?: string): Issue[] {
  return issues.map((issue) => {
    const formatted = { ...issue };

    // Add property if not present
    if (property && !formatted.property) {
      formatted.property = property;
    }

    // Add source context if location available
    if (issue._location) {
      formatted.sourceContext = formatSourceContext(source, issue._location);
      delete formatted._location; // Remove internal field
    }

    return formatted;
  });
}
```

---

### Task 1.5: Update One Property Parser (Proof of Concept)

**File:** `packages/b_declarations/src/properties/background-image/parser.ts`

```typescript
export function parseBackgroundImage(
  value: string,
  options?: PropertyParserOptions
): ParseResult<BackgroundImageIR> {
  const sourceOffset = options?.sourceOffset ?? 0;

  // ... existing parsing logic ...

  // When error occurs, include location:
  if (/* syntax error at position X */) {
    return parseErr({
      code: "invalid-syntax",
      message: "Invalid gradient syntax",
      _location: {
        offset: sourceOffset + localPosition,
        length: tokenLength,
      },
    });
  }

  // ... continue parsing ...
}
```

**Test:**

```typescript
it("should include source context in errors", () => {
  const result = parseDeclaration("background-image: linear-gradient(invalid");

  expect(result.ok).toBe(false);
  expect(result.issues[0]).toMatchObject({
    code: "invalid-syntax",
    message: expect.stringContaining("Invalid"),
    property: "background-image",
    sourceContext: expect.stringContaining("^"),
  });
});
```

---

### Phase 1 Success Criteria

- [ ] `formatSourceContext` utility created and tested
- [ ] `parseDeclaration` formats errors with source context
- [ ] At least one property parser updated (proof of concept)
- [ ] Integration test shows visual pointer in errors
- [ ] All 944 tests still pass
- [ ] Rollout plan for remaining parsers

**Expected Outcome:**
Users see exactly where in their CSS the error occurred with visual context.

---

## Phase 3: Path Propagation in Nested Calls

**Priority:** MEDIUM - Polish for complex scenarios
**Estimated Time:** 2-3 hours
**Complexity:** Medium (requires threading through call chains)

### Why Last?

- Only needed for deeply nested structures
- Builds on Phase 2 foundation
- Can be done property-by-property

---

### Task 3.1: Define GenerateContext Interface

**File:** `packages/b_types/src/result/generate.ts`

```typescript
export interface GenerateContext {
  parentPath?: (string | number)[]; // Path from root
  property?: string; // CSS property being generated
}
```

---

### Task 3.2: Update Generator Signatures (Incrementally)

**Pattern:**

```typescript
// Before:
export function generate(ir: T): GenerateResult;

// After:
export function generate(ir: T, context?: GenerateContext): GenerateResult;
```

**Start with nested structures:**

- Background-image generator
- Gradient generators (they call color generators)

---

### Task 3.3: Thread Context Through Calls

**Example:** `packages/b_generators/src/gradient/linear.ts`

```typescript
export function generate(gradient: unknown, context?: GenerateContext): GenerateResult {
  const validation = linearGradientSchema.safeParse(gradient);

  if (!validation.success) {
    return generateErr(
      zodErrorToIssues(validation.error, {
        typeName: "LinearGradient",
        property: context?.property,
        parentPath: context?.parentPath,
      })
    );
  }

  const validated = validation.data;

  // Generate color stops
  const stopResults = validated.colorStops.map((stop, i) => {
    return Color.generate(stop.color, {
      parentPath: [...(context?.parentPath ?? []), "colorStops", i, "color"],
      property: context?.property,
    });
  });

  // ... combine results ...
}
```

---

### Phase 3 Success Criteria

- [ ] `GenerateContext` interface defined
- [ ] Background-image generator threads context
- [ ] Gradient generators thread context
- [ ] Integration test shows full nested path
- [ ] All tests passing

**Expected Outcome:**
Deep error paths like `["value", "layers", 0, "gradient", "colorStops", 1, "color", "g"]`

---

## Validation Strategy

### Unit Tests

- Test each utility function in isolation
- Test edge cases (empty strings, Unicode, etc.)
- Test backward compatibility

### Integration Tests

- End-to-end parsing with source context
- End-to-end generation with rich errors
- Nested structure error paths

### Visual Validation

- Manual inspection of formatted errors
- Test with real CSS examples
- Verify suggestions are helpful

---

## Rollback Strategy

### Phase 2 Rollback

- Revert `zodErrorToIssues` changes
- Keep Zod validation (Session 022)
- All tests pass

### Phase 1 Rollback

- Remove source formatting
- Keep basic error messages
- All tests pass

### Phase 3 Rollback

- Remove context parameters
- Keep enhanced errors
- All tests pass

---

## Timeline Summary

| Phase   | Time | Dependencies     | Priority |
| ------- | ---- | ---------------- | -------- |
| Phase 2 | 2-3h | None (ready now) | HIGHEST  |
| Phase 1 | 3-4h | None             | HIGH     |
| Phase 3 | 2-3h | Phase 2 complete | MEDIUM   |

**Total: 7-10 hours**

---

## Next Steps

1. ✅ Review and approve this plan
2. 🚀 Start Phase 2 implementation (highest ROI)
3. 🧪 Validate with integration tests
4. 📝 Update documentation with examples
5. 🔄 Continue to Phase 1
6. 🏁 Complete with Phase 3

---

**Ready to begin Phase 2 implementation.**
