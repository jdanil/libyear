import { compare, sort } from "semver";

import { calculateDrift, calculatePulse } from "./dates";
import { getDependencies } from "./dependencies";
import { getReleaseTime } from "./release-time";
import type { PackageManager } from "./types";
import {
  getReleasesByType,
  getSanitisedReleases,
  getStableReleases,
} from "./versions";

export const libyear = async (
  packageManager: PackageManager,
): Promise<
  Array<{
    dependency: string;
    drift: number;
    pulse: number;
    releases: number;
    major: number;
    minor: number;
    patch: number;
    available: string;
  }>
> => {
  const awaitedDependencies = Object.entries(
    await getDependencies(packageManager),
  ).map(async ([dependency, currentVersion]) => {
    const releaseTime =
      (await getReleaseTime(packageManager, dependency)) ?? {};

    const allVersionsObj = getSanitisedReleases(releaseTime);
    const stableVersionsObj = getStableReleases(allVersionsObj);
    const allVersions = Object.keys(allVersionsObj);
    const stableVersions = Object.keys(stableVersionsObj);

    const latestAllVersion = sort(allVersions).slice(-1)[0];
    const latestStableVersion = sort(stableVersions).slice(-1)[0];

    const diffAllVersions = allVersions.slice(
      allVersions.findIndex((version) => version === currentVersion) + 1,
      allVersions.findIndex((version) => version === latestStableVersion) + 1,
    );
    const diffStableVersions = diffAllVersions.filter((version) =>
      stableVersions.includes(version),
    );

    const drift = calculateDrift(
      releaseTime[currentVersion],
      releaseTime[latestStableVersion],
    );
    const pulse = calculatePulse(releaseTime[latestAllVersion]);
    const releases = diffStableVersions.length;
    const major = getReleasesByType(
      [currentVersion, ...diffStableVersions],
      "major",
    ).length;
    const minor = getReleasesByType(
      [currentVersion, ...diffStableVersions],
      "minor",
    ).length;
    const patch = getReleasesByType(
      [currentVersion, ...diffStableVersions],
      "patch",
    ).length;
    const available =
      [latestStableVersion, latestAllVersion].find(
        (version) =>
          compare(currentVersion, version, { includePrerelease: true }) < 0,
      ) ?? "N/A";

    return {
      dependency,
      drift,
      pulse,
      releases,
      major,
      minor,
      patch,
      available,
    };
  });

  return Promise.all(awaitedDependencies);
};
