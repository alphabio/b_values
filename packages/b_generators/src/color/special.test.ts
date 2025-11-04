// b_path:: packages/b_generators/src/color/special.test.ts
import { describe, expect, it } from "vitest";
import type { SpecialColor } from "@b/types";
import * as Special from "./special";

describe("special color generator", () => {
  it("should generate transparent", () => {
    const color: SpecialColor = { kind: "special", keyword: "transparent" };
    const result = Special.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("transparent");
    }
  });

  it("should generate currentcolor", () => {
    const color: SpecialColor = { kind: "special", keyword: "currentcolor" };
    const result = Special.generate(color);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("currentcolor");
    }
  });

  it("should return error for null color", () => {
    const result = Special.generate(null as unknown as SpecialColor);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.code).toBe("invalid-ir");
    }
  });
});
