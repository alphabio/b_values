// b_path:: docs/sessions/081/test-roundtrip.ts
// Verify round-trip: parse → generate → parse

import { parseDeclaration, generateDeclaration } from "@b/declarations";

function testRoundTrip(css: string) {
  console.log(`\n🔄 Testing: ${css}`);
  
  // Parse
  const parseResult = parseDeclaration(css);
  if (!parseResult.ok) {
    console.log("❌ Parse failed:", parseResult.issues);
    return;
  }
  
  console.log("✅ Parse:", JSON.stringify(parseResult.value.ir, null, 2));
  
  // Generate
  const genResult = generateDeclaration({
    property: parseResult.value.property,
    ir: parseResult.value.ir
  });
  
  if (!genResult.ok) {
    console.log("❌ Generate failed:", genResult.issues);
    return;
  }
  
  console.log("✅ Generate:", genResult.value);
  
  // Parse again
  const parseResult2 = parseDeclaration(genResult.value);
  if (!parseResult2.ok) {
    console.log("❌ Re-parse failed:", parseResult2.issues);
    return;
  }
  
  // Compare
  const match = JSON.stringify(parseResult.value.ir) === JSON.stringify(parseResult2.value.ir);
  console.log(match ? "✅ Round-trip SUCCESS" : "❌ Round-trip FAILED");
}

testRoundTrip("animation-delay: 1s");
testRoundTrip("animation-delay: 200ms");
testRoundTrip("animation-delay: var(--delay)");
testRoundTrip("animation-delay: calc(1s + 200ms)");
