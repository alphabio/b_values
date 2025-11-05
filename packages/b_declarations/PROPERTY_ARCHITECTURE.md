# Property Architecture Guide

## Overview

This guide explains the scalable architecture for CSS property implementations in `@b/declarations`. The structure is designed to handle 100+ properties with consistency, type safety, and maintainability.

## Directory Structure

```
packages/b_declarations/src/
├── core/                           # Core framework
│   ├── types.ts                   # Base types for properties
│   ├── registry.ts                # Property registry system
│   ├── parser.ts                  # Generic declaration parser
│   ├── generator.ts               # Generic declaration generator
│   ├── index.ts                   # Core exports
│   ├── parser.test.ts            # Parser tests
│   └── registry.test.ts          # Registry tests
│
├── properties/                     # Property implementations
│   ├── background-image/          # Example: background-image property
│   │   ├── types.ts              # Property-specific IR types
│   │   ├── parser.ts             # Parse CSS → IR
│   │   ├── generator.ts          # Generate IR → CSS
│   │   ├── definition.ts         # Property registration
│   │   ├── index.ts              # Barrel exports
│   │   └── __tests__/
│   │       └── background-image.test.ts
│   │
│   ├── color/                     # Future property
│   │   ├── types.ts
│   │   ├── parser.ts
│   │   ├── generator.ts
│   │   ├── definition.ts
│   │   └── index.ts
│   │
│   └── index.ts                   # All properties barrel export
│
├── utils/                          # Shared utilities
├── types.ts                        # PropertyIRMap (type registry)
├── index.ts                        # Main package exports
└── integration.test.ts            # Cross-layer tests
```

## Property Module Pattern

Each property follows a consistent 5-file structure:

### 1. `types.ts` - IR Type Definitions

```typescript
// properties/background-image/types.ts
import type { Gradient } from "@b/types";

export type BackgroundImageIR = { kind: "keyword"; value: string } | { kind: "layers"; layers: ImageLayer[] };

export type ImageLayer = { kind: "url"; url: string } | { kind: "gradient"; gradient: Gradient } | { kind: "none" };
```

**Purpose:** Define the Intermediate Representation (IR) for the property's parsed value.

### 2. `parser.ts` - CSS → IR

```typescript
// properties/background-image/parser.ts
import { ok, err, type Result } from "@b/types";
import type { BackgroundImageIR } from "./types";

export function parseBackgroundImage(value: string): Result<BackgroundImageIR, string> {
  // Parse CSS string into IR
  // ...
  return ok({ kind: "layers", layers });
}
```

**Purpose:** Parse CSS string values into structured IR.

### 3. `generator.ts` - IR → CSS

```typescript
// properties/background-image/generator.ts
import { generateOk, type GenerateResult } from "@b/types";
import type { BackgroundImageIR } from "./types";

export function generateBackgroundImage(ir: BackgroundImageIR): GenerateResult {
  // Generate CSS string from IR
  // ...
  return generateOk("url(image.png)", "background-image");
}
```

**Purpose:** Generate CSS string from IR (reverse of parser).

### 4. `definition.ts` - Property Registration

```typescript
// properties/background-image/definition.ts
import { defineProperty } from "../../core/registry";
import { parseBackgroundImage } from "./parser";
import { generateBackgroundImage } from "./generator";
import type { BackgroundImageIR } from "./types";

export const backgroundImage = defineProperty<BackgroundImageIR>({
  name: "background-image",
  syntax: "<bg-image>#",
  parser: parseBackgroundImage,
  generator: generateBackgroundImage, // Required!
  inherited: false,
  initial: "none",
});
```

**Purpose:** Register the property with the runtime registry.

### 5. `index.ts` - Barrel Export

```typescript
// properties/background-image/index.ts
export * from "./types";
export * from "./parser";
export * from "./generator";
export * from "./definition";
```

**Purpose:** Provide clean import path for consumers.

## Type Registry

The `types.ts` file at the root contains the `PropertyIRMap`:

```typescript
// src/types.ts
import type { BackgroundImageIR } from "./properties/background-image";

export interface PropertyIRMap {
  "background-image": BackgroundImageIR;
  // Add more properties here
}

export type RegisteredProperty = keyof PropertyIRMap;
```

**Future:** This file will be auto-generated from property definitions.

## Adding a New Property

Follow these steps to add a new CSS property:

