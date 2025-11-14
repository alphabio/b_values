// b_path:: packages/b_generators/src/time.test.ts
import { describe, expect, it } from "vitest";
import { generate } from "./time";

describe("Time generator", () => {
  it("should generate seconds", () => {
    const result = generate({ value: 2, unit: "s" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("2s");
    }
  });

  it("should generate milliseconds", () => {
    const result = generate({ value: 300, unit: "ms" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("300ms");
    }
  });

  it("should generate zero", () => {
    const result = generate({ value: 0, unit: "s" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("0s");
    }
  });

  it("should generate negative values", () => {
    const result = generate({ value: -1, unit: "s" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("-1s");
    }
  });

  it("should generate decimal values", () => {
    const result = generate({ value: 0.5, unit: "s" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("0.5s");
    }
  });
});
