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
export * from "./background-position-x";
export * from "./background-position-y";
export * from "./background-repeat";
export * from "./background-size";
export * from "./border-bottom-color";
export * from "./border-bottom-left-radius";
export * from "./border-bottom-right-radius";
export * from "./border-bottom-style";
export * from "./border-bottom-width";
export * from "./border-left-color";
export * from "./border-left-style";
export * from "./border-left-width";
export * from "./border-right-color";
export * from "./border-right-style";
export * from "./border-right-width";
export * from "./border-top-color";
export * from "./border-top-left-radius";
export * from "./border-top-right-radius";
export * from "./border-top-style";
export * from "./border-top-width";
export * from "./margin-bottom";
export * from "./margin-left";
export * from "./margin-right";
export * from "./margin-top";
export * from "./mix-blend-mode";
export * from "./padding-bottom";
export * from "./padding-left";
export * from "./padding-right";
export * from "./padding-top";
export * from "./transition-delay";
export * from "./transition-duration";
export * from "./transition-property";
export * from "./transition-timing-function";

// Mark registry as initialized after all properties are loaded
// This is a side-effect import that happens when this module is imported
import { propertyRegistry } from "../core/registry";
propertyRegistry.markInitialized();
