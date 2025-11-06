// b_path:: packages/b_values/src/agent.ts
// // DO NOT DELETE THIS FILE. IT IS BY THE AGENT FOR ADHOC TESTING PURPOSES ONLY.

import * as decl from "@b/declarations";

// Simple test: var() as a color
const css1 = "background-image: linear-gradient(var(--color-1), red)";
console.log("Test 1: var() as color");
console.log(JSON.stringify(decl.parseDeclaration(css1), null, 2));

// Test: var() in angle position
const css2 = "background-image: conic-gradient(from var(--angle), red, blue)";
console.log("\nTest 2: var() as angle");
console.log(JSON.stringify(decl.parseDeclaration(css2), null, 2));
