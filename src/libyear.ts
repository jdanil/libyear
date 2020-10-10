import { compare, sort, valid } from "semver";

import { calculateDrift, calculatePulse } from "./dates";
import { getDependencies } from "./dependencies";
import { getReleaseTime } from "./release-time";
import type { Dependencies, PackageManager } from "./types";
import {
  getReleasesByType,
  getSanitisedReleases,
  getStableReleases,
} from "./versions";

export const libyear = async (
  packageManager: PackageManager,
  flags?: { all?: boolean },
): Promise<Dependencies> => {
  const awaitedDependencies = Array.from(
    (await getDependencies(packageManager, flags)).entries(),
  ).map(async ([dependency, currentVersion]) => {
    const releaseTimeObj =
      (await getReleaseTime(packageManager, dependency)) ?? {};
    const releaseTimeMap = new Map(Object.entries(releaseTimeObj));

    const allVersionsMap = getSanitisedReleases(releaseTimeMap);
    const stableVersionsMap = getStableReleases(allVersionsMap);
    const allVersions = Array.from(allVersionsMap.keys());
    const stableVersions = Array.from(stableVersionsMap.keys());

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
      releaseTimeMap.get(currentVersion),
      releaseTimeMap.get(latestStableVersion),
    );
    const pulse = calculatePulse(releaseTimeMap.get(latestAllVersion));
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
      [latestStableVersion, latestAllVersion]
        .filter((version) => valid(version))
        .find(
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
