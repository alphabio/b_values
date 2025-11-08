// b_path:: scripts/generate-property-ir-map.ts
// scripts/generate-property-ir-map.ts
/** biome-ignore-all lint/suspicious/noConsole: useful for debugging */
import * as fs from "node:fs/promises";
import * as path from "node:path";

const propertiesDir = path.resolve(process.cwd(), "packages/b_declarations/src/properties");
const outputFile = path.resolve(process.cwd(), "packages/b_declarations/src/types.map.ts");

async function main() {
  const properties = await fs.readdir(propertiesDir);
  const imports: string[] = [];
  const mapEntries: string[] = [];

  for (const property of properties) {
    const propertyPath = path.join(propertiesDir, property);
    const stats = await fs.stat(propertyPath);

    if (stats.isDirectory()) {
      const definitionPath = path.join(propertyPath, "definition.ts");
      const typesPath = path.join(propertyPath, "types.ts");

      try {
        await fs.access(definitionPath);
        await fs.access(typesPath);

        const definitionContent = await fs.readFile(definitionPath, "utf-8");
        const typesContent = await fs.readFile(typesPath, "utf-8");

        const propertyNameMatch = definitionContent.match(/name:\s*"([^"]+)"/);
        const irTypeNameMatch = typesContent.match(/export type (\w+IR) =/);

        if (propertyNameMatch && irTypeNameMatch) {
          const propertyName = propertyNameMatch[1];
          const irTypeName = irTypeNameMatch[1];

          // Skip custom properties as they are handled separately
          if (propertyName === "--*") {
            continue;
          }

          imports.push(`  ${irTypeName},`);
          mapEntries.push(`  "${propertyName}": ${irTypeName};`);
        } else {
          console.warn(`Skipping property '${property}': Could not extract property name or IR type.`);
        }
      } catch (error) {
        if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
          console.warn(`Skipping property '${property}': Missing definition.ts or types.ts file.`);
        } else {
          console.error(`Error processing property '${property}':`, error);
        }
      }
    }
  }

  const fileContent = [
    "// b_path:: packages/b_declarations/src/types.map.ts",
    "// This file contains the PropertyIRMap that maps property names to their IR types.",
    "//",
    "// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.",
    "",
    "import type {",
    ...imports,
    "  CustomPropertyIR",
    '} from "./properties";',
    "",
    "/**",
    " * Map of CSS property names to their IR types.",
    " * Used for type-safe parsing and generation.",
    " */",
    "export interface PropertyIRMap {",
    ...mapEntries,
    "  [key: `--$" + "{string}`]: CustomPropertyIR;",
    "}",
    "",
  ].join("\n");
  await fs.writeFile(outputFile, fileContent);
  console.log("Successfully generated types.map.ts");
}

main().catch(console.error);
