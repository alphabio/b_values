// b_path:: packages/b_declarations/src/properties/background-origin/generator.test.ts
import { describe, expect, it } from "vitest";
import { generateBackgroundOrigin } from "./generator";
import type { BackgroundOriginIR } from "./types";

describe("generateBackgroundOrigin", () => {
  describe("single value", () => {
    it("should generate 'border-box'", () => {
      const ir: BackgroundOriginIR = {
        kind: "list",
        values: ["border-box"],
      };

      const result = generateBackgroundOrigin(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("border-box");
    });

    it("should generate 'padding-box'", () => {
      const ir: BackgroundOriginIR = {
        kind: "list",
        values: ["padding-box"],
      };

      const result = generateBackgroundOrigin(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("padding-box");
    });

    it("should generate 'content-box'", () => {
      const ir: BackgroundOriginIR = {
        kind: "list",
        values: ["content-box"],
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
        kind: "list",
        values: ["padding-box", "border-box"],
      };

      const result = generateBackgroundOrigin(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("padding-box, border-box");
    });

    it("should generate all valid values", () => {
      const ir: BackgroundOriginIR = {
        kind: "list",
        values: ["border-box", "padding-box", "content-box"],
      };

      const result = generateBackgroundOrigin(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("border-box, padding-box, content-box");
    });
  });
});
