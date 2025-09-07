import { availableParallelism } from "node:os";

import { orderBy } from "lodash-es";
import pLimit from "p-limit";
import { compare, sort, valid } from "semver";

import { calculateDrift, calculatePulse } from "./date.ts";
import { getDependencies } from "./fetch/dependencies.ts";
import { getPackageInfo } from "./fetch/package-info.ts";
import { filterDependencies } from "./filter.ts";
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
  flags?: {
    all?: boolean;
    dev?: boolean;
    preReleases?: boolean;
    quiet?: boolean;
    sort?: Metric;
    include?: string[];
    exclude?: string[];
  },
): Promise<Dependencies> =>
  limit
    .map(
      Object.entries(await getDependencies(packageManager, flags)),
      ([dependency, currentVersion]) =>
        getPackageInfo(packageManager, dependency).then(
          ({ deprecated, versions = {} }) => {
            const allVersionsMap = getSanitisedReleases(
              versions,
              currentVersion,
            );
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
              allVersionsMap[currentVersion],
              allVersionsMap[latestStableVersion],
            );
            const pulse = calculatePulse(
              Object.values(allVersionsMap).sort().at(-1),
            );
            const releases = diffStableVersions.length;
            const { major, minor, patch } = getReleasesByType([
              currentVersion,
              ...diffStableVersions,
            ]);
            const latest = [
              latestStableVersion,
              flags?.preReleases ? latestAllVersion : "",
            ]
              .filter((version) => valid(version))
              .find((version) => compare(currentVersion, version) < 0);

            if (flags?.quiet && drift <= 0) {
              return null;
            }

            return {
              dependency,
              deprecated: deprecated ?? versions[currentVersion]?.deprecated,
              drift,
              pulse,
              releases,
              major,
              minor,
              patch,
              latest,
            };
          },
        ),
    )
    .then((dependencies) =>
      dependencies.filter((dependency) => dependency != null),
    )
    .then((dependencies) =>
      flags?.sort != null
        ? orderBy<Dependency>(dependencies, flags.sort, "desc")
        : dependencies,
    )
    .then((dependencies) =>
      filterDependencies(dependencies, flags?.include, flags?.exclude),
    );
