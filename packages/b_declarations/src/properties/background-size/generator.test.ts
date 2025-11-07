// b_path:: packages/b_declarations/src/properties/background-size/generator.test.ts

import { describe, it, expect } from "vitest";
import { generateBackgroundSize } from "./generator";

describe("generateBackgroundSize", () => {
  describe("keyword sizes", () => {
    it("should generate cover", () => {
      const ir = { kind: "list" as const, values: [{ kind: "keyword" as const, value: "cover" as const }] };
      const result = generateBackgroundSize(ir);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe("cover");
    });

    it("should generate contain", () => {
      const ir = { kind: "list" as const, values: [{ kind: "keyword" as const, value: "contain" as const }] };
      const result = generateBackgroundSize(ir);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe("contain");
    });
  });

  describe("explicit sizes - single value (both axes)", () => {
    it("should generate auto", () => {
      const ir = {
        kind: "list" as const,
        values: [
          {
            kind: "explicit" as const,
            width: { kind: "keyword" as const, value: "auto" as const },
            height: { kind: "keyword" as const, value: "auto" as const },
          },
        ],
      };
      const result = generateBackgroundSize(ir);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe("auto");
    });

    it("should generate percentage", () => {
      const ir = {
        kind: "list" as const,
        values: [
          {
            kind: "explicit" as const,
            width: { kind: "literal" as const, value: 50, unit: "%" as const },
            height: { kind: "literal" as const, value: 50, unit: "%" as const },
          },
        ],
      };
      const result = generateBackgroundSize(ir);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe("50%");
    });

    it("should generate length", () => {
      const ir = {
        kind: "list" as const,
        values: [
          {
            kind: "explicit" as const,
            width: { kind: "literal" as const, value: 100, unit: "px" as const },
            height: { kind: "literal" as const, value: 100, unit: "px" as const },
          },
        ],
      };
      const result = generateBackgroundSize(ir);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe("100px");
    });
  });

  describe("explicit sizes - two values one auto (different axes)", () => {
    it("should generate 50%", () => {
      const ir = {
        kind: "list" as const,
        values: [
          {
            kind: "explicit" as const,
            width: { kind: "literal" as const, value: 50, unit: "%" as const },
            height: { kind: "keyword" as const, value: "auto" as const },
          },
        ],
      };
      const result = generateBackgroundSize(ir);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe("50%");
    });

    it("should generate 100px 50px", () => {
      const ir = {
        kind: "list" as const,
        values: [
          {
            kind: "explicit" as const,
            width: { kind: "literal" as const, value: 100, unit: "px" as const },
            height: { kind: "literal" as const, value: 50, unit: "px" as const },
          },
        ],
      };
      const result = generateBackgroundSize(ir);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe("100px 50px");
    });

    it("should generate auto 100px", () => {
      const ir = {
        kind: "list" as const,
        values: [
          {
            kind: "explicit" as const,
            width: { kind: "keyword" as const, value: "auto" as const },
            height: { kind: "literal" as const, value: 100, unit: "px" as const },
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
        kind: "list" as const,
        values: [
          { kind: "keyword" as const, value: "cover" as const },
          { kind: "keyword" as const, value: "contain" as const },
          {
            kind: "explicit" as const,
            width: { kind: "literal" as const, value: 50, unit: "%" as const },
            height: { kind: "keyword" as const, value: "auto" as const },
          },
        ],
      };
      const result = generateBackgroundSize(ir);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe("cover, contain, 50%");
    });
  });

  describe("round-trip", () => {
    const cases = [
      {
        name: "cover",
        input: { kind: "list" as const, values: [{ kind: "keyword" as const, value: "cover" as const }] },
        expected: "cover",
      },
      {
        name: "contain",
        input: { kind: "list" as const, values: [{ kind: "keyword" as const, value: "contain" as const }] },
        expected: "contain",
      },
      {
        name: "50%",
        input: {
          kind: "list" as const,
          values: [
            {
              kind: "explicit" as const,
              width: { kind: "literal" as const, value: 50, unit: "%" as const },
              height: { kind: "literal" as const, value: 50, unit: "%" as const },
            },
          ],
        },
        expected: "50%",
      },
      {
        name: "100px 50px",
        input: {
          kind: "list" as const,
          values: [
            {
              kind: "explicit" as const,
              width: { kind: "literal" as const, value: 100, unit: "px" as const },
              height: { kind: "literal" as const, value: 50, unit: "px" as const },
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
