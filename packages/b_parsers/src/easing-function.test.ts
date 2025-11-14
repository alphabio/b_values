// b_path:: packages/b_parsers/src/easing-function.test.ts
import { describe, expect, it } from "vitest";
import { parseEasingFunctionNode } from "./easing-function";
import type * as csstree from "@eslint/css-tree";

describe("parseEasingFunctionNode", () => {
  describe("keywords", () => {
    it("should parse ease", () => {
      const node: csstree.Identifier = {
        type: "Identifier",
        name: "ease",
      };
      const result = parseEasingFunctionNode(node);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual({ kind: "keyword", value: "ease" });
      }
    });

    it("should parse linear", () => {
      const node: csstree.Identifier = {
        type: "Identifier",
        name: "linear",
      };
      const result = parseEasingFunctionNode(node);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual({ kind: "keyword", value: "linear" });
      }
    });

    it("should parse step-start", () => {
      const node: csstree.Identifier = {
        type: "Identifier",
        name: "step-start",
      };
      const result = parseEasingFunctionNode(node);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual({ kind: "keyword", value: "step-start" });
      }
    });

    it("should reject invalid keyword", () => {
      const node: csstree.Identifier = {
        type: "Identifier",
        name: "invalid",
      };
      const result = parseEasingFunctionNode(node);
      expect(result.ok).toBe(false);
    });
  });

  describe("cubic-bezier", () => {
    it("should parse cubic-bezier with 4 parameters", () => {
      const node: csstree.FunctionNode = {
        type: "Function",
        name: "cubic-bezier",
        children: {
          toArray: () => [
            { type: "Number", value: "0.42" } as csstree.NumberNode,
            { type: "Number", value: "0" } as csstree.NumberNode,
            { type: "Number", value: "0.58" } as csstree.NumberNode,
            { type: "Number", value: "1" } as csstree.NumberNode,
          ],
        } as csstree.List<csstree.CssNode>,
      };
      const result = parseEasingFunctionNode(node);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual({
          kind: "cubic-bezier",
          x1: 0.42,
          y1: 0,
          x2: 0.58,
          y2: 1,
        });
      }
    });

    it("should reject cubic-bezier with wrong parameter count", () => {
      const node: csstree.FunctionNode = {
        type: "Function",
        name: "cubic-bezier",
        children: {
          toArray: () => [
            { type: "Number", value: "0.42" } as csstree.NumberNode,
            { type: "Number", value: "0" } as csstree.NumberNode,
          ],
        } as csstree.List<csstree.CssNode>,
      };
      const result = parseEasingFunctionNode(node);
      expect(result.ok).toBe(false);
    });
  });

  describe("steps", () => {
    it("should parse steps with count only", () => {
      const node: csstree.FunctionNode = {
        type: "Function",
        name: "steps",
        children: {
          toArray: () => [{ type: "Number", value: "4" } as csstree.NumberNode],
        } as csstree.List<csstree.CssNode>,
      };
      const result = parseEasingFunctionNode(node);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual({
          kind: "steps",
          count: 4,
        });
      }
    });

    it("should parse steps with position", () => {
      const node: csstree.FunctionNode = {
        type: "Function",
        name: "steps",
        children: {
          toArray: () => [
            { type: "Number", value: "10" } as csstree.NumberNode,
            { type: "Identifier", name: "jump-end" } as csstree.Identifier,
          ],
        } as csstree.List<csstree.CssNode>,
      };
      const result = parseEasingFunctionNode(node);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual({
          kind: "steps",
          count: 10,
          position: "jump-end",
        });
      }
    });

    it("should reject steps with zero count", () => {
      const node: csstree.FunctionNode = {
        type: "Function",
        name: "steps",
        children: {
          toArray: () => [{ type: "Number", value: "0" } as csstree.NumberNode],
        } as csstree.List<csstree.CssNode>,
      };
      const result = parseEasingFunctionNode(node);
      expect(result.ok).toBe(false);
    });

    it("should reject steps with decimal count", () => {
      const node: csstree.FunctionNode = {
        type: "Function",
        name: "steps",
        children: {
          toArray: () => [{ type: "Number", value: "4.5" } as csstree.NumberNode],
        } as csstree.List<csstree.CssNode>,
      };
      const result = parseEasingFunctionNode(node);
      expect(result.ok).toBe(false);
    });
  });
});
