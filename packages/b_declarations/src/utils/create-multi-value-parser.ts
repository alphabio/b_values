// b_path:: packages/b_declarations/src/utils/create-multi-value-parser.ts
/**
 * Factory for creating resilient multi-value (comma-separated) property parsers.
 *
 * This solves the "incomplete consumption" bug where css-tree stops parsing early
 * but doesn't error, causing silent failures when commas are missing between values.
 *
 * Key features:
 * - Splits by top-level commas
 * - Parses each chunk individually (resilience)
 * - Validates complete consumption (detects missing commas)
 * - Aggregates results and issues
 *
 * @module
 */

import * as csstree from "@eslint/css-tree";
import { createError, parseErr, type ParseResult, type Issue } from "@b/types";
import { splitByComma } from "./split";

/**
 * Configuration for the multi-value parser factory.
 * @template TItem The IR type of a single item in the list (e.g., ImageLayer).
 * @template TFinal The final IR type for the whole property (e.g., BackgroundImageIR).
 */
export interface MultiValueParserConfig<TItem, TFinal> {
  /**
   * A parser for a single item in the list. It receives a validated AST for one chunk.
   */
  itemParser: (node: csstree.Value) => ParseResult<TItem>;

  /**
   * A function that aggregates an array of successfully parsed items into the final IR structure.
   * e.g., (layers) => ({ kind: 'layers', layers })
   */
  aggregator: (items: TItem[]) => TFinal;

  /**
   * Optional: A function to handle property-specific keywords (like 'none') before list splitting.
   *
   * NOTE: CSS-wide keywords (inherit, initial, unset, revert, revert-layer) are handled
   * by the top-level parseDeclaration orchestrator. Do NOT check for them here.
   *
   * If it returns a result, the list parsing is skipped.
   */
  preParse?: (value: string) => ParseResult<TFinal> | null;
}

/**
 * Factory function to create a resilient, multi-value (comma-separated) property parser.
 *
 * This handles the generic boilerplate for:
 * 1. Handling top-level keywords.
 * 2. Splitting the value string by top-level commas.
 * 3. Parsing each chunk into an AST individually.
 * 4. Checking for incomplete consumption (trailing content bugs).
 * 5. Aggregating successful results and all issues.
 *
 * @param config The property-specific parsing and aggregation logic.
 * @returns A complete multi-value parser function.
 *
 * @example
 * ```typescript
 * export const parseBackgroundImage = createMultiValueParser({
 *   preParse: (value) => {
 *     if (value === "none") return parseOk({ kind: "keyword", value: "none" });
 *     return null;
 *   },
 *   itemParser: (ast) => parseImageLayer(ast),
 *   aggregator: (layers) => ({ kind: "list", layers }),
 * });
 * ```
 */
export function createMultiValueParser<TItem, TFinal>(
  config: MultiValueParserConfig<TItem, TFinal>,
): (value: string) => ParseResult<TFinal> {
  // This is the returned parser that conforms to the MultiValueParser signature.
  return (value: string): ParseResult<TFinal> => {
    const trimmedValue = value.trim();

    // 1. Handle top-level keywords (optional)
    if (config.preParse) {
      const preParseResult = config.preParse(trimmedValue);
      if (preParseResult !== null) {
        return preParseResult;
      }
    }

    // 2. Split by top-level commas
    const itemStrings = splitByComma(trimmedValue);
    const itemResults: ParseResult<TItem>[] = [];

    // 3. Parse each chunk individually
    for (const itemStr of itemStrings) {
      const trimmedItemStr = itemStr.trim();
      if (!trimmedItemStr) continue;

      let itemAst: csstree.Value;
      try {
        itemAst = csstree.parse(trimmedItemStr, { context: "value", positions: true }) as csstree.Value;

        // ✨ REFINED CRITICAL FIX: Check the container node's location ✨
        // If the parsed AST's end offset doesn't match the string's length,
        // it means css-tree stopped parsing early and there's trailing content.
        // This correctly handles both:
        // - Space-separated values within a layer (e.g., "repeat space") ✅
        // - Missing commas between layers (e.g., "url(...) url(...)") ✅
        if (itemAst.loc && itemAst.loc.end.offset < trimmedItemStr.length) {
          const unparsed = trimmedItemStr.slice(itemAst.loc.end.offset).trim();
          const previewLength = Math.min(unparsed.length, 50);
          const preview = unparsed.slice(0, previewLength) + (unparsed.length > previewLength ? "..." : "");
          const issue = createError(
            "invalid-syntax",
            `Unexpected content after a valid value, likely a missing comma. Unparsed: "${preview}"`,
          );
          itemResults.push(parseErr("InvalidSyntax", issue));
          continue;
        }
      } catch (e) {
        const issue = createError(
          "invalid-syntax",
          `Invalid syntax in list item: ${e instanceof Error ? e.message : String(e)}`,
        );
        itemResults.push(parseErr("InvalidSyntax", issue));
        continue;
      }

      // 5. Delegate to the property-specific item parser with the validated AST chunk.
      itemResults.push(config.itemParser(itemAst));
    }

    // 6. Aggregate all successful items and all issues.
    const validItems: TItem[] = [];
    const allIssues: Issue[] = [];

    for (const result of itemResults) {
      allIssues.push(...result.issues);
      if (result.value) {
        validItems.push(result.value);
      }
    }

    // If there were no valid items, it's a total failure.
    if (validItems.length === 0) {
      return {
        ok: false,
        value: undefined,
        issues: allIssues.length > 0 ? allIssues : [createError("invalid-value", "No valid list items found")],
      };
    }

    // Otherwise, we have a partial or full success.
    const finalIR = config.aggregator(validItems);

    // Determine ok status based on whether there were any errors.
    const hasErrors = allIssues.some((issue) => issue.severity === "error");
    if (!hasErrors) {
      return {
        ok: true,
        value: finalIR,
        issues: [],
      };
    }

    return {
      ok: false,
      value: finalIR,
      issues: allIssues,
    };
  };
}
