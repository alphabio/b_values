// b_path:: packages/b_utils/src/parse/validate.ts
/**
 * Validates CSS stylesheet syntax and property values, providing detailed error formatting.
 *
 * This function parses CSS using the css-tree library and validates each CSS property
 * against the CSS specification. When validation errors are found, it generates
 * formatted error messages with visual context including line numbers, code snippets,
 * and precise error location indicators.
 *
 * @param css - The CSS string to validate
 *
 * @returns StylesheetValidation object containing:
 *   - ok: boolean indicating if validation passed (no errors)
 *   - errors: Array of syntax parsing errors (malformed CSS)
 *   - warnings: Array of property validation errors (invalid property values)
 *
 * @remarks
 * - Context window shows ±2 lines around each error for better debugging
 * - Long lines are intelligently truncated with ellipses (…) for readability
 * - Pointer indicators (^^^) precisely mark the error location and length
 * - Duplicate declarations are automatically deduplicated to avoid redundant warnings
 *
 * @throws Does not throw - parsing errors are captured in the returned errors array
 *
 * @since 1.0.0
 */

import * as csstree from "css-tree";
import type { BStyleWarning, StylesheetValidation } from "./schema";

// Constants
const DEFAULT_MAX_LINE_WIDTH = 80;
const LINE_NUMBER_PADDING = 4;
const DEFAULT_CONTEXT_WINDOW_SIZE = 2; // Lines before and after error

export interface BStyleMatchError extends csstree.SyntaxMatchError {
  property: string;
  formattedError?: string;
}

export type { BStyleWarning, StylesheetValidation };

export interface Declaration {
  property: string;
  value: csstree.Value | csstree.Raw;
  node: csstree.CssNode;
}

/**
 * Checks if a CSS value contains dynamic functions (var, calc, etc.)
 * that csstree cannot validate.
 *
 * @param value - The CSS value AST node to check
 * @returns true if the value contains var(), calc(), or other dynamic functions
 */
function containsDynamicValue(value: csstree.Value | csstree.Raw): boolean {
  let hasDynamic = false;

  csstree.walk(value, (node) => {
    if (node.type === "Function") {
      const funcName = node.name.toLowerCase();
      // Dynamic functions that csstree cannot validate
      if (
        funcName === "var" ||
        funcName === "calc" ||
        funcName === "min" ||
        funcName === "max" ||
        funcName === "clamp" ||
        funcName === "attr"
      ) {
        hasDynamic = true;
      }
    }
  });

  return hasDynamic;
}

export interface ErrorFormatOptions {
  maxLineWidth: number;
  contextWindowSize?: number;
}

interface TruncationBounds {
  startPos: number;
  endPos: number;
  needsStartEllipsis: boolean;
  needsEndEllipsis: boolean;
  availableWidth: number;
}

interface FormattedLine {
  content: string;
  adjustedColumn: number;
}

/**
 * Validates a CSS stylesheet for syntax and property value errors.
 *
 * @param css - The CSS string to validate
 * @returns StylesheetValidation object containing validation results
 */
