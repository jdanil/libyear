import { default as mri } from "mri";

import { libyear } from "./libyear.js";
import {
  getInferredPackageManager,
  getParsedPackageManager,
} from "./package-manager.js";
import { getConfiguration } from "./configuration.js";
import { print } from "./print.js";
import type { PackageManager } from "./types.js";

const validateThreshold = (threshold: unknown): number =>
  Number.isNaN(Number(threshold)) ? null : Number(threshold);

export const cli = async (): Promise<void> => {
  // parse cli args
  const argv = process.argv.slice(2);
  const args = mri(argv, { boolean: ["all", "json"], string: ["config"] });

  // validate cli options
  const packageManager = args["package-manager"] as PackageManager;
  const all = args["all"] as boolean;
  const json = args["json"] as boolean;

  // run libyear
  try {
    const report = await libyear(
      getParsedPackageManager(
        packageManager ?? (await getInferredPackageManager()),
      ),
      { all },
    );

    if (json) {
      console.log(JSON.stringify(report));
    } else {
      const { overrides, threshold } = await getConfiguration(args).then(
        ({ overrides, threshold }) => ({
          overrides,
          threshold: {
            driftCollective: validateThreshold(threshold?.drift?.collective),
            driftIndividual: validateThreshold(threshold?.drift?.individual),
            pulseCollective: validateThreshold(threshold?.pulse?.collective),
            pulseIndividual: validateThreshold(threshold?.pulse?.individual),
            releasesCollective: validateThreshold(
              threshold?.releases?.collective,
            ),
            releasesIndividual: validateThreshold(
              threshold?.releases?.individual,
            ),
            majorCollective: validateThreshold(threshold?.major?.collective),
            majorIndividual: validateThreshold(threshold?.major?.individual),
            minorCollective: validateThreshold(threshold?.minor?.collective),
            minorIndividual: validateThreshold(threshold?.minor?.individual),
            patchCollective: validateThreshold(threshold?.patch?.collective),
            patchIndividual: validateThreshold(threshold?.patch?.individual),
          },
        }),
      );

      print(report, threshold, overrides);
    }
  } catch (error) {
    if (json) {
      console.log(JSON.stringify(error));
    } else {
      console.error((error as Error).message);
    }
  }
};
