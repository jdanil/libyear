import type { Dependency } from "./types.ts";

/**
 * Filters dependencies to include only those matching the specified patterns
 * @param dependencies - Array of dependencies to filter
 * @param includeOnly - Array of regex patterns to include (if empty, all are included)
 * @returns Filtered array of dependencies
 */
export const filterDependencies = (
  dependencies: Dependency[],
  includeOnly?: string[],
): Dependency[] => {
  if (!includeOnly?.length) {
    return dependencies;
  }

  return dependencies.filter((dependency) => {
    const depName = dependency.dependency;

    // Check include patterns - if any match, include the dependency
    for (const pattern of includeOnly) {
      try {
        const regex = new RegExp(pattern);
        if (regex.test(depName)) {
          return true;
        }
      } catch (error) {
        // Invalid regex pattern - log warning and continue
        console.warn(
          `Warning: Invalid include-only regex pattern "${pattern}": ${error}`,
        );
      }
    }

    // If we have include patterns but none matched, exclude the dependency
    return false;
  });
};
