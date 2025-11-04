// b_path:: packages/b_generators/src/color/hex.test.ts
import { describe, expect, it } from "vitest";
import type { HexColor } from "@b/types";
import * as Hex from "./hex";

describe("hex generator", () => {
  it("should generate 6-digit hex color", () => {
    const color: HexColor = { kind: "hex", value: "#FF5733" };
    const result = Hex.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("#FF5733");
    }
  });

  it("should generate 8-digit hex color with alpha", () => {
    const color: HexColor = { kind: "hex", value: "#FF573380" };
    const result = Hex.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("#FF573380");
    }
  });

  it("should return error for null color", () => {
    const result = Hex.generate(null as unknown as HexColor);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.code).toBe("invalid-ir");
    }
  });

  it("should return error for missing value field", () => {
    const color = { kind: "hex" } as HexColor;
    const result = Hex.generate(color);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.code).toBe("missing-required-field");
    }
  });
});
