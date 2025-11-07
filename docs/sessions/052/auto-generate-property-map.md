# Auto-Generate PropertyIRMap - Architecture Improvement

**Date:** 2025-11-07
**Status:** Proposed Enhancement
**Priority:** High (reduces maintenance burden as properties scale)

---

## Problem

Currently, `PropertyIRMap` in `packages/b_declarations/src/types.ts` is manually maintained:

```typescript
export interface PropertyIRMap {
  "background-image": BackgroundImageIR;
  [key: `--${string}`]: CustomPropertyIR;
}
```

**Issues:**

- Easy to forget updating when adding new properties
- Manual synchronization with property definitions
- Prone to errors as codebase scales (5th, 10th, 50th property)
- Type errors only surface when generating declarations

---

## Solution: Automatic Type Inference

Use TypeScript's type inference to auto-generate `PropertyIRMap` from property definitions.

### Implementation Steps

#### Step 1: Create Central Property Object

In `packages/b_declarations/src/properties/index.ts`:

```typescript
// packages/b_declarations/src/properties/index.ts
import { backgroundImage } from "./background-image";
import { customProperty } from "./custom-property";
// Future properties:
// import { color } from "./color";
// import { margin } from "./margin";

/**
 * Central registry of all property definitions.
 * This is the single source of truth.
 *
 * To add a new property:
 * 1. Import the definition
 * 2. Add it to this object
 * 3. PropertyIRMap and RegisteredProperty update automatically
 */
export const allProperties = {
  "background-image": backgroundImage,
  "--*": customProperty,
  // Add future properties here
} as const; // 'as const' is critical for type inference

// Still export for backward compatibility
export * from "./background-image";
export * from "./custom-property";
```

#### Step 2: Derive PropertyIRMap Automatically

In `packages/b_declarations/src/types.ts`:

```typescript
// packages/b_declarations/src/types.ts
import type { PropertyDefinition } from "./types";
import type { allProperties } from "./properties";

/**
 * Helper type to infer IR type from PropertyDefinition
 */
type InferIR<T> = T extends PropertyDefinition<infer U> ? U : never;

/**
 * Map of CSS property names to their IR types.
 * AUTOMATICALLY GENERATED from allProperties object.
 *
 * To add a new property, just add it to allProperties - this updates automatically.
 */
export type PropertyIRMap = {
  [K in keyof typeof allProperties]: InferIR<(typeof allProperties)[K]>;
};

/**
 * Union type of all registered property names.
 * Also automatically generated.
 */
export type RegisteredProperty = keyof PropertyIRMap;

// Rest of types remain unchanged...
```

#### Step 3: Auto-Register on Startup

In `packages/b_declarations/src/core/registry.ts`:

```typescript
// packages/b_declarations/src/core/registry.ts
import type { PropertyDefinition } from "../types";
import { allProperties } from "../properties";

class PropertyRegistry {
  private properties = new Map<string, PropertyDefinition>();

  /**
   * Register a property definition.
   */
  register(definition: PropertyDefinition): void {
    this.properties.set(definition.name, definition);
  }

  /**
   * Register all properties from the central allProperties object.
   * Called automatically on module load.
   */
  registerAll(): void {
    for (const definition of Object.values(allProperties)) {
      this.register(definition as PropertyDefinition<unknown>);
    }
  }

  // ... rest of methods unchanged
}

export const propertyRegistry = new PropertyRegistry();

// Auto-register all properties on startup
propertyRegistry.registerAll();

/**
 * Helper to define a property.
 * Now just returns the definition - registration handled by registerAll().
 */
export function defineProperty<T>(definition: PropertyDefinition<T>): PropertyDefinition<T> {
  return definition;
}

// ... rest of exports unchanged
```

---

## Benefits

### 1. Single Source of Truth

- `properties/index.ts` is the **only place** to add a new property
- No manual synchronization between definition and type map
- Import, add to object, done!

### 2. Zero Maintenance

- `PropertyIRMap` updates automatically via TypeScript inference
- `RegisteredProperty` stays in sync
- No risk of forgetting to update types

