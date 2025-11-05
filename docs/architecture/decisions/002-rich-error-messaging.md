# ADR 002: Rich Error Messaging for Parsing and Generation

**Status:** Proposed
**Date:** 2025-11-05
**Context:** Session 021 - Phase 2 Error Handling Improvements

---

## Context

Currently, our error handling system uses a basic `Issue` structure with `code` and `message` fields:

```typescript
interface Issue {
  code: string; // e.g., "invalid-ir", "missing-required-field"
  message: string; // Human-readable description
}
```

This approach has limitations:

1. **Parsers** - When CSS parsing fails, users don't get visual context showing exactly where in their CSS the error occurred
2. **Generators** - When IR generation fails, users don't get the full path to the problematic field or hints on how to fix it
3. **No Integration** - We have a rich validation system in `packages/b_utils/src/parse/validate.ts` that provides excellent error formatting (line numbers, visual pointers, context windows), but it's not integrated into our parser error handling

### Current State

**Parsing errors:**

```typescript
// User sees:
{ code: "parse-error", message: "Invalid angle value" }

// But they need:
//   3 | .class {
//   4 |   transform: rotate(45degrees);
//       -----------------------^^^^^^^^
//   5 | }
```

**Generation errors (with new Zod validation):**

```typescript
// User sees:
{ code: "invalid-ir", message: "Invalid RGBColor: g: Expected" }

// But they need:
{
  code: "invalid-ir",
  message: "Invalid RGBColor",
  path: ["backgroundColor", "value", "g"],
  hint: "Expected CssValue object with kind, value fields",
  received: "undefined"
}
```

---

## Decision

We will enhance our error system to provide rich, actionable error messages for both parsing and generation failures.

### Phase 1: Integrate Parser Validation (High Priority)

**Goal:** Use existing `validate()` function from `packages/b_utils/src/parse/validate.ts` in all CSS parsers.

**Benefits:**

- Already implemented and tested
- Beautiful error formatting with:
  - Line numbers and context window (±2 lines)
  - Visual pointers (^^^) at exact error location
  - Smart line truncation for long lines
  - Intelligent whitespace handling

**Integration Points:**

1. **Declaration-level parsing** (`packages/b_declarations`)

   ```typescript
   // Before:
   parseDeclaration("background-image: invalid");
   // Returns: { ok: false, issues: [{ code: "parse-error", message: "..." }] }

   // After:
   parseDeclaration("background-image: invalid");
   // Returns: {
   //   ok: false,
   //   issues: [{
   //     code: "parse-error",
   //     message: "Invalid gradient syntax",
   //     formattedError: `
   //       1 | background-image: linear-gradient(45deg red, blue);
   //           -------------------^^^^^^^^^^^^^^^^^
   //     `
   //   }]
   // }
   ```

2. **Property-level parsing** (`packages/b_parsers`)
   - Currently parsers work on AST nodes (not raw CSS strings)
   - Need to preserve original CSS context for error reporting
   - Option A: Thread original CSS through parser chain
   - Option B: Regenerate CSS from AST for error context (lossy)

**Implementation:**

```typescript
// packages/b_types/src/result/parse.ts
export interface Issue {
  code: string;
  message: string;
  formattedError?: string; // NEW: Rich formatted error with visual context
  path?: string[]; // NEW: Path to error location in structure
}

// packages/b_declarations/src/core/parser.ts
import { validate } from "@b/utils/parse/validate";

export function parseDeclaration(css: string): ParseResult<Declaration> {
  // First, validate with rich error formatting
  const validation = validate(css);

  if (!validation.ok || validation.warnings.length > 0) {
    const issues: Issue[] = [];

    // Add syntax errors with context
    for (const error of validation.errors) {
      issues.push(createError("syntax-error", error.message));
    }

    // Add property validation errors with formatted display
    for (const warning of validation.warnings) {
      issues.push({
        code: "invalid-property-value",
        message: `Invalid value for '${warning.property}'`,
        formattedError: warning.formattedWarning,
      });
    }

    return parseErr(...issues);
  }

  // Continue with normal parsing...
}
```

### Phase 2: Rich Generator Error Context (Medium Priority)

**Goal:** Leverage Zod's detailed error information to provide full paths and actionable hints.

**Current Zod Output:**

```typescript
{
  issues: [
    {
      code: "invalid_type",
      expected: "object",
      received: "undefined",
      path: ["g"],
      message: "Required",
    },
  ];
}
```

**Enhanced Generator Errors:**

```typescript
// packages/b_generators/src/color/rgb.ts
export function generate(color: RGBColor): GenerateResult {
  const validation = rgbColorSchema.safeParse(color);

  if (!validation.success) {
    const issues = validation.error.issues.map((zodIssue) => {
      const path = zodIssue.path.map(String);
      const hint = getHintForZodError(zodIssue, "RGBColor");

      return {
        code: mapZodCodeToIssueCode(zodIssue.code),
        message: `Invalid RGBColor at ${path.join(".")}`,
        path: path,
        hint: hint,
        received: zodIssue.received,
        expected: zodIssue.expected,
      };
    });

    return generateErr(...issues);
  }

  // Continue...
}

