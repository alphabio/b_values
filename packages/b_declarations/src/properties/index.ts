// b_path:: packages/b_declarations/src/properties/index.ts

// Central definitions export (single source of truth)
export * from "./definitions";

// Import before other properties that might depend on it
export * from "./custom-property";

export * from "./background-attachment";
export * from "./background-blend-mode";
export * from "./background-clip";
export * from "./background-color";
export * from "./background-image";
export * from "./background-origin";
export * from "./background-repeat";
export * from "./background-size";
export * from "./mix-blend-mode";

// Mark registry as initialized after all properties are loaded
// This is a side-effect import that happens when this module is imported
import { propertyRegistry } from "../core/registry";
propertyRegistry.markInitialized();
