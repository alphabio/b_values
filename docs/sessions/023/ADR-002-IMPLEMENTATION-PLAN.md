# ADR 002: Rich Error Reporting - Detailed Implementation Plan

**Date:** 2025-11-05
**Session:** 023
**Status:** Planning Phase
**Priority:** CRITICAL - High DX Impact

---

## Executive Summary

This document provides a detailed, step-by-step implementation plan for ADR 002: Rich, Actionable Error Reporting. The implementation is divided into three phases with clear dependencies, validation criteria, and rollback strategies.

**Key Changes from Original ADR:**
1. **Phase 1 Strategy Refined:** Source-aware parsers with offset tracking (not full re-parsing)
2. **Phase 2 Priority Elevated:** Generator errors have highest ROI
3. **All schemas must use `.strict()`:** Non-negotiable for catching typos

---

## Current State Assessment

### ✅ Already Complete
- Session 022 Phase 2: Zod validation standardized in all generators
- Session 023 Phase 4: `.strict()` added to all 24 Zod schemas
- `zodErrorToIssues` utility exists in `b_utils`

### 🔄 In Progress
- None (clean slate)

### ❌ Not Started
- Phase 1: Source-aware parsers
- Phase 2: Enhanced Zod error translation
- Phase 3: Path propagation in nested calls

---

## Phase 1: Rich Parser Errors (HIGH PRIORITY)

**Goal:** Make parsing errors show exact location in source CSS with visual context.

### 1.1 Understanding the Problem

**Current State:**
```typescript
parseDeclaration("color: #gg0000");
// Returns: { ok: false, issues: [{ code: "invalid-value", message: "Invalid hex color" }] }
```

**Desired State:**
```typescript
parseDeclaration("color: #gg0000");
// Returns: {
//   ok: false,
//   issues: [{
//     code: "invalid-syntax",
//     message: "Invalid hex color: must be 3, 4, 6, or 8 hex characters.",
//     property: "color",
//     sourceContext:
//       "  1 | .my-class {\n" +
//       "  2 |   color: #gg0000;\n" +
//       "    |          ^^^^^^^\n" +
//       "  3 | }"
//   }]
// }
```

### 1.2 Strategy: Source-Aware Parsers

**Key Insight:** Don't re-parse. Thread location information through the parser chain.

```typescript
// Location information structure
interface SourceLocation {
  offset: number;  // Character offset from start of input
  length: number;  // Length of problematic substring
}

// Enhanced ParseResult can include location
interface ParseResult<T> {
  ok: boolean;
  value?: T;
  issues: Issue[];
  location?: SourceLocation;  // NEW: where the error occurred
}
```

**Parser Chain Flow:**
```
parseDeclaration(fullCss)
  ↓ knows full source
  ↓ passes substring + offset to property parser
  → parseBackgroundImage(value, sourceOffset)
      ↓ tracks position within value
      ↓ passes substring + accumulated offset
      → parseUrl(urlString, sourceOffset)
          ↓ fails at specific position
          ↓ returns error with location
      ← error bubbles up with location
  ← formats sourceContext using full source + location
  ← returns rich error
```

### 1.3 Implementation Tasks

#### Task 1.3.1: Enhance Issue Interface
**File:** `packages/b_types/src/result/issue.ts`

```typescript
export interface Issue {
  code: IssueCode;
  severity: "error" | "warning" | "info";
  message: string;

  // Context fields (NEW)
  property?: string;              // CSS property name
  path?: (string | number)[];     // Path in IR structure
  suggestion?: string;            // How to fix
  sourceContext?: string;         // Formatted source with pointer
  
  // Type information (NEW)
  expected?: string;              // Expected type/value
  received?: string;              // Actual type/value
  
  // Internal (not for end users)
  _location?: SourceLocation;     // For internal use during parsing
}

interface SourceLocation {
  offset: number;
  length: number;
}
```

**Validation:**
- All existing code compiles (new fields are optional)
- Export `SourceLocation` type

#### Task 1.3.2: Create Source Formatter Utility
**File:** `packages/b_utils/src/format/source-context.ts` (NEW)

This will be extracted/derived from existing `validate.ts` formatting logic.

