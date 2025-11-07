// b_path:: packages/b_declarations/src/properties/background-repeat/generator.test.ts
import { describe, expect, it } from "vitest";
import { generateBackgroundRepeat } from "./generator";
import type { BackgroundRepeatIR } from "./types";

describe("generateBackgroundRepeat", () => {
  describe("CSS-wide keywords", () => {
    it("should generate 'inherit' keyword", () => {
      const ir: BackgroundRepeatIR = {
        kind: "keyword",
        value: "inherit",
      };

      const result = generateBackgroundRepeat(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("inherit");
      expect(result.property).toBe("background-repeat");
    });

    it("should generate 'initial' keyword", () => {
      const ir: BackgroundRepeatIR = {
        kind: "keyword",
        value: "initial",
      };

      const result = generateBackgroundRepeat(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("initial");
    });
  });

  describe("shorthand", () => {
    it("should generate 'repeat-x'", () => {
      const ir: BackgroundRepeatIR = {
        kind: "layers",
        layers: [{ kind: "shorthand", value: "repeat-x" }],
      };

      const result = generateBackgroundRepeat(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("repeat-x");
    });

    it("should generate 'repeat-y'", () => {
      const ir: BackgroundRepeatIR = {
        kind: "layers",
        layers: [{ kind: "shorthand", value: "repeat-y" }],
      };

      const result = generateBackgroundRepeat(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("repeat-y");
    });
  });

  describe("explicit - single value (both axes)", () => {
    it("should generate 'repeat' (not 'repeat repeat')", () => {
      const ir: BackgroundRepeatIR = {
        kind: "layers",
        layers: [
          {
            kind: "explicit",
            horizontal: "repeat",
            vertical: "repeat",
          },
        ],
      };

      const result = generateBackgroundRepeat(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("repeat");
    });

    it("should generate 'space' (not 'space space')", () => {
      const ir: BackgroundRepeatIR = {
        kind: "layers",
        layers: [
          {
            kind: "explicit",
            horizontal: "space",
            vertical: "space",
          },
        ],
      };

      const result = generateBackgroundRepeat(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("space");
    });

    it("should generate 'round' (not 'round round')", () => {
      const ir: BackgroundRepeatIR = {
        kind: "layers",
        layers: [
          {
            kind: "explicit",
            horizontal: "round",
            vertical: "round",
          },
        ],
      };

      const result = generateBackgroundRepeat(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("round");
    });

    it("should generate 'no-repeat' (not 'no-repeat no-repeat')", () => {
      const ir: BackgroundRepeatIR = {
        kind: "layers",
        layers: [
          {
            kind: "explicit",
            horizontal: "no-repeat",
            vertical: "no-repeat",
          },
        ],
      };

      const result = generateBackgroundRepeat(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("no-repeat");
    });
  });

  describe("explicit - two values (different axes)", () => {
    it("should generate 'repeat space'", () => {
      const ir: BackgroundRepeatIR = {
        kind: "layers",
        layers: [
          {
            kind: "explicit",
            horizontal: "repeat",
            vertical: "space",
          },
        ],
      };

      const result = generateBackgroundRepeat(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("repeat space");
    });

    it("should generate 'repeat no-repeat'", () => {
      const ir: BackgroundRepeatIR = {
        kind: "layers",
        layers: [
          {
            kind: "explicit",
            horizontal: "repeat",
            vertical: "no-repeat",
          },
        ],
      };

      const result = generateBackgroundRepeat(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("repeat no-repeat");
    });

    it("should generate 'space round'", () => {
      const ir: BackgroundRepeatIR = {
        kind: "layers",
        layers: [
          {
            kind: "explicit",
            horizontal: "space",
            vertical: "round",
          },
        ],
      };

      const result = generateBackgroundRepeat(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("space round");
    });

    it("should generate 'no-repeat repeat'", () => {
      const ir: BackgroundRepeatIR = {
        kind: "layers",
        layers: [
          {
            kind: "explicit",
            horizontal: "no-repeat",
            vertical: "repeat",
          },
        ],
      };

      const result = generateBackgroundRepeat(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("no-repeat repeat");
    });
  });

  describe("multiple layers", () => {
    it("should generate mixed layers", () => {
      const ir: BackgroundRepeatIR = {
        kind: "layers",
        layers: [
          { kind: "shorthand", value: "repeat-x" },
          { kind: "explicit", horizontal: "space", vertical: "space" },
          { kind: "explicit", horizontal: "repeat", vertical: "no-repeat" },
        ],
      };

      const result = generateBackgroundRepeat(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("repeat-x, space, repeat no-repeat");
    });

    it("should generate all shorthand layers", () => {
      const ir: BackgroundRepeatIR = {
        kind: "layers",
        layers: [
          { kind: "shorthand", value: "repeat-x" },
          { kind: "shorthand", value: "repeat-y" },
        ],
      };

      const result = generateBackgroundRepeat(ir);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value).toBe("repeat-x, repeat-y");
    });
  });
});
