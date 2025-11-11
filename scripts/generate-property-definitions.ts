// b_path:: scripts/generate-property-definitions.ts
/** biome-ignore-all lint/suspicious/noConsole: we scriptin */

/**
 * Generate the central PROPERTY_DEFINITIONS export.
 *
 * Scans properties slash star slash definition.ts and builds definitions.ts.
 * This is the single source of truth for PropertyIRMap derivation.
 *
 * Run: pnpm generate:definitions
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";

const PROPERTIES_DIR = path.resolve(process.cwd(), "packages/b_declarations/src/properties");
const OUTPUT_FILE = path.resolve(PROPERTIES_DIR, "definitions.ts");

interface PropertyInfo {
  folderName: string;
  exportName: string;
  propertyName: string;
}

async function extractPropertyInfo(definitionPath: string): Promise<PropertyInfo | null> {
  const content = await fs.readFile(definitionPath, "utf-8");

  // Extract export name: export const backgroundAttachment = defineProperty(...)
  const exportMatch = content.match(/export\s+const\s+(\w+)\s*=/);
  if (!exportMatch) {
    console.warn(`Could not find export in ${definitionPath}`);
    return null;
  }
  const exportName = exportMatch[1];

  // Extract property name: name: "background-attachment"
  const nameMatch = content.match(/name:\s*["']([^"']+)["']/);
  if (!nameMatch) {
    console.warn(`Could not find property name in ${definitionPath}`);
    return null;
  }
  const propertyName = nameMatch[1];

  const folderName = path.basename(path.dirname(definitionPath));

  return { folderName, exportName, propertyName };
}

async function main() {
  console.log("Scanning property definitions...");

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
      console.warn(`Skipping ${entry.name}: no definition.ts found`);
    }
  }

  if (properties.length === 0) {
    console.error("No properties found!");
    process.exit(1);
  }

  // Sort properties (custom-property first, then alphabetically)
  properties.sort((a, b) => {
    if (a.propertyName === "--*") return -1;
    if (b.propertyName === "--*") return 1;
    return a.propertyName.localeCompare(b.propertyName);
  });

  // Generate imports
  const imports = properties.map((p) => `import { ${p.exportName} } from "./${p.folderName}/definition";`).join("\n");

  // Generate PROPERTY_DEFINITIONS object
  const entries_code = properties.map((p) => `  "${p.propertyName}": ${p.exportName},`).join("\n");

  // Generate file content
  const fileContent = `// b_path:: packages/b_declarations/src/properties/definitions.ts

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
${entries_code}
} as const;

/**
 * Type alias for the definitions object.
 * Used for type-level operations.
 */
export type PropertyDefinitions = typeof PROPERTY_DEFINITIONS;
`;

  await fs.writeFile(OUTPUT_FILE, fileContent, "utf-8");
  console.log(`✅ Generated definitions.ts with ${properties.length} properties`);

  // List properties
  console.log("\nRegistered properties:");
  for (const p of properties) {
    console.log(`  - ${p.propertyName} (${p.exportName})`);
  }
}

main().catch((error) => {
  console.error("Error generating definitions:", error);
  process.exit(1);
});
