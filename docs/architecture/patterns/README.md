# Architecture Patterns

**Permanent reference documentation for core patterns.**

---

## 📚 Available Patterns

### [Property Addition Research](./property-addition-research.md)

Deep dive into how properties are built based on `background-image` implementation.

**Covers:**

- Real imports and utilities used
- Package breakdown with actual code
- Key patterns (multi-value parser, namespace imports, type guards)
- Complete utility reference
- Error forwarding and composition

**When to read:** Before adding properties, understanding the system.

### [CSS Values and Functions](./css-values-functions.md)

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
