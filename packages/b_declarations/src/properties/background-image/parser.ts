// b_path:: packages/b_declarations/src/properties/background-image/parser.ts

import { parseOk, type ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import { createMultiValueParser } from "../../utils";
import type { BackgroundImageIR } from "./types";
import type { Image } from "@b/types";
import type * as csstree from "@eslint/css-tree";

export const parseBackgroundImage = createMultiValueParser<Image, BackgroundImageIR>({
  propertyName: "background-image",

  preParse: (value: string): ParseResult<BackgroundImageIR> | null => {
    if (value.trim().toLowerCase() === "none") {
      return parseOk({ kind: "keyword", value: "none" });
    }
    return null;
  },

  itemParser(valueNode: csstree.Value): ParseResult<Image> {
    return Parsers.Image.parseImageValue(valueNode);
  },

  aggregator(layers: Image[]): BackgroundImageIR {
    return { kind: "list", values: layers };
  },
});
