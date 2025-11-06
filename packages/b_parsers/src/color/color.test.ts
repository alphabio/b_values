// b_path:: packages/b_parsers/src/color/color.test.ts
import { describe, expect, it } from "vitest";
import { parse, parseNode } from "./color";
import * as cssTree from "css-tree";

describe("parse (color dispatcher)", () => {
  it("parses hex colors", () => {
    const result = parse("#ff0000");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("hex");
    }
  });

  it("parses named colors", () => {
    const result = parse("red");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("named");
    }
  });

  it("parses rgb() functions", () => {
    const result = parse("rgb(255, 0, 0)");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("rgb");
    }
  });

  it("parses hsl() functions", () => {
    const result = parse("hsl(0, 100%, 50%)");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("hsl");
    }
  });

  it("parses hwb() functions", () => {
    const result = parse("hwb(0 0% 0%)");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("hwb");
    }
  });

  it("parses lab() functions", () => {
    const result = parse("lab(50% 40 30)");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("lab");
    }
  });

  it("parses lch() functions", () => {
    const result = parse("lch(50% 40 30)");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("lch");
    }
  });

  it("parses oklab() functions", () => {
    const result = parse("oklab(0.5 0.1 0.1)");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("oklab");
    }
  });

  it("parses oklch() functions", () => {
    const result = parse("oklch(0.5 0.1 180)");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("oklch");
    }
  });

  it("parses color() functions", () => {
    const result = parse("color(srgb 1 0 0)");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("color");
    }
  });

  it("parses var() as variable", () => {
    const result = parse("var(--my-color)");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("variable");
    }
  });

  it("parses special keyword transparent", () => {
    const result = parse("transparent");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("special");
    }
  });

  it("parses special keyword currentcolor", () => {
    const result = parse("currentcolor");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("special");
    }
  });

  it("fails on invalid color syntax", () => {
    const result = parse("not-a-color-{{{");
    expect(result.ok).toBe(false);
    expect(result.issues[0]?.code).toBe("invalid-syntax");
  });

  it("fails on empty value", () => {
    const result = parse("");
    expect(result.ok).toBe(false);
    expect(result.issues[0]?.code).toBe("invalid-syntax");
  });

  it("fails on unsupported color function", () => {
    const result = parse("device-cmyk(0 0 0 1)");
    expect(result.ok).toBe(false);
    expect(result.issues[0]?.code).toBe("unsupported-kind");
  });
});

describe("parseNode (color node dispatcher)", () => {
  it("parses Hash node as hex color", () => {
    const ast = cssTree.parse("#ff0000", { context: "value" });
    let hashNode: cssTree.CssNode | null = null;
    cssTree.walk(ast, (node) => {
      if (node.type === "Hash") hashNode = node;
    });

    if (!hashNode) throw new Error("No Hash node found");

    const result = parseNode(hashNode);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("hex");
    }
  });

  it("fails on invalid hex color", () => {
    const ast = cssTree.parse("#gg0000", { context: "value" });
    let hashNode: cssTree.CssNode | null = null;
    cssTree.walk(ast, (node) => {
      if (node.type === "Hash") hashNode = node;
    });

    if (!hashNode) throw new Error("No Hash node found");

    const result = parseNode(hashNode);
    expect(result.ok).toBe(false);
    expect(result.issues[0]?.code).toBe("invalid-value");
  });

  it("parses Identifier node as named color", () => {
    const ast = cssTree.parse("red", { context: "value" });
    let identNode: cssTree.CssNode | null = null;
    cssTree.walk(ast, (node) => {
      if (node.type === "Identifier") identNode = node;
    });

    if (!identNode) throw new Error("No Identifier node found");

    const result = parseNode(identNode);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("named");
    }
  });

  it("fails on unsupported node type", () => {
    const ast = cssTree.parse("10px", { context: "value" });
    let dimensionNode: cssTree.CssNode | null = null;
    cssTree.walk(ast, (node) => {
      if (node.type === "Dimension") dimensionNode = node;
    });

    if (!dimensionNode) throw new Error("No Dimension node found");

    const result = parseNode(dimensionNode);
    expect(result.ok).toBe(false);
    expect(result.issues[0]?.code).toBe("invalid-syntax");
  });

  it("handles var() function node", () => {
    const ast = cssTree.parse("var(--col)", { context: "value" });
    let funcNode: cssTree.CssNode | null = null;
    cssTree.walk(ast, (node) => {
      if (node.type === "Function" && node.name === "var") funcNode = node;
    });

    if (!funcNode) throw new Error("No Function node found");

    const result = parseNode(funcNode);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.kind).toBe("variable");
    }
  });
});
