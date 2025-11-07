// b_path:: packages/b_declarations/src/core/registry.test.ts
import { describe, expect, it, beforeEach } from "vitest";
import { defineProperty, getPropertyDefinition, isCustomProperty, propertyRegistry } from "./registry";
import { parseOk, type ParseResult } from "@b/types";
import { customProperty } from "../properties/custom-property";
import type { PropertyDefinition } from "../types";

describe("PropertyRegistry", () => {
  beforeEach(() => {
    propertyRegistry.clear();
    // Re-register custom property after clear
    propertyRegistry.register(customProperty as PropertyDefinition<unknown>);
  });

  it("should register and retrieve a property", () => {
    const definition = defineProperty({
      name: "color",
      syntax: "<color>",
      parser: (): ParseResult<string> => parseOk("test"),
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
      parser: (): ParseResult<string> => parseOk("test"),
      inherited: true,
      initial: "black",
    });

    defineProperty({
      name: "background",
      syntax: "<background>",
      parser: (): ParseResult<string> => parseOk("test"),
      inherited: false,
      initial: "transparent",
    });

    const names = propertyRegistry.getPropertyNames();
    expect(names).toContain("color");
    expect(names).toContain("background");
  });

  it("should clear all properties", () => {
    defineProperty({
      name: "color",
      syntax: "<color>",
      parser: (): ParseResult<string> => parseOk("test"),
      inherited: true,
      initial: "black",
    });

    expect(propertyRegistry.has("color")).toBe(true);

    propertyRegistry.clear();

    expect(propertyRegistry.has("color")).toBe(false);
  });
});

describe("isCustomProperty", () => {
  it("should return true for valid custom properties", () => {
    expect(isCustomProperty("--my-color")).toBe(true);
    expect(isCustomProperty("--main-bg-color")).toBe(true);
    expect(isCustomProperty("--_private")).toBe(true);
  });

  it("should return false for invalid custom properties", () => {
    expect(isCustomProperty("--")).toBe(false);
    expect(isCustomProperty("-")).toBe(false);
    expect(isCustomProperty("color")).toBe(false);
    expect(isCustomProperty("background-color")).toBe(false);
  });
});

describe("getPropertyDefinition", () => {
  beforeEach(() => {
    propertyRegistry.clear();
    // Re-register custom property after clear
    propertyRegistry.register(customProperty as PropertyDefinition<unknown>);
  });

  it("should return registered property definition", () => {
    const definition = defineProperty({
      name: "color",
      syntax: "<color>",
      parser: (): ParseResult<string> => parseOk("test"),
      inherited: true,
      initial: "black",
    });

    expect(getPropertyDefinition("color")).toBe(definition);
  });

  it("should return custom property template for --* names", () => {
    expect(getPropertyDefinition("--my-color")).toBe(customProperty);
    expect(getPropertyDefinition("--main-bg")).toBe(customProperty);
  });

  it("should return undefined for unknown standard properties", () => {
    expect(getPropertyDefinition("unknown-property")).toBeUndefined();
  });

  it("should prioritize exact match over custom property fallback", () => {
    const definition = defineProperty({
      name: "--special",
      syntax: "<special>",
      parser: (): ParseResult<string> => parseOk("special"),
      inherited: true,
      initial: "default",
    });

    expect(getPropertyDefinition("--special")).toBe(definition);
    expect(getPropertyDefinition("--special")).not.toBe(customProperty);
  });
});
