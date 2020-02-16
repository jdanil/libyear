import { prerelease, valid } from "semver";

/**
 * Filter out "time" metadata about the package.
 */
export const getSanitisedReleases = (releases: { [version: string]: string }) =>
  Object.fromEntries(
    Object.entries(releases).filter(
      ([version, _]) => valid(version),
    ),
  );

/**
 * Filter pre-release versions.
 */
export const getStableReleases = (releases: { [version: string]: string }) =>
  Object.fromEntries(
    Object.entries(releases).filter(
      ([version, _]) => prerelease(version) == null,
    ),
  );
