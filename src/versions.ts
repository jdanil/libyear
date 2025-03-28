import { diff, prerelease, valid, type ReleaseType } from "semver";

/**
 * Filter versions by release type.
 */
export const getReleasesByType = (
  versions: string[],
  type: ReleaseType,
): string[] =>
  versions.filter(
    (value: string, index: number, array: string[]) =>
      diff(array[index - 1] ?? value, value) === type,
  );

/**
 * Filter out "time" metadata about the package.
 */
export const getSanitisedReleases = (
  releases: Record<string, string>,
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(releases).filter(([version]) => valid(version)),
  );

/**
 * Filter pre-release versions.
 */
export const getStableReleases = (
  releases: Record<string, string>,
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(releases).filter(([version]) => prerelease(version) == null),
  );
