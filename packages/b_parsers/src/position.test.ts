// b_path:: packages/b_parsers/src/position.test.ts
import { describe, expect, it } from "vitest";
import { parsePositionValueNode, parsePosition2D, parseAtPosition } from "./position";
import type * as csstree from "css-tree";

describe("parsePositionValueNode", () => {
  it("should parse center keyword", () => {
    const node: csstree.Identifier = {
      type: "Identifier",
      name: "center",
    };
    const result = parsePositionValueNode(node);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("center");
    }
  });

  it("should parse left keyword", () => {
    const node: csstree.Identifier = {
      type: "Identifier",
      name: "left",
    };
    const result = parsePositionValueNode(node);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("left");
    }
  });

  it("should parse right keyword", () => {
    const node: csstree.Identifier = {
      type: "Identifier",
      name: "right",
    };
    const result = parsePositionValueNode(node);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("right");
    }
  });

  it("should parse top keyword", () => {
    const node: csstree.Identifier = {
      type: "Identifier",
      name: "top",
    };
    const result = parsePositionValueNode(node);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("top");
    }
  });

  it("should parse bottom keyword", () => {
    const node: csstree.Identifier = {
      type: "Identifier",
      name: "bottom",
    };
    const result = parsePositionValueNode(node);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("bottom");
    }
  });

  it("should parse case-insensitive keyword", () => {
    const node: csstree.Identifier = {
      type: "Identifier",
      name: "CENTER",
    };
    const result = parsePositionValueNode(node);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("center");
    }
  });

  it("should reject invalid keyword", () => {
    const node: csstree.Identifier = {
      type: "Identifier",
      name: "invalid",
    };
    const result = parsePositionValueNode(node);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Invalid position keyword: invalid");
    }
  });

  it("should parse percentage", () => {
    const node: csstree.Percentage = {
      type: "Percentage",
      value: "50",
    };
    const result = parsePositionValueNode(node);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ value: 50, unit: "%" });
    }
  });

  it("should parse px length", () => {
    const node: csstree.Dimension = {
      type: "Dimension",
      value: "100",
      unit: "px",
    };
    const result = parsePositionValueNode(node);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ value: 100, unit: "px" });
    }
  });
});

describe("parsePosition2D", () => {
  it("should parse single horizontal keyword", () => {
    const nodes: csstree.CssNode[] = [{ type: "Identifier", name: "left" }];
    const result = parsePosition2D(nodes, 0);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.position).toEqual({ horizontal: "left", vertical: "center" });
      expect(result.value.nextIdx).toBe(1);
    }
  });

  it("should parse single vertical keyword", () => {
    const nodes: csstree.CssNode[] = [{ type: "Identifier", name: "top" }];
    const result = parsePosition2D(nodes, 0);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.position).toEqual({ horizontal: "center", vertical: "top" });
      expect(result.value.nextIdx).toBe(1);
    }
  });

  it("should parse single percentage", () => {
    const nodes: csstree.CssNode[] = [{ type: "Percentage", value: "50" }];
    const result = parsePosition2D(nodes, 0);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.position).toEqual({
        horizontal: { value: 50, unit: "%" },
        vertical: "center",
      });
      expect(result.value.nextIdx).toBe(1);
    }
  });

  it("should parse two horizontal keywords", () => {
    const nodes: csstree.CssNode[] = [
      { type: "Identifier", name: "left" },
      { type: "Identifier", name: "top" },
    ];
    const result = parsePosition2D(nodes, 0);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.position).toEqual({ horizontal: "left", vertical: "top" });
      expect(result.value.nextIdx).toBe(2);
    }
  });

  it("should parse center center", () => {
    const nodes: csstree.CssNode[] = [
      { type: "Identifier", name: "center" },
      { type: "Identifier", name: "center" },
    ];
    const result = parsePosition2D(nodes, 0);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.position).toEqual({ horizontal: "center", vertical: "center" });
      expect(result.value.nextIdx).toBe(2);
    }
  });

  it("should parse percentage positions", () => {
    const nodes: csstree.CssNode[] = [
      { type: "Percentage", value: "25" },
      { type: "Percentage", value: "75" },
    ];
    const result = parsePosition2D(nodes, 0);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.position).toEqual({
        horizontal: { value: 25, unit: "%" },
        vertical: { value: 75, unit: "%" },
      });
      expect(result.value.nextIdx).toBe(2);
    }
  });

  it("should parse mixed keyword and length", () => {
    const nodes: csstree.CssNode[] = [
      { type: "Identifier", name: "left" },
      { type: "Dimension", value: "50", unit: "px" },
    ];
    const result = parsePosition2D(nodes, 0);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.position).toEqual({
        horizontal: "left",
        vertical: { value: 50, unit: "px" },
      });
      expect(result.value.nextIdx).toBe(2);
    }
  });

  it("should parse px positions", () => {
    const nodes: csstree.CssNode[] = [
      { type: "Dimension", value: "100", unit: "px" },
      { type: "Dimension", value: "200", unit: "px" },
    ];
    const result = parsePosition2D(nodes, 0);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.position).toEqual({
        horizontal: { value: 100, unit: "px" },
        vertical: { value: 200, unit: "px" },
      });
      expect(result.value.nextIdx).toBe(2);
    }
  });

  it("should handle startIdx offset", () => {
    const nodes: csstree.CssNode[] = [
      { type: "Identifier", name: "dummy" },
      { type: "Identifier", name: "center" },
    ];
    const result = parsePosition2D(nodes, 1);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.position).toEqual({ horizontal: "center", vertical: "center" });
      expect(result.value.nextIdx).toBe(2);
    }
  });

  it("should reject empty nodes", () => {
    const nodes: csstree.CssNode[] = [];
    const result = parsePosition2D(nodes, 0);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Expected position value");
    }
  });

  it("should reject startIdx beyond array", () => {
    const nodes: csstree.CssNode[] = [{ type: "Identifier", name: "center" }];
    const result = parsePosition2D(nodes, 5);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Expected position value");
    }
  });
});

