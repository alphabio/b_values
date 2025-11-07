# b_values

![Status: Pre-Alpha](https://img.shields.io/badge/status-pre--alpha-orange)

`b_values` is a type-safe, bidirectional CSS declaration parser and generator, built from the ground up with a focus on architectural purity, robust error handling, and developer experience. It translates CSS declaration strings into a strict, well-defined Intermediate Representation (IR) and can generate CSS strings back from that IR.

It is built with TypeScript and Zod to provide strong compile-time and run-time guarantees about the shape of your CSS data...

## Core Philosophy

This library is designed to be more than just a string-splitter. It is built on a few core principles:

- **Bidirectional & Lossless (in spirit):** The system can parse CSS into a structured IR and generate it back out. While it canonicalizes syntax (e.g., `rgb(0,0,0)` might become `rgb(0 0 0)`), it preserves the semantic meaning.
- **Type-Safe IR:** The shape of every CSS property's value is defined by a Zod schema. This eliminates entire classes of bugs and makes the data structure self-documenting and verifiable.
- **Resilient by Design:** When parsing lists (e.g., multiple background layers), a failure in one item does not prevent other valid items from being parsed.
- **Rich Error Reporting:** Parse and generate operations never throw. They return a `Result` object containing either the value or a detailed array of `issues` (errors or warnings), complete with contextual messages and suggestions.
- **First-Class Symbolic Values:** CSS values like `var(...)` and `calc(...)` are not treated as opaque strings. They are parsed into their own structured IR nodes, allowing for deep introspection and manipulation.
- **Architecturally Sound:** The system uses a clear Orchestrator Pattern to separate concerns. High-level orchestrators handle universal logic (like CSS-wide keywords) and delegate property-specific logic to specialized parsers.

---

## Quick Start & Examples

### Basic Parsing (CSS String → IR)

The primary entry point is `parseDeclaration` from the `@b/declarations` package.

```typescript
import { parseDeclaration } from "@b/declarations";

const css = "background-color: red;";

const result = parseDeclaration(css);

if (result.ok) {
  console.log(result.value);
  // {
  //   property: 'background-color',
  //   ir: { kind: 'named', name: 'red' }
  // }
}
```

### Basic Generation (IR → CSS String)

Use `generateDeclaration` to turn an IR object back into a CSS string.

```typescript
import { generateDeclaration } from "@b/declarations";

const declarationIR = {
  property: "background-color" as const,
  ir: { kind: "named", name: "red" },
};

const result = generateDeclaration(declarationIR);

if (result.ok) {
  console.log(result.value);
  // "background-color: red"
}
```

### Advanced Parsing: Lists & Functions

`b_values` excels at parsing complex, modern CSS.

```typescript
import { parseDeclaration } from "@b/declarations";

const css = 'background-image: url("stars.png"), linear-gradient(to right, #f00, oklch(50% 0.25 20));';

const result = parseDeclaration(css);

// The resulting `ir` would look like this (simplified):
// {
//   property: 'background-image',
//   ir: {
//     kind: 'list',
//     values: [
//       { kind: 'url', url: 'stars.png' },
//       {
//         kind: 'gradient',
//         gradient: {
//           kind: 'linear',
//           direction: { kind: 'to-side', value: 'right' },
//           colorStops: [
//             { color: { kind: 'hex', value: '#f00' } },
//             {
//               color: {
//                 kind: 'oklch',
//                 l: { kind: 'literal', value: 50, unit: '%' },
//                 c: { kind: 'literal', value: 0.25 },
//                 h: { kind: 'literal', value: 20 }
//               }
//             }
//           ]
//         }
//       }
//     ]
//   }
// }
```

### Error Handling

The library never throws on invalid input, instead returning meticulous error reports.

```typescript
import { parseDeclaration } from "@b/declarations";

// CSS with a syntax error (three values for background-size is invalid)
const css = "background-size: 50% 100px 200px;";

const result = parseDeclaration(css);

console.log(result.ok); // false

if (!result.ok) {
  console.log(result.issues);
  // [
  //   {
  //     "code": "invalid-syntax",
  //     "severity": "error",
  //     "message": "Unexpected content after a valid value, likely a missing comma. Unparsed: \"200px\""
  //   }
  // ]
}
```

---

## Architecture Overview

The project is a monorepo with a strict separation of concerns between packages.

| Package               | Responsibility                                                                                                                                                                        |
| :-------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`@b/types`**        | Defines all **reusable component value schemas** (e.g., `<image>`, `<color>`, `<bg-size>`) and the `Result` system.                                                                   |
| **`@b/keywords`**     | Defines the **vocabulary** of CSS. Provides Zod schemas for all keyword sets (`cssWide`, `namedColor`, etc.).                                                                         |
| **`@b/units`**        | Defines the **vocabulary** of CSS units (`px`, `deg`, `vw`, etc.).                                                                                                                    |
| **`@b/parsers`**      | Contains low-level **component parsers** that turn `css-tree` AST nodes into `b_types` IR (e.g., `parseColorNode`).                                                                   |
| **`@b/generators`**   | Contains low-level **component generators** that turn `b_types` IR back into CSS strings (e.g., `generateColor`).                                                                     |
| **`@b/declarations`** | **The main engine.** Orchestrates everything. Defines **full property IRs**, registers properties, and provides the top-level `parseDeclaration` and `generateDeclaration` functions. |
| **`@b/utils`**        | Shared utility functions for string manipulation, AST traversal, and validation helpers.                                                                                              |

### The `CssValue` vs. Property `IR` Distinction

A fundamental concept is the separation of a reusable CSS _component value_ from the final _property IR_.

- **Component Value (`CssValue` in `@b/types`)**: A low-level, reusable building block. For example, the `<bg-size>` type is defined in `@b/types` because it's a reusable component used by both `background-size` and `mask-size`.
- **Property IR (`...IR` in `@b/declarations`)**: The final, top-level schema for a specific property. For example, `BackgroundSizeIR` is defined in `@b/declarations`. It orchestrates the `<bg-size>` component type into a final structure that includes a list (`kind: 'list'`) and the ability to be a CSS-wide keyword (`kind: 'keyword'`).

This separation ensures that common CSS value types are defined once and reused everywhere, while property-specific logic remains cleanly encapsulated.

## Development

1. **Install Dependencies:**

   ```bash
   npm install
   ```

2. **Run Tests:**

   ```bash
   npm test
   ```

## License

MIT
