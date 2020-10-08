// TODO [2021-04-01]: replace with `Object.fromEntries()` after dropping node@10.
import * as fromEntries from "fromentries";
import { ReleaseType, diff, prerelease, valid } from "semver";

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
  fromEntries(
    Object.entries(releases).filter(([version, _]) => valid(version)),
  );

/**
 * Filter pre-release versions.
 */
export const getStableReleases = (
  releases: Record<string, string>,
): Record<string, string> =>
  fromEntries(
    Object.entries(releases).filter(
      ([version, _]) => prerelease(version) == null,
    ),
  );