### 3. Type Safety

- Property available in type system immediately
- Can't add property without it being registered
- Compile-time errors if property missing from type map

### 4. Scalability

- Works for 5 properties or 500 properties
- No manual tracking required
- "Pit of success" - doing the right thing is automatic

### 5. Developer Experience

- Clear, single location for property registration
- Self-documenting (see `allProperties` to see all properties)
- Less cognitive load

---

## Migration Path

### Phase 1: Create allProperties Object

- Add `allProperties` export to `properties/index.ts`
- Keep existing individual exports for backward compatibility

### Phase 2: Update Type Inference

- Update `PropertyIRMap` to use `InferIR<typeof allProperties[K]>`
- Verify types still work correctly

### Phase 3: Auto-Registration

- Add `registerAll()` method to `PropertyRegistry`
- Call on module load
- Simplify `defineProperty` to just return definition

### Phase 4: Cleanup

- Remove manual `register()` calls from property definitions
- Update documentation

---

## Example: Adding a New Property

### Before (Manual)

```typescript
// 1. Create property/color/definition.ts
export const color = defineProperty<ColorIR>({ ... });

// 2. Export from properties/index.ts
export * from "./color";

// 3. MANUALLY update types.ts (EASY TO FORGET!)
export interface PropertyIRMap {
  "background-image": BackgroundImageIR;
  "color": ColorIR;  // <-- Must remember to add this!
  [key: `--${string}`]: CustomPropertyIR;
}
```

### After (Automatic)

```typescript
// 1. Create property/color/definition.ts
export const color = defineProperty<ColorIR>({ ... });

// 2. Add to allProperties in properties/index.ts
export const allProperties = {
  "background-image": backgroundImage,
  "color": color,  // <-- ONLY CHANGE NEEDED
  "--*": customProperty,
} as const;

// 3. PropertyIRMap updates automatically - NOTHING ELSE TO DO!
```

---

## Testing Strategy

1. **Type Tests:** Verify `PropertyIRMap` includes all properties from `allProperties`
2. **Runtime Tests:** Verify `propertyRegistry.getPropertyNames()` matches `Object.keys(allProperties)`
3. **Integration Tests:** Verify all properties can be parsed and generated

```typescript
// packages/b_declarations/src/types.test.ts
import { describe, it, expect } from "vitest";
import { allProperties } from "./properties";
import { propertyRegistry } from "./core/registry";
import type { PropertyIRMap, RegisteredProperty } from "./types";

describe("PropertyIRMap auto-generation", () => {
  it("should include all properties from allProperties", () => {
    const definedProperties = Object.keys(allProperties);
    const registeredProperties = propertyRegistry.getPropertyNames();

    expect(registeredProperties).toEqual(expect.arrayContaining(definedProperties));
  });

  it("should have type-safe property names", () => {
    // This is a compile-time test
    const validProperty: RegisteredProperty = "background-image";
    // @ts-expect-error - invalid property should fail
    const invalidProperty: RegisteredProperty = "not-a-property";
  });
});
```

---

## Considerations

### Custom Properties (--\*)

- Custom properties use template `"--*"` as key in `allProperties`
- `getPropertyDefinition()` already handles dynamic lookup
- Type map uses index signature: `[key: \`--${string}\`]: CustomPropertyIR`
- Works seamlessly with auto-generation

### Backward Compatibility

- Keep individual exports from `properties/index.ts`
- Additive change - doesn't break existing code
- Can migrate incrementally

### Performance

- No runtime overhead - type inference is compile-time only
- `registerAll()` called once on module load
- Map lookup same as before

---

## Next Steps

1. ✅ Document the improvement (this file)
2. ⬜ Create implementation PR
3. ⬜ Add type tests
4. ⬜ Update documentation
5. ⬜ Add to DX guide

---

## References

- TypeScript: Inferring types from const assertions
- TypeScript: Mapped types and conditional types
- Current implementation: `packages/b_declarations/src/types.ts`

---

**Status:** Ready for implementation
**Estimated effort:** 1-2 hours
**Risk:** Low (additive, non-breaking change)
