import { describe, expect, it } from "vitest";
import { percentageUnitSchema } from "./percentage";

describe("percentageUnitSchema", () => {
	it("accepts percentage unit", () => {
		expect(percentageUnitSchema.parse("%")).toBe("%");
	});

	it("rejects other values", () => {
		expect(() => percentageUnitSchema.parse("px")).toThrow();
		expect(() => percentageUnitSchema.parse("")).toThrow();
		expect(() => percentageUnitSchema.parse("percent")).toThrow();
	});
});
