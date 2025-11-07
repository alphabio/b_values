// b_path:: packages/b_declarations/src/properties/background-attachment/generator.test.ts
import { describe, expect, it } from "vitest";
import { generateBackgroundAttachment } from "./generator";
import type { BackgroundAttachmentIR } from "./types";

describe("generateBackgroundAttachment", () => {
  describe("CSS-wide keywords", () => {
    it("should generate 'inherit' keyword", () => {
      const ir: BackgroundAttachmentIR = {
        kind: "keyword",
        value: "inherit",
      };

      const result = generateBackgroundAttachment(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("inherit");
      expect(result.property).toBe("background-attachment");
    });

    it("should generate 'initial' keyword", () => {
      const ir: BackgroundAttachmentIR = {
        kind: "keyword",
        value: "initial",
      };

      const result = generateBackgroundAttachment(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("initial");
    });

    it("should generate 'unset' keyword", () => {
      const ir: BackgroundAttachmentIR = {
        kind: "keyword",
        value: "unset",
      };

      const result = generateBackgroundAttachment(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("unset");
    });

    it("should generate 'revert' keyword", () => {
      const ir: BackgroundAttachmentIR = {
        kind: "keyword",
        value: "revert",
      };

      const result = generateBackgroundAttachment(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("revert");
    });
  });

  describe("single value", () => {
    it("should generate 'scroll'", () => {
      const ir: BackgroundAttachmentIR = {
        kind: "layers",
        layers: ["scroll"],
      };

      const result = generateBackgroundAttachment(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("scroll");
    });

    it("should generate 'fixed'", () => {
      const ir: BackgroundAttachmentIR = {
        kind: "layers",
        layers: ["fixed"],
      };

      const result = generateBackgroundAttachment(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("fixed");
    });

    it("should generate 'local'", () => {
      const ir: BackgroundAttachmentIR = {
        kind: "layers",
        layers: ["local"],
      };

      const result = generateBackgroundAttachment(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("local");
    });
  });

  describe("multiple values", () => {
    it("should generate two values", () => {
      const ir: BackgroundAttachmentIR = {
        kind: "layers",
        layers: ["scroll", "fixed"],
      };

      const result = generateBackgroundAttachment(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("scroll, fixed");
    });

    it("should generate three values", () => {
      const ir: BackgroundAttachmentIR = {
        kind: "layers",
        layers: ["fixed", "local", "scroll"],
      };

      const result = generateBackgroundAttachment(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("fixed, local, scroll");
    });

    it("should generate all valid values", () => {
      const ir: BackgroundAttachmentIR = {
        kind: "layers",
        layers: ["scroll", "fixed", "local"],
      };

      const result = generateBackgroundAttachment(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("scroll, fixed, local");
    });
  });
});