```typescript
/**
 * Format source code with visual pointer to error location.
 * 
 * @param source - Full source CSS
 * @param location - Error location (offset + length)
 * @param options - Formatting options
 */
export function formatSourceContext(
  source: string,
  location: SourceLocation,
  options?: {
    contextLines?: number;  // Lines before/after (default: 2)
    maxLineWidth?: number;  // Max line width (default: 80)
  }
): string {
  // Implementation:
  // 1. Find line and column from offset
  // 2. Extract context window (±N lines)
  // 3. Add line numbers
  // 4. Add visual pointer (^^^) at exact location
  // 5. Truncate long lines intelligently
  
  // Example output:
  //   1 | .my-class {
  //   2 |   color: #gg0000;
  //     |          ^^^^^^^
  //   3 | }
}
```

**Validation:**
- Unit tests with various inputs (single line, multi-line, edge cases)
- Test with Unicode characters
- Test with very long lines
- Test with locations at start/end of source

#### Task 1.3.3: Update parseDeclaration
**File:** `packages/b_declarations/src/parser.ts`

```typescript
export function parseDeclaration(input: string | CSSDeclaration): ParseResult<DeclarationResult> {
  let property: string;
  let value: string;
  let fullSource: string;  // NEW: keep full source for formatting
  let valueOffset: number = 0;  // NEW: offset of value in full source

  if (typeof input === "string") {
    fullSource = input;
    const parsed = parseDeclarationString(input);
    if (!parsed.ok) {
      // Format source context if location available
      const issues = parsed.issues.map(issue => {
        if (issue._location) {
          return {
            ...issue,
            sourceContext: formatSourceContext(fullSource, issue._location),
            _location: undefined,  // Remove internal field
          };
        }
        return issue;
      });
      return { ...parsed, issues };
    }
    property = parsed.value.property;
    value = parsed.value.value;
    
    // Calculate offset of value substring
    valueOffset = fullSource.indexOf(value);
  } else {
    // Object input - no source context available
    property = input.property;
    value = input.value;
    fullSource = `${property}: ${value}`;  // Reconstruct for errors
    valueOffset = property.length + 2;  // "prop: "
  }

  // Look up property parser
  const definition = propertyRegistry.get(property);
  if (!definition) {
    return parseErr(createError("invalid-value", `Unknown CSS property: ${property}`));
  }

  // Parse value with source context
  const parseResult = definition.parser(value, { sourceOffset: valueOffset });
  
  if (!parseResult.ok) {
    // Format any errors with source context
    const issues = parseResult.issues.map(issue => {
      if (issue._location && fullSource) {
        return {
          ...issue,
          property,  // Add property name
          sourceContext: formatSourceContext(fullSource, issue._location),
          _location: undefined,
        };
      }
      return { ...issue, property };
    });
    return { ...parseResult, issues } as ParseResult<DeclarationResult>;
  }

  return parseOk({
    property,
    ir: parseResult.value,
    original: value,
  });
}
```

**Validation:**
- Test with string input (has source context)
- Test with object input (no source context)
- Test with unknown property
- Test with invalid value (should show source context)

#### Task 1.3.4: Update Property Parser Interface
**File:** `packages/b_declarations/src/types.ts`

```typescript
export interface PropertyParserOptions {
  sourceOffset?: number;  // Offset in full source (for error reporting)
}

export type PropertyParser<T = unknown> = (
  value: string,
  options?: PropertyParserOptions
) => ParseResult<T>;
```

**Validation:**
- All existing parsers still work (options is optional)
- Type checking passes

#### Task 1.3.5: Update One Property Parser (Proof of Concept)
**File:** `packages/b_declarations/src/properties/background-image/parser.ts`

Update to accept and use `sourceOffset`:

```typescript
export function parseBackgroundImage(
  value: string,
  options?: PropertyParserOptions
): ParseResult<BackgroundImageIR> {
  const sourceOffset = options?.sourceOffset ?? 0;
  
  // ... existing parsing logic ...
  
  // When creating errors, include location:
  if (/* error condition */) {
    return parseErr({
      code: "invalid-syntax",
      message: "Invalid gradient syntax",
      _location: {
        offset: sourceOffset + localOffset,  // Accumulated offset
        length: problematicToken.length,
      },
    });
  }
  
  // ... rest of logic ...
}
```

**Validation:**
- Test that errors include `_location`
- Test that `parseDeclaration` formats these into `sourceContext`
- Visual inspection of formatted errors

### 1.4 Phase 1 Rollout Strategy

**Incremental Approach:**
1. Implement infrastructure (Tasks 1.3.1 - 1.3.4)
2. Update ONE property parser as proof-of-concept (Task 1.3.5)
3. Validate with integration tests
4. Update remaining property parsers one-by-one
5. Update core parsers in `b_parsers` package

