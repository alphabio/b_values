// b_path:: packages/b_declarations/src/properties/background-clip/parser.ts
import type * as csstree from "@eslint/css-tree";
import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import type * as Keywords from "@b/keywords";
import { createMultiValueParser } from "../../utils";
import type { BackgroundClipIR } from "./types";

export const parseBackgroundClip = createMultiValueParser<Keywords.BackgroundClip, BackgroundClipIR>({
  itemParser(valueNode: csstree.Value): ParseResult<Keywords.BackgroundClip> {
    return Parsers.Background.parseBackgroundClipValue(valueNode);
  },

  aggregator(layers: Keywords.BackgroundClip[]): BackgroundClipIR {
    return { kind: "list", values: layers };
  },
});
