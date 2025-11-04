import { describe, expect, it } from "vitest";
import { viewportLengthUnitSchema } from "./length-viewport";

describe("viewportLengthUnitSchema", () => {
	it("accepts standard viewport units", () => {
		expect(viewportLengthUnitSchema.parse("vw")).toBe("vw");
		expect(viewportLengthUnitSchema.parse("vh")).toBe("vh");
		expect(viewportLengthUnitSchema.parse("vi")).toBe("vi");
		expect(viewportLengthUnitSchema.parse("vb")).toBe("vb");
		expect(viewportLengthUnitSchema.parse("vmin")).toBe("vmin");
		expect(viewportLengthUnitSchema.parse("vmax")).toBe("vmax");
	});

	it("accepts small viewport units", () => {
		expect(viewportLengthUnitSchema.parse("svw")).toBe("svw");
		expect(viewportLengthUnitSchema.parse("svh")).toBe("svh");
		expect(viewportLengthUnitSchema.parse("svi")).toBe("svi");
		expect(viewportLengthUnitSchema.parse("svb")).toBe("svb");
	});

	it("accepts large viewport units", () => {
		expect(viewportLengthUnitSchema.parse("lvw")).toBe("lvw");
		expect(viewportLengthUnitSchema.parse("lvh")).toBe("lvh");
		expect(viewportLengthUnitSchema.parse("lvmin")).toBe("lvmin");
		expect(viewportLengthUnitSchema.parse("lvmax")).toBe("lvmax");
	});

	it("accepts dynamic viewport units", () => {
		expect(viewportLengthUnitSchema.parse("dvw")).toBe("dvw");
		expect(viewportLengthUnitSchema.parse("dvh")).toBe("dvh");
		expect(viewportLengthUnitSchema.parse("dvi")).toBe("dvi");
		expect(viewportLengthUnitSchema.parse("dvb")).toBe("dvb");
	});

	it("rejects invalid units", () => {
		expect(() => viewportLengthUnitSchema.parse("px")).toThrow();
		expect(() => viewportLengthUnitSchema.parse("")).toThrow();
		expect(() => viewportLengthUnitSchema.parse("em")).toThrow();
	});
});