**Risk Mitigation:**
- Keep all changes backward compatible (options are optional)
- Internal `_location` field is never exposed to users
- If formatting fails, fall back to basic error message

### 1.5 Phase 1 Success Criteria

- [ ] `Issue` interface updated with new fields
- [ ] `formatSourceContext()` utility created and tested
- [ ] `parseDeclaration()` formats errors with source context
- [ ] At least ONE property parser updated and working
- [ ] Integration test shows full error with visual pointer
- [ ] All 944 tests still passing
- [ ] Documentation updated with example errors

---

## Phase 2: Rich Generator Errors (HIGHEST PRIORITY)

**Goal:** Translate Zod errors into actionable issues with suggestions.

### 2.1 Understanding the Problem

**Current State:**
```typescript
const color = { kind: "rgb", r: lit(255) } as RGBColor;  // Missing g, b
RGB.generate(color);
// Returns: { ok: false, issues: [{ code: "invalid-ir", message: "Expected string, received undefined" }] }
```

**Desired State:**
```typescript
const color = { kind: "rgb", r: lit(255), positon: lit(128) } as RGBColor;  // Typo: positon
RGB.generate(color);
// Returns: {
//   ok: false,
//   issues: [{
//     code: "unrecognized_keys",
//     message: "Unrecognized key(s) in object: 'positon'",
//     property: "rgb-color",
//     path: ["positon"],
//     suggestion: "Did you mean 'position'?",
//     severity: "error"
//   }]
// }
```

### 2.2 Strategy: Enhanced zodErrorToIssues

**Current Implementation:**
```typescript
// packages/b_utils/src/zod/error.ts
export function zodErrorToIssues(error: ZodError): Issue[] {
  return error.issues.map((zodIssue) => ({
    code: "invalid-ir",
    message: zodIssue.message,
    severity: "error",
  }));
}
```

**Enhanced Implementation:**
```typescript
export function zodErrorToIssues(
  error: ZodError,
  context?: {
    typeName?: string;      // e.g., "RGBColor"
    property?: string;      // e.g., "background-color"
    parentPath?: (string | number)[];  // For nested errors
  }
): Issue[] {
  return error.issues.map((zodIssue) => {
    const fullPath = [
      ...(context?.parentPath ?? []),
      ...zodIssue.path,
    ];
    
    return {
      code: mapZodCode(zodIssue.code),
      message: formatZodMessage(zodIssue, context?.typeName),
      severity: "error",
      property: context?.property,
      path: fullPath.length > 0 ? fullPath : undefined,
      suggestion: generateSuggestion(zodIssue, context),
      expected: getExpected(zodIssue),
      received: getReceived(zodIssue),
    };
  });
}
```

### 2.3 Implementation Tasks

#### Task 2.3.1: Enhance zodErrorToIssues
**File:** `packages/b_utils/src/zod/error.ts`

Add helper functions:

```typescript
// Map Zod error codes to our Issue codes
function mapZodCode(zodCode: string): IssueCode {
  switch (zodCode) {
    case "invalid_type": return "invalid-ir";
    case "unrecognized_keys": return "unrecognized_keys";
    case "invalid_union": return "invalid-union";
    case "too_small": return "missing-value";
    case "too_big": return "invalid-value";
    default: return "invalid-ir";
  }
}

// Format message with context
function formatZodMessage(issue: ZodIssue, typeName?: string): string {
  const pathStr = issue.path.length > 0 ? ` at ${issue.path.join(".")}` : "";
  const typeStr = typeName ? ` in ${typeName}` : "";
  
  switch (issue.code) {
    case "invalid_type":
      if (issue.received === "undefined") {
        return `Missing required field${pathStr}${typeStr}`;
      }
      return `Invalid type${pathStr}${typeStr}: ${issue.message}`;
    
    case "unrecognized_keys":
      const keys = issue.keys.join(", ");
      return `Unrecognized key(s)${typeStr}: '${keys}'`;
    
    default:
      return `${issue.message}${pathStr}${typeStr}`;
  }
}

// Generate helpful suggestions
function generateSuggestion(issue: ZodIssue, context?: any): string | undefined {
  switch (issue.code) {
    case "invalid_type":
      if (issue.received === "undefined") {
        const field = issue.path[issue.path.length - 1];
        return `'${field}' is required${context?.typeName ? ` in ${context.typeName}` : ""}`;
      }
      return `Expected ${issue.expected}, got ${issue.received}`;
    
    case "unrecognized_keys":
      // TODO: Levenshtein distance for "Did you mean X?"
      const unknownKey = issue.keys[0];
      // For now, just list the key
      return `Remove '${unknownKey}' or check for typos in property name`;
    
    default:
      return undefined;
  }
}

function getExpected(issue: ZodIssue): string | undefined {
  if ("expected" in issue) return String(issue.expected);
  return undefined;
}

function getReceived(issue: ZodIssue): string | undefined {
  if ("received" in issue) return String(issue.received);
  return undefined;
}
```

