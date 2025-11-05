// b_path:: packages/b_declarations/src/registry.test.ts
import { describe, expect, it, beforeEach } from "vitest";
import { propertyRegistry, defineProperty } from "./registry";
import { ok, type Result } from "@b/types";

describe("PropertyRegistry", () => {
  beforeEach(() => {
    propertyRegistry.clear();
  });

  it("should register and retrieve a property", () => {
    const definition = defineProperty({
      name: "color",
      syntax: "<color>",
      parser: (value: string): Result<string, string> => ok(value),
      inherited: true,
      initial: "black",
    });

    expect(propertyRegistry.has("color")).toBe(true);
    expect(propertyRegistry.get("color")).toBe(definition);
  });

  it("should return undefined for unregistered property", () => {
    expect(propertyRegistry.get("unknown")).toBeUndefined();
    expect(propertyRegistry.has("unknown")).toBe(false);
  });

  it("should list all registered property names", () => {
    defineProperty({
      name: "color",
      syntax: "<color>",
      parser: (value: string): Result<string, string> => ok(value),
      inherited: true,
      initial: "black",
    });

    defineProperty({
      name: "background",
      syntax: "<background>",
      parser: (value: string): Result<string, string> => ok(value),
      inherited: false,
      initial: "transparent",
    });

    const names = propertyRegistry.getPropertyNames();
    expect(names).toContain("color");
    expect(names).toContain("background");
    expect(names).toHaveLength(2);
  });

  it("should clear all properties", () => {
    defineProperty({
      name: "color",
      syntax: "<color>",
      parser: (value: string): Result<string, string> => ok(value),
      inherited: true,
      initial: "black",
    });

    expect(propertyRegistry.has("color")).toBe(true);

    propertyRegistry.clear();

    expect(propertyRegistry.has("color")).toBe(false);
    expect(propertyRegistry.getPropertyNames()).toHaveLength(0);
  });
});
