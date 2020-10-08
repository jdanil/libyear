import { compare, sort } from "semver";

import { calculateDrift, calculatePulse } from "./dates";
import { getDependencies } from "./dependencies";
import { print } from "./print";
import { getReleaseTime } from "./release-time";
import type { Overrides, PackageManager, Threshold } from "./types";
import {
  getReleasesByType,
  getSanitisedReleases,
  getStableReleases,
} from "./versions";

export const libyear = async (
  packageManager: PackageManager,
  threshold?: Threshold,
  overrides?: Overrides,
): Promise<void> => {
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

  Promise.all(awaitedDependencies)
    .then((dependencies) => {
      print(dependencies, threshold, overrides);
    })
    .catch((error: unknown) => {
      console.error((error as Error).message);
    });
};
