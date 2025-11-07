// b_path:: packages/b_declarations/src/properties/background-clip/parser.ts
import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import { createMultiValueParser } from "../../utils";
import type { BackgroundClipIR, BoxValue } from "./types";
import type * as csstree from "@eslint/css-tree";

export const parseBackgroundClip = createMultiValueParser<BoxValue, BackgroundClipIR>({
  itemParser(valueNode: csstree.Value): ParseResult<BoxValue> {
    return Parsers.Background.parseBackgroundClipValue(valueNode);
  },

  aggregator(layers: BoxValue[]): BackgroundClipIR {
    return { kind: "layers", layers };
  },
});
