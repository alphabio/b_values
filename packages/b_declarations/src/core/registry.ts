// b_path:: packages/b_declarations/src/core/registry.ts
import type { PropertyDefinition } from "../types";

/**
 * Property registry - maps CSS property names to their definitions.
 * This allows runtime lookup of property parsers and metadata.
 *
 * ⚠️ **Initialization Pattern**:
 * The registry is populated via side-effect imports when property definition
 * modules are loaded. Each property calls `defineProperty()` during module
 * initialization, which automatically registers it with the global registry.
 *
 * The `@b/declarations` package ensures all properties are registered by
 * importing them in `properties/index.ts`, which marks the registry as
 * initialized after all definitions are loaded.
 *
 * **For library consumers**: Just import from `@b/declarations` and the
 * registry will be ready. No manual initialization required.
 *
 * @example
 * ```typescript
 * import { getPropertyDefinition } from "@b/declarations";
 *
 * const def = getPropertyDefinition("background-color");
 * // Registry is automatically populated via side-effect imports
 * ```
 */
class PropertyRegistry {
  private properties = new Map<string, PropertyDefinition>();
  private initialized = false;

  /**
   * Register a property definition.
   */
  register(definition: PropertyDefinition): void {
    this.properties.set(definition.name, definition);
  }

  /**
   * Get a property definition by name.
   */
  get(name: string): PropertyDefinition | undefined {
    return this.properties.get(name);
  }

  /**
   * Check if a property is registered.
   */
  has(name: string): boolean {
    return this.properties.has(name);
  }

  /**
   * Get all registered property names.
   */
  getPropertyNames(): string[] {
    return Array.from(this.properties.keys());
  }

  /**
   * Clear all registered properties (useful for testing).
   */
  clear(): void {
    this.properties.clear();
    this.initialized = false;
  }

  /**
   * Mark registry as initialized.
   * Called by property definitions during module load.
   * @internal
   */
  markInitialized(): void {
    this.initialized = true;
  }

  /**
   * Check if registry has been initialized.
   * @internal
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

/**
 * Global property registry instance.
 *
 * **Initialization**: The registry is populated via side-effect imports.
 * Each property definition module calls `defineProperty()` during load,
 * which registers it with this global instance. The `properties/index.ts`
 * module imports all property definitions and marks initialization complete.
 *
 * This pattern ensures:
 * - Zero-config usage for library consumers
 * - Properties are registered once during module load
 * - No circular dependency issues
 * - Lazy evaluation only for dynamic imports
 */
export const propertyRegistry = new PropertyRegistry();

/**
 * Helper to define and register a property.
 */
export function defineProperty<T>(definition: PropertyDefinition<T>): PropertyDefinition<T> {
  propertyRegistry.register(definition as PropertyDefinition<unknown>);
  return definition;
}

/**
 * Check if a property name is a custom property (--*)
 */
export function isCustomProperty(name: string): boolean {
  return name.startsWith("--") && name.length > 2;
}

/**
 * Get property definition with custom property fallback.
 *
 * The registry is automatically populated when property definitions are imported.
 * Property modules call `defineProperty()` during module initialization,
 * which registers them with the global registry.
 *
 * @example
 * ```typescript
 * import { getPropertyDefinition } from "@b/declarations";
 *
 * const bgColor = getPropertyDefinition("background-color");
 * const customProp = getPropertyDefinition("--my-color");
 * // Properties are available after module import
 * ```
 */
export function getPropertyDefinition(name: string): PropertyDefinition | undefined {
  // First, try a direct lookup.
  const definition = propertyRegistry.get(name);
  if (definition) return definition;

  // If not found and it's a custom property, get the generic '--*' definition.
  if (isCustomProperty(name)) {
    return propertyRegistry.get("--*");
  }

  return undefined;
}
