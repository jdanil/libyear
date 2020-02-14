import { sort } from "semver";

import { calculateDrift, calculatePulse } from "./dates";
import { getDependencies } from "./dependencies";
import { print } from "./print";
import { getReleaseTime } from "./release-time";
import type { PackageManager } from "./types";
import { getSanitisedReleases, getStableReleases } from "./versions";

export const libyear = async (
  packageManager: PackageManager,
  threshold?: {
    driftCollective?: number;
    driftIndividual?: number;
    pulseCollective?: number;
    pulseIndividual?: number;
  },
) => {
  const awaitedDependencies = Object.entries(await getDependencies()).map(
    async ([dependency, currentVersion]) => {
      const releaseTime = await getReleaseTime(packageManager, dependency);

      const allVersionsObj = getSanitisedReleases(releaseTime);
      const stableVersionsObj = getStableReleases(allVersionsObj);
      const allVersions = Object.keys(allVersionsObj);
      const stableVersions = Object.keys(stableVersionsObj);

      const latestAllVersion = sort(allVersions).slice(-1)[0];
      const latestStableVersion = sort(stableVersions).slice(-1)[0];

      const drift = calculateDrift(
        releaseTime[currentVersion],
        releaseTime[latestStableVersion],
      );
      const pulse = calculatePulse(releaseTime[latestAllVersion]);
      const status = stableVersions.includes(currentVersion)
        ? "stable"
        : "pre-release";

      return {
        dependency,
        drift,
        pulse,
        status,
      };
    },
  );

  Promise.all(awaitedDependencies)
    .then(dependencies => {
      print(dependencies, threshold);
    })
    .catch(error => {
      console.error(error.message);
    });
};
