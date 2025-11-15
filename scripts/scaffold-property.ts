#!/usr/bin/env node
// b_path:: scripts/scaffold-property.ts

/**
 * Scaffold a new CSS property.
 *
 * Creates the complete property structure with templates.
 *
 * Usage:
 *   pnpm scaffold:property <property-name>
 *
 * Example:
 *   pnpm scaffold:property text-decoration-color
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";

const PROPERTIES_DIR = path.resolve(process.cwd(), "packages/b_declarations/src/properties");

function toPascalCase(str: string): string {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

interface TemplateContext {
  propertyName: string;
  folderName: string;
  exportName: string;
  typeName: string;
  parserName: string;
  generatorName: string;
}

function createTemplates(ctx: TemplateContext) {
  return {
    types: `// b_path:: packages/b_declarations/src/properties/${ctx.folderName}/types.ts

export type ${ctx.typeName} = {
  kind: "keyword";
  value: "TODO" | "inherit" | "initial" | "revert" | "revert-layer" | "unset";
};
`,

    parser: `// b_path:: packages/b_declarations/src/properties/${ctx.folderName}/parser.ts

import type { ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
import type * as csstree from "@eslint/css-tree";
import type { ${ctx.typeName} } from "./types";

export function ${ctx.parserName}(ast: csstree.Value): ParseResult<${ctx.typeName}> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "${ctx.propertyName}",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for ${ctx.propertyName}" }],
    };
  }

  if (firstNode.type === "Identifier") {
    const name = firstNode.name.toLowerCase();

    const cssWideResult = Keywords.cssWide.safeParse(name);
    if (cssWideResult.success) {
      return {
        ok: true,
        property: "${ctx.propertyName}",
        value: { kind: "keyword", value: cssWideResult.data },
        issues: [],
      };
    }

    // TODO: Add property-specific value parsing here
  }

  return {
    ok: false,
    property: "${ctx.propertyName}",
    value: undefined,
    issues: [{ code: "invalid-value", severity: "error", message: "Invalid ${ctx.propertyName} value" }],
  };
}
`,

    generator: `// b_path:: packages/b_declarations/src/properties/${ctx.folderName}/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import type { ${ctx.typeName} } from "./types";

export function ${ctx.generatorName}(ir: ${ctx.typeName}): GenerateResult {
  return generateOk(ir.value);
}
`,

    definition: `// b_path:: packages/b_declarations/src/properties/${ctx.folderName}/definition.ts

import { defineProperty } from "../../core";
import { ${ctx.parserName} } from "./parser";
import { ${ctx.generatorName} } from "./generator";
import type { ${ctx.typeName} } from "./types";

export const ${ctx.exportName} = defineProperty<${ctx.typeName}>({
  name: "${ctx.propertyName}",
  syntax: "TODO",
  parser: ${ctx.parserName},
  generator: ${ctx.generatorName},
  inherited: false, // TODO: Check spec
  initial: "TODO",  // TODO: Check spec
});
`,

    index: `// b_path:: packages/b_declarations/src/properties/${ctx.folderName}/index.ts

export * from "./types";
export * from "./parser";
export * from "./generator";
export * from "./definition";
`,
  };
}

async function scaffoldProperty(propertyName: string): Promise<void> {
  const folderName = propertyName;
  const exportName = toCamelCase(propertyName);
  const typeName = `${toPascalCase(propertyName)}IR`;
  const parserName = `parse${toPascalCase(propertyName)}`;
  const generatorName = `generate${toPascalCase(propertyName)}`;

  const ctx: TemplateContext = {
    propertyName,
    folderName,
    exportName,
    typeName,
    parserName,
    generatorName,
  };

  const propertyDir = path.join(PROPERTIES_DIR, folderName);

  // Check if property already exists
  try {
    await fs.access(propertyDir);
    console.error(`❌ Property "${propertyName}" already exists at ${propertyDir}`);
    process.exit(1);
  } catch {
    // Property doesn't exist, proceed
  }

  // Create directory
  await fs.mkdir(propertyDir, { recursive: true });

  // Generate all files
  const templates = createTemplates(ctx);

  await fs.writeFile(path.join(propertyDir, "types.ts"), templates.types, "utf-8");
  await fs.writeFile(path.join(propertyDir, "parser.ts"), templates.parser, "utf-8");
  await fs.writeFile(path.join(propertyDir, "generator.ts"), templates.generator, "utf-8");
  await fs.writeFile(path.join(propertyDir, "definition.ts"), templates.definition, "utf-8");
  await fs.writeFile(path.join(propertyDir, "index.ts"), templates.index, "utf-8");

  console.log(`✅ Scaffolded property: ${propertyName}`);
  console.log(`📁 Location: ${propertyDir}`);
  console.log("\n📝 Next steps:");
  console.log("  1. Update types.ts with correct IR type");
  console.log("  2. Implement parser logic in parser.ts");
  console.log("  3. Update definition.ts (syntax, inherited, initial)");
  console.log("  4. Run: pnpm generate:definitions");
  console.log("  5. Run: just check");
}

async function main() {
  const propertyName = process.argv[2];

  if (!propertyName) {
    console.error("Usage: pnpm scaffold:property <property-name>");
    console.error("Example: pnpm scaffold:property text-decoration-color");
    process.exit(1);
  }

  await scaffoldProperty(propertyName);
}

main().catch((error) => {
  console.error("❌ Error scaffolding property:", error);
  process.exit(1);
});
