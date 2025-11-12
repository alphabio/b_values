#!/usr/bin/env tsx
// b_path:: scripts/manifest/audit-property.ts

/**
 * Audit a property's dependencies before scaffolding.
 *
 * Validates that all required types, parsers, and generators exist.
 * Reports what's missing and what's ready.
 *
 * Usage:
 *   pnpm audit-property background-color
 *   pnpm audit-property width
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";

const MANIFEST_PATH = path.resolve(process.cwd(), "scripts/manifest/property-manifest.json");
const KEYWORDS_DIR = path.resolve(process.cwd(), "packages/b_keywords/src");
const TYPES_DIR = path.resolve(process.cwd(), "packages/b_types/src");
const PARSERS_DIR = path.resolve(process.cwd(), "packages/b_parsers/src");
const GENERATORS_DIR = path.resolve(process.cwd(), "packages/b_generators/src");

interface PropertyManifest {
  properties: Record<string, PropertySpec>;
}

interface PropertySpec {
  name: string;
  syntax: string;
  inherited: boolean;
  initial: string;
  mode: "single" | "multi" | "raw";
  requirements: Requirements;
}

interface Requirements {
  keywords?: string[];
  types: string[];
  parser: string;
  generator: string;
  cssValues?: "auto" | "none" | "explicit";
}

interface AuditResult {
  property: string;
  status: "ready" | "blocked" | "partial";
  keywords: { required: string[]; found: string[]; missing: string[] };
  types: { required: string[]; found: string[]; missing: string[] };
  parser: { required: string; exists: boolean };
  generator: { required: string; exists: boolean };
  cssValues: { mode: string; supported: boolean };
}

async function fileExists(filepath: string): Promise<boolean> {
  try {
    await fs.access(filepath);
    return true;
  } catch {
    return false;
  }
}

async function checkKeyword(keyword: string): Promise<boolean> {
  // Check common keyword files
  const commonFiles = [
    path.join(KEYWORDS_DIR, "common.ts"),
    path.join(KEYWORDS_DIR, "none.ts"),
    path.join(KEYWORDS_DIR, "position.ts"),
  ];

  for (const file of commonFiles) {
    if (await fileExists(file)) {
      const content = await fs.readFile(file, "utf-8");
      if (content.includes(`"${keyword}"`) || content.includes(`'${keyword}'`)) {
        return true;
      }
    }
  }

  // Check all keyword files
  const files = await fs.readdir(KEYWORDS_DIR);
  for (const file of files) {
    if (!file.endsWith(".ts") || file.endsWith(".test.ts")) continue;
    const filepath = path.join(KEYWORDS_DIR, file);
    const content = await fs.readFile(filepath, "utf-8");
    if (content.includes(`"${keyword}"`) || content.includes(`'${keyword}'`)) {
      return true;
    }
  }

  return false;
}

async function checkType(typeName: string): Promise<boolean> {
  // 1. Check @b/types direct file
  const typeFile = path.join(TYPES_DIR, `${typeName}.ts`);
  if (await fileExists(typeFile)) {
    return true;
  }

  // 2. Check @b/types subdirectories
  const dirs = await fs.readdir(TYPES_DIR, { withFileTypes: true });
  for (const dir of dirs) {
    if (dir.isDirectory()) {
      const subFile = path.join(TYPES_DIR, dir.name, `${typeName}.ts`);
      if (await fileExists(subFile)) {
        return true;
      }
    }
  }

  // 3. Check @b/keywords for keyword-only types
  const keywordFile = path.join(KEYWORDS_DIR, `${typeName}.ts`);
  if (await fileExists(keywordFile)) {
    return true;
  }

  return false;
}

async function checkParser(parserPath: string): Promise<boolean> {
  // Format: "Color.parseNode" -> check packages/b_parsers/src/color/*.ts
  const [category, _method] = parserPath.split(".");
  const categoryLower = category.toLowerCase();

  // Check if category directory exists
  const categoryDir = path.join(PARSERS_DIR, categoryLower);
  if (await fileExists(categoryDir)) {
    return true;
  }

  // Check for root-level parser file (e.g., position.ts)
  const rootFile = path.join(PARSERS_DIR, `${categoryLower}.ts`);
  return await fileExists(rootFile);
}

async function checkGenerator(generatorPath: string): Promise<boolean> {
  // Format: "Color.generate" -> check packages/b_generators/src/color/*.ts
  const [category, _method] = generatorPath.split(".");
  const categoryLower = category.toLowerCase();

  // Check if category directory exists
  const categoryDir = path.join(GENERATORS_DIR, categoryLower);
  if (await fileExists(categoryDir)) {
    return true;
  }

  // Check for root-level generator file (e.g., position.ts)
  const rootFile = path.join(GENERATORS_DIR, `${categoryLower}.ts`);
  return await fileExists(rootFile);
}

async function auditProperty(propertyName: string, spec: PropertySpec): Promise<AuditResult> {
  const result: AuditResult = {
    property: propertyName,
    status: "ready",
    keywords: { required: spec.requirements.keywords || [], found: [], missing: [] },
    types: { required: spec.requirements.types, found: [], missing: [] },
    parser: { required: spec.requirements.parser, exists: false },
    generator: { required: spec.requirements.generator, exists: false },
    cssValues: { mode: spec.requirements.cssValues || "auto", supported: true },
  };

  // Check keywords
  for (const keyword of result.keywords.required) {
    const exists = await checkKeyword(keyword);
    if (exists) {
      result.keywords.found.push(keyword);
    } else {
      result.keywords.missing.push(keyword);
    }
  }

  // Check types
  for (const type of result.types.required) {
    const exists = await checkType(type);
    if (exists) {
      result.types.found.push(type);
    } else {
      result.types.missing.push(type);
    }
  }

  // Check parser
  result.parser.exists = await checkParser(spec.requirements.parser);

  // Check generator
  result.generator.exists = await checkGenerator(spec.requirements.generator);

  // CSS values always supported (it's built-in)
  result.cssValues.supported = true;

  // Determine status
  const hasIssues =
    result.keywords.missing.length > 0 ||
    result.types.missing.length > 0 ||
    !result.parser.exists ||
    !result.generator.exists;

  if (hasIssues) {
    const blockers = result.types.missing.length > 0 || !result.parser.exists || !result.generator.exists;
    result.status = blockers ? "blocked" : "partial";
  }

  return result;
}

function printAuditResult(result: AuditResult): void {
  const statusEmoji = result.status === "ready" ? "✅" : result.status === "partial" ? "⚠️" : "❌";

  console.log(`\n${statusEmoji} ${result.property.toUpperCase()}`);
  console.log("=".repeat(60));

  // Keywords
  if (result.keywords.required.length > 0) {
    console.log("\n📋 Keywords:");
    for (const kw of result.keywords.found) {
      console.log(`  ✅ ${kw}`);
    }
    for (const kw of result.keywords.missing) {
      console.log(`  ❌ ${kw} - NOT FOUND`);
    }
  }

  // Types
  console.log("\n📦 Types:");
  for (const type of result.types.found) {
    console.log(`  ✅ ${type}`);
  }
  for (const type of result.types.missing) {
    console.log(`  ❌ ${type} - NOT FOUND`);
  }

  // Parser
  console.log("\n🔍 Parser:");
  if (result.parser.exists) {
    console.log(`  ✅ ${result.parser.required}`);
  } else {
    console.log(`  ❌ ${result.parser.required} - NOT FOUND`);
  }

  // Generator
  console.log("\n🎨 Generator:");
  if (result.generator.exists) {
    console.log(`  ✅ ${result.generator.required}`);
  } else {
    console.log(`  ❌ ${result.generator.required} - NOT FOUND`);
  }

  // CSS Values
  console.log("\n🌐 CSS Values:");
  console.log(`  ✅ Mode: ${result.cssValues.mode}`);
  if (result.cssValues.mode === "auto") {
    console.log("     • var() ✅");
    console.log("     • calc() ✅");
    console.log("     • min/max/clamp() ✅");
  }

  // Summary
  console.log("\n📊 Assessment:");
  if (result.status === "ready") {
    console.log("  ✅ READY TO SCAFFOLD");
    console.log(`  ✨ Run: pnpm scaffold-property ${result.property}`);
  } else if (result.status === "partial") {
    console.log("  ⚠️  PARTIAL - Missing optional dependencies");
    console.log("  💡 Can scaffold but may need manual keyword additions");
  } else {
    console.log("  ❌ BLOCKED - Missing required dependencies");
    console.log("\n🎯 Next Steps:");
    if (result.types.missing.length > 0) {
      for (const type of result.types.missing) {
        console.log(`  1. Create @b/types/src/${type}.ts`);
      }
    }
    if (!result.parser.exists) {
      const category = result.parser.required.split(".")[0].toLowerCase();
      console.log(`  2. Create @b/parsers/src/${category}/*.ts`);
    }
    if (!result.generator.exists) {
      const category = result.generator.required.split(".")[0].toLowerCase();
      console.log(`  3. Create @b/generators/src/${category}/*.ts`);
    }
    console.log(`  4. Re-run: pnpm audit-property ${result.property}`);
  }
}

async function main() {
  const propertyName = process.argv[2];

  if (!propertyName) {
    console.error("❌ Usage: pnpm audit-property <property-name>");
    console.error("   Example: pnpm audit-property background-color");
    process.exit(1);
  }

  // Load manifest
  const manifestContent = await fs.readFile(MANIFEST_PATH, "utf-8");
  const manifest: PropertyManifest = JSON.parse(manifestContent);

  const spec = manifest.properties[propertyName];
  if (!spec) {
    console.error(`❌ Property "${propertyName}" not found in manifest`);
    console.error("\n📋 Available properties:");
    for (const name of Object.keys(manifest.properties)) {
      console.error(`   - ${name}`);
    }
    process.exit(1);
  }

  console.log(`\n🔍 Auditing property: ${propertyName}`);
  console.log(`📄 Syntax: ${spec.syntax}`);
  console.log(`🎯 Mode: ${spec.mode}`);

  const result = await auditProperty(propertyName, spec);
  printAuditResult(result);
}

main().catch((error) => {
  console.error("❌ Error during audit:", error);
  process.exit(1);
});
