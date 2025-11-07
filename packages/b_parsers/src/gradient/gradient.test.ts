// b_path:: packages/b_parsers/src/gradient/gradient.test.ts
import { describe, it, expect } from "vitest";
import * as Gradient from "./gradient";
import * as csstree from "@eslint/css-tree";

describe("Gradient Dispatcher", () => {
  describe("parse() - String-based dispatcher", () => {
    it("dispatches linear-gradient to Linear parser", () => {
      const css = "linear-gradient(red, blue)";
      const result = Gradient.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("linear");
        expect(result.value.repeating).toBe(false);
      }
    });

    it("dispatches repeating-linear-gradient to Linear parser", () => {
      const css = "repeating-linear-gradient(red, blue)";
      const result = Gradient.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("linear");
        expect(result.value.repeating).toBe(true);
      }
    });

    it("dispatches radial-gradient to Radial parser", () => {
      const css = "radial-gradient(red, blue)";
      const result = Gradient.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("radial");
        expect(result.value.repeating).toBe(false);
      }
    });

    it("dispatches repeating-radial-gradient to Radial parser", () => {
      const css = "repeating-radial-gradient(red, blue)";
      const result = Gradient.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("radial");
        expect(result.value.repeating).toBe(true);
      }
    });

    it("dispatches conic-gradient to Conic parser", () => {
      const css = "conic-gradient(red, blue)";
      const result = Gradient.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("conic");
        expect(result.value.repeating).toBe(false);
      }
    });

    it("dispatches repeating-conic-gradient to Conic parser", () => {
      const css = "repeating-conic-gradient(red, blue)";
      const result = Gradient.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("conic");
        expect(result.value.repeating).toBe(true);
      }
    });

    it("returns error for non-gradient function", () => {
      const css = "rgb(255, 0, 0)";
      const result = Gradient.parse(css);

      expect(result.ok).toBe(false);
    });

    it("returns error for unknown function", () => {
      const css = "unknown-gradient(red, blue)";
      const result = Gradient.parse(css);

      expect(result.ok).toBe(false);
    });

    it("handles whitespace in input", () => {
      const css = "  linear-gradient(red, blue)  ";
      const result = Gradient.parse(css);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("linear");
      }
    });

    it("returns error for empty string", () => {
      const css = "";
      const result = Gradient.parse(css);

      expect(result.ok).toBe(false);
    });
  });

  describe("parseFromNode() - AST-based dispatcher", () => {
    it("dispatches linear-gradient FunctionNode", () => {
      const ast = csstree.parse("linear-gradient(red, blue)", { context: "value" }) as csstree.Value;
      const node = ast.children.first as csstree.FunctionNode;

      const result = Gradient.parseFromNode(node);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("linear");
        expect(result.value.repeating).toBe(false);
      }
    });

    it("dispatches repeating-linear-gradient FunctionNode", () => {
      const ast = csstree.parse("repeating-linear-gradient(red, blue)", { context: "value" }) as csstree.Value;
      const node = ast.children.first as csstree.FunctionNode;

      const result = Gradient.parseFromNode(node);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("linear");
        expect(result.value.repeating).toBe(true);
      }
    });

    it("dispatches radial-gradient FunctionNode", () => {
      const ast = csstree.parse("radial-gradient(red, blue)", { context: "value" }) as csstree.Value;
      const node = ast.children.first as csstree.FunctionNode;

      const result = Gradient.parseFromNode(node);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("radial");
        expect(result.value.repeating).toBe(false);
      }
    });

    it("dispatches repeating-radial-gradient FunctionNode", () => {
      const ast = csstree.parse("repeating-radial-gradient(red, blue)", { context: "value" }) as csstree.Value;
      const node = ast.children.first as csstree.FunctionNode;

      const result = Gradient.parseFromNode(node);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("radial");
        expect(result.value.repeating).toBe(true);
      }
    });

    it("dispatches conic-gradient FunctionNode", () => {
      const ast = csstree.parse("conic-gradient(red, blue)", { context: "value" }) as csstree.Value;
      const node = ast.children.first as csstree.FunctionNode;

      const result = Gradient.parseFromNode(node);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("conic");
        expect(result.value.repeating).toBe(false);
      }
    });

    it("dispatches repeating-conic-gradient FunctionNode", () => {
      const ast = csstree.parse("repeating-conic-gradient(red, blue)", { context: "value" }) as csstree.Value;
      const node = ast.children.first as csstree.FunctionNode;

      const result = Gradient.parseFromNode(node);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("conic");
        expect(result.value.repeating).toBe(true);
      }
    });

    it("returns error for non-gradient FunctionNode", () => {
      const ast = csstree.parse("rgb(255, 0, 0)", { context: "value" }) as csstree.Value;
      const node = ast.children.first as csstree.FunctionNode;

      const result = Gradient.parseFromNode(node);

      expect(result.ok).toBe(false);
    });

    it("returns error for calc FunctionNode", () => {
      const ast = csstree.parse("calc(100% - 20px)", { context: "value" }) as csstree.Value;
      const node = ast.children.first as csstree.FunctionNode;

      const result = Gradient.parseFromNode(node);

      expect(result.ok).toBe(false);
    });

    it("handles case-insensitive function names", () => {
      const ast = csstree.parse("LINEAR-GRADIENT(red, blue)", { context: "value" }) as csstree.Value;
      const node = ast.children.first as csstree.FunctionNode;

      const result = Gradient.parseFromNode(node);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.kind).toBe("linear");
      }
    });
  });
});