export function validate(css: string): StylesheetValidation {
  const errors: csstree.SyntaxParseError[] = [];
  const warnings: BStyleMatchError[] = [];
  const declarations: Declaration[] = [];
  const syntax = csstree.lexer;
  const uniqueDecls = new Map<string, number>();

  // Parse CSS
  const ast = csstree.parse(css, {
    context: "declarationList",
    positions: true,
    parseAtrulePrelude: true,
    parseRulePrelude: true,
    parseCustomProperty: true,
    onParseError(err: csstree.SyntaxParseError) {
      // biome-ignore lint/correctness/noUnusedVariables: remove stack from err
      const { stack, ...rest } = err;
      errors.push(rest);
    },
  });

  // Extract declarations
  csstree.walk(ast, (node) => {
    if (node.type !== "Declaration") {
      return;
    }
    const id = csstree.generate(node);
    if (uniqueDecls.has(id)) {
      uniqueDecls.set(id, uniqueDecls.get(id)! + 1);
      return;
    }
    uniqueDecls.set(id, 1);
    declarations.push({ property: node.property, value: node.value, node });
  });

  // Validate declarations
  // Suppress noisy csstree-match iteration warnings during matching.
  // Control via env var: BStyle_CSSTREE_LOG_LEVEL=ERROR (default) suppresses these messages.
  const suppressNoise = (msg: unknown): boolean => {
    try {
      const s = String(msg);
      return /\[csstree-match\]\s*BREAK after/i.test(s);
    } catch {
      return false;
    }
  };
  const LOG_LEVEL = (process.env.BStyle_CSSTREE_LOG_LEVEL || "ERROR").toUpperCase();
  const QUIET = LOG_LEVEL === "ERROR" || LOG_LEVEL === "SILENT";
  // biome-ignore lint/suspicious/noConsole: suppress console method reassignment
  const origWarn = console.warn;
  // biome-ignore lint/suspicious/noConsole: suppress console method reassignment
  const origError = console.error;
  try {
    if (QUIET) {
      console.warn = (...args: Parameters<typeof console.warn>) => {
        if (args.length && suppressNoise(args[0])) return;
        return origWarn(...args);
      };
      console.error = (...args: Parameters<typeof console.error>) => {
        if (args.length && suppressNoise(args[0])) return;
        return origError(...args);
      };
    }

    for (const decl of declarations) {
      // Skip validation for declarations with dynamic values (var, calc, etc.)
      // csstree cannot validate these and will throw errors
      if (containsDynamicValue(decl.value)) {
        continue;
      }

      const match = syntax.matchProperty(decl.property, decl.value);
      const error = match.error as csstree.SyntaxMatchError;

      if (!error) continue;

      // biome-ignore lint/correctness/noUnusedVariables: remove stack from error
      const { stack, name, ...rest } = error;
      warnings.push({
        property: decl.property,
        name,
        ...rest,
      });
    }
  } finally {
    // Always restore console methods
    console.warn = origWarn;
    console.error = origError;
  }

  // Format and display warnings
  const formattedWarnings: BStyleWarning[] = [];

  if (warnings.length > 0) {
    const cssLines = css.split("\n");
    for (const warning of warnings) {
      const formattedError = formatErrorDisplay(cssLines, warning);
      formattedWarnings.push({
        property: warning.property,
        name: warning.name,
        syntax: warning.syntax,
        formattedWarning: `Errors found in: ${warning.property}\n${formattedError.join("\n")}`,
      });
    }
  }

  // Return result with runtime type safety
  const result: StylesheetValidation = {
    ok: errors.length === 0,
    errors,
    warnings: formattedWarnings,
  };

  return result;
}

export function validateDeclaration(value: string, prop: string): StylesheetValidation {
  const css = `.class {${prop}: ${value};}`;
  const result = validate(css);
  return result;
}

// Helper functions
/**
 * Calculates the line window to display around an error line.
 * Shows contextWindowSize lines before and after the error for better context.
 *
 * @param errorLine - The line number where the error occurred
 * @param totalLines - Total number of lines in the CSS
 * @param contextWindowSize - Number of lines to show before and after error (default: 2)
 * @returns Object with start and end line numbers for the context window
 */
function calculateLineWindow(
  errorLine: number,
  totalLines: number,
  contextWindowSize: number = DEFAULT_CONTEXT_WINDOW_SIZE,
): { start: number; end: number } {
  const start = Math.max(1, errorLine - contextWindowSize);
  const end = Math.min(totalLines, errorLine + contextWindowSize);
  return { start, end };
}

function formatLineNumber(lineNum: number, maxLineNum: number): string {
  const maxDigits = Math.max(maxLineNum.toString().length, 1);
  const paddedNum = lineNum.toString().padStart(maxDigits, " ");
  const prefix = " ".repeat(LINE_NUMBER_PADDING - maxDigits);
  return `${prefix}${paddedNum} |`;
}

function trimLine(line: string): { trimmed: string; spacesRemoved: number } {
  const trimmed = line.trimStart();
  const spacesRemoved = line.length - trimmed.length;
  return { trimmed, spacesRemoved };
}

function calculateTruncationBounds(lineLength: number, errorColumn: number, maxWidth: number): TruncationBounds {
  if (lineLength <= maxWidth) {
    return {
      startPos: 0,
      endPos: lineLength,
      needsStartEllipsis: false,
      needsEndEllipsis: false,
      availableWidth: maxWidth,
    };
  }

  // Reserve space for potential ellipses
  let availableWidth = maxWidth - 2;
  const halfWidth = Math.floor(availableWidth / 2);
  let startPos = Math.max(0, errorColumn - halfWidth - 1);

  // Determine if we need start ellipsis
  const needsStartEllipsis = startPos > 0;

  if (!needsStartEllipsis) {
    // No start truncation - reclaim space for end-only ellipsis
    availableWidth = maxWidth - 1;
  } else {
    // Skip one additional character for better spacing after ellipsis
    startPos = startPos + 1;
  }

  let endPos = startPos + availableWidth;
  let needsEndEllipsis = endPos < lineLength;

  // Adjust if we hit the end of the line
  if (endPos >= lineLength) {
    endPos = lineLength;
    needsEndEllipsis = false;

    if (needsStartEllipsis) {
      startPos = Math.max(0, endPos - availableWidth);
    }
  }

  return {
    startPos,
    endPos,
    needsStartEllipsis,
    needsEndEllipsis,
    availableWidth,
  };
}

