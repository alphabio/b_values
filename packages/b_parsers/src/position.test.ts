// b_path:: packages/b_parsers/src/position.test.ts
import { describe, expect, it } from "vitest";
import { parsePosition2D } from "./position";
import type * as csstree from "@eslint/css-tree";

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

  // 3-value syntax tests
  describe("3-value syntax", () => {
    it("should parse left 15% top", () => {
      const nodes: csstree.CssNode[] = [
        { type: "Identifier", name: "left" },
        { type: "Percentage", value: "15" },
        { type: "Identifier", name: "top" },
      ];
      const result = parsePosition2D(nodes, 0);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: {
            edge: "left",
            offset: { kind: "literal", value: 15, unit: "%" },
          },
          vertical: { kind: "keyword", value: "top" },
        });
        expect(result.value.nextIdx).toBe(3);
      }
    });

    it("should parse right 10% center", () => {
      const nodes: csstree.CssNode[] = [
        { type: "Identifier", name: "right" },
        { type: "Percentage", value: "10" },
        { type: "Identifier", name: "center" },
      ];
      const result = parsePosition2D(nodes, 0);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: {
            edge: "right",
            offset: { kind: "literal", value: 10, unit: "%" },
          },
          vertical: { kind: "keyword", value: "center" },
        });
      }
    });

    it("should parse top 20px left", () => {
      const nodes: csstree.CssNode[] = [
        { type: "Identifier", name: "top" },
        { type: "Dimension", value: "20", unit: "px" },
        { type: "Identifier", name: "left" },
      ];
      const result = parsePosition2D(nodes, 0);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: { kind: "keyword", value: "left" },
          vertical: {
            edge: "top",
            offset: { kind: "literal", value: 20, unit: "px" },
          },
        });
      }
    });

    it("should parse center top 20px", () => {
      const nodes: csstree.CssNode[] = [
        { type: "Identifier", name: "center" },
        { type: "Identifier", name: "top" },
        { type: "Dimension", value: "20", unit: "px" },
      ];
      const result = parsePosition2D(nodes, 0);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: { kind: "keyword", value: "center" },
          vertical: {
            edge: "top",
            offset: { kind: "literal", value: 20, unit: "px" },
          },
        });
      }
    });
  });

  // 4-value syntax tests
  describe("4-value syntax", () => {
    it("should parse left 15% top 20px", () => {
      const nodes: csstree.CssNode[] = [
        { type: "Identifier", name: "left" },
        { type: "Percentage", value: "15" },
        { type: "Identifier", name: "top" },
        { type: "Dimension", value: "20", unit: "px" },
      ];
      const result = parsePosition2D(nodes, 0);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: {
            edge: "left",
            offset: { kind: "literal", value: 15, unit: "%" },
          },
          vertical: {
            edge: "top",
            offset: { kind: "literal", value: 20, unit: "px" },
          },
        });
        expect(result.value.nextIdx).toBe(4);
      }
    });

    it("should parse top 20px left 15% (order independent)", () => {
      const nodes: csstree.CssNode[] = [
        { type: "Identifier", name: "top" },
        { type: "Dimension", value: "20", unit: "px" },
        { type: "Identifier", name: "left" },
        { type: "Percentage", value: "15" },
      ];
      const result = parsePosition2D(nodes, 0);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: {
            edge: "left",
            offset: { kind: "literal", value: 15, unit: "%" },
          },
          vertical: {
            edge: "top",
            offset: { kind: "literal", value: 20, unit: "px" },
          },
        });
      }
    });

    it("should parse right 10% bottom 30px", () => {
      const nodes: csstree.CssNode[] = [
        { type: "Identifier", name: "right" },
        { type: "Percentage", value: "10" },
        { type: "Identifier", name: "bottom" },
        { type: "Dimension", value: "30", unit: "px" },
      ];
      const result = parsePosition2D(nodes, 0);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: {
            edge: "right",
            offset: { kind: "literal", value: 10, unit: "%" },
          },
          vertical: {
            edge: "bottom",
            offset: { kind: "literal", value: 30, unit: "px" },
          },
        });
      }
    });

    it("should parse bottom 5px right 8%", () => {
      const nodes: csstree.CssNode[] = [
        { type: "Identifier", name: "bottom" },
        { type: "Dimension", value: "5", unit: "px" },
        { type: "Identifier", name: "right" },
        { type: "Percentage", value: "8" },
      ];
      const result = parsePosition2D(nodes, 0);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.position).toEqual({
          horizontal: {
            edge: "right",
            offset: { kind: "literal", value: 8, unit: "%" },
          },
          vertical: {
            edge: "bottom",
            offset: { kind: "literal", value: 5, unit: "px" },
          },
        });
      }
    });

    it("should reject same axis edges", () => {
      const nodes: csstree.CssNode[] = [
        { type: "Identifier", name: "left" },
        { type: "Percentage", value: "15" },
        { type: "Identifier", name: "right" },
        { type: "Percentage", value: "10" },
      ];
      const result = parsePosition2D(nodes, 0);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.issues[0]?.message).toContain("same axis");
      }
    });
  });
});
