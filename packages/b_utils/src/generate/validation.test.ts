// b_path:: packages/b_utils/src/generate/validation.test.ts
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { formatPath, zodErrorToIssues } from "./validation";

describe("validation utilities", () => {
  describe("formatPath", () => {
    it("formats empty path", () => {
      expect(formatPath([])).toBe("");
    });

    it("formats single string segment", () => {
      expect(formatPath(["value"])).toBe("value");
    });

    it("formats array index", () => {
      expect(formatPath(["items", 0])).toBe("items[0]");
    });

    it("formats nested path", () => {
      expect(formatPath(["durations", 0, "unit"])).toBe("durations[0].unit");
    });

    it("formats multiple nested levels", () => {
      expect(formatPath(["a", "b", 1, "c", 2, "d"])).toBe("a.b[1].c[2].d");
    });
  });

  describe("zodErrorToIssues", () => {
    describe("basic type errors", () => {
      it("converts string type error", () => {
        const schema = z.object({ name: z.string() });
        const result = schema.safeParse({ name: 123 });

        if (result.success) throw new Error("Should fail");

        const issues = zodErrorToIssues(result.error, {
          typeName: "TestType",
          property: "test-property",
        });

        expect(issues.length).toBeGreaterThan(0);
        expect(issues[0]?.code).toBe("invalid-ir");
        expect(issues[0]?.property).toBe("test-property");
        expect(issues[0]?.message).toContain("name");
      });

      it("converts number type error", () => {
        const schema = z.object({ count: z.number() });
        const result = schema.safeParse({ count: "not a number" });

        if (result.success) throw new Error("Should fail");

        const issues = zodErrorToIssues(result.error);

        expect(issues.length).toBeGreaterThan(0);
        expect(issues[0]?.code).toBe("invalid-ir");
      });
    });

    describe("missing required fields", () => {
      it("reports missing required field", () => {
        const schema = z.object({ required: z.string() });
        const result = schema.safeParse({});

        if (result.success) throw new Error("Should fail");

        const issues = zodErrorToIssues(result.error, { typeName: "RequiredTest" });

        expect(issues.length).toBeGreaterThan(0);
        expect(issues[0]?.message).toContain("required");
      });
    });

    describe("unrecognized keys", () => {
      it("reports unrecognized keys with suggestions", () => {
        const schema = z.object({ name: z.string() }).strict();
        const result = schema.safeParse({ name: "test", nmae: "typo" });

        if (result.success) throw new Error("Should fail");

        const issues = zodErrorToIssues(result.error, {
          validKeys: ["name", "value", "kind"],
        });

        expect(issues.length).toBeGreaterThan(0);
        const unrecognizedIssue = issues.find((i) => i.code === "unrecognized-keys");
        expect(unrecognizedIssue).toBeDefined();
      });
    });

    describe("union errors", () => {
      it("handles union with custom message", () => {
        const schema = z.union([z.literal("red"), z.literal("blue")]);
        const result = schema.safeParse("green");

        if (result.success) throw new Error("Should fail");

        const issues = zodErrorToIssues(result.error);

        expect(issues.length).toBeGreaterThan(0);
      });

      it("traverses nested union errors", () => {
        const schema = z.union([
          z.object({ kind: z.literal("a"), value: z.number() }),
          z.object({ kind: z.literal("b"), value: z.string() }),
        ]);
        const result = schema.safeParse({ kind: "a", value: "wrong" });

        if (result.success) throw new Error("Should fail");

        const issues = zodErrorToIssues(result.error, { typeName: "UnionType" });

        expect(issues.length).toBeGreaterThan(0);
      });

      it("handles deeply nested union with path context", () => {
        const innerSchema = z.union([z.literal("x"), z.literal("y")]);
        const schema = z.object({
          items: z.array(z.object({ type: innerSchema })),
        });
        const result = schema.safeParse({
          items: [{ type: "x" }, { type: "invalid" }],
        });

        if (result.success) throw new Error("Should fail");

        const issues = zodErrorToIssues(result.error);

        expect(issues.length).toBeGreaterThan(0);
        expect(issues[0]?.path).toContain("items");
        expect(issues[0]?.path).toContain(1);
      });
    });

    describe("enum errors", () => {
      it("reports invalid enum value", () => {
        const schema = z.enum(["top", "bottom", "left", "right"]);
        const result = schema.safeParse("center");

        if (result.success) throw new Error("Should fail");

        const issues = zodErrorToIssues(result.error);

        expect(issues.length).toBeGreaterThan(0);
        // Enum errors map to invalid-ir by default
        expect(issues[0]?.code).toBe("invalid-ir");
      });
    });

    describe("array errors", () => {
      it("reports array item errors with index", () => {
        const schema = z.array(z.number());
        const result = schema.safeParse([1, 2, "three", 4]);

        if (result.success) throw new Error("Should fail");

        const issues = zodErrorToIssues(result.error);

        expect(issues.length).toBeGreaterThan(0);
        expect(issues[0]?.path).toContain(2);
      });

      it("reports too small array", () => {
        const schema = z.array(z.string()).min(2);
        const result = schema.safeParse(["one"]);

        if (result.success) throw new Error("Should fail");

        const issues = zodErrorToIssues(result.error);

        expect(issues.length).toBeGreaterThan(0);
        expect(issues[0]?.code).toBe("missing-required-field");
      });

      it("reports too large array", () => {
        const schema = z.array(z.string()).max(2);
        const result = schema.safeParse(["one", "two", "three"]);

        if (result.success) throw new Error("Should fail");

        const issues = zodErrorToIssues(result.error);

        expect(issues.length).toBeGreaterThan(0);
        expect(issues[0]?.code).toBe("invalid-value");
      });
    });

    describe("context handling", () => {
      it("includes type name in message", () => {
        const schema = z.object({ value: z.string() });
        const result = schema.safeParse({ value: 123 });

        if (result.success) throw new Error("Should fail");

        const issues = zodErrorToIssues(result.error, { typeName: "MyType" });

        expect(issues[0]?.message).toContain("MyType");
      });

      it("includes property name", () => {
        const schema = z.string();
        const result = schema.safeParse(123);

        if (result.success) throw new Error("Should fail");

        const issues = zodErrorToIssues(result.error, { property: "background-color" });

        expect(issues[0]?.property).toBe("background-color");
      });

      it("respects parent path", () => {
        const schema = z.object({ nested: z.string() });
        const result = schema.safeParse({ nested: 123 });

        if (result.success) throw new Error("Should fail");

        const issues = zodErrorToIssues(result.error, {
          parentPath: ["root", 0],
        });

        expect(issues[0]?.path).toEqual(["root", 0, "nested"]);
      });
    });

    describe("fallback behavior", () => {
      it("provides fallback issue when no specific errors", () => {
        // Create a schema that produces empty issues (edge case)
        const schema = z.string();
        const result = schema.safeParse(123);

        if (result.success) throw new Error("Should fail");

        // Manually create edge case by filtering all issues
        const mockError = {
          issues: [],
          name: "ZodError" as const,
          format: () => ({}),
          flatten: () => ({ formErrors: [], fieldErrors: {} }),
          toString: () => "",
          message: "",
          addIssue: () => {},
          addIssues: () => {},
          isEmpty: true,
        } as unknown as z.ZodError;
        const issues = zodErrorToIssues(mockError, { property: "test" });

        expect(issues.length).toBe(1);
        expect(issues[0]?.code).toBe("invalid-ir");
        expect(issues[0]?.message).toBe("Invalid IR structure");
      });
    });

    describe("expected/received fields", () => {
      it("includes expected for type errors", () => {
        const schema = z.string();
        const result = schema.safeParse(123);

        if (result.success) throw new Error("Should fail");

        const issues = zodErrorToIssues(result.error);

        expect(issues[0]?.expected).toBeDefined();
      });
    });
  });
});
