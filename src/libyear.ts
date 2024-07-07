import { availableParallelism } from "node:os";

import { orderBy } from "lodash-es";
import pLimit from "p-limit";
import { compare, sort, valid } from "semver";

import { calculateDrift, calculatePulse } from "./dates.js";
import { getDependencies } from "./dependencies.js";
import { getReleaseTime } from "./release-time.js";
import type { Dependencies, Metric, PackageManager } from "./types.js";
import {
  getReleasesByType,
  getSanitisedReleases,
  getStableReleases,
} from "./versions.js";

const limit = pLimit(availableParallelism());

export const libyear = async (
  packageManager: PackageManager,
  flags?: { all?: boolean; quiet?: boolean; sort?: Metric },
): Promise<Dependencies> =>
  Promise.all(
    Array.from((await getDependencies(packageManager, flags)).entries()).map(
      ([dependency, currentVersion]) =>
        limit(() =>
          getReleaseTime(packageManager, dependency).then((releaseTimeObj) => {
            const releaseTimeMap = new Map(Object.entries(releaseTimeObj));

            const allVersionsMap = getSanitisedReleases(releaseTimeMap);
            const stableVersionsMap = getStableReleases(allVersionsMap);
            const allVersions = Array.from(allVersionsMap.keys());
            const stableVersions = Array.from(stableVersionsMap.keys());

            const latestAllVersion = sort(allVersions).at(-1) ?? "";
            const latestStableVersion = sort(stableVersions).at(-1) ?? "";

            const diffAllVersions = allVersions.slice(
              allVersions.findIndex((version) => version === currentVersion) +
                1,
              allVersions.findIndex(
                (version) => version === latestStableVersion,
              ) + 1,
            );
            const diffStableVersions = diffAllVersions.filter((version) =>
              stableVersions.includes(version),
            );

            const drift = calculateDrift(
              allVersionsMap.get(currentVersion) ?? "",
              allVersionsMap.get(latestStableVersion) ?? "",
            );
            const pulse = calculatePulse(
              Array.from(allVersionsMap.values()).sort().at(-1) ?? "",
            );
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
                .find((version) => compare(currentVersion, version) < 0) ??
              "N/A";

            if (flags?.quiet && drift <= 0) {
              return null;
            }

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
          }),
        ),
    ),
  ).then(
    (dependencies) =>
      orderBy(
        dependencies.filter(Boolean),
        flags?.sort,
        "desc",
      ) as Dependencies,
  );
