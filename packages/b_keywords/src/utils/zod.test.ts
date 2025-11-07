// b_path:: packages/b_keywords/src/utils/zod.test.ts
import { describe, it, expect } from "vitest";
import { z } from "zod";
import { getLiteralValues } from "./zod";

describe("Zod Utility - getLiteralValues", () => {
  describe("Single literals", () => {
    it("extracts string literal value", () => {
      const schema = z.literal("hello");
      const values = getLiteralValues(schema);

      expect(values).toEqual(["hello"]);
    });

    it("extracts number literal as string", () => {
      const schema = z.literal(42);
      const values = getLiteralValues(schema);

      expect(values).toEqual(["42"]);
    });

    it("extracts boolean literal as string", () => {
      const schema = z.literal(true);
      const values = getLiteralValues(schema);

      expect(values).toEqual(["true"]);
    });
  });

  describe("Union of literals", () => {
    it("extracts all values from simple union", () => {
      const schema = z.union([z.literal("red"), z.literal("blue"), z.literal("green")]);
      const values = getLiteralValues(schema);

      expect(values).toEqual(["red", "blue", "green"]);
    });

    it("extracts values from mixed type union", () => {
      const schema = z.union([z.literal("auto"), z.literal(0), z.literal(false)]);
      const values = getLiteralValues(schema);

      expect(values).toEqual(["auto", "0", "false"]);
    });

    it("handles empty union", () => {
      const schema = z.union([z.literal("only")]);
      const values = getLiteralValues(schema);

      expect(values).toEqual(["only"]);
    });
  });

  describe("Nested unions", () => {
    it("flattens nested unions", () => {
      const inner = z.union([z.literal("a"), z.literal("b")]);
      const schema = z.union([inner, z.literal("c")]);
      const values = getLiteralValues(schema);

      expect(values).toEqual(["a", "b", "c"]);
    });

    it("handles deeply nested unions", () => {
      const level1 = z.union([z.literal("x"), z.literal("y")]);
      const level2 = z.union([level1, z.literal("z")]);
      const level3 = z.union([level2, z.literal("w")]);
      const values = getLiteralValues(level3);

      expect(values).toEqual(["x", "y", "z", "w"]);
    });
  });

  describe("Non-literal schemas", () => {
    it("returns empty array for string schema", () => {
      const schema = z.string();
      const values = getLiteralValues(schema);

      expect(values).toEqual([]);
    });

    it("returns empty array for number schema", () => {
      const schema = z.number();
      const values = getLiteralValues(schema);

      expect(values).toEqual([]);
    });

    it("returns empty array for object schema", () => {
      const schema = z.object({ name: z.string() });
      const values = getLiteralValues(schema);

      expect(values).toEqual([]);
    });

    it("returns empty array for array schema", () => {
      const schema = z.array(z.string());
      const values = getLiteralValues(schema);

      expect(values).toEqual([]);
    });

    it("ignores non-literal in union", () => {
      const schema = z.union([z.literal("test"), z.string()]);
      const values = getLiteralValues(schema);

      expect(values).toEqual(["test"]);
    });
  });

  describe("Real-world schemas", () => {
    it("extracts color keyword values", () => {
      const schema = z.union([z.literal("red"), z.literal("blue"), z.literal("green"), z.literal("transparent")]);
      const values = getLiteralValues(schema);

      expect(values).toEqual(["red", "blue", "green", "transparent"]);
      expect(values.length).toBe(4);
    });

    it("extracts display values", () => {
      const schema = z.union([
        z.literal("block"),
        z.literal("inline"),
        z.literal("flex"),
        z.literal("grid"),
        z.literal("none"),
      ]);
      const values = getLiteralValues(schema);

      expect(values).toEqual(["block", "inline", "flex", "grid", "none"]);
      expect(values.length).toBe(5);
    });

    it("extracts position values", () => {
      const schema = z.union([
        z.literal("static"),
        z.literal("relative"),
        z.literal("absolute"),
        z.literal("fixed"),
        z.literal("sticky"),
      ]);
      const values = getLiteralValues(schema);

      expect(values.length).toBe(5);
      expect(values).toContain("static");
      expect(values).toContain("relative");
      expect(values).toContain("absolute");
      expect(values).toContain("fixed");
      expect(values).toContain("sticky");
    });
  });
});
