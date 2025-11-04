import { describe, expect, it } from "vitest";
import { absoluteLengthUnitSchema } from "./length-absolute";

describe("absoluteLengthUnitSchema", () => {
	it("accepts valid absolute length units", () => {
		expect(absoluteLengthUnitSchema.parse("px")).toBe("px");
		expect(absoluteLengthUnitSchema.parse("pt")).toBe("pt");
		expect(absoluteLengthUnitSchema.parse("cm")).toBe("cm");
		expect(absoluteLengthUnitSchema.parse("mm")).toBe("mm");
		expect(absoluteLengthUnitSchema.parse("Q")).toBe("Q");
		expect(absoluteLengthUnitSchema.parse("in")).toBe("in");
		expect(absoluteLengthUnitSchema.parse("pc")).toBe("pc");
	});

	it("rejects invalid units", () => {
		expect(() => absoluteLengthUnitSchema.parse("em")).toThrow();
		expect(() => absoluteLengthUnitSchema.parse("")).toThrow();
		expect(() => absoluteLengthUnitSchema.parse("pixels")).toThrow();
	});
});
