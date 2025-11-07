/**
 * Performance Benchmark: Current Architecture Baseline
 * 
 * Measures parse performance for complex CSS declarations to establish
 * baseline before AST-native refactoring.
 */

import { parseDeclaration } from "../../../packages/b_declarations/src/parser";
// Import to trigger registration
import "../../../packages/b_declarations/src/properties/background-image";

// Test cases representing real-world complexity
const testCases = {
  simpleGradient: "background-image: linear-gradient(red, blue)",
  
  complexGradient: "background-image: linear-gradient(45deg, rgba(255,0,0,0.5) 0%, blue 50%, transparent 100%)",
  
  radialGradient: "background-image: radial-gradient(ellipse at left 15% top 20px, rgba(0,0,0,0.5), transparent)",
  
  multipleGradients: "background-image: linear-gradient(red, blue), radial-gradient(circle, yellow, green), conic-gradient(from 45deg, purple, pink)",
  
  complexMultiLayer: `background-image: linear-gradient(45deg, rgba(255,0,0,0.5) 0%, blue 25%, green 50%, yellow 75%, transparent 100%), 
    radial-gradient(ellipse at center 30% right 20%, rgba(0,0,0,0.8), transparent 70%), 
    conic-gradient(from 90deg at 50% 50%, red, orange, yellow, green, blue, purple, red)`,
    
  withCalc: "background-image: linear-gradient(45deg, red calc(20% + 10px), blue calc(50% - 5px), green 100%)",
};

interface BenchmarkResult {
  testCase: string;
  iterations: number;
  totalTime: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  opsPerSec: number;
  success: boolean;
}

/**
 * Run benchmark for a single test case
 */
function benchmarkCase(name: string, css: string, iterations = 10000): BenchmarkResult {
  const times: number[] = [];
  let success = true;
  
  // Warm-up phase (JIT optimization)
  for (let i = 0; i < 100; i++) {
    parseDeclaration(css);
  }
  
  // Actual benchmark
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    const result = parseDeclaration(css);
    const end = performance.now();
    
    times.push(end - start);
    
    if (!result.ok && i === 0) {
      success = false;
      console.warn(`⚠️  ${name}: Parse failed -`, result.issues[0]?.message);
    }
  }
  
  const totalTime = times.reduce((a, b) => a + b, 0);
  const avgTime = totalTime / iterations;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const opsPerSec = 1000 / avgTime;
  
  return {
    testCase: name,
    iterations,
    totalTime,
    avgTime,
    minTime,
    maxTime,
    opsPerSec,
    success,
  };
}

/**
 * Format benchmark result as table row
 */
function formatResult(result: BenchmarkResult): string {
  const icon = result.success ? "✅" : "❌";
  const name = result.testCase.padEnd(25);
  const avg = result.avgTime.toFixed(4).padStart(10);
  const min = result.minTime.toFixed(4).padStart(10);
  const max = result.maxTime.toFixed(4).padStart(10);
  const ops = result.opsPerSec.toFixed(0).padStart(10);
  
  return `${icon} ${name} ${avg}ms  ${min}ms  ${max}ms  ${ops} ops/s`;
}

/**
 * Run all benchmarks
 */
export function runBenchmarks(iterations = 10000): void {
  console.log("\n📊 Performance Benchmark - Current Architecture Baseline\n");
  console.log(`Iterations per test: ${iterations.toLocaleString()}\n`);
  
  console.log("   Test Case                     Avg Time    Min Time    Max Time    Ops/Sec");
  console.log("─".repeat(90));
  
  const results: BenchmarkResult[] = [];
  
  for (const [name, css] of Object.entries(testCases)) {
    const result = benchmarkCase(name, css, iterations);
    results.push(result);
    console.log(formatResult(result));
  }
  
  console.log("─".repeat(90));
  
  // Summary statistics
  const avgOfAvgs = results.reduce((sum, r) => sum + r.avgTime, 0) / results.length;
  const totalOps = results.reduce((sum, r) => sum + r.opsPerSec, 0) / results.length;
  
  console.log(`\n📈 Summary:`);
  console.log(`   Average parse time: ${avgOfAvgs.toFixed(4)}ms`);
  console.log(`   Average throughput: ${totalOps.toFixed(0)} ops/sec`);
  console.log(`   Success rate: ${results.filter(r => r.success).length}/${results.length}\n`);
  
  // Save results to JSON for comparison
  const timestamp = new Date().toISOString();
  const output = {
    timestamp,
    architecture: "current-multi-pass",
    iterations,
    results,
    summary: {
      avgParseTime: avgOfAvgs,
      avgThroughput: totalOps,
      successRate: results.filter(r => r.success).length / results.length,
    },
  };
  
  // Write to file
  const fs = require("node:fs");
  const outputPath = __dirname + "/baseline-results.json";
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`💾 Results saved to: ${outputPath}\n`);
  
  return output as any;
}

// Run if executed directly
if (require.main === module) {
  runBenchmarks(10000);
}