**Validation:**
- Unit tests for each Zod error type
- Test with nested paths
- Test with context information
- Test suggestion generation

#### Task 2.3.2: Update All Generators
**Pattern:** Every generator follows this pattern:

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
  
  // ... generation logic ...
}
```

**Files to Update:**
- All 7 color generators (already done in Session 022)
- All 3 gradient generators
- Length, angle, percentage generators
- URL generator
- Position generator

**Validation:**
- Each generator has test for invalid input
- Test assertions check for rich error details
- Integration tests verify end-to-end error flow

#### Task 2.3.3: Add Levenshtein Distance for Suggestions
**File:** `packages/b_utils/src/string/levenshtein.ts` (NEW)

```typescript
/**
 * Calculate Levenshtein distance between two strings.
 * Used for "Did you mean X?" suggestions.
 */
export function levenshteinDistance(a: string, b: string): number {
  // Standard dynamic programming implementation
  // ...
}

/**
 * Find closest match from a list of valid options.
 */
export function findClosestMatch(
  input: string,
  validOptions: string[],
  maxDistance: number = 3
): string | undefined {
  let closest: string | undefined;
  let minDistance = Number.POSITIVE_INFINITY;
  
  for (const option of validOptions) {
    const distance = levenshteinDistance(input.toLowerCase(), option.toLowerCase());
    if (distance < minDistance && distance <= maxDistance) {
      minDistance = distance;
      closest = option;
    }
  }
  
  return closest;
}
```

**Usage in suggestion generation:**
```typescript
case "unrecognized_keys":
  const unknownKey = issue.keys[0];
  const validKeys = Object.keys(schemaShape);  // Get from Zod schema
  const suggestion = findClosestMatch(unknownKey, validKeys);
  
  if (suggestion) {
    return `Did you mean '${suggestion}'?`;
  }
  return `Unknown key '${unknownKey}'. Valid keys: ${validKeys.join(", ")}`;
```

**Validation:**
- Test with common typos
- Test with completely different strings
- Test edge cases (empty strings, very long strings)

### 2.4 Phase 2 Success Criteria

- [ ] `zodErrorToIssues` enhanced with all helper functions
- [ ] All generators use enhanced `zodErrorToIssues`
- [ ] Levenshtein distance implemented for suggestions
- [ ] Integration tests show rich errors with suggestions
- [ ] Documentation updated with examples
- [ ] All 944+ tests passing

---

## Phase 3: Path Propagation (MEDIUM PRIORITY)

**Goal:** Maintain correct error paths through nested generator/parser calls.

### 3.1 Understanding the Problem

**Scenario:**
```typescript
generateDeclaration({
  property: "background-image",
  value: {
    kind: "layers",
    layers: [
      {
        kind: "linear-gradient",
        colorStops: [
          { color: { kind: "rgb", r: lit(255) } }  // Missing g, b
        ]
      }
    ]
  }
})
```

**Desired Error Path:**
```
["value", "layers", 0, "colorStops", 0, "color", "g"]
```

### 3.2 Strategy: Parent Path Threading

**Pattern:**
```typescript
function generateNested(
  ir: unknown,
  context?: {
    parentPath?: (string | number)[];
    property?: string;
  }
): GenerateResult {
  const validation = schema.safeParse(ir);
  
  if (!validation.success) {
    return generateErr(
      zodErrorToIssues(validation.error, {
        typeName: "NestedType",
        property: context?.property,
        parentPath: context?.parentPath,  // Pass through
      })
    );
  }
  
  // When calling nested generators:
  const result = generateChild(ir.child, {
    parentPath: [...(context?.parentPath ?? []), "child"],
    property: context?.property,
  });
  
  return result;
}
```

### 3.3 Implementation Tasks

#### Task 3.3.1: Add Context Parameter to Generators
**Pattern:** Update function signatures:

```typescript
// Before:
export function generate(ir: T): GenerateResult;

