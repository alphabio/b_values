// b_path:: packages/b_parsers/src/color/color.ts
import type * as csstree from "css-tree";
import * as cssTree from "css-tree";
import { err, ok, type Result } from "@b/types";
import type * as Type from "@b/types";

/**
 * Parse color AST node with auto-detection.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
 */
export function parseNode(node: csstree.CssNode): Result<Type.Color, string> {
	if (node.type === "Hash") {
		const value = node.value.toLowerCase();
		return ok({ kind: "hex", value: `#${value}` } as Type.Color);
	}

	if (node.type === "Function") {
		return err(`Color functions not yet implemented: ${node.name}`);
	}

	if (node.type === "Identifier") {
		const keyword = node.name.toLowerCase();

		if (keyword === "transparent" || keyword === "currentcolor") {
			return ok({ kind: "special", keyword } as Type.Color);
		}

		return ok({ kind: "named", name: keyword } as Type.Color);
	}

	return err(`Invalid color node type: ${node.type}`);
}

/**
 * Parse color value with auto-detection.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
 */
export function parse(value: string): Result<Type.Color, string> {
	try {
		const ast = cssTree.parse(value, { context: "value" });
		
		let firstNode: csstree.CssNode | null = null;
		cssTree.walk(ast, {
			enter(node: csstree.CssNode) {
				if (!firstNode && node.type !== "Value") {
					firstNode = node;
				}
			},
		});

		if (!firstNode) {
			return err("Empty value");
		}

		return parseNode(firstNode);
	} catch (e) {
		return err(`Failed to parse color: ${e instanceof Error ? e.message : String(e)}`);
	}
}
