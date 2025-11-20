// b_path:: packages/b_declarations/src/properties/perspective-origin/generator.test.ts

import { describe, expect, it } from "vitest";
import { generatePerspectiveOrigin } from "./generator";
import type { PerspectiveOriginIR } from "./types";

describe("generatePerspectiveOrigin", () => {
  it("generates 2-value position", () => {
    const ir: PerspectiveOriginIR = {
      kind: "position",
      value: {
        horizontal: { kind: "literal", value: 50, unit: "%" },
        vertical: { kind: "literal", value: 50, unit: "%" },
      },
    };
    const result = generatePerspectiveOrigin(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("50% 50%");
    }
  });

  it("generates pixel positions", () => {
    const ir: PerspectiveOriginIR = {
      kind: "position",
      value: {
        horizontal: { kind: "literal", value: 100, unit: "px" },
        vertical: { kind: "literal", value: 200, unit: "px" },
      },
    };
    const result = generatePerspectiveOrigin(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("100px 200px");
    }
  });

  it("generates keyword positions", () => {
    const ir: PerspectiveOriginIR = {
      kind: "position",
      value: {
        horizontal: { kind: "keyword", value: "left" },
        vertical: { kind: "keyword", value: "top" },
      },
    };
    const result = generatePerspectiveOrigin(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("left top");
    }
  });

  it("generates mixed keyword and length", () => {
    const ir: PerspectiveOriginIR = {
      kind: "position",
      value: {
        horizontal: { kind: "keyword", value: "left" },
        vertical: { kind: "literal", value: 50, unit: "%" },
      },
    };
    const result = generatePerspectiveOrigin(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain("left");
      expect(result.value).toContain("50%");
    }
  });

  it("generates CSS-wide keywords", () => {
    const keywords = ["inherit", "initial", "unset", "revert", "revert-layer"] as const;
    for (const kw of keywords) {
      const ir: PerspectiveOriginIR = { kind: "keyword", value: kw };
      const result = generatePerspectiveOrigin(ir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(kw);
      }
    }
  });

  it("generates em units", () => {
    const ir: PerspectiveOriginIR = {
      kind: "position",
      value: {
        horizontal: { kind: "literal", value: 5, unit: "em" },
        vertical: { kind: "literal", value: 10, unit: "em" },
      },
    };
    const result = generatePerspectiveOrigin(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("5em 10em");
    }
  });

  it("generates rem units", () => {
    const ir: PerspectiveOriginIR = {
      kind: "position",
      value: {
        horizontal: { kind: "literal", value: 2.5, unit: "rem" },
        vertical: { kind: "literal", value: 3.5, unit: "rem" },
      },
    };
    const result = generatePerspectiveOrigin(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("2.5rem 3.5rem");
    }
  });

  it("generates viewport units", () => {
    const ir: PerspectiveOriginIR = {
      kind: "position",
      value: {
        horizontal: { kind: "literal", value: 50, unit: "vw" },
        vertical: { kind: "literal", value: 50, unit: "vh" },
      },
    };
    const result = generatePerspectiveOrigin(ir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("50vw 50vh");
    }
  });
});
