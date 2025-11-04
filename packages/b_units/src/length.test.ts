import { describe, expect, it } from "vitest";
import { lengthUnitSchema } from "./length";

describe("lengthUnitSchema", () => {
	it("accepts absolute length units", () => {
		expect(lengthUnitSchema.parse("px")).toBe("px");
		expect(lengthUnitSchema.parse("cm")).toBe("cm");
	});

	it("accepts font-relative length units", () => {
		expect(lengthUnitSchema.parse("em")).toBe("em");
		expect(lengthUnitSchema.parse("rem")).toBe("rem");
	});

	it("accepts viewport-relative length units", () => {
		expect(lengthUnitSchema.parse("vw")).toBe("vw");
		expect(lengthUnitSchema.parse("dvh")).toBe("dvh");
	});

	it("rejects invalid units", () => {
		expect(() => lengthUnitSchema.parse("%")).toThrow();
		expect(() => lengthUnitSchema.parse("")).toThrow();
		expect(() => lengthUnitSchema.parse("deg")).toThrow();
	});
});