function applyTruncation(line: string, bounds: TruncationBounds, originalErrorColumn: number): FormattedLine {
  let content = line.slice(bounds.startPos, bounds.endPos);
  let adjustedColumn = originalErrorColumn - bounds.startPos;

  if (bounds.needsStartEllipsis) {
    content = `…${content}`;
    adjustedColumn = adjustedColumn + 1;
  }

  if (bounds.needsEndEllipsis) {
    content = `${content}…`;
  }

  return { content, adjustedColumn };
}

function formatContextLine(line: string, maxWidth: number): string {
  const { trimmed } = trimLine(line);

  if (trimmed.length <= maxWidth) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxWidth - 1)}…`;
}

function formatErrorLine(line: string, errorColumn: number, maxWidth: number): FormattedLine {
  // Input validation
  if (errorColumn < 1) {
    throw new Error("Error column must be >= 1");
  }

  const { trimmed, spacesRemoved } = trimLine(line);
  const adjustedErrorColumn = Math.max(1, errorColumn - spacesRemoved);

  // Handle case where line fits without truncation after trimming
  if (trimmed.length <= maxWidth) {
    return {
      content: trimmed,
      adjustedColumn: adjustedErrorColumn,
    };
  }

  // Calculate truncation bounds using the original error column position
  const bounds = calculateTruncationBounds(line.length, errorColumn, maxWidth);

  // Special handling for start-of-line case (after trimming consideration)
  if (bounds.startPos === 0 || bounds.startPos <= spacesRemoved) {
    // Use trimmed line for start-of-line truncation
    const trimmedBounds = calculateTruncationBounds(trimmed.length, adjustedErrorColumn, maxWidth);
    return applyTruncation(trimmed, trimmedBounds, adjustedErrorColumn);
  }

  // Standard middle-of-line truncation
  return applyTruncation(line, bounds, errorColumn);
}

function createPointerLine(prefixLength: number, column: number, length: number): string {
  const safeLength = Math.max(1, length ?? 1);
  const safeColumn = Math.max(1, column);

  const pointerPrefix = " ".repeat(prefixLength);
  const dashes = "-".repeat(safeColumn - 1);
  const carets = "^".repeat(safeLength);

  return pointerPrefix + dashes + carets;
}

/**
 * Formats and displays CSS validation errors with visual context.
 * Shows the error line with surrounding context, line numbers, and pointer indicators.
 *
 * @param cssLines - Array of CSS source lines
 * @param warning - The validation error/warning to format
 * @param options - Formatting options (maxLineWidth, contextWindowSize)
 * @returns Array of formatted strings representing the error display
 *
 * @example
 * // Error at line 5, column 10:
 * //   3 | .class {
 * //   4 |   margin: 10px;
 * //   5 |   color: notacolor;
 * //       ---------^^^^^^^^^^^
 * //   6 | }
 */
function formatErrorDisplay(
  cssLines: string[],
  warning: BStyleMatchError,
  options: ErrorFormatOptions = {
    maxLineWidth: DEFAULT_MAX_LINE_WIDTH,
    contextWindowSize: DEFAULT_CONTEXT_WINDOW_SIZE,
  },
): string[] {
  // Input validation
  if (!cssLines.length || warning.line < 1 || warning.line > cssLines.length) {
    return [`Invalid error location: line ${warning.line}`];
  }
  const errorLine = warning.line;
  const errorColumn = warning.column;
  const mismatchLength = warning.mismatchLength ?? 1;
  const contextWindowSize = options.contextWindowSize ?? DEFAULT_CONTEXT_WINDOW_SIZE;

  const { start, end } = calculateLineWindow(errorLine, cssLines.length, contextWindowSize);
  const maxLineNum = end;
  const linePrefix = formatLineNumber(1, maxLineNum);
  const prefixLength = linePrefix.length;
  const availableWidth = options.maxLineWidth - prefixLength;

  const result: string[] = [];

  for (let lineNum = start; lineNum <= end; lineNum++) {
    const lineIndex = lineNum - 1;
    const currentLine = cssLines[lineIndex] ?? "";
    const currentPrefix = formatLineNumber(lineNum, maxLineNum);

    if (lineNum === errorLine) {
      // Format error line
      const { content, adjustedColumn } = formatErrorLine(currentLine, errorColumn, availableWidth);

      result.push(currentPrefix + content);

      // Add pointer line
      const pointerLine = createPointerLine(prefixLength, adjustedColumn, mismatchLength);
      result.push(pointerLine);
    } else {
      // Format context line
      const formattedLine = formatContextLine(currentLine, availableWidth);
      result.push(currentPrefix + formattedLine);
    }
  }

  return result;
}
