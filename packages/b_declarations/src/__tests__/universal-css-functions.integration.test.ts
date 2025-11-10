// b_path:: packages/b_declarations/src/__tests__/universal-css-functions.integration.test.ts
/**
 * Integration tests for universal CSS functions support (var, calc, min, max, clamp, etc.)
 * Session 064: Validates that declaration layer injects universal function handling
 * at abstraction points (createMultiValueParser, parseDeclaration).
 */

import { describe, it, expect } from "vitest";
import { parseDeclaration } from "..";

describe("Universal CSS Functions Integration", () => {
	describe("var() support in multi-value properties", () => {
		it("should parse var() in background-image", () => {
			const result = parseDeclaration(
				"background-image: var(--gradient), url(img.png), none",
			);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.ir.kind).toBe("list");
				if (result.value.ir.kind === "list") {
					expect(result.value.ir.values).toHaveLength(3);
					expect(result.value.ir.values[0]).toMatchObject({
						kind: "variable",
						name: "--gradient",
					});
					expect(result.value.ir.values[1]).toMatchObject({
						kind: "url",
						url: "img.png",
					});
					expect(result.value.ir.values[2]).toMatchObject({
						kind: "keyword",
						value: "none",
					});
				}
			}
		});

		it("should parse calc() in background-size", () => {
			const result = parseDeclaration("background-size: calc(100% - 20px)");

			expect(result.ok).toBe(true);
			if (result.ok && result.value.ir.kind === "list") {
				const firstLayer = result.value.ir.values[0];
				if (firstLayer.kind === "explicit") {
					expect(firstLayer.width.kind).toBe("calc");
				}
			}
		});

		it("should parse min/max/clamp", () => {
			const minResult = parseDeclaration("background-size: min(50vw, 500px)");
			const maxResult = parseDeclaration("background-size: max(100px, 10%)");
			const clampResult = parseDeclaration(
				"background-size: clamp(100px, 50%, 500px)",
			);

			expect(minResult.ok).toBe(true);
			expect(maxResult.ok).toBe(true);
			expect(clampResult.ok).toBe(true);
		});
	});

	describe("property-specific values still work", () => {
		it("should still parse gradients", () => {
			const result = parseDeclaration("background-image: linear-gradient(red, blue)");

			expect(result.ok).toBe(true);
			if (result.ok && result.value.ir.kind === "list") {
				const firstLayer = result.value.ir.values[0];
				if (firstLayer.kind === "gradient") {
					expect(firstLayer.gradient.kind).toBe("linear");
				}
			}
		});

		it("should still parse url()", () => {
			const result = parseDeclaration("background-image: url(img.png)");

			expect(result.ok).toBe(true);
			if (result.ok && result.value.ir.kind === "list") {
				const firstLayer = result.value.ir.values[0];
				expect(firstLayer.kind).toBe("url");
			}
		});

		it("should still parse keywords", () => {
			const result = parseDeclaration("background-image: none");

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.ir.kind).toBe("keyword");
				if (result.value.ir.kind === "keyword") {
					expect(result.value.ir.value).toBe("none");
				}
			}
		});
	});

	describe("mixed values", () => {
		it("should handle mix of var() and concrete values", () => {
			const result = parseDeclaration(
				"background-image: var(--overlay), url(pattern.svg), none",
			);

			expect(result.ok).toBe(true);
			if (result.ok && result.value.ir.kind === "list") {
				expect(result.value.ir.values).toHaveLength(3);
				expect(result.value.ir.values[0].kind).toBe("variable");
				expect(result.value.ir.values[1].kind).toBe("url");
				expect(result.value.ir.values[2].kind).toBe("keyword");
			}
		});

		it("should handle multiple var() in list", () => {
			const result = parseDeclaration(
				"background-image: var(--img1), var(--img2), var(--img3)",
			);

			expect(result.ok).toBe(true);
			if (result.ok && result.value.ir.kind === "list") {
				expect(result.value.ir.values).toHaveLength(3);
				expect(result.value.ir.values[0]).toMatchObject({
					kind: "variable",
					name: "--img1",
				});
				expect(result.value.ir.values[1]).toMatchObject({
					kind: "variable",
					name: "--img2",
				});
				expect(result.value.ir.values[2]).toMatchObject({
					kind: "variable",
					name: "--img3",
				});
			}
		});
	});

	describe("background-clip (multi-value with simpler type)", () => {
		it("should parse var() in background-clip", () => {
			const result = parseDeclaration(
				"background-clip: var(--clip), border-box, padding-box",
			);

			expect(result.ok).toBe(true);
			if (result.ok && result.value.ir.kind === "list") {
				expect(result.value.ir.values).toHaveLength(3);
				expect(result.value.ir.values[0].kind).toBe("variable");
				expect(result.value.ir.values[1]).toBe("border-box");
				expect(result.value.ir.values[2]).toBe("padding-box");
			}
		});
	});

	describe("background-repeat", () => {
		it("should parse var() in background-repeat", () => {
			const result = parseDeclaration(
				"background-repeat: var(--repeat), repeat-x, no-repeat",
			);

			expect(result.ok).toBe(true);
			if (result.ok && result.value.ir.kind === "list") {
				expect(result.value.ir.values).toHaveLength(3);
				expect(result.value.ir.values[0].kind).toBe("variable");
			}
		});
	});
});
