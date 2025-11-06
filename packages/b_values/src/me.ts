// b_path:: packages/b_values/src/me.ts
// @ts-nocheck
// // DO NOT DELETE THIS FILE. IT IS BY THE USER FOR ADHOC TESTING PURPOSES ONLY.

import * as decl from "@b/declarations";
import { validate } from "@b/utils";

console.log("=".repeat(80));
console.log("INVESTIGATION 1: Out-of-range oklab - Should have OUR warning");
console.log("=".repeat(80));
const css1 = "background-image: radial-gradient(circle at 50% 50%, oklab(-255 255 255), red)";
console.log("CSS:", css1);
console.log("\nparseDeclaration result:");
const result1 = decl.parseDeclaration(css1);
console.log(JSON.stringify(result1, null, 2));
console.log("\nvalidate result:");
const validate1 = validate(css1);
console.log(JSON.stringify(validate1, null, 2));

console.log(`\n${"=".repeat(80)}`);
console.log("INVESTIGATION 2: Generate CSS from parsed IR");
console.log("=".repeat(80));
if (result1.ok) {
  const generated = decl.generateDeclaration(result1.value.ir);
  console.log("Generated CSS:", generated.css);
  console.log("Generate result:");
  console.log(JSON.stringify(generated, null, 2));
}

console.log(`\n${"=".repeat(80)}`);
console.log("INVESTIGATION 3: Malformed CSS - radial-gradient(circle at )");
console.log("=".repeat(80));
const css3 = "background-image: radial-gradient(circle at )";
console.log("CSS:", css3);
console.log("\nparseDeclaration result:");
const result3 = decl.parseDeclaration(css3);
console.log(JSON.stringify(result3, null, 2));
console.log("\nvalidate result:");
const validate3 = validate(css3);
console.log(JSON.stringify(validate3, null, 2));
console.log("\n💡 Analysis: parseDeclaration ok=false is correct!");
console.log("   We cannot populate model without color stops.");
console.log("   validate ok=true just means css-tree parsed the structure.");

console.log(`\n${"=".repeat(80)}`);
console.log("INVESTIGATION 4: Multiple issues - named(invalid) + oklab(-255...)");
console.log("=".repeat(80));
const css5 = "background-image: linear-gradient(oklab(-255 255 255), named(invalid))";
console.log("CSS:", css5);
console.log("\nparseDeclaration result:");
const result5 = decl.parseDeclaration(css5);
console.log(JSON.stringify(result5, null, 2));
console.log("\n💡 Question: Why don't we see BOTH issues?");
console.log("   - oklab(-255 255 255) out of range");
console.log("   - named(invalid) unsupported function");

console.log(`\n${"=".repeat(80)}`);
console.log("INVESTIGATION 5: Just oklab out of range");
console.log("=".repeat(80));
const css6 = "background-image: linear-gradient(oklab(-255 255 255), red)";
console.log("CSS:", css6);
console.log("\nparseDeclaration result:");
const result6 = decl.parseDeclaration(css6);
console.log(JSON.stringify(result6, null, 2));
if (result6.ok) {
  console.log("\nGenerate result:");
  const gen6 = decl.generateDeclaration(result6.value.ir);
  console.log(JSON.stringify(gen6, null, 2));
}

console.log(`\n${"=".repeat(80)}`);
console.log("INVESTIGATION 6: Just named(invalid)");
console.log("=".repeat(80));
const css7 = "background-image: linear-gradient(named(invalid), red)";
console.log("CSS:", css7);
console.log("\nparseDeclaration result:");
const result7 = decl.parseDeclaration(css7);
console.log(JSON.stringify(result7, null, 2));
