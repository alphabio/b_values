// b_path:: scripts/generate-property-definitions.ts

/**
 * Unified property generation system.
 *
 * Scans properties/star/definition.ts and generates:
 * 1. definitions.ts - Runtime registry (PROPERTY_DEFINITIONS)
 * 2. manifest.json - Property metadata for tooling
 *
 * Note: PropertyIRMap is derived via type inference in types.derived.ts,
 * not generated. This eliminates sync issues and ensures single source of truth.
 *
 * Single source of truth. Single execution.
 *
 * Run: pnpm generate:definitions
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";

const PROPERTIES_DIR = path.resolve(process.cwd(), "packages/b_declarations/src/properties");
const DEFINITIONS_FILE = path.resolve(PROPERTIES_DIR, "definitions.ts");
const INDEX_FILE = path.resolve(PROPERTIES_DIR, "index.ts");
const MANIFEST_FILE = path.resolve(process.cwd(), "packages/b_declarations/src/manifest.json");

interface PropertyInfo {
  folderName: string;
  exportName: string;
  propertyName: string;
  syntax: string;
  inherited: boolean;
  initial: string;
  multiValue: boolean;
  irTypeName: string;
}

async function extractPropertyInfo(definitionPath: string): Promise<PropertyInfo | null> {
  const folderName = path.basename(path.dirname(definitionPath));
  const definitionContent = await fs.readFile(definitionPath, "utf-8");

  // Extract export name: export const backgroundAttachment = defineProperty(...)
  const exportMatch = definitionContent.match(/export\s+const\s+(\w+)\s*=/);
  if (!exportMatch) {
    console.warn(`Could not find export in ${definitionPath}`);
    return null;
  }
  const exportName = exportMatch[1];

  // Extract property name: name: "background-attachment"
  const nameMatch = definitionContent.match(/name:\s*["']([^"']+)["']/);
  if (!nameMatch) {
    console.warn(`Could not find property name in ${definitionPath}`);
    return null;
  }
  const propertyName = nameMatch[1];

  // Extract syntax: syntax: "<color>"
  const syntaxMatch = definitionContent.match(/syntax:\s*["']([^"']+)["']/);
  const syntax = syntaxMatch ? syntaxMatch[1] : "unknown";

  // Extract inherited: inherited: false
  const inheritedMatch = definitionContent.match(/inherited:\s*(true|false)/);
  const inherited = inheritedMatch ? inheritedMatch[1] === "true" : false;

  // Extract initial: initial: "transparent"
  const initialMatch = definitionContent.match(/initial:\s*["']([^"']+)["']/);
  const initial = initialMatch ? initialMatch[1] : "";

  // Extract multiValue: multiValue: true
  const multiValueMatch = definitionContent.match(/multiValue:\s*(true|false)/);
  const multiValue = multiValueMatch ? multiValueMatch[1] === "true" : false;

  // Extract IR type from types.ts
  const typesPath = path.join(path.dirname(definitionPath), "types.ts");
  let irTypeName = "unknown";
  try {
    const typesContent = await fs.readFile(typesPath, "utf-8");
    const irTypeMatch = typesContent.match(/export type (\w+IR) =/);
    if (irTypeMatch) {
      irTypeName = irTypeMatch[1];
    }
  } catch {
    console.warn(`Could not read types.ts for ${folderName}`);
  }

  return {
    folderName,
    exportName,
    propertyName,
    syntax,
    inherited,
    initial,
    multiValue,
    irTypeName,
  };
}

async function generateDefinitionsFile(properties: PropertyInfo[]): Promise<void> {
  const imports = properties.map((p) => `import { ${p.exportName} } from "./${p.folderName}/definition";`).join("\n");

  const entries = properties.map((p) => `  "${p.propertyName}": ${p.exportName},`).join("\n");

  const content = `// b_path:: packages/b_declarations/src/properties/definitions.ts

/**
 * Central registry of all property definitions.
 *
 * ⚠️ THIS FILE IS AUTO-GENERATED. DO NOT EDIT MANUALLY.
 *
 * Run: pnpm generate:definitions
 *
 * This is the single source of truth for:
 * - Property names → IR type mapping (derives PropertyIRMap)
 * - Property metadata (multiValue, rawValue flags)
 * - Type-level contract enforcement
 *
 * Architecture:
 * - Each property folder exports its definition (e.g., backgroundAttachment)
 * - This file aggregates them into PROPERTY_DEFINITIONS
 * - PropertyIRMap is derived from this via type inference
 * - Type-level contracts check actual definitions, not generic types
 *
 * When adding a new property:
 * 1. Create property folder with definition.ts that exports a definition
 * 2. Run: pnpm generate:definitions
 * 3. PropertyIRMap auto-updates via type inference
 * 4. Type-level contracts validate multiValue → list IR
 */

