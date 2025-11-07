// b_path:: packages/b_parsers/src/angle.test.ts
import { describe, expect, it } from "vitest";
import { parseAngleNode } from "./angle";
import type * as csstree from "@eslint/css-tree";

describe("parseAngleNode", () => {
  it("should parse deg angle", () => {
    const node: csstree.Dimension = {
      type: "Dimension",
      value: "90",
      unit: "deg",
    };
    const result = parseAngleNode(node);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ value: 90, unit: "deg" });
    }
  });

  it("should parse rad angle", () => {
    const node: csstree.Dimension = {
      type: "Dimension",
      value: "3.14",
      unit: "rad",
    };
    const result = parseAngleNode(node);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ value: 3.14, unit: "rad" });
    }
  });

  it("should parse turn angle", () => {
    const node: csstree.Dimension = {
      type: "Dimension",
      value: "0.25",
      unit: "turn",
    };
    const result = parseAngleNode(node);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ value: 0.25, unit: "turn" });
    }
  });

  it("should parse grad angle", () => {
    const node: csstree.Dimension = {
      type: "Dimension",
      value: "100",
      unit: "grad",
    };
    const result = parseAngleNode(node);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ value: 100, unit: "grad" });
    }
  });

  it("should parse negative angle", () => {
    const node: csstree.Dimension = {
      type: "Dimension",
      value: "-45",
      unit: "deg",
    };
    const result = parseAngleNode(node);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ value: -45, unit: "deg" });
    }
  });

  it("should reject invalid angle value", () => {
    const node: csstree.Dimension = {
      type: "Dimension",
      value: "invalid",
      unit: "deg",
    };
    const result = parseAngleNode(node);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.message).toContain("Invalid angle value");
    }
  });

  it("should reject invalid angle unit", () => {
    const node: csstree.Dimension = {
      type: "Dimension",
      value: "90",
      unit: "px",
    };
    const result = parseAngleNode(node);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.message).toContain("Invalid angle unit");
    }
  });

  it("should reject non-dimension node", () => {
    const node: csstree.Identifier = {
      type: "Identifier",
      name: "auto",
    };
    const result = parseAngleNode(node);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.message).toContain("Expected angle dimension");
    }
  });
});
