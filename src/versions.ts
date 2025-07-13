import { diff, prerelease, valid } from "semver";

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
 * Tally releases by type.
 */
export const getReleasesByType = (
  versions: string[],
): Record<"major" | "minor" | "patch", number> => {
  const counts = {
    major: 0,
    minor: 0,
    patch: 0,
  };

  versions.forEach((value, index, array) => {
    const type = diff(array[index - 1] ?? value, value);

    if (type != null && Object.hasOwn(counts, type)) {
      counts[type as keyof typeof counts]++;
    }
  });

  return counts;
};
