// b_path:: packages/b_declarations/src/properties/background-blend-mode/parser.ts

import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import { createMultiValueParser } from "../../utils";
import type { BackgroundBlendModeIR, BackgroundBlendModeValue } from "./types";
import type * as csstree from "@eslint/css-tree";

export const parseBackgroundBlendMode = createMultiValueParser<BackgroundBlendModeValue, BackgroundBlendModeIR>({
  propertyName: "background-blend-mode",

  itemParser(valueNode: csstree.Value): ParseResult<BackgroundBlendModeValue> {
    return Parsers.BlendMode.parse(valueNode);
  },

  aggregator(values: BackgroundBlendModeValue[]): BackgroundBlendModeIR {
    return { kind: "list", values };
  },
});
