// b_path:: packages/b_declarations/src/properties/background-clip/generator.test.ts
import { describe, expect, it } from "vitest";
import { generateBackgroundClip } from "./generator";
import type { BackgroundClipIR } from "./types";

describe("generateBackgroundClip", () => {
  describe("single value", () => {
    it("should generate 'border-box'", () => {
      const ir: BackgroundClipIR = {
        kind: "layers",
        layers: ["border-box"],
      };

      const result = generateBackgroundClip(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("border-box");
    });

    it("should generate 'padding-box'", () => {
      const ir: BackgroundClipIR = {
        kind: "layers",
        layers: ["padding-box"],
      };

      const result = generateBackgroundClip(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("padding-box");
    });

    it("should generate 'content-box'", () => {
      const ir: BackgroundClipIR = {
        kind: "layers",
        layers: ["content-box"],
      };

      const result = generateBackgroundClip(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("content-box");
    });

    it("should generate 'text'", () => {
      const ir: BackgroundClipIR = {
        kind: "layers",
        layers: ["text"],
      };

      const result = generateBackgroundClip(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("text");
    });
  });

  describe("multiple values", () => {
    it("should generate two values", () => {
      const ir: BackgroundClipIR = {
        kind: "layers",
        layers: ["border-box", "padding-box"],
      };

      const result = generateBackgroundClip(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("border-box, padding-box");
    });

    it("should generate all valid values", () => {
      const ir: BackgroundClipIR = {
        kind: "layers",
        layers: ["border-box", "padding-box", "content-box", "text"],
      };

      const result = generateBackgroundClip(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("border-box, padding-box, content-box, text");
    });
  });
});
