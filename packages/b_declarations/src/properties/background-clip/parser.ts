// b_path:: packages/b_declarations/src/properties/background-clip/parser.ts
import type * as csstree from "@eslint/css-tree";
import type { ParseResult } from "@b/types";
import type { BackgroundClip } from "@b/keywords";
import * as Parsers from "@b/parsers";
import { createMultiValueParser } from "../../utils";
import type { BackgroundClipIR } from "./types";

export const parseBackgroundClip = createMultiValueParser<BackgroundClip, BackgroundClipIR>({
  propertyName: "background-clip",

  itemParser(valueNode: csstree.Value): ParseResult<BackgroundClip> {
    return Parsers.Background.parseBackgroundClipValue(valueNode);
  },

  aggregator(layers: BackgroundClip[]): BackgroundClipIR {
    return { kind: "list", values: layers };
  },
});
