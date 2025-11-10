// b_path:: packages/b_declarations/src/properties/background-position/parser.ts

import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import { createMultiValueParser } from "../../utils";
import type { BackgroundPositionIR } from "./types";
import type * as csstree from "@eslint/css-tree";

export const parseBackgroundPosition = createMultiValueParser<any, BackgroundPositionIR>({
  itemParser(valueNode: csstree.Value): ParseResult<any> {
    const nodes = Array.from(valueNode.children);
    const result = Parsers.Position.parsePosition2D(nodes, 0);
    if (result.ok) {
      return {
        ok: true,
        property: "background-position",
        value: result.value.position,
        issues: result.issues,
      };
    }
    return result as ParseResult<any>;
  },

  aggregator(values: any[]): BackgroundPositionIR {
    return { kind: "list", values };
  },
});
