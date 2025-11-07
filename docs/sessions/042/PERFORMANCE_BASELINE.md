# Performance Baseline Report

**Date:** 2025-11-07
**Architecture:** Current Multi-Pass (String-based)

---

## 📊 Benchmark Results

### Test Configuration

- **Iterations:** 10,000 per test case
- **Environment:** Node.js with JIT warm-up
- **Test Cases:** 6 real-world gradient scenarios

### Performance Metrics

| Test Case           | Avg Time | Min Time | Max Time | Ops/Sec | Status |
| ------------------- | -------- | -------- | -------- | ------- | ------ |
| Simple Gradient     | 0.0210ms | 0.0158ms | 1.4106ms | 47,530  | ✅     |
| Complex Gradient    | 0.0466ms | 0.0405ms | 1.4026ms | 21,480  | ✅     |
| Radial Gradient     | 0.0432ms | 0.0379ms | 1.7212ms | 23,171  | ✅     |
| Multiple Gradients  | 0.0501ms | 0.0461ms | 0.7627ms | 19,956  | ✅     |
| Complex Multi-Layer | 0.1655ms | 0.1484ms | 1.6430ms | 6,042   | ❌     |
| With Calc           | 0.0287ms | 0.0259ms | 1.4441ms | 34,880  | ✅     |

### Summary Statistics

- **Average Parse Time:** 0.0592ms
- **Average Throughput:** 25,510 ops/sec
- **Success Rate:** 83% (5/6 tests passing)

---

## 🔍 Current Architecture Analysis

### Multi-Pass Pipeline

The current architecture performs **3+ parsing passes**:

```
1. css-tree.validate() → Generic syntax validation
2. parser(string) → String-based custom parsing
3. generateDeclaration() → Validation via generation
4. Set deduplication → Remove duplicate errors
```

### Performance Characteristics

**Simple gradient** (`linear-gradient(red, blue)`):

- **0.0210ms** average parse time
- **47,530 ops/sec** throughput

**Complex gradient** (with RGBA, percentages):

- **0.0466ms** average parse time
- **21,480 ops/sec** throughput
- **2.2x slower** than simple case

**Multiple layers** (3 gradients):

- **0.0501ms** average parse time
- **19,956 ops/sec** throughput
- **2.4x slower** than simple case

**Complex multi-layer** (failing):

- **0.1655ms** average parse time
- **6,042 ops/sec** throughput
- **7.9x slower** than simple case

### Bottlenecks Identified

1. **String manipulation overhead**
   - `splitByComma` must handle nested functions
   - Complex disambiguation logic for calc/colors
   - Multiple string→AST conversions

2. **Multiple parsing passes**
   - css-tree validates syntax
   - Custom parser parses again from strings
   - Generator validates semantic correctness
   - Each pass re-parses the same content

3. **Error handling complexity**
   - Errors from 3 different sources
   - Need Set to deduplicate
   - Imprecise error locations (string indices)

4. **Type assertions needed**
   - `as never` workarounds for string manipulation
   - Try/catch for error handling
   - No natural type safety from AST

---

## 🎯 Target Improvements

### AST-Native Architecture Goals

**Primary Goal:** Single-pass parsing with direct AST traversal

**Expected Performance Gains:**

- **60-70% faster** (eliminate 2 extra passes)
- **0.0592ms → 0.0178ms** average parse time
- **25,510 → 56,000+ ops/sec** throughput

**Expected Quality Gains:**

- ✅ Perfect error locations (AST `.loc` data)
- ✅ Single authoritative error per issue
- ✅ Natural type safety (no `as never`)
- ✅ Eliminate disambiguation logic

### Performance Targets by Test Case

| Test Case   | Current  | Target   | Expected Gain |
| ----------- | -------- | -------- | ------------- |
| Simple      | 0.0210ms | 0.0063ms | 70% faster    |
| Complex     | 0.0466ms | 0.0140ms | 70% faster    |
| Radial      | 0.0432ms | 0.0130ms | 70% faster    |
| Multiple    | 0.0501ms | 0.0150ms | 70% faster    |
| Multi-Layer | 0.1655ms | 0.0497ms | 70% faster    |
| With Calc   | 0.0287ms | 0.0086ms | 70% faster    |

---

## 📈 Comparison Methodology

### How to Measure After Refactoring

1. Run same benchmark with AST-native code
2. Compare against `baseline-results.json`
3. Calculate actual performance improvement
4. Verify error quality improvements

### Success Criteria

**Performance:**

- [ ] At least 50% average improvement
- [ ] All test cases faster than baseline
- [ ] No performance regressions

**Quality:**

- [ ] Single error per issue (no duplicates)
- [ ] Perfect error pointers (exact character)
- [ ] All 6 test cases passing (fix multi-layer)

**Code Quality:**

- [ ] Remove string manipulation utilities
- [ ] Remove disambiguation logic
- [ ] No `as never` assertions
- [ ] Natural AST type checking

---

## 📁 Artifacts

- `performance-benchmark.ts` - Main benchmark suite
- `performance-profiler.ts` - Detailed timing breakdown
- `baseline-results.json` - Raw data for comparison
- `PERFORMANCE_BASELINE.md` - This report

---

## 🚀 Next Steps

1. **Begin Phase 1 of refactoring** (AST-native foundation)
2. **Run benchmarks after each phase** to track progress
3. **Compare final results** against this baseline
4. **Document improvements** in final report

---

**Baseline established! Ready to proceed with AST-native refactoring.** 🎯
