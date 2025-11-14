// b_path:: packages/b_parsers/src/time.test.ts
import { describe, expect, it } from "vitest";
import { parseTimeNode } from "./time";
import type * as csstree from "@eslint/css-tree";

describe("parseTimeNode", () => {
  it("should parse seconds", () => {
    const node: csstree.Dimension = {
      type: "Dimension",
      value: "2",
      unit: "s",
    };
    const result = parseTimeNode(node);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ value: 2, unit: "s" });
    }
  });

  it("should parse milliseconds", () => {
    const node: csstree.Dimension = {
      type: "Dimension",
      value: "300",
      unit: "ms",
    };
    const result = parseTimeNode(node);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ value: 300, unit: "ms" });
    }
  });

  it("should parse decimal values", () => {
    const node: csstree.Dimension = {
      type: "Dimension",
      value: "0.5",
      unit: "s",
    };
    const result = parseTimeNode(node);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ value: 0.5, unit: "s" });
    }
  });

  it("should parse zero", () => {
    const node: csstree.Dimension = {
      type: "Dimension",
      value: "0",
      unit: "s",
    };
    const result = parseTimeNode(node);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ value: 0, unit: "s" });
    }
  });

  it("should parse negative values", () => {
    const node: csstree.Dimension = {
      type: "Dimension",
      value: "-1",
      unit: "s",
    };
    const result = parseTimeNode(node);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ value: -1, unit: "s" });
    }
  });

  it("should reject invalid time value", () => {
    const node: csstree.Dimension = {
      type: "Dimension",
      value: "invalid",
      unit: "s",
    };
    const result = parseTimeNode(node);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.message).toContain("Invalid time value");
    }
  });

  it("should reject invalid time unit", () => {
    const node: csstree.Dimension = {
      type: "Dimension",
      value: "2",
      unit: "px",
    };
    const result = parseTimeNode(node);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.message).toContain("Invalid time unit");
    }
  });

  it("should reject non-dimension node", () => {
    const node: csstree.Identifier = {
      type: "Identifier",
      name: "auto",
    };
    const result = parseTimeNode(node);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.message).toContain("Expected time dimension");
    }
  });
});