// After:
export function generate(
  ir: T,
  context?: GenerateContext
): GenerateResult;

interface GenerateContext {
  parentPath?: (string | number)[];
  property?: string;
}
```

**Files to Update:**
- Start with background-image generator (nested structure)
- Then update all generators that call other generators

**Validation:**
- Existing calls still work (context is optional)
- New tests verify path propagation

#### Task 3.3.2: Update Generator Call Sites
**Example:**
```typescript
// packages/b_generators/src/gradient/linear.ts
export function generate(gradient: unknown, context?: GenerateContext): GenerateResult {
  // ... validation ...
  
  // Generate color stops
  for (let i = 0; i < validated.colorStops.length; i++) {
    const stop = validated.colorStops[i];
    const colorResult = Color.generate(stop.color, {
      parentPath: [...(context?.parentPath ?? []), "colorStops", i, "color"],
      property: context?.property,
    });
    
    if (!colorResult.ok) return colorResult;
    // ... use result ...
  }
  
  // ...
}
```

**Validation:**
- Integration test with deeply nested error
- Verify full path is correct in error

### 3.4 Phase 3 Success Criteria

- [ ] `GenerateContext` interface defined
- [ ] Background-image generator updated (proof of concept)
- [ ] Integration test shows correct nested path
- [ ] Remaining generators updated
- [ ] All tests passing

---

## Validation Strategy

### Unit Tests
- Each utility function has comprehensive tests
- Test edge cases and error conditions
- Test backward compatibility

### Integration Tests
- End-to-end parsing with rich errors
- End-to-end generation with rich errors
- Nested structure error paths

### Manual Testing
- Visual inspection of formatted errors
- Test with real-world CSS examples
- Test with intentional typos and mistakes

### Performance Testing
- Benchmark error formatting overhead
- Ensure no performance regression on success path
- Validate lazy evaluation (format only on demand)

---

## Rollback Plan

### Phase 1 Rollback
- Remove `_location` field from errors
- Remove source formatting
- Keep basic error messages
- All tests should still pass

### Phase 2 Rollback
- Revert to basic `zodErrorToIssues`
- Keep Zod validation (Session 022)
- Remove enhanced error context

### Phase 3 Rollback
- Remove context parameters
- Keep enhanced error formatting
- Lose deep path information

---

## Timeline Estimate

### Phase 1: 3-4 hours
- Infrastructure: 1.5h
- Proof of concept: 1h
- Rollout: 1-1.5h

### Phase 2: 2-3 hours
- zodErrorToIssues: 1h
- Generator updates: 1h
- Levenshtein: 0.5-1h

### Phase 3: 2-3 hours
- Interface updates: 1h
- Call site updates: 1-2h

**Total: 7-10 hours**

---

## Dependencies

### Phase 1 Dependencies
- None (can start immediately)

### Phase 2 Dependencies
- Session 022 Phase 2 (✅ Complete)
- Session 023 Phase 4 (✅ Complete)

### Phase 3 Dependencies
- Phase 2 complete
- Integration test infrastructure

---

## Open Questions

1. **Source Location Threading:** Should we pass `sourceOffset` through all parser helper functions, or only at API boundaries?
   - **Decision:** Only at API boundaries to minimize changes

2. **Error Formatting Performance:** Should we format source context eagerly or lazily?
   - **Decision:** Eager (at error creation) for simpler API

3. **Context Options:** Should users be able to customize error formatting (line width, context window)?
   - **Decision:** Start with reasonable defaults, add options later if needed

4. **Levenshtein Threshold:** What's the max distance for "Did you mean"?
   - **Decision:** 3 characters (covers common typos)

5. **Multiple Suggestions:** Should we show multiple close matches?
   - **Decision:** Show only closest match to avoid clutter

---

## Success Metrics

### Quantitative
- Error message length increased by 2-5x (more detail)
- User bug reports with "can't find error" decrease
- Time to fix typical errors decreases

### Qualitative
- Errors are immediately actionable
- Users don't need to open source code to debug
- Error messages are clear and professional

---

## Next Steps

1. **Review this plan** with team/stakeholders
2. **Prioritize phases** based on user feedback
3. **Create session** for Phase 1 implementation
4. **Start with infrastructure** (Issue interface, formatters)
5. **Iterate and validate** after each phase

---

**This is a living document. Update as implementation progresses.**
