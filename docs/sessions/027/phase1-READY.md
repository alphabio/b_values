# ADR Phase 1: Source Context Threading - READY TO START 🚀

**Status:** ✅ Planned & Ready for Implementation  
**Created:** 2025-11-05  
**Session:** 027 (continuation)

---

## Executive Summary

We have a **comprehensive, battle-tested plan** to implement ADR Phase 1 (Source Context Threading). All analysis is complete, approach validated, and tasks broken down.

**Time Estimate:** 6-8 hours over 2 days  
**Risk Level:** Low-Medium (well-contained)  
**Breaking Changes:** Zero  

---

## What We're Building

### Before (Current)
```
Error: RGB r value 300 is out of valid range 0-255
  at path: ["r"]
  property: background-image
```

### After (Phase 1)
```
ERROR: RGB r value 300 is out of valid range 0-255
  at background-image (line 1, column 23)

  1 | background-image: rgb(300 100 50);
    |                       ^^^

  Expected: 0-255
  Received: 300
  Suggestion: Use a value between 0 and 255
```

**Professional, compiler-quality error messages.**

---

## Key Decisions Made

### ✅ Architectural Approach
**Hybrid Strategy (Option D + Context Threading)**

- Attach source context to errors **immediately** when they occur
- Don't pollute IR types with metadata
- Thread context through ParseContext/GenerateContext
- Lazy formatting (format on display, not storage)

**Why this works:**
- Simple implementation
- No IR changes needed
- Performance-friendly (only on error path)
- Backward compatible

### ✅ Offset Tracking
**Cumulative offset with baseOffset + nodeOffset**

Handles multiple coordinate systems:
- Declaration level: full CSS string
- Value level: substring being parsed
- Node level: css-tree AST node position

### ✅ Information Flow
**Parser errors:** Attach immediately from AST node  
**Generator warnings:** Receive via context parameter  

---

## Documentation Created

### 1. Exploration Document
**File:** `docs/sessions/027/phase1-exploration.md`

- Architecture analysis
- Parser chain flow diagram
- Key files to modify
- Implementation strategy (5 phases)
- Challenges & considerations

### 2. Code Trace
**File:** `docs/sessions/027/phase1-code-trace.md`

- Actual code flow traced
- Information loss points identified
- Coordinate system issues analyzed
- 4 implementation options evaluated
- Recommended approach detailed

### 3. Action Plan
**File:** `docs/sessions/027/phase1-action-plan.md`

- **71 specific tasks** broken down
- Code examples for each change
- Test cases included
- Migration strategy defined
- Success metrics listed

---

## Files to Modify

### Core Types (5 files)
- ✅ `b_types/src/result/issue.ts` - SourceContext type, Issue update
- ✅ `b_types/src/result/parse.ts` - ParseContext update
- ✅ `b_types/src/result/generate.ts` - GenerateContext update

### Utilities (2 files, 1 new)
- ✅ `b_utils/src/parse/ast.ts` - extractSourceContext()
- ✅ `b_utils/src/format/source-context.ts` - NEW file for formatting

### Parser Chain (15+ files)
- ✅ `b_declarations/src/parser.ts` - Entry point
- ✅ `b_declarations/src/properties/background-image/parser.ts`
- ✅ `b_parsers/src/color/*.ts` - 7 color parsers
- ✅ `b_parsers/src/gradient/*.ts` - 3 gradient parsers
- ✅ Others as needed

### Tests (10+ new tests)
- Unit tests for SourceContext
- Unit tests for formatSourceContext
- Integration tests for end-to-end flow
- Performance regression tests

**Total:** ~25-30 files affected

---

## Implementation Phases

### Phase 1.1: Foundation (30 min)
- Add SourceContext type
- Update Issue, ParseContext, GenerateContext
- Add helper functions
- **Risk:** Low - pure types

### Phase 1.2: Utilities (1 hour)
- Create extractSourceContext
- Create formatSourceContext
- Add comprehensive tests
- **Risk:** Low - standalone

### Phase 1.3: Parser Integration (2-3 hours)
- Update parseDeclaration
- Update property parsers
- Update color parsers (7 files)
- Update gradient parsers (3 files)
- **Risk:** Medium - many files

### Phase 1.4: Generator Integration (1 hour)
- Thread context through generators
- Update semantic validation
- **Risk:** Low - follows established pattern

### Phase 1.5: Testing & Polish (1-2 hours)
- Integration tests
- Performance tests
- Documentation
- **Risk:** Low - validation

---

## Success Criteria

### Functional
- [ ] Source context in all parser errors
- [ ] Formatted errors show exact location
- [ ] All 994 existing tests pass
- [ ] 10+ new tests added

