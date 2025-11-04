import { describe, expect, it } from "vitest";
import { angleUnitSchema } from "./angle";

describe("angleUnitSchema", () => {
	it("accepts valid angle units", () => {
		expect(angleUnitSchema.parse("deg")).toBe("deg");
		expect(angleUnitSchema.parse("grad")).toBe("grad");
		expect(angleUnitSchema.parse("rad")).toBe("rad");
		expect(angleUnitSchema.parse("turn")).toBe("turn");
	});

	it("rejects invalid units", () => {
		expect(() => angleUnitSchema.parse("px")).toThrow();
		expect(() => angleUnitSchema.parse("")).toThrow();
		expect(() => angleUnitSchema.parse("degrees")).toThrow();
	});
});
