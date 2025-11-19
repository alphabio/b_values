const fs = require("fs");
const path = require("path");

const PROPERTIES_DIR = "packages/b_declarations/src/properties";
const REPORT_FILE = "docs/sessions/080/full_audit_results.md";

// Gold Standard Criteria Regex
const CHECKS = {
  parser: [
    { name: "Imports Parsers or Keywords", regex: /import .* from "@b\/(parsers|keywords)"/ },
    { name: "Standard Return Type", regex: /ParseResult<.*>/ },
  ],
  generator: [
    { name: "Imports Generators or Utils", regex: /import .* from "@b\/(generators|utils)"/ },
    { name: "Standard Return Type", regex: /GenerateResult/ },
  ],
  definition: [
    { name: "Uses defineProperty", regex: /defineProperty<.*>\({/ },
    { name: "Has Syntax", regex: /syntax:/ },
  ],
  types: [{ name: "Exports IR Type", regex: /export type .*IR =/ }],
};

function auditProperty(propName) {
  const propDir = path.join(PROPERTIES_DIR, propName);
  const results = { name: propName, passed: true, issues: [] };

  // Check file existence
  const files = ["parser.ts", "generator.ts", "definition.ts", "types.ts"];
  for (const file of files) {
    if (!fs.existsSync(path.join(propDir, file))) {
      results.passed = false;
      results.issues.push(`Missing file: ${file}`);
      continue;
    }

    const content = fs.readFileSync(path.join(propDir, file), "utf8");
    const fileType = file.replace(".ts", "");

    if (CHECKS[fileType]) {
      for (const check of CHECKS[fileType]) {
        if (!check.regex.test(content)) {
          // Special case: simple generators might not import anything if they just return values
          if (file === "generator.ts" && check.name === "Imports Generators or Utils") {
            if (!content.includes("generateOk")) {
              // minimal check
              results.passed = false;
              results.issues.push(`${file}: Failed check "${check.name}"`);
            }
            continue;
          }

          results.passed = false;
          results.issues.push(`${file}: Failed check "${check.name}"`);
        }
      }
    }
  }

  return results;
}

function main() {
  if (!fs.existsSync(PROPERTIES_DIR)) {
    console.error(`Directory not found: ${PROPERTIES_DIR}`);
    process.exit(1);
  }

  const properties = fs
    .readdirSync(PROPERTIES_DIR)
    .filter((f) => fs.statSync(path.join(PROPERTIES_DIR, f)).isDirectory());

  console.log(`Auditing ${properties.length} properties...`);

  const auditResults = properties.map(auditProperty);
  const failures = auditResults.filter((r) => !r.passed);

  let report = `# Full Property Audit Results\n\n`;
  report += `**Date:** ${new Date().toISOString()}\n`;
  report += `**Total Properties:** ${properties.length}\n`;
  report += `**Passed:** ${properties.length - failures.length}\n`;
  report += `**Failed:** ${failures.length}\n\n`;

  if (failures.length > 0) {
    report += `## ❌ Failures\n\n`;
    for (const fail of failures) {
      report += `### ${fail.name}\n`;
      for (const issue of fail.issues) {
        report += `- ${issue}\n`;
      }
      report += `\n`;
    }
  } else {
    report += `## ✅ All Properties Passed Gold Standard Checks\n`;
  }

  fs.writeFileSync(REPORT_FILE, report);
  console.log(`Audit complete. Report saved to ${REPORT_FILE}`);

  if (failures.length > 0) {
    console.log("Found failures:");
    failures.forEach((f) => console.log(`- ${f.name}`));
  } else {
    console.log("All passed!");
  }
}

main();
