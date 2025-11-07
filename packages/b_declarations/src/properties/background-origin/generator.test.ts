// b_path:: packages/b_declarations/src/properties/background-origin/generator.test.ts
import { describe, expect, it } from "vitest";
import { generateBackgroundOrigin } from "./generator";
import type { BackgroundOriginIR } from "./types";

describe("generateBackgroundOrigin", () => {
  describe("CSS-wide keywords", () => {
    it("should generate 'inherit' keyword", () => {
      const ir: BackgroundOriginIR = {
        kind: "keyword",
        value: "inherit",
      };

      const result = generateBackgroundOrigin(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("inherit");
      expect(result.property).toBe("background-origin");
    });

    it("should generate 'initial' keyword", () => {
      const ir: BackgroundOriginIR = {
        kind: "keyword",
        value: "initial",
      };

      const result = generateBackgroundOrigin(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("initial");
    });
  });

  describe("single value", () => {
    it("should generate 'border-box'", () => {
      const ir: BackgroundOriginIR = {
        kind: "layers",
        layers: ["border-box"],
      };

      const result = generateBackgroundOrigin(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("border-box");
    });

    it("should generate 'padding-box'", () => {
      const ir: BackgroundOriginIR = {
        kind: "layers",
        layers: ["padding-box"],
      };

      const result = generateBackgroundOrigin(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("padding-box");
    });

    it("should generate 'content-box'", () => {
      const ir: BackgroundOriginIR = {
        kind: "layers",
        layers: ["content-box"],
      };

      const result = generateBackgroundOrigin(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("content-box");
    });
  });

  describe("multiple values", () => {
    it("should generate two values", () => {
      const ir: BackgroundOriginIR = {
        kind: "layers",
        layers: ["padding-box", "border-box"],
      };

      const result = generateBackgroundOrigin(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("padding-box, border-box");
    });

    it("should generate all valid values", () => {
      const ir: BackgroundOriginIR = {
        kind: "layers",
        layers: ["border-box", "padding-box", "content-box"],
      };

      const result = generateBackgroundOrigin(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("border-box, padding-box, content-box");
    });
  });
});
