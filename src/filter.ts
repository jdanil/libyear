import type { Dependency } from "./types.ts";

/**
 * Filters dependencies based on include and exclude patterns
 * @param dependencies - Array of dependencies to filter
 * @param include - Array of regex patterns to include (if empty, all are included)
 * @param exclude - Array of regex patterns to exclude
 * @returns Filtered array of dependencies
 */
export const filterDependencies = (
  dependencies: Dependency[],
  include?: string[],
  exclude?: string[],
): Dependency[] => {
  if (!include?.length && !exclude?.length) {
    return dependencies;
  }

  return dependencies.filter((dependency) => {
    const depName = dependency.dependency;

    // Check exclude patterns first - if any match, exclude the dependency
    if (exclude?.length) {
      for (const pattern of exclude) {
        try {
          const regex = new RegExp(pattern);
          if (regex.test(depName)) {
            return false;
          }
        } catch (error) {
          // Invalid regex pattern - log warning and continue
          console.warn(
            `Warning: Invalid exclude regex pattern "${pattern}": ${error}`,
          );
        }
      }
    }

    // If no include patterns, include all non-excluded dependencies
    if (!include?.length) {
      return true;
    }

    // Check include patterns - if any match, include the dependency
    for (const pattern of include) {
      try {
        const regex = new RegExp(pattern);
        if (regex.test(depName)) {
          return true;
        }
      } catch (error) {
        // Invalid regex pattern - log warning and continue
        console.warn(
          `Warning: Invalid include regex pattern "${pattern}": ${error}`,
        );
      }
    }

    // If we have include patterns but none matched, exclude the dependency
    return false;
  });
};