// Helper function
function getHintForZodError(issue: ZodIssue, typeName: string): string {
  switch (issue.code) {
    case "invalid_type":
      if (issue.received === "undefined") {
        return `'${issue.path.join(".")}' is required in ${typeName}`;
      }
      return `Expected ${issue.expected}, got ${issue.received}`;

    case "invalid_union":
      return `Value must be one of: ${issue.unionErrors.map((e) => e.issues[0]?.expected).join(", ")}`;

    default:
      return issue.message;
  }
}
```

**Enhanced Issue Structure:**

```typescript
// packages/b_types/src/result/issue.ts
export interface Issue {
  code: string; // Error type
  message: string; // Human-readable summary

  // NEW: Rich context
  path?: string[]; // Path to error in data structure
  hint?: string; // Actionable suggestion for fixing
  formattedError?: string; // Visual error display (for parsing)

  // NEW: Type information
  expected?: string; // Expected type/value
  received?: string; // Actual type/value
}
```

### Phase 3: Path Context in Nested Structures (Low Priority)

**Goal:** Track full path context through nested property parsing.

**Example:**

```typescript
// User's IR:
{
  backgroundImage: [
    {
      kind: "linear-gradient",
      colorStops: [
        { color: { kind: "rgb", r: lit(255) /* missing g, b */ } }
      ]
    }
  ]
}

// Error with full path:
{
  code: "invalid-ir",
  message: "Invalid RGB color",
  path: ["backgroundImage", 0, "colorStops", 0, "color", "g"],
  hint: "RGB colors require 'r', 'g', and 'b' fields",
  received: "undefined",
  expected: "CssValue"
}
```

**Implementation:** Thread path context through parser/generator chains.

---

## Consequences

### Positive

1. **Better DX** - Developers get precise, actionable error messages
2. **Faster debugging** - Visual context shows exact error location
3. **Type safety** - Zod integration provides rich type information
4. **Consistency** - Same error format across parsing and generation
5. **Low effort** - Phase 1 reuses existing validation infrastructure

### Negative

1. **Breaking change** - Issue structure changes (mitigated: optional fields)
2. **Performance** - Additional validation step (mitigated: only on error path)
3. **Complexity** - Need to track context through call chains
4. **Memory** - Storing formatted errors increases memory (mitigated: only when needed)

### Neutral

1. **Migration** - Existing code continues to work (new fields are optional)
2. **Testing** - Need to update test assertions (already doing this in Session 021)

---

## Implementation Plan

### Immediate (Session 021 continuation)

1. ✅ Fix test assertions to expect `"invalid-ir"` with Zod messages
2. ✅ Complete Phase 2 Task 2.1 (Zod validation in generators)

### Short-term (Next session)

1. Add optional `formattedError` field to `Issue` interface
2. Integrate `validate()` function in `parseDeclaration()`
3. Update declaration parser tests to verify rich errors
4. Document error format in user-facing docs

### Medium-term (Future session)

1. Enhance generator error context with Zod details
2. Add `path`, `hint`, `expected`, `received` fields
3. Create helper functions for Zod → Issue mapping
4. Add path tracking through nested structures

### Long-term (Future enhancement)

1. Error recovery suggestions
2. Interactive error fixing (suggest valid values)
3. Error severity levels (error vs warning)
4. Error aggregation and deduplication

---

## Examples

### Parser Error (After Phase 1)

```typescript
const css = `
  color: #gg0000;
  margin: 10px;
`;

const result = parseDeclaration(css);

// Result:
{
  ok: false,
  issues: [{
    code: "invalid-property-value",
    message: "Invalid value for 'color'",
    formattedError: `
      1 | color: #gg0000;
          -------^^^^^^^^
      2 | margin: 10px;
    `
  }]
}
```

### Generator Error (After Phase 2)

```typescript
const color: RGBColor = { kind: "rgb", r: lit(255) } as RGBColor;
const result = RGB.generate(color);

// Result:
{
  ok: false,
  issues: [{
    code: "missing-required-field",
    message: "Invalid RGBColor at g",
    path: ["g"],
    hint: "'g' is required in RGBColor",
    expected: "CssValue",
    received: "undefined"
  }]
}
```

### Nested Error (After Phase 3)

```typescript
const decl = {
  property: "background-image",
  value: {
    kind: "list",
    values: [
      {
        kind: "linear-gradient",
        colorStops: [
          { color: { kind: "rgb", r: lit(255) } } // missing g, b
        ]
      }
    ]
  }
};

const result = generateDeclaration(decl);

// Result:
{
  ok: false,
  issues: [{
    code: "invalid-ir",
    message: "Invalid RGB color in gradient color stop",
    path: ["value", "values", 0, "colorStops", 0, "color", "g"],
    hint: "RGB colors require 'r', 'g', and 'b' fields with CssValue objects",
    expected: "CssValue",
    received: "undefined"
  }]
}
```

---

## References

- Existing validation: `packages/b_utils/src/parse/validate.ts`
- Issue structure: `packages/b_types/src/result/issue.ts`
- Zod documentation: https://zod.dev
- Session 021 test failure analysis: `docs/sessions/021/test-failure-analysis.md`

---

## Notes

- This ADR captures the long-term vision for error messaging
- Implementation will be gradual across multiple sessions
- Phase 1 has the highest ROI (reuses existing infrastructure)
- Phase 2 and 3 can be prioritized based on user feedback
- Consider exposing error formatting options (context window size, max line width) in API
