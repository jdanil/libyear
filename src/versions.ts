import { diff, prerelease, valid, type ReleaseType } from "semver";

/**
 * Filter out "time" metadata about the package
 * and deprecated versions.
 */
export const getSanitisedReleases = (
  versions: Record<string, { deprecated?: string; time: string }>,
  currentVersion: string,
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(versions)
      .filter(
        ([version, { deprecated }]) =>
          valid(version) && (deprecated == null || version === currentVersion),
      )
      .map(([version, { time }]) => [version, time]),
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
