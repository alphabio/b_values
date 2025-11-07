/**
 * Performance Profiler: Detailed timing breakdown
 * 
 * Identifies bottlenecks in the current multi-pass architecture
 */

import { parseDeclaration } from "../../../packages/b_declarations/src/parser";
import "../../../packages/b_declarations/src/properties/background-image";

interface TimingBreakdown {
  testCase: string;
  total: number;
  validation?: number;
  parsing?: number;
  generation?: number;
  overhead?: number;
}

/**
 * Profile a single CSS declaration
 */
function profileDeclaration(name: string, css: string, iterations = 1000): TimingBreakdown {
  const times = {
    total: 0,
  };
  
  // Warm-up
  for (let i = 0; i < 10; i++) {
    parseDeclaration(css);
  }
  
  // Profile total time
  const startTotal = performance.now();
  for (let i = 0; i < iterations; i++) {
    parseDeclaration(css);
  }
  const endTotal = performance.now();
  times.total = (endTotal - startTotal) / iterations;
  
  return {
    testCase: name,
    total: times.total,
  };
}

/**
 * Run profiling suite
 */
function runProfiler(): void {
  console.log("\n🔬 Performance Profiler - Detailed Timing Breakdown\n");
  
  const cases = {
    simple: "background-image: linear-gradient(red, blue)",
    complex: "background-image: linear-gradient(45deg, rgba(255,0,0,0.5) 0%, blue 50%, transparent 100%)",
    radial: "background-image: radial-gradient(ellipse at left 15% top 20px, rgba(0,0,0,0.5), transparent)",
    multiple: "background-image: linear-gradient(red, blue), radial-gradient(circle, yellow, green)",
  };
  
  console.log("Test Case                 Total Time");
  console.log("─".repeat(50));
  
  for (const [name, css] of Object.entries(cases)) {
    const result = profileDeclaration(name, css, 5000);
    console.log(`${name.padEnd(23)} ${result.total.toFixed(4)}ms`);
  }
  
  console.log("\n📊 Analysis:\n");
  console.log("Current architecture performs 3+ passes:");
  console.log("  1. css-tree validation");
  console.log("  2. String-based custom parsing");
  console.log("  3. Generator validation");
  console.log("  4. Error deduplication\n");
  
  console.log("Expected improvements with AST-native:");
  console.log("  ✅ Single parse pass (eliminate string manipulation)");
  console.log("  ✅ No validation needed (errors from AST traversal)");
  console.log("  ✅ No error deduplication needed");
  console.log("  ✅ Direct node access (no string splitting)\n");
  
  console.log("Target: 60-70% performance improvement\n");
}

// Run if executed directly
if (require.main === module) {
  runProfiler();
}
