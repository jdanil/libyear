// TODO [2021-04-01]: replace with `Object.fromEntries()` after dropping node@10.
import * as fromEntries from "fromentries";
import { prerelease, valid } from "semver";

/**
 * Filter out "time" metadata about the package.
 */
export const getSanitisedReleases = (releases: { [version: string]: string }) =>
  fromEntries(
    Object.entries(releases).filter(([version, _]) => valid(version)),
  );

/**
 * Filter pre-release versions.
 */
export const getStableReleases = (releases: { [version: string]: string }) =>
  fromEntries(
    Object.entries(releases).filter(
      ([version, _]) => prerelease(version) == null,
    ),
  );
