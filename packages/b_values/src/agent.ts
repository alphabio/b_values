// b_path:: packages/b_values/src/agent.ts
// // DO NOT DELETE THIS FILE. IT IS BY THE AGENT FOR ADHOC TESTING PURPOSES ONLY.

import * as decl from "@b/declarations";

// Simple test: var() as a color
const css1 = "background-image: linear-gradient(var(--color-1), red)";
console.log("Test 1: var() as color - PARSE");
const parsed1 = decl.parseDeclaration(css1);
console.log(JSON.stringify(parsed1, null, 2));

console.log("\nTest 1: var() as color - GENERATE");
if (parsed1.ok) {
  const generated1 = decl.generateDeclaration(parsed1.value);
  console.log(JSON.stringify(generated1, null, 2));
}

// Test: var() in angle position
const css2 = "background-image: conic-gradient(from var(--angle), red, blue)";
console.log("\n\nTest 2: var() as angle - PARSE");
const parsed2 = decl.parseDeclaration(css2);
console.log(JSON.stringify(parsed2, null, 2));

console.log("\nTest 2: var() as angle - GENERATE");
if (parsed2.ok) {
  const generated2 = decl.generateDeclaration(parsed2.value);
  console.log(JSON.stringify(generated2, null, 2));
}
