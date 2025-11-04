// b_path:: packages/b_units/src/length-font.test.ts
import { describe, expect, it } from "vitest";
import { fontLengthUnitSchema } from "./length-font";

describe("fontLengthUnitSchema", () => {
  it("accepts valid font-relative length units", () => {
    expect(fontLengthUnitSchema.parse("em")).toBe("em");
    expect(fontLengthUnitSchema.parse("rem")).toBe("rem");
    expect(fontLengthUnitSchema.parse("ch")).toBe("ch");
    expect(fontLengthUnitSchema.parse("ex")).toBe("ex");
    expect(fontLengthUnitSchema.parse("lh")).toBe("lh");
    expect(fontLengthUnitSchema.parse("rlh")).toBe("rlh");
  });

  it("accepts newer font-relative units", () => {
    expect(fontLengthUnitSchema.parse("cap")).toBe("cap");
    expect(fontLengthUnitSchema.parse("ic")).toBe("ic");
    expect(fontLengthUnitSchema.parse("rex")).toBe("rex");
    expect(fontLengthUnitSchema.parse("rcap")).toBe("rcap");
    expect(fontLengthUnitSchema.parse("rch")).toBe("rch");
    expect(fontLengthUnitSchema.parse("ric")).toBe("ric");
  });

  it("rejects invalid units", () => {
    expect(() => fontLengthUnitSchema.parse("px")).toThrow();
    expect(() => fontLengthUnitSchema.parse("")).toThrow();
    expect(() => fontLengthUnitSchema.parse("vw")).toThrow();
  });
});
