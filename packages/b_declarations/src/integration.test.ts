// b_path:: packages/b_declarations/src/integration.test.ts
import { describe, expect, it } from "vitest";
import { parseDeclaration } from "./parser";
import { backgroundImageProperty } from "./properties/background-image";

describe("Declaration Layer Integration", () => {
  it("should parse CSS declaration string", () => {
    const result = parseDeclaration("background-image: url(image.png);");

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.property).toBe("background-image");
    expect(result.value.original).toBe("url(image.png)");
    const ir = result.value.ir as { kind: string; layers?: unknown[] };
    expect(ir.kind).toBe("layers");
    if (ir.kind !== "layers" || !ir.layers) return;
    expect(ir.layers).toHaveLength(1);
  });

  it("should parse multiline CSS declaration", () => {
    const result = parseDeclaration(`
      background-image: linear-gradient(to right, red, blue);
    `);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.property).toBe("background-image");
    const ir = result.value.ir as { kind: string; layers?: unknown[] };
    expect(ir.kind).toBe("layers");
  });

  it("should parse object input", () => {
    const result = parseDeclaration({
      property: "background-image",
      value: "url(image.png)",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.property).toBe("background-image");
    const ir = result.value.ir as { kind: string; layers?: unknown[] };
    expect(ir.kind).toBe("layers");
  });

  it("should handle CSS-wide keywords", () => {
    const result = parseDeclaration("background-image: inherit");

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const ir = result.value.ir as { kind: string; value?: string };
    expect(ir.kind).toBe("keyword");
    if (ir.kind !== "keyword") return;
    expect(ir.value).toBe("inherit");
  });

  it("should handle property-specific keywords", () => {
    const result = parseDeclaration("background-image: none;");

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const ir = result.value.ir as { kind: string; value?: string };
    expect(ir.kind).toBe("keyword");
    if (ir.kind !== "keyword") return;
    expect(ir.value).toBe("none");
  });

  it("should provide clear error messages", () => {
    const result = parseDeclaration("unknown-property: some-value");

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.error).toContain("Unknown CSS property");
  });

  it("should verify property is registered", () => {
    expect(backgroundImageProperty.name).toBe("background-image");
  });
});
