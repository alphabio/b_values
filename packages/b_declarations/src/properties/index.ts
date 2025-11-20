// b_path:: packages/b_declarations/src/properties/index.ts

/**
 * Central property exports.
 *
 * ⚠️ THIS FILE IS AUTO-GENERATED. DO NOT EDIT MANUALLY.
 *
 * Run: pnpm generate:definitions
 */

// Central definitions export (single source of truth)
export * from "./definitions";

// Import before other properties that might depend on it
export * from "./custom-property";

export * from "./animation-delay";
export * from "./animation-direction";
export * from "./animation-duration";
export * from "./animation-fill-mode";
export * from "./animation-iteration-count";
export * from "./animation-name";
export * from "./animation-play-state";
export * from "./animation-timing-function";
export * from "./backdrop-filter";
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
export * from "./color";
export * from "./filter";
export * from "./font-family";
export * from "./font-kerning";
export * from "./font-optical-sizing";
export * from "./font-size";
export * from "./font-stretch";
export * from "./font-style";
export * from "./font-variant";
export * from "./font-variant-caps";
export * from "./font-variant-ligatures";
export * from "./font-variant-numeric";
export * from "./font-weight";
export * from "./letter-spacing";
export * from "./line-height";
export * from "./margin-bottom";
export * from "./margin-left";
export * from "./margin-right";
export * from "./margin-top";
export * from "./mix-blend-mode";
export * from "./opacity";
export * from "./padding-bottom";
export * from "./padding-left";
export * from "./padding-right";
export * from "./padding-top";
export * from "./perspective";
export * from "./perspective-origin";
export * from "./text-align";
export * from "./text-indent";
export * from "./text-overflow";
export * from "./text-transform";
export * from "./transform";
export * from "./transform-origin";
export * from "./transform-style";
export * from "./transition-delay";
export * from "./transition-duration";
export * from "./transition-property";
export * from "./transition-timing-function";
export * from "./visibility";
export * from "./white-space";
export * from "./word-spacing";

// Mark registry as initialized after all properties are loaded
// This is a side-effect import that happens when this module is imported
import { propertyRegistry } from "../core/registry";
propertyRegistry.markInitialized();