### Step 1: Create Directory Structure

```bash
mkdir -p src/properties/your-property/__tests__
```

### Step 2: Create `types.ts`

```typescript
export type YourPropertyIR = {
  // Define your IR structure
};
```

### Step 3: Create `parser.ts`

```typescript
import { ok, err, type Result } from "@b/types";
import type { YourPropertyIR } from "./types";

export function parseYourProperty(value: string): Result<YourPropertyIR, string> {
  // Implementation
  return ok(/* parsed IR */);
}
```

### Step 4: Create `generator.ts`

```typescript
import { generateOk, type GenerateResult } from "@b/types";
import type { YourPropertyIR } from "./types";

export function generateYourProperty(ir: YourPropertyIR): GenerateResult {
  // Implementation
  return generateOk(/* css string */, "your-property");
}
```

### Step 5: Create `definition.ts`

```typescript
import { defineProperty } from "../../core/registry";
import { parseYourProperty } from "./parser";
import { generateYourProperty } from "./generator";
import type { YourPropertyIR } from "./types";

export const yourProperty = defineProperty<YourPropertyIR>({
  name: "your-property",
  syntax: "...",
  parser: parseYourProperty,
  generator: generateYourProperty,
  inherited: false,
  initial: "...",
});
```

### Step 6: Create `index.ts`

```typescript
export * from "./types";
export * from "./parser";
export * from "./generator";
export * from "./definition";
```

### Step 7: Update Type Registry

Add to `src/types.ts`:

```typescript
import type { YourPropertyIR } from "./properties/your-property";

export interface PropertyIRMap {
  "background-image": BackgroundImageIR;
  "your-property": YourPropertyIR; // Add this
}
```

### Step 8: Export from Properties Barrel

Add to `src/properties/index.ts`:

```typescript
export * from "./background-image";
export * from "./your-property"; // Add this
```

### Step 9: Write Tests

Create `__tests__/your-property.test.ts`:

```typescript
import { describe, expect, it } from "vitest";
import { parseYourProperty } from "../parser";

describe("your-property", () => {
  it("should parse basic value", () => {
    const result = parseYourProperty("value");
    expect(result.ok).toBe(true);
  });
});
```

## Benefits of This Architecture

### 1. **Separation of Concerns**

- Each aspect (types, parsing, generation) in separate files
- Easy to find and modify specific functionality

### 2. **Enforced Completeness**

- Pattern requires both parser AND generator
- No more missing implementations

### 3. **Type Safety**

- `PropertyIRMap` provides compile-time property checking
- Generator receives correctly typed IR

### 4. **Scalability**

- Self-contained property modules
- Parallel development possible
- No merge conflicts between properties

### 5. **Testability**

- Each property has dedicated test directory
- Can test parser/generator independently

### 6. **Discoverability**

- Consistent structure across all properties
- Easy for new developers to understand

### 7. **Auto-generation Ready**

- Structure supports code generation
- Can generate PropertyIRMap from definitions
- Can generate property scaffolding

## Usage Examples

### Parsing a Declaration

```typescript
import { parseDeclaration } from "@b/declarations";

const result = parseDeclaration("background-image: url(img.png);");

if (result.ok) {
  console.log(result.value.ir); // Typed as BackgroundImageIR
}
```

### Generating a Declaration

```typescript
import { generateDeclaration } from "@b/declarations";
import type { BackgroundImageIR } from "@b/declarations";

const ir: BackgroundImageIR = {
  kind: "layers",
  layers: [{ kind: "url", url: "img.png" }],
};

const result = generateDeclaration({
  property: "background-image",
  ir,
});

if (result.ok) {
  console.log(result.value); // "background-image: url(img.png)"
}
```

## Future Improvements

### Auto-generation Script

Create a script to:

1. Scan all `properties/*/definition.ts` files
2. Extract property names and IR types
3. Generate `src/types.ts` automatically

### Property Scaffolding CLI

```bash
pnpm generate:property --name color
```

Creates full property structure with templates.

### Documentation Generation

Generate property documentation from definitions and JSDoc comments.

## Migration from Old Structure

Old structure had:

- Single file per property
- Missing generators
- Manual PropertyIRMap updates

New structure provides:

- Modular organization
- Required generators
- Clear upgrade path to auto-generation

## Questions?

See existing properties in `src/properties/` for examples!
