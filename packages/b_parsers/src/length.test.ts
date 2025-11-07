// b_path:: packages/b_parsers/src/length.test.ts
import { describe, expect, it } from "vitest";
import { parseLengthNode, parseLengthPercentageNode, parseNumberNode } from "./length";
import type * as csstree from "@eslint/css-tree";

describe("parseLengthNode", () => {
  it("should parse px length", () => {
    const node: csstree.Dimension = {
      type: "Dimension",
      value: "100",
      unit: "px",
    };
    const result = parseLengthNode(node);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ value: 100, unit: "px" });
    }
  });

  it("should parse rem length", () => {
    const node: csstree.Dimension = {
      type: "Dimension",
      value: "2.5",
      unit: "rem",
    };
    const result = parseLengthNode(node);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ value: 2.5, unit: "rem" });
    }
  });

  it("should parse em length", () => {
    const node: csstree.Dimension = {
      type: "Dimension",
      value: "1.5",
      unit: "em",
    };
    const result = parseLengthNode(node);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ value: 1.5, unit: "em" });
    }
  });

  it("should parse vw length", () => {
    const node: csstree.Dimension = {
      type: "Dimension",
      value: "50",
      unit: "vw",
    };
    const result = parseLengthNode(node);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ value: 50, unit: "vw" });
    }
  });

  it("should reject invalid length value", () => {
    const node: csstree.Dimension = {
      type: "Dimension",
      value: "invalid",
      unit: "px",
    };
    const result = parseLengthNode(node);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.message).toContain("Invalid length value");
    }
  });

  it("should reject invalid length unit", () => {
    const node: csstree.Dimension = {
      type: "Dimension",
      value: "100",
      unit: "deg",
    };
    const result = parseLengthNode(node);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.message).toContain("Invalid length unit");
    }
  });

  it("should reject non-dimension node", () => {
    const node: csstree.Identifier = {
      type: "Identifier",
      name: "auto",
    };
    const result = parseLengthNode(node);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.message).toContain("Expected length dimension");
    }
  });
});

describe("parseLengthPercentageNode", () => {
  it("should parse zero without unit", () => {
    const node: csstree.CssNode = {
      type: "Number",
      value: "0",
    };
    const result = parseLengthPercentageNode(node);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ value: 0, unit: "px" });
    }
  });

  it("should reject non-zero unitless value", () => {
    const node: csstree.CssNode = {
      type: "Number",
      value: "10",
    };
    const result = parseLengthPercentageNode(node);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.message).toContain("Unitless values must be zero");
    }
  });

  it("should parse px length-percentage", () => {
    const node: csstree.Dimension = {
      type: "Dimension",
      value: "100",
      unit: "px",
    };
    const result = parseLengthPercentageNode(node);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ value: 100, unit: "px" });
    }
  });

  it("should parse percentage", () => {
    const node: csstree.Percentage = {
      type: "Percentage",
      value: "50",
    };
    const result = parseLengthPercentageNode(node);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ value: 50, unit: "%" });
    }
  });

  it("should parse rem length-percentage", () => {
    const node: csstree.Dimension = {
      type: "Dimension",
      value: "2",
      unit: "rem",
    };
    const result = parseLengthPercentageNode(node);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ value: 2, unit: "rem" });
    }
  });

  it("should reject invalid dimension value", () => {
    const node: csstree.Dimension = {
      type: "Dimension",
      value: "invalid",
      unit: "px",
    };
    const result = parseLengthPercentageNode(node);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.message).toContain("Invalid length value");
    }
  });

  it("should reject invalid percentage value", () => {
    const node: csstree.Percentage = {
      type: "Percentage",
      value: "invalid",
    };
    const result = parseLengthPercentageNode(node);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.message).toContain("Invalid percentage value");
    }
  });

  it("should reject invalid length unit", () => {
    const node: csstree.Dimension = {
      type: "Dimension",
      value: "100",
      unit: "deg",
    };
    const result = parseLengthPercentageNode(node);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.message).toContain("Invalid length unit");
    }
  });

  it("should reject invalid node type", () => {
    const node: csstree.Identifier = {
      type: "Identifier",
      name: "auto",
    };
    const result = parseLengthPercentageNode(node);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.message).toContain("Expected length or percentage");
    }
  });
});

describe("parseNumberNode", () => {
  it("should parse integer", () => {
    const node: csstree.CssNode = {
      type: "Number",
      value: "42",
    };
    const result = parseNumberNode(node);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(42);
    }
  });

  it("should parse decimal", () => {
    const node: csstree.CssNode = {
      type: "Number",
      value: "3.14",
    };
    const result = parseNumberNode(node);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(3.14);
    }
  });

  it("should parse negative number", () => {
    const node: csstree.CssNode = {
      type: "Number",
      value: "-5",
    };
    const result = parseNumberNode(node);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(-5);
    }
  });

  it("should parse zero", () => {
    const node: csstree.CssNode = {
      type: "Number",
      value: "0",
    };
    const result = parseNumberNode(node);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(0);
    }
  });

  it("should reject invalid number value", () => {
    const node: csstree.CssNode = {
      type: "Number",
      value: "invalid",
    };
    const result = parseNumberNode(node);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.message).toContain("Invalid number value");
    }
  });

  it("should reject non-number node", () => {
    const node: csstree.Identifier = {
      type: "Identifier",
      name: "auto",
    };
    const result = parseNumberNode(node);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.message).toContain("Expected number");
    }
  });
});
