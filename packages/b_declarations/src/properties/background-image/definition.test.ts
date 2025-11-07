// b_path:: packages/b_declarations/src/properties/background-image/definition.test.ts
import { describe, expect, it } from "vitest";
import { backgroundImage } from "./definition";
import { propertyRegistry } from "../../core";

describe("backgroundImage definition", () => {
  it("should have correct property metadata", () => {
    expect(backgroundImage.name).toBe("background-image");
    expect(backgroundImage.syntax).toBe("<bg-image>#");
    expect(backgroundImage.inherited).toBe(false);
    expect(backgroundImage.initial).toBe("none");
    expect(backgroundImage.multiValue).toBe(true);
  });

  it("should have parser function", () => {
    expect(backgroundImage.parser).toBeDefined();
    expect(typeof backgroundImage.parser).toBe("function");
  });

  it("should have generator function", () => {
    expect(backgroundImage.generator).toBeDefined();
    expect(typeof backgroundImage.generator).toBe("function");
  });

  it("should be registered in property registry", () => {
    expect(propertyRegistry.has("background-image")).toBe(true);
    expect(propertyRegistry.get("background-image")).toBe(backgroundImage);
  });
});
