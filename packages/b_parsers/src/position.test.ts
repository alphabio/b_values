// b_path:: packages/b_parsers/src/position.test.ts
import { describe, expect, it } from "vitest";
import { parsePosition2D } from "./position";
import type * as csstree from "css-tree";

describe("parsePosition2D", () => {
  it("should parse single horizontal keyword", () => {
    const nodes: csstree.CssNode[] = [{ type: "Identifier", name: "left" }];
    const result = parsePosition2D(nodes, 0);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.position).toEqual({
        horizontal: { kind: "keyword", value: "left" },
        vertical: { kind: "keyword", value: "center" },
      });
      expect(result.value.nextIdx).toBe(1);
    }
  });

  it("should parse single vertical keyword", () => {
    const nodes: csstree.CssNode[] = [{ type: "Identifier", name: "top" }];
    const result = parsePosition2D(nodes, 0);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.position).toEqual({
        horizontal: { kind: "keyword", value: "center" },
        vertical: { kind: "keyword", value: "top" },
      });
      expect(result.value.nextIdx).toBe(1);
    }
  });

  it("should parse single percentage", () => {
    const nodes: csstree.CssNode[] = [{ type: "Percentage", value: "50" }];
    const result = parsePosition2D(nodes, 0);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.position).toEqual({
        horizontal: { kind: "literal", value: 50, unit: "%" },
        vertical: { kind: "keyword", value: "center" },
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
      expect(result.value.position).toEqual({
        horizontal: { kind: "keyword", value: "left" },
        vertical: { kind: "keyword", value: "top" },
      });
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
      expect(result.value.position).toEqual({
        horizontal: { kind: "keyword", value: "center" },
        vertical: { kind: "keyword", value: "center" },
      });
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
        horizontal: { kind: "literal", value: 25, unit: "%" },
        vertical: { kind: "literal", value: 75, unit: "%" },
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
        horizontal: { kind: "keyword", value: "left" },
        vertical: { kind: "literal", value: 50, unit: "px" },
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
        horizontal: { kind: "literal", value: 100, unit: "px" },
        vertical: { kind: "literal", value: 200, unit: "px" },
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
      expect(result.value.position).toEqual({
        horizontal: { kind: "keyword", value: "center" },
        vertical: { kind: "keyword", value: "center" },
      });
      expect(result.value.nextIdx).toBe(2);
    }
  });

  it("should reject empty nodes", () => {
    const nodes: csstree.CssNode[] = [];
    const result = parsePosition2D(nodes, 0);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.message).toContain("Expected position value");
    }
  });

  it("should reject startIdx beyond array", () => {
    const nodes: csstree.CssNode[] = [{ type: "Identifier", name: "center" }];
    const result = parsePosition2D(nodes, 5);
    expect(result.ok).toBe(false);
    if (!result.ok) {
    }
  });
});
