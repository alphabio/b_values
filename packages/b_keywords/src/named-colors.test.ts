// b_path:: packages/b_keywords/src/named-colors.test.ts
import { describe, expect, it } from "vitest";
import { namedColor } from "./named-colors";

describe("namedColor", () => {
  it("accepts valid named colors", () => {
    expect(namedColor.parse("red")).toBe("red");
    expect(namedColor.parse("blue")).toBe("blue");
    expect(namedColor.parse("transparent")).toBe("transparent");
    expect(namedColor.parse("currentcolor")).toBe("currentcolor");
  });

  it("accepts extended colors", () => {
    expect(namedColor.parse("rebeccapurple")).toBe("rebeccapurple");
    expect(namedColor.parse("aliceblue")).toBe("aliceblue");
    expect(namedColor.parse("cornflowerblue")).toBe("cornflowerblue");
  });

  it("rejects invalid colors", () => {
    expect(() => namedColor.parse("notacolor")).toThrow();
    expect(() => namedColor.parse("")).toThrow();
    expect(() => namedColor.parse("#ff0000")).toThrow();
  });

  it("rejects uppercase (case-sensitive schema)", () => {
    expect(() => namedColor.parse("RED")).toThrow();
    expect(() => namedColor.parse("Blue")).toThrow();
  });
});
