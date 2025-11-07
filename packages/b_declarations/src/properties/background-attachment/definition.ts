// b_path:: packages/b_declarations/src/properties/background-attachment/definition.ts
import { defineProperty } from "../../core";
import { parseBackgroundAttachment } from "./parser";
import { generateBackgroundAttachment } from "./generator";
import type { BackgroundAttachmentIR } from "./types";

/**
 * background-attachment property definition.
 */
export const backgroundAttachment = defineProperty<BackgroundAttachmentIR>({
  name: "background-attachment",
  syntax: "<attachment>#",
  parser: parseBackgroundAttachment,
  multiValue: true,
  generator: generateBackgroundAttachment,
  inherited: false,
  initial: "scroll",
});
