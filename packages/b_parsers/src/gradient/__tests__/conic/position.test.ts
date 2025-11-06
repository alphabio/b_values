// b_path:: packages/b_parsers/src/gradient/__tests__/conic/position.test.ts
import { describe, expect, it } from "vitest";
import * as Conic from "../../conic";
import * as Generate from "@b/generators";

describe("Conic Gradient - Position", () => {
  describe("Keyword Positions", () => {
    it("parses at center center", () => {
      const css = "conic-gradient(at center center, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();
      expect(result.value.position?.horizontal).toMatchObject({
        kind: "keyword",
        value: "center",
      });
      expect(result.value.position?.vertical).toMatchObject({
        kind: "keyword",
        value: "center",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses at center (single keyword)", () => {
      const css = "conic-gradient(at center, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses at left top", () => {
      const css = "conic-gradient(at left top, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();
      expect(result.value.position?.horizontal).toMatchObject({
        kind: "keyword",
        value: "left",
      });
      expect(result.value.position?.vertical).toMatchObject({
        kind: "keyword",
        value: "top",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses at right bottom", () => {
      const css = "conic-gradient(at right bottom, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();
      expect(result.value.position?.horizontal).toMatchObject({
        kind: "keyword",
        value: "right",
      });
      expect(result.value.position?.vertical).toMatchObject({
        kind: "keyword",
        value: "bottom",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses at top left", () => {
      const css = "conic-gradient(at top left, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses at bottom right", () => {
      const css = "conic-gradient(at bottom right, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses at center top", () => {
      const css = "conic-gradient(at center top, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses at center bottom", () => {
      const css = "conic-gradient(at center bottom, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses at left center", () => {
      const css = "conic-gradient(at left center, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses at right center", () => {
      const css = "conic-gradient(at right center, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });

  describe("Percentage Positions", () => {
    it("parses at 50% 50%", () => {
      const css = "conic-gradient(at 50% 50%, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();
      expect(result.value.position?.horizontal).toMatchObject({
        kind: "literal",
        value: 50,
        unit: "%",
      });
      expect(result.value.position?.vertical).toMatchObject({
        kind: "literal",
        value: 50,
        unit: "%",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses at 0% 0%", () => {
      const css = "conic-gradient(at 0% 0%, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses at 100% 100%", () => {
      const css = "conic-gradient(at 100% 100%, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses at 25% 75%", () => {
      const css = "conic-gradient(at 25% 75%, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();
      expect(result.value.position?.horizontal).toMatchObject({
        value: 25,
        unit: "%",
      });
      expect(result.value.position?.vertical).toMatchObject({
        value: 75,
        unit: "%",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses at 33.33% 66.67%", () => {
      const css = "conic-gradient(at 33.33% 66.67%, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });

  describe("Length Positions", () => {
    it("parses at 100px 200px", () => {
      const css = "conic-gradient(at 100px 200px, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();
      expect(result.value.position?.horizontal).toMatchObject({
        kind: "literal",
        value: 100,
        unit: "px",
      });
      expect(result.value.position?.vertical).toMatchObject({
        kind: "literal",
        value: 200,
        unit: "px",
      });

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses at 10em 20em", () => {
      const css = "conic-gradient(at 10em 20em, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses at 5rem 10rem", () => {
      const css = "conic-gradient(at 5rem 10rem, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses at 50vw 50vh", () => {
      const css = "conic-gradient(at 50vw 50vh, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses at 0px 0px", () => {
      const css = "conic-gradient(at 0px 0px, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });

  describe("Mixed Positions", () => {
    it("parses at center 20%", () => {
      const css = "conic-gradient(at center 20%, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses at left 100px", () => {
      const css = "conic-gradient(at left 100px, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses at 50% bottom", () => {
      const css = "conic-gradient(at 50% bottom, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses at right 25%", () => {
      const css = "conic-gradient(at right 25%, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses at 30% top", () => {
      const css = "conic-gradient(at 30% top, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses at 100px center", () => {
      const css = "conic-gradient(at 100px center, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });

  describe("CSS Value Functions", () => {
    it("parses at var(--x) var(--y)", () => {
      const css = "conic-gradient(at var(--x) var(--y), red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();
      expect(result.value.position?.horizontal.kind).toBe("variable");
      expect(result.value.position?.vertical.kind).toBe("variable");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses at calc(50% - 20px) 50%", () => {
      const css = "conic-gradient(at calc(50% - 20px) 50%, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();
      expect(result.value.position?.horizontal.kind).toBe("calc");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses at 50% calc(50% + 10px)", () => {
      const css = "conic-gradient(at 50% calc(50% + 10px), red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();
      expect(result.value.position?.vertical.kind).toBe("calc");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses at clamp(0%, var(--x), 100%) center", () => {
      const css = "conic-gradient(at clamp(0%, var(--x), 100%) center, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();
      expect(result.value.position?.horizontal.kind).toBe("clamp");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses at min(50%, 200px) max(50%, 100px)", () => {
      const css = "conic-gradient(at min(50%, 200px) max(50%, 100px), red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();
      expect(result.value.position?.horizontal.kind).toBe("min");
      expect(result.value.position?.vertical.kind).toBe("max");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses at var(--pos-x, 50%) var(--pos-y, 50%)", () => {
      const css = "conic-gradient(at var(--pos-x, 50%) var(--pos-y, 50%), red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });

  describe("Without Position (Default)", () => {
    it("parses gradient without position", () => {
      const css = "conic-gradient(red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeUndefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
      if (genResult.ok) {
        expect(genResult.value).toBe("conic-gradient(red, blue)");
      }
    });

    it("parses gradient with from angle but no position", () => {
      const css = "conic-gradient(from 45deg, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.position).toBeUndefined();
      expect(result.value.fromAngle).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });

  describe("Combined From Angle and Position", () => {
    it("parses from 90deg at 50% 50%", () => {
      const css = "conic-gradient(from 90deg at 50% 50%, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle).toBeDefined();
      expect(result.value.position).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses from 45deg at center center", () => {
      const css = "conic-gradient(from 45deg at center center, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle).toBeDefined();
      expect(result.value.position).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses from var(--angle) at var(--x) var(--y)", () => {
      const css = "conic-gradient(from var(--angle) at var(--x) var(--y), red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle?.kind).toBe("variable");
      expect(result.value.position?.horizontal.kind).toBe("variable");
      expect(result.value.position?.vertical.kind).toBe("variable");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses from 0.25turn at left top", () => {
      const css = "conic-gradient(from 0.25turn at left top, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle).toBeDefined();
      expect(result.value.position).toBeDefined();

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });

    it("parses from calc(var(--base) * 2) at calc(50% - 20px) 50%", () => {
      const css = "conic-gradient(from calc(var(--base) * 2) at calc(50% - 20px) 50%, red, blue)";
      const result = Conic.parse(css);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.fromAngle?.kind).toBe("calc");
      expect(result.value.position?.horizontal.kind).toBe("calc");

      const genResult = Generate.Gradient.Conic.generate(result.value);
      expect(genResult.ok).toBe(true);
    });
  });
});
