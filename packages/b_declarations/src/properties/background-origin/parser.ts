// b_path:: packages/b_declarations/src/properties/background-origin/parser.ts
import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import { createMultiValueParser } from "../../utils";
import type { BackgroundOriginIR } from "./types";
import type * as csstree from "@eslint/css-tree";
import type * as Keywords from "@b/keywords";

export const parseBackgroundOrigin = createMultiValueParser<Keywords.BackgroundOrigin, BackgroundOriginIR>({
  itemParser(valueNode: csstree.Value): ParseResult<Keywords.BackgroundOrigin> {
    return Parsers.Background.parseBackgroundOriginValue(valueNode);
  },

  aggregator(layers: Keywords.BackgroundOrigin[]): BackgroundOriginIR {
    return { kind: "list", values: layers };
  },
});
