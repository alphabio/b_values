#!/usr/bin/env tsx
// b_path:: scripts/new-property.ts
/** biome-ignore-all lint/suspicious/noConsole: not a code file */

// b_path:: scripts/new-property.ts
//
// ⚠️ DEPRECATED: This script is being phased out in favor of manifest-based scaffolding.
//
// Use property-manifest.json + pattern-based generation instead.
// See: docs/sessions/068/PROPERTY_SCAFFOLDING_STRATEGY.md
//
// The --from flag has been REMOVED. It does not scale to 50+ properties.
// Pattern-based generation from manifest is the only supported approach.
//
// Temporary script for Session 071 testing only.
// Will be replaced with manifest-driven scaffold-property.ts in Session 072.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.error("⚠️  DEPRECATED SCRIPT");
console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.error("");
console.error("This script is being phased out.");
console.error("");
console.error("✅ CORRECT APPROACH:");
console.error("   1. Add property to property-manifest.json");
console.error("   2. Run: pnpm scaffold-property <name>");
console.error("");
console.error("📖 See: docs/sessions/068/PROPERTY_SCAFFOLDING_STRATEGY.md");
console.error("");
console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.error("");

process.exit(1);
