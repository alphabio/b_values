// b_path:: packages/b_declarations/src/properties/background-origin/parser.ts
import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import { createMultiValueParser } from "../../utils";
import type { BackgroundOriginIR, OriginBoxValue } from "./types";
import type * as csstree from "@eslint/css-tree";

export const parseBackgroundOrigin = createMultiValueParser<OriginBoxValue, BackgroundOriginIR>({
  itemParser(valueNode: csstree.Value): ParseResult<OriginBoxValue> {
    return Parsers.Background.parseBackgroundOriginValue(valueNode);
  },

  aggregator(layers: OriginBoxValue[]): BackgroundOriginIR {
    return { kind: "layers", layers };
  },
});
