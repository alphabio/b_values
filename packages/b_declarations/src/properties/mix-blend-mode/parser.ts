// b_path:: packages/b_declarations/src/properties/mix-blend-mode/parser.ts

import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { MixBlendModeIR } from "./types";

export function parseMixBlendMode(
	ast: csstree.Value,
): ParseResult<MixBlendModeIR> {
	const firstNode = ast.children.first;

	if (!firstNode) {
		return {
			ok: false,
			property: "mix-blend-mode",
			value: undefined,
			issues: [
				{
					code: "missing-value",
					severity: "error",
					message: "Empty value for mix-blend-mode",
				},
			],
		};
	}

	const result = Parsers.BlendMode.parse(ast);

	if (result.ok) {
		return {
			ok: true,
			property: "mix-blend-mode",
			value: { kind: "value", value: result.value },
			issues: result.issues,
		};
	}

	return result as ParseResult<MixBlendModeIR>;
}
