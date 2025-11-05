// b_path:: packages/b_parsers/src/gradient/linear.ts
import * as csstree from "css-tree";
import { err, ok, type Result } from "@b/types";
import type * as Type from "@b/types";
import { parseAngleNode } from "../angle";
import * as ColorStop from "./color-stop";
import * as Utils from "../utils";

/**
 * Parse gradient direction from nodes.
 */
function parseDirection(
	nodes: csstree.CssNode[],
	startIdx: number,
): Result<{ direction: Type.GradientDirection; nextIdx: number }, string> {
	let idx = startIdx;
	const node = nodes[idx];

	if (!node) {
		return err("Expected direction value");
	}

	if (node.type === "Dimension" || node.type === "Number") {
		const angleResult = parseAngleNode(node);
		if (angleResult.ok) {
			return ok({
				direction: {
					kind: "angle",
					value: angleResult.value,
				},
				nextIdx: idx + 1,
			});
		}
	}

	if (node.type === "Identifier" && node.name.toLowerCase() === "to") {
		idx++;
		const firstKeyword = nodes[idx];
		if (!firstKeyword || firstKeyword.type !== "Identifier") {
			return err("Expected side or corner keyword after 'to'");
		}

		const first = firstKeyword.name.toLowerCase();
		idx++;

		const secondKeyword = nodes[idx];
		if (secondKeyword && secondKeyword.type === "Identifier") {
			const second = secondKeyword.name.toLowerCase();
			const corner = `${first} ${second}`;
			if (["top left", "top right", "bottom left", "bottom right"].includes(corner)) {
				return ok({
					direction: {
						kind: "to-corner",
						value: corner as "top left" | "top right" | "bottom left" | "bottom right",
					},
					nextIdx: idx + 1,
				});
			}
		}

		if (["top", "right", "bottom", "left"].includes(first)) {
			return ok({
				direction: {
					kind: "to-side",
					value: first as "top" | "right" | "bottom" | "left",
				},
				nextIdx: idx,
			});
		}

		return err(`Invalid direction keyword: ${first}`);
	}

	return err("Invalid direction syntax");
}

/**
 * Parse linear gradient from CSS function AST.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient
 */
export function fromFunction(fn: csstree.FunctionNode): Result<Type.LinearGradient, string> {
	const functionName = fn.name.toLowerCase();
	const isRepeating = functionName === "repeating-linear-gradient";

	if (!isRepeating && functionName !== "linear-gradient") {
		return err(`Expected linear-gradient or repeating-linear-gradient, got: ${functionName}`);
	}

	const children = fn.children.toArray();
	if (children.length === 0) {
		return err("linear-gradient requires at least 2 color stops");
	}

	let direction: Type.GradientDirection | undefined;
	let colorInterpolationMethod: Type.ColorInterpolationMethod | undefined;

	let idx = 0;

	const firstNode = children[idx];
	if (firstNode) {
		if (
			firstNode.type === "Dimension" ||
			firstNode.type === "Number" ||
			(firstNode.type === "Identifier" && firstNode.name.toLowerCase() === "to")
		) {
			const dirResult = parseDirection(children, idx);
			if (dirResult.ok) {
				direction = dirResult.value.direction;
				idx = dirResult.value.nextIdx;
			}
		}
	}

	idx = Utils.Ast.skipComma(children, idx);

	if (idx < children.length) {
		const node = children[idx];
		if (node?.type === "Identifier" && node.name.toLowerCase() === "in") {
			idx++;
			const spaceNode = children[idx];
			if (spaceNode?.type === "Identifier") {
				const space = spaceNode.name.toLowerCase();
				colorInterpolationMethod = { colorSpace: space } as Type.ColorInterpolationMethod;
				idx++;

				const hueNode = children[idx];
				if (hueNode?.type === "Identifier") {
					const hueMethod = `${hueNode.name.toLowerCase()}`;
					if (hueMethod.includes("hue")) {
						colorInterpolationMethod = {
							colorSpace: space,
							hueInterpolationMethod: hueMethod,
						} as Type.ColorInterpolationMethod;
						idx++;
					}
				}
			}

			idx = Utils.Ast.skipComma(children, idx);
		}
	}

	const stopGroups = Utils.Ast.splitNodesByComma(children, { startIndex: idx });

	const colorStops: Type.ColorStop[] = [];
	for (const stopNodes of stopGroups) {
		const stopResult = ColorStop.fromNodes(stopNodes);
		if (stopResult.ok) {
			colorStops.push(stopResult.value);
		} else {
			return err(`Invalid color stop: ${stopResult.error}`);
		}
	}

	if (colorStops.length < 2) {
		return err("linear-gradient requires at least 2 color stops");
	}

	return ok({
		kind: "linear",
		direction,
		colorInterpolationMethod,
		colorStops,
		repeating: isRepeating,
	});
}

/**
 * Parse a CSS linear gradient value into IR.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient
 */
export function parse(css: string): Result<Type.LinearGradient, string> {
	const astResult = Utils.Ast.parseCssString(css, "value");
	if (!astResult.ok) {
		return astResult;
	}

	const funcResult = Utils.Ast.findFunctionNode(astResult.value, ["linear-gradient", "repeating-linear-gradient"]);
	if (!funcResult.ok) {
		return funcResult;
	}

	return fromFunction(funcResult.value);
}
