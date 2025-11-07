// b_path:: packages/b_declarations/src/properties/background-size/generator.test.ts

import { describe, it, expect } from "vitest";
import { generateBackgroundSize } from "./generator";

describe("generateBackgroundSize", () => {
  describe("CSS-wide keywords", () => {
    it("should generate inherit", () => {
      const ir = { kind: "keyword" as const, value: "inherit" as const };
      const result = generateBackgroundSize(ir);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe("inherit");
    });

    it("should generate initial", () => {
      const ir = { kind: "keyword" as const, value: "initial" as const };
      const result = generateBackgroundSize(ir);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe("initial");
    });
  });

  describe("keyword sizes", () => {
    it("should generate cover", () => {
      const ir = { kind: "layers" as const, layers: [{ kind: "keyword" as const, value: "cover" as const }] };
      const result = generateBackgroundSize(ir);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe("cover");
    });

    it("should generate contain", () => {
      const ir = { kind: "layers" as const, layers: [{ kind: "keyword" as const, value: "contain" as const }] };
      const result = generateBackgroundSize(ir);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe("contain");
    });
  });

  describe("explicit sizes - single value (both axes)", () => {
    it("should generate auto", () => {
      const ir = {
        kind: "layers" as const,
        layers: [
          {
            kind: "explicit" as const,
            width: { kind: "auto" as const },
            height: { kind: "auto" as const },
          },
        ],
      };
      const result = generateBackgroundSize(ir);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe("auto");
    });

    it("should generate percentage", () => {
      const ir = {
        kind: "layers" as const,
        layers: [
          {
            kind: "explicit" as const,
            width: { kind: "percentage" as const, value: { value: 50, unit: "%" as const } },
            height: { kind: "percentage" as const, value: { value: 50, unit: "%" as const } },
          },
        ],
      };
      const result = generateBackgroundSize(ir);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe("50%");
    });

    it("should generate length", () => {
      const ir = {
        kind: "layers" as const,
        layers: [
          {
            kind: "explicit" as const,
            width: { kind: "length" as const, value: { value: 100, unit: "px" as const } },
            height: { kind: "length" as const, value: { value: 100, unit: "px" as const } },
          },
        ],
      };
      const result = generateBackgroundSize(ir);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe("100px");
    });
  });

  describe("explicit sizes - two values (different axes)", () => {
    it("should generate 50% auto", () => {
      const ir = {
        kind: "layers" as const,
        layers: [
          {
            kind: "explicit" as const,
            width: { kind: "percentage" as const, value: { value: 50, unit: "%" as const } },
            height: { kind: "auto" as const },
          },
        ],
      };
      const result = generateBackgroundSize(ir);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe("50% auto");
    });

    it("should generate 100px 50px", () => {
      const ir = {
        kind: "layers" as const,
        layers: [
          {
            kind: "explicit" as const,
            width: { kind: "length" as const, value: { value: 100, unit: "px" as const } },
            height: { kind: "length" as const, value: { value: 50, unit: "px" as const } },
          },
        ],
      };
      const result = generateBackgroundSize(ir);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe("100px 50px");
    });

    it("should generate auto 100px", () => {
      const ir = {
        kind: "layers" as const,
        layers: [
          {
            kind: "explicit" as const,
            width: { kind: "auto" as const },
            height: { kind: "length" as const, value: { value: 100, unit: "px" as const } },
          },
        ],
      };
      const result = generateBackgroundSize(ir);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe("auto 100px");
    });
  });

  describe("multiple layers", () => {
    it("should generate comma-separated layers", () => {
      const ir = {
        kind: "layers" as const,
        layers: [
          { kind: "keyword" as const, value: "cover" as const },
          { kind: "keyword" as const, value: "contain" as const },
          {
            kind: "explicit" as const,
            width: { kind: "percentage" as const, value: { value: 50, unit: "%" as const } },
            height: { kind: "auto" as const },
          },
        ],
      };
      const result = generateBackgroundSize(ir);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe("cover, contain, 50% auto");
    });
  });

  describe("round-trip", () => {
    const cases = [
      {
        name: "cover",
        input: { kind: "layers" as const, layers: [{ kind: "keyword" as const, value: "cover" as const }] },
        expected: "cover",
      },
      {
        name: "contain",
        input: { kind: "layers" as const, layers: [{ kind: "keyword" as const, value: "contain" as const }] },
        expected: "contain",
      },
      {
        name: "50%",
        input: {
          kind: "layers" as const,
          layers: [
            {
              kind: "explicit" as const,
              width: { kind: "percentage" as const, value: { value: 50, unit: "%" as const } },
              height: { kind: "percentage" as const, value: { value: 50, unit: "%" as const } },
            },
          ],
        },
        expected: "50%",
      },
      {
        name: "100px 50px",
        input: {
          kind: "layers" as const,
          layers: [
            {
              kind: "explicit" as const,
              width: { kind: "length" as const, value: { value: 100, unit: "px" as const } },
              height: { kind: "length" as const, value: { value: 50, unit: "px" as const } },
            },
          ],
        },
        expected: "100px 50px",
      },
    ];

    for (const { name, input, expected } of cases) {
      it(`should round-trip ${name}`, () => {
        const result = generateBackgroundSize(input);
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(expected);
      });
    }
  });
});
