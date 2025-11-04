// b_path:: packages/b_keywords/src/named-colors.test.ts
import { describe, expect, it } from "vitest";
import { namedColorSchema } from "./named-colors";

describe("namedColorSchema", () => {
  it("accepts valid named colors", () => {
    expect(namedColorSchema.parse("red")).toBe("red");
    expect(namedColorSchema.parse("blue")).toBe("blue");
    expect(namedColorSchema.parse("transparent")).toBe("transparent");
    expect(namedColorSchema.parse("currentcolor")).toBe("currentcolor");
  });

  it("accepts extended colors", () => {
    expect(namedColorSchema.parse("rebeccapurple")).toBe("rebeccapurple");
    expect(namedColorSchema.parse("aliceblue")).toBe("aliceblue");
    expect(namedColorSchema.parse("cornflowerblue")).toBe("cornflowerblue");
  });

  it("rejects invalid colors", () => {
    expect(() => namedColorSchema.parse("notacolor")).toThrow();
    expect(() => namedColorSchema.parse("")).toThrow();
    expect(() => namedColorSchema.parse("#ff0000")).toThrow();
  });

  it("rejects uppercase (case-sensitive schema)", () => {
    expect(() => namedColorSchema.parse("RED")).toThrow();
    expect(() => namedColorSchema.parse("Blue")).toThrow();
  });
});
