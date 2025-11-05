// b_path:: packages/b_declarations/src/registry.ts
import type { PropertyDefinition } from "./types";

/**
 * Property registry - maps CSS property names to their definitions.
 * This allows runtime lookup of property parsers and metadata.
 */
class PropertyRegistry {
  private properties = new Map<string, PropertyDefinition>();

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
  }
}

/**
 * Global property registry instance.
 */
export const propertyRegistry = new PropertyRegistry();

/**
 * Helper to define and register a property.
 */
export function defineProperty<T>(definition: PropertyDefinition<T>): PropertyDefinition<T> {
  propertyRegistry.register(definition as PropertyDefinition<unknown>);
  return definition;
}
