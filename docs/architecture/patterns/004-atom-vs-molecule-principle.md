### The "Atom vs. Molecule" Principle

Your proposed orchestration is almost perfect:

- keywords -> `b_keywords` (Correct)
- parsers -> `b_parsers` (Correct)
- generators -> `b_generators` (Correct)
- b_declarations is the glue/orchestrator (Correct)
- types / value types -> `b_types` (**This is the one we must refine**)

You have discovered the crucial distinction that separates primitives from composites. Let's call it the **"Atom vs. Molecule"** principle.

---

**Atoms** are the fundamental, context-free, indivisible building blocks of CSS values. They are universal and can be used everywhere.

- `<length>`
- `<percentage>`
- `<angle>`
- `<color>`
- `<integer>`
- `<string>`

**Molecules** are complex, structured values that are **composed of Atoms**. They are often "functions" or complex component values.

- `<linear-gradient()>` is a molecule made of atoms like `<angle>` and `<color>`.
- `<url()>` is a molecule made of atoms like `<string>`.
- `<shadow>` is a molecule made of atoms like `<length>` and `<color>`.
- `<bg-size>` (the value type for `background-size`) is a molecule made of atoms like `<length-percentage>` and the keyword `auto`.

This distinction is the key. Let's define the roles of your packages with this new clarity.

---

### The Definitive Architectural Blueprint

This is the rule set that resolves all ambiguity.

#### `packages/b_keywords` (The Lexicon)

- **Role:** Defines the vocabulary of the CSS language.
- **Contains:** Schemas for sets of keyword literals (`srgb`, `display-p3`, `top`, `left`, `cover`, `contain`).
- **Rule:** If it's a defined set of raw string identifiers in the spec, its schema goes here.

#### `packages/b_types` (The Atomic Chart & Reusable Molecules)

- **Role:** Defines the TypeScript/Zod shapes for **Atoms** and common, **reusable Molecules**.
- **Contains ATOMS:**
  - `Length`, `Percentage`, `Angle`, `Time`, `Number`, `Integer`...
  - The universal `CssValue` that can represent any atom.
- **Contains Reusable MOLECULES:**
  - `ColorIR` (a color is a complex molecule of spaces and channels)
  - `GradientIR` (gradients are used in many properties)
  - `ShadowIR` (`box-shadow` and `text-shadow` share this structure)
  - `UrlIR`
- **Rule:** If a type is a fundamental building block OR a complex value shape that can be reused across _multiple, unrelated properties_, its IR schema belongs here. `b_types` should depend only on `b_keywords` and `zod`.

#### `packages/b_parsers` (The Molecule Factory)

- **Role:** Contains the logic to build molecules.
- **Contains:** Functions like `parseGradientFromNode`, `parseColorStop`, `parseUrlFromNode`. These functions take a `csstree` AST node and produce an IR object that conforms to a schema from `b_types`.
- **Rule:** If you need to write logic to parse a complex, reusable component value (a Molecule), the parser function goes here.

#### `packages/b_declarations` (The Orchestrator)

- **Role:** Maps CSS **Properties** to their parsers and defines the final, top-level IR for each property.
- **Contains:**
  - The `defineProperty` map.
  - Property-specific folders (`/properties/background-image/`, `/properties/background-size/`).
  - **Property-specific, non-reusable IR types.** This is where your `<bg-size>` IR definition (`SingleBackgroundSizeIR`) belongs! It's effectively a "private" molecule used only for the `background-size` and `mask-size` family of properties.
- **Rule:** This is the top layer. It consumes everything from the other packages to perform its job.

### Let's Apply This Blueprint to `linear-gradient`

Your breakdown was perfect. Here's where each piece fits in the new model:

- `<linear-gradient()>`: A **reusable Molecule**. The parser logic (`parseLinearGradient`) goes in `b_parsers`. The final shape (`LinearGradientIR`) goes in **`b_types`**.
- `<angle>`: An **Atom**. Its schema (`angleSchema`) is in `b_types`.
- `<zero>`: A value, not a type. Handled by the `<length>` or `<number>` parser. Doesn't need a unique type.
- `<side-or-corner>`: **Lexicon**. `sideOrCornerKeywordSchema` goes in `b_keywords`.
- `<color-interpolation-method>`: A **reusable sub-Molecule**. The parser logic goes in `b_parsers`, and its IR schema (`ColorInterpolationMethodIR`) goes in `b_types`.
- `<rectangular-color-space>`: **Lexicon**. `rectangularColorSpaceSchema` goes in `b_keywords`.
- `<polar-color-space>`: **Lexicon**. `polarColorSpaceSchema` goes in `b_keywords`.
- `<hue-interpolation-method>`: **Lexicon**. A simple set of keywords that modify the color space. `hueInterpolationSchema` goes in `b_keywords`.
- `<linear-color-stop>`: Part of the `<linear-gradient>` molecule. The parser in `b_parsers` knows how to build this structure. Its shape, `ColorStopIR`, is defined as part of the `GradientIR` in `b_types`.
- `<color-stop-length>`: A **Molecule** of one or two `<length-percentage>` **Atoms**. The logic to parse this is part of the `linear-gradient` parser. The IR to represent it is just `[LengthPercentage, LengthPercentage?]`.

### The Ambiguity is Gone

Your approach didn't fail. It revealed the need for this crucial "Atom vs. Molecule" distinction.

- `b_types` is not for _all_ types. It's for **primitive atomic types** and **common, reusable composite types (molecules)**. `Gradient` is reusable. `Shadow` is reusable.
- The IR for `<bg-size>` is a composite type, but it's not widely reusable. Its primary home is inside the `background-size` property definition. Therefore, its schema lives locally in `b_declarations/properties/background-size/types.ts`. This co-locates the specific an one-off logic.

This is the clean, consistent, and scalable architecture you've been working toward. The schema doesn't just drive the process—it is now properly organized according to its role as a primitive building block or a composite entity.