describe("parseAtPosition", () => {
  it("should parse 'at center'", () => {
    const nodes: csstree.CssNode[] = [
      { type: "Identifier", name: "at" },
      { type: "Identifier", name: "center" },
    ];
    const result = parseAtPosition(nodes, 0);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.position).toEqual({ horizontal: "center", vertical: "center" });
      expect(result.value.nextIdx).toBe(2);
    }
  });

  it("should parse 'at left top'", () => {
    const nodes: csstree.CssNode[] = [
      { type: "Identifier", name: "at" },
      { type: "Identifier", name: "left" },
      { type: "Identifier", name: "top" },
    ];
    const result = parseAtPosition(nodes, 0);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.position).toEqual({ horizontal: "left", vertical: "top" });
      expect(result.value.nextIdx).toBe(3);
    }
  });

  it("should parse 'at 50% 75%'", () => {
    const nodes: csstree.CssNode[] = [
      { type: "Identifier", name: "at" },
      { type: "Percentage", value: "50" },
      { type: "Percentage", value: "75" },
    ];
    const result = parseAtPosition(nodes, 0);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.position).toEqual({
        horizontal: { value: 50, unit: "%" },
        vertical: { value: 75, unit: "%" },
      });
      expect(result.value.nextIdx).toBe(3);
    }
  });

  it("should return undefined position when no 'at' keyword", () => {
    const nodes: csstree.CssNode[] = [{ type: "Identifier", name: "center" }];
    const result = parseAtPosition(nodes, 0);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.position).toBeUndefined();
      expect(result.value.nextIdx).toBe(0);
    }
  });

  it("should handle case-insensitive 'at'", () => {
    const nodes: csstree.CssNode[] = [
      { type: "Identifier", name: "AT" },
      { type: "Identifier", name: "center" },
    ];
    const result = parseAtPosition(nodes, 0);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.position).toEqual({ horizontal: "center", vertical: "center" });
      expect(result.value.nextIdx).toBe(2);
    }
  });

  it("should handle startIdx offset", () => {
    const nodes: csstree.CssNode[] = [
      { type: "Identifier", name: "dummy" },
      { type: "Identifier", name: "at" },
      { type: "Identifier", name: "center" },
    ];
    const result = parseAtPosition(nodes, 1);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.position).toEqual({ horizontal: "center", vertical: "center" });
      expect(result.value.nextIdx).toBe(3);
    }
  });

  it("should return undefined when startIdx beyond array", () => {
    const nodes: csstree.CssNode[] = [{ type: "Identifier", name: "at" }];
    const result = parseAtPosition(nodes, 5);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.position).toBeUndefined();
      expect(result.value.nextIdx).toBe(5);
    }
  });

  it("should reject 'at' without position", () => {
    const nodes: csstree.CssNode[] = [{ type: "Identifier", name: "at" }];
    const result = parseAtPosition(nodes, 0);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Expected position after 'at'");
    }
  });
});
