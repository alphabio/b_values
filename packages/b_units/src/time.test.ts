// b_path:: packages/b_units/src/time.test.ts
import { describe, expect, it } from "vitest";
import { TIME_UNITS, timeUnitSchema } from "./time";

describe("timeUnitSchema", () => {
  it("validates seconds", () => {
    const result = timeUnitSchema.parse("s");
    expect(result).toBe("s");
  });

  it("validates milliseconds", () => {
    const result = timeUnitSchema.parse("ms");
    expect(result).toBe("ms");
  });

  it("rejects invalid units", () => {
    expect(() => timeUnitSchema.parse("px")).toThrow();
    expect(() => timeUnitSchema.parse("deg")).toThrow();
  });
});

describe("TIME_UNITS", () => {
  it("contains all time units", () => {
    expect(TIME_UNITS).toEqual(["s", "ms"]);
  });
});
