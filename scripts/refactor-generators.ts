#!/usr/bin/env tsx
/**
 * Automated generator naming refactor script
 *
 * Refactors inconsistent generator function names to follow the standard pattern:
 * - Multi-type namespaces: Namespace.generateTypeName()
 * - Single-type namespaces: Namespace.generate()
 *
 * This enables manifest system automation.
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

interface Refactor {
  namespace: string;
  oldName: string;
  newName: string;
  files: string[];
  usages: Array<{ file: string; pattern: string }>;
}

const REFACTORS: Refactor[] = [
  {
    namespace: "Background",
    oldName: "generateImageValue",
    newName: "generateImage",
    files: ["packages/b_generators/src/background/image.ts"],
    usages: [
      {
        file: "packages/b_declarations/src/properties/background-image/generator.ts",
        pattern: "Generators.Background.generateImageValue",
      },
    ],
  },
  {
    namespace: "Background",
    oldName: "generateBackgroundAttachmentValue",
    newName: "generateAttachment",
    files: ["packages/b_generators/src/background/attachment.ts"],
    usages: [
      {
        file: "packages/b_declarations/src/properties/background-attachment/generator.ts",
        pattern: "Generators.Background.generateBackgroundAttachmentValue",
      },
    ],
  },
  {
    namespace: "Background",
    oldName: "generateBackgroundClipValue",
    newName: "generateClip",
    files: ["packages/b_generators/src/background/clip.ts"],
    usages: [
      {
        file: "packages/b_declarations/src/properties/background-clip/generator.ts",
        pattern: "Generators.Background.generateBackgroundClipValue",
      },
    ],
  },
  {
    namespace: "Background",
    oldName: "generateBackgroundOriginValue",
    newName: "generateOrigin",
    files: ["packages/b_generators/src/background/origin.ts"],
    usages: [
      {
        file: "packages/b_declarations/src/properties/background-origin/generator.ts",
        pattern: "Generators.Background.generateBackgroundOriginValue",
      },
    ],
  },
  {
    namespace: "Background",
    oldName: "generateBackgroundRepeatValue",
    newName: "generateRepeat",
    files: ["packages/b_generators/src/background/repeat.ts"],
    usages: [
      {
        file: "packages/b_declarations/src/properties/background-repeat/generator.ts",
        pattern: "Generators.Background.generateBackgroundRepeatValue",
      },
    ],
  },
  {
    namespace: "Background",
    oldName: "generateBackgroundSizeValue",
    newName: "generateSize",
    files: ["packages/b_generators/src/background/size.ts"],
    usages: [
      {
        file: "packages/b_declarations/src/properties/background-size/generator.ts",
        pattern: "Generators.Background.generateBackgroundSizeValue",
      },
      {
        file: "packages/b_declarations/src/utils/generate-value.ts",
        pattern: "Generators.Background.generateBackgroundSizeValue",
      },
    ],
  },
];

function replaceInFile(filePath: string, oldText: string, newText: string): void {
  const content = fs.readFileSync(filePath, "utf-8");
  const newContent = content.replace(new RegExp(oldText, "g"), newText);

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, "utf-8");
    console.log(`  ✓ Updated ${filePath}`);
  } else {
    console.log(`  ℹ No changes in ${filePath}`);
  }
}

function runTests(): boolean {
  try {
    console.log("\n🧪 Running tests...");
    execSync("pnpm test", { stdio: "inherit", cwd: path.resolve(__dirname, "..") });
    return true;
  } catch {
    return false;
  }
}

function main() {
  console.log("🔧 Generator Naming Refactor\n");
  console.log("This script will refactor generator names to follow the standard pattern.\n");

  // Run tests first to ensure baseline
  console.log("📊 Checking baseline...");
  if (!runTests()) {
    console.error("\n❌ Baseline tests failed. Fix issues before running refactor.");
    process.exit(1);
  }

  console.log("\n✅ Baseline tests pass. Proceeding with refactor.\n");

  for (const refactor of REFACTORS) {
    console.log(`\n📝 Refactoring ${refactor.namespace}.${refactor.oldName} → ${refactor.newName}`);

    // Update generator definition files
    for (const file of refactor.files) {
      const filePath = path.resolve(__dirname, "..", file);
      replaceInFile(filePath, `export function ${refactor.oldName}`, `export function ${refactor.newName}`);
    }

    // Update usage sites
    for (const usage of refactor.usages) {
      const filePath = path.resolve(__dirname, "..", usage.file);
      const oldPattern = usage.pattern;
      const newPattern = oldPattern.replace(refactor.oldName, refactor.newName);
      replaceInFile(filePath, oldPattern, newPattern);
    }
  }

  console.log("\n\n🎯 Refactor complete. Running tests...\n");

  if (runTests()) {
    console.log("\n✅ All tests pass! Refactor successful.");
    console.log("\n📋 Next steps:");
    console.log("  1. Review changes: git diff");
    console.log("  2. Update property-manifest.json");
    console.log("  3. Run: just check && just build");
    console.log("  4. Commit: feat(generators): standardize Background.* naming");
  } else {
    console.error("\n❌ Tests failed after refactor. Review changes and fix issues.");
    process.exit(1);
  }
}

main();
