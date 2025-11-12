// b_path:: packages/b_declarations/src/properties/mix-blend-mode/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import { generateValue } from "../../utils";
import type { MixBlendModeIR } from "./types";

export function generateMixBlendMode(ir: MixBlendModeIR): GenerateResult {
	if (ir.kind === "keyword") {
		return generateOk(ir.value);
	}

	return generateValue(ir.value, Generators.BlendMode.generate);
}