### Non-Functional
- [ ] Zero breaking changes
- [ ] Performance overhead < 5%
- [ ] TypeScript errors: 0
- [ ] Lint warnings: 0

### Documentation
- [ ] Examples in docs
- [ ] JSDoc on new types
- [ ] Migration guide if needed

---

## Risk Mitigation

### Medium Risk: Parser Integration (Phase 1.3)

**Risk:** Touching many parser files, potential for bugs

**Mitigation:**
1. Start with one color parser (rgb.ts)
2. Test thoroughly before copying pattern
3. Use TypeScript to catch errors
4. Incremental commits (one parser type at a time)

### Low Risk: Performance Impact

**Risk:** Copying source strings everywhere

**Mitigation:**
1. Only attach on errors (not success path)
2. Lazy formatting (format when displaying)
3. Performance test in Phase 1.5
4. Benchmark before/after

### Zero Risk: Breaking Changes

**All changes are backward compatible:**
- Optional fields only
- Existing code unaffected
- Additive API changes

---

## Next Steps

### Immediate
1. Review this comprehensive plan
2. Get stakeholder approval
3. Create feature branch: `feature/phase1-source-context`

### Day 1 (3-4 hours)
```bash
# Start fresh session
git checkout -b feature/phase1-source-context

# Phase 1.1: Types (30 min)
# - Modify b_types/src/result/issue.ts
# - Modify b_types/src/result/parse.ts  
# - Modify b_types/src/result/generate.ts
# - Run tests: just test
# - Commit: "feat(types): add SourceContext for error locations"

# Phase 1.2: Utilities (1 hour)
# - Create b_utils/src/format/source-context.ts
# - Modify b_utils/src/parse/ast.ts
# - Add tests
# - Run tests: just test && just check
# - Commit: "feat(utils): add source context extraction and formatting"

# Phase 1.3: Start parsers (2 hours)
# - Modify b_declarations/src/parser.ts
# - Modify b_parsers/src/color/rgb.ts (first parser)
# - Test thoroughly
# - Commit: "feat(parsers): add source context to entry and rgb parser"
```

### Day 2 (3-4 hours)
```bash
# Continue Phase 1.3: Complete parsers (2 hours)
# - Update remaining 6 color parsers
# - Update 3 gradient parsers
# - Commit: "feat(parsers): add source context to all parsers"

# Phase 1.4: Generators (1 hour)
# - Update generator context threading
# - Commit: "feat(generators): thread source context for warnings"

# Phase 1.5: Testing & Polish (1 hour)
# - Add integration tests
# - Add performance tests
# - Update documentation
# - Commit: "test: add source context integration tests"
# - Commit: "docs: document source context feature"
```

### After Completion
```bash
# Quality checks
just check
just build
just test

# Update session handover
# Open PR for review
# Merge when approved
```

---

## Open Questions (For Discussion)

These don't block implementation but are good to discuss:

1. **Context lines:** 1 line or 3 lines around error?
2. **Minified CSS:** Special handling or just show what's available?
3. **Multiline values:** How to visualize caret across lines?
4. **Caching:** Format once and cache or always format fresh?
5. **Source maps:** Future enhancement for preprocessors?

**Recommendation:** Start simple (1 line, no special cases), enhance later based on user feedback.

---

## Why This Plan Works

### 1. Comprehensive Analysis
- Traced actual code paths
- Identified all boundary points
- Evaluated 4 different approaches
- Selected best option with clear rationale

### 2. Detailed Breakdown
- 71 specific tasks listed
- Code examples for each change
- Tests specified upfront
- Clear success criteria

### 3. Risk Management
- Identified risks at each phase
- Mitigation strategies defined
- Incremental approach reduces blast radius
- Backward compatible by design

### 4. Practical Timeline
- Realistic time estimates (6-8 hours)
- Split across 2 days
- Each phase can be committed independently
- Early feedback possible via draft PR

---

## Resources

**All planning documents:**
- `phase1-exploration.md` - Architecture analysis
- `phase1-code-trace.md` - Code flow validation
- `phase1-action-plan.md` - Task breakdown (THIS IS THE MAIN GUIDE)
- `phase1-READY.md` - This summary

**Reference:**
- css-tree docs: https://github.com/csstree/csstree/blob/master/docs/parsing.md#location
- Existing ADR: (in architecture/decisions/)

---

## Conclusion

**We have everything we need to start.**

The plan is:
- ✅ Comprehensive
- ✅ Detailed
- ✅ Risk-assessed
- ✅ Time-estimated
- ✅ Backward-compatible
- ✅ Test-covered

**This is production-quality planning.**  
**Ready to execute.** 🚀

---

**Let's build this!**

The next session can start with:
```bash
git checkout -b feature/phase1-source-context
# Follow phase1-action-plan.md step by step
```
