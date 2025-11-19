// b_path:: docs/sessions/081/test-animation-delay.ts
// Quick verification that animation-delay now produces concrete Time type

import { parseDeclaration } from "@b/declarations";

// Test 1: Concrete time value
const test1 = parseDeclaration("animation-delay: 1s");
console.log("Test 1 - animation-delay: 1s");
console.log(JSON.stringify(test1, null, 2));
console.log("");

// Test 2: Different unit
const test2 = parseDeclaration("animation-delay: 200ms");
console.log("Test 2 - animation-delay: 200ms");
console.log(JSON.stringify(test2, null, 2));
console.log("");

// Test 3: CssValue fallback (var)
const test3 = parseDeclaration("animation-delay: var(--delay)");
console.log("Test 3 - animation-delay: var(--delay)");
console.log(JSON.stringify(test3, null, 2));
console.log("");

// Test 4: CssValue fallback (calc)
const test4 = parseDeclaration("animation-delay: calc(1s + 200ms)");
console.log("Test 4 - animation-delay: calc(1s + 200ms)");
console.log(JSON.stringify(test4, null, 2));
