# Architecture Patterns

**Permanent reference documentation for core patterns.**

---

## 📚 Available Patterns

### 🎯 Core Implementation Protocols (START HERE)

#### [Property Implementation Protocol](./PROPERTY_IMPLEMENTATION_PROTOCOL.md) ⭐

**THE definitive 5-phase process for implementing any CSS property.**

**Phases:**
1. CSS Value Pattern Detection
2. Dependency Audit
3. Implement Missing Dependencies
4. Scaffold Property
5. Test & Validate

**When to read:** ALWAYS - before implementing ANY new property.

**Why critical:** Ensures consistency, prevents duplication, scales to 50+ properties.

#### [CSS Value Pattern Detection](./CSS_VALUE_PATTERN_DETECTION.md) ⭐

**How to identify reusable CSS value types vs property-specific patterns.**

**Covers:**
- Decision tree for pattern classification
- Rules for package location (@b/keywords vs @b/types vs property dir)
- Pure keyword enums vs complex types vs functions
- Examples across all categories
- Common mistakes and anti-patterns

**When to read:** Phase 1 of Property Implementation Protocol.

**Why critical:** Prevents creating property-specific implementations of reusable patterns.

---

### 📖 Reference Documentation

#### [Property Addition Research](./004-property-addition-research.md)

Deep dive into how properties are built based on `background-image` implementation.

**Covers:**
- Real imports and utilities used
- Package breakdown with actual code
- Key patterns (multi-value parser, namespace imports, type guards)
- Complete utility reference
- Error forwarding and composition

**When to read:** Understanding the system architecture.

#### [CSS Values and Functions](./004-css-values-functions.md)

Complete explanation of CSS value types and function handling.

**Covers:**
- Value categories (simple, functions, gradients)
- Function anatomy and AST structure
- Parsing patterns
- CSS value infrastructure (CssValue type, parseNodeToCssValue, function-dispatcher)
- Real examples from codebase
- Mental model of nested parsers

**When to read:** Understanding how CSS values work, building parsers.

---

## 🎯 How to Use

1. **Quick reference:** Use HOW-TO guides in root `docs/`
2. **Deep understanding:** Read patterns here
3. **Implementation examples:** Check existing code in `packages/`

---

**These docs are the foundation for scaling to 50+ properties with consistency.**