${imports}

/**
 * Central definitions object.
 *
 * Keys are CSS property names (e.g., "background-color").
 * Values are PropertyDefinition instances.
 *
 * This object is the source of truth for:
 * - Runtime property lookup
 * - Type-level IR extraction
 * - Contract validation
 */
export const PROPERTY_DEFINITIONS = {
${entries}
} as const;

/**
 * Type alias for the definitions object.
 * Used for type-level operations.
 */
export type PropertyDefinitions = typeof PROPERTY_DEFINITIONS;
`;

  await fs.writeFile(DEFINITIONS_FILE, content, "utf-8");
  console.log("✅ Generated definitions.ts");
}

async function generateIndexFile(properties: PropertyInfo[]): Promise<void> {
  const exports = properties
    .filter((p) => p.propertyName !== "--*")
    .map((p) => `export * from "./${p.folderName}";`)
    .join("\n");

  const content = `// b_path:: packages/b_declarations/src/properties/index.ts

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

${exports}

// Mark registry as initialized after all properties are loaded
// This is a side-effect import that happens when this module is imported
import { propertyRegistry } from "../core/registry";
propertyRegistry.markInitialized();
`;

  await fs.writeFile(INDEX_FILE, content, "utf-8");
  console.log("✅ Generated index.ts");
}

async function generateManifestFile(properties: PropertyInfo[]): Promise<void> {
  const manifest: Record<string, unknown> = {
    $schema: "./manifest.schema.json",
    generated: new Date().toISOString(),
    properties: {},
  };

  const propsObj: Record<string, unknown> = {};

  for (const p of properties) {
    // Skip custom properties in manifest
    if (p.propertyName === "--*") continue;

    propsObj[p.propertyName] = {
      name: p.propertyName,
      syntax: p.syntax,
      inherited: p.inherited,
      initial: p.initial,
      mode: p.multiValue ? "multi" : "single",
      irType: p.irTypeName,
    };
  }

  manifest.properties = propsObj;

  await fs.writeFile(MANIFEST_FILE, `${JSON.stringify(manifest, null, 2)}\n`, "utf-8");
  console.log("✅ Generated manifest.json");
}

async function main() {
  console.log("🔍 Scanning property definitions...\n");

  const entries = await fs.readdir(PROPERTIES_DIR, { withFileTypes: true });
  const properties: PropertyInfo[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const definitionPath = path.join(PROPERTIES_DIR, entry.name, "definition.ts");

    try {
      await fs.access(definitionPath);
      const info = await extractPropertyInfo(definitionPath);
      if (info) {
        properties.push(info);
      }
    } catch {
      console.warn(`⚠️  Skipping ${entry.name}: no definition.ts found`);
    }
  }

  if (properties.length === 0) {
    console.error("❌ No properties found!");
    process.exit(1);
  }

  // Sort properties (custom-property first, then alphabetically)
  properties.sort((a, b) => {
    if (a.propertyName === "--*") return -1;
    if (b.propertyName === "--*") return 1;
    return a.propertyName.localeCompare(b.propertyName);
  });

  console.log(`📦 Found ${properties.length} properties\n`);

  // Generate artifacts
  await generateDefinitionsFile(properties);
  await generateIndexFile(properties);
  await generateManifestFile(properties);

  console.log("\n✨ Generation complete!");
  console.log("📝 PropertyIRMap derived via types.derived.ts (type-level)\n");
  console.log("Registered properties:");
  for (const p of properties) {
    console.log(`  • ${p.propertyName}`);
  }
}

main().catch((error) => {
  console.error("❌ Error generating artifacts:", error);
  process.exit(1);
});
