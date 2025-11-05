// b_path:: packages/b_utils/src/string/levenshtein.ts

/**
 * Calculate Levenshtein distance between two strings.
 * Used for "Did you mean X?" suggestions.
 *
 * @param a - First string
 * @param b - Second string
 * @returns Minimum number of single-character edits (insertions, deletions, substitutions)
 *
 * @example
 * ```typescript
 * levenshteinDistance("kitten", "sitting"); // 3
 * levenshteinDistance("hello", "hello"); // 0
 * ```
 *
 * @see https://en.wikipedia.org/wiki/Levenshtein_distance
 *
 * @public
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  // Initialize first column and row
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1, // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Find closest match from a list of valid options.
 * Returns undefined if no close match found.
 *
 * @param input - The string to match
 * @param validOptions - List of valid options
 * @param maxDistance - Maximum distance to consider (default: 3)
 * @returns Closest matching string, or undefined if none found within maxDistance
 *
 * @example
 * ```typescript
 * const colors = ["red", "blue", "green"];
 * findClosestMatch("gren", colors); // "green"
 * findClosestMatch("xyz", colors); // undefined
 * ```
 *
 * @public
 */
export function findClosestMatch(input: string, validOptions: string[], maxDistance = 3): string | undefined {
  let closestMatch: string | undefined;
  let minDistance = Number.POSITIVE_INFINITY;

  for (const option of validOptions) {
    const distance = levenshteinDistance(input.toLowerCase(), option.toLowerCase());

    if (distance < minDistance && distance <= maxDistance) {
      minDistance = distance;
      closestMatch = option;
    }
  }

  return closestMatch;
}
