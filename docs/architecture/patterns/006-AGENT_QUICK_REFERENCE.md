# 🤖 Agent Quick Reference: CSS Property Creation

_Concise checklist for AI agents implementing CSS properties_

## 🎯 Property Type Decision Matrix

| Property Example                   | Type   | multiValue | Parser Pattern           |
| ---------------------------------- | ------ | ---------- | ------------------------ |
| `color: red`                       | Single | `false`    | `(node: csstree.Value)`  |
| `background-image: url(a), url(b)` | Multi  | `true`     | `createMultiValueParser` |
| `font-family: Arial, sans-serif`   | Multi  | `true`     | `createMultiValueParser` |
| `width: 100px`                     | Single | `false`    | `(node: csstree.Value)`  |

## 📁 Required Files Checklist

```
packages/b_declarations/src/properties/{property-name}/
├── ✅ index.ts          ← export * from "./{definition,generator,parser,types}";
├── ✅ definition.ts     ← defineProperty<PropertyIR>({ name, syntax, parser, multiValue, generator, inherited, initial })
├── ✅ types.ts          ← z.discriminatedUnion("kind", [...])
├── ✅ parser.ts         ← Single: (node) => ParseResult | Multi: createMultiValueParser
├── ✅ generator.ts      ← (ir) => GenerateResult with property name
├── ✅ parser.test.ts    ← describe("valid|invalid|edge cases")
└── ✅ generator.test.ts ← describe("generation from IR")
```

## 🔧 Code Templates

### Single-Value Property

**types.ts:**

```typescript
import { z } from "zod";
import * as Keywords from "@b/keywords";

export const myPropertyIR = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("keyword"), value: Keywords.cssWide }),
  z.object({ kind: z.literal("value"), value: /* schema */ }),
]);
export type MyPropertyIR = z.infer<typeof myPropertyIR>;
```

**parser.ts:**

```typescript
import { type ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import type { MyPropertyIR } from "./types";

export function parseMyProperty(node: csstree.Value): ParseResult<MyPropertyIR> {
  const result = Parsers.Type.parseType(node);
  if (result.ok) return { ok: true, value: { kind: "value", value: result.value }, issues: [] };
  return { ok: false, value: undefined, issues: result.issues };
}
```

**definition.ts:**

```typescript
import { defineProperty } from "../../core";

export const myProperty = defineProperty<MyPropertyIR>({
  name: "my-property",
  syntax: "<type>",
  parser: parseMyProperty,
  multiValue: false, // ← SINGLE VALUE
  generator: generateMyProperty,
  inherited: false,
  initial: "value",
});
```

### Multi-Value Property

**parser.ts:**

```typescript
import { createMultiValueParser } from "../../utils";

export const parseMyMultiProperty = createMultiValueParser<ItemType, MyPropertyIR>({
  preParse: (value) => (value === "none" ? parseOk({ kind: "keyword", value: "none" }) : null),
  itemParser: (node) => Parsers.Type.parseType(node),
  aggregator: (items) => ({ kind: "list", values: items }),
});
```

**definition.ts:**

```typescript
export const myMultiProperty = defineProperty<MyPropertyIR>({
  name: "my-multi-property",
  syntax: "<type>#",
  parser: parseMyMultiProperty,
  multiValue: true, // ← MULTI VALUE
  generator: generateMyMultiProperty,
  inherited: false,
  initial: "none",
});
```

## ⚡ Implementation Speed Run

1. **Create directory:** `mkdir packages/b_declarations/src/properties/{name}`
2. **Copy template files** from existing similar property
3. **Find/replace** property names throughout
4. **Update types.ts** with correct schema
5. **Update parser.ts** with correct parsers
6. **Update generator.ts** with correct generators
7. **Update definition.ts** metadata
8. **Add to types.map.ts**
9. **Add to properties/index.ts**
10. **Run tests:** `just test`

## 🚨 Critical Gotchas

| ❌ Wrong                | ✅ Correct               | Issue                            |
| ----------------------- | ------------------------ | -------------------------------- |
| `multiValue: undefined` | `multiValue: false`      | Parser gets wrong input type     |
| `Keywords.inherit`      | `Keywords.cssWide`       | CSS-wide handled by orchestrator |
| `createError("failed")` | Preserve `result.issues` | Lose specific error context      |
| `property: undefined`   | `property: "my-prop"`    | Missing property context         |
| Missing path context    | `[...parentPath, key]`   | Nested error location lost       |

## 📊 Available Parsers & Generators

**Common Parsers:**

- `Parsers.Color.parseColor`
- `Parsers.Length.parseLength`
- `Parsers.Angle.parseAngle`
- `Parsers.Position.parsePosition`
- `Parsers.Image.parseImageValue`
- `Parsers.Url.parseUrl`

**Common Generators:**

- `Generators.Color.generateColor`
- `Generators.Length.generateLength`
- `Generators.Background.generateImageValue`
- `Generators.Position.generatePosition`

**Keywords Available:**

- `Keywords.cssWide` (inherit, initial, unset, revert, revert-layer)
- `Keywords.none`
- `Keywords.backgroundAttachment`
- `Keywords.backgroundClip`
- `Keywords.position`

## 🧪 Essential Test Patterns

```typescript
// Parser tests
describe("parseMyProperty", () => {
  describe("valid values", () => {
    it("should parse basic values", () => {
      const result = parseMyProperty(parseValueNode("red"));
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.kind).toBe("color");
    });
  });

  describe("invalid values", () => {
    it("should reject invalid input", () => {
      const result = parseMyProperty(parseValueNode("invalid"));
      expect(result.ok).toBe(false);
      expect(result.issues[0]?.code).toBeDefined();
    });
  });
});

// Generator tests
describe("generateMyProperty", () => {
  it("should generate CSS from IR", () => {
    const ir = { kind: "color", value: { kind: "named", value: "red" } };
    const result = generateMyProperty(ir);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toBe("red");
    expect(result.property).toBe("my-property");
  });
});
```

## 🔍 Quick Validation

**After implementation, verify:**

- [ ] `just test` passes
- [ ] `just check` passes
- [ ] Property shows in type map
- [ ] Parser handles keywords correctly
- [ ] Generator includes property name
- [ ] Tests cover error cases
- [ ] Multi-value handles commas correctly

## 📚 Reference Properties

**Study these for patterns:**

- **Simple single:** `background-attachment`
- **Complex multi:** `background-image`
- **Keyword-heavy:** `background-clip`
- **Custom:** `custom-property`

---

_Follow this reference exactly for fast, consistent property implementation._
