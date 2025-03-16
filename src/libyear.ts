import { availableParallelism } from "node:os";

import { orderBy } from "lodash-es";
import pLimit from "p-limit";
import { compare, sort, valid } from "semver";

import { calculateDrift, calculatePulse } from "./date.ts";
import { getDependencies } from "./fetch/dependencies.ts";
import { getReleaseTime } from "./fetch/release-time.ts";
import type {
  Dependencies,
  Dependency,
  Metric,
  PackageManager,
} from "./types.ts";
import {
  getReleasesByType,
  getSanitisedReleases,
  getStableReleases,
} from "./versions.ts";

const limit = pLimit(availableParallelism());

export const libyear = async (
  packageManager: PackageManager,
  flags?: { all?: boolean; quiet?: boolean; sort?: Metric },
): Promise<Dependencies> =>
  Promise.all(
    Object.entries(await getDependencies(packageManager, flags)).map(
      ([dependency, currentVersion]) =>
        limit(() =>
          getReleaseTime(packageManager, dependency).then((releaseTimeMap) => {
            const allVersionsMap = getSanitisedReleases(releaseTimeMap);
            const stableVersionsMap = getStableReleases(allVersionsMap);
            const allVersions = Object.keys(allVersionsMap);
            const stableVersions = Object.keys(stableVersionsMap);

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
              allVersionsMap[currentVersion] ?? "",
              allVersionsMap[latestStableVersion] ?? "",
            );
            const pulse = calculatePulse(
              Object.values(allVersionsMap).sort().at(-1) ?? "",
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
              null;

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
      orderBy<Dependency>(
        dependencies.filter(Boolean) as Dependencies,
        flags?.sort,
        "desc",
      ) as Dependencies,
  );
