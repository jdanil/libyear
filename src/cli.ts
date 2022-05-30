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
  const { overrides, threshold } = await getConfiguration(args);
  const driftCollective = validateThreshold(threshold?.drift?.collective);
  const driftIndividual = validateThreshold(threshold?.drift?.individual);
  const pulseCollective = validateThreshold(threshold?.pulse?.collective);
  const pulseIndividual = validateThreshold(threshold?.pulse?.individual);
  const releasesCollective = validateThreshold(threshold?.releases?.collective);
  const releasesIndividual = validateThreshold(threshold?.releases?.individual);
  const majorCollective = validateThreshold(threshold?.major?.collective);
  const majorIndividual = validateThreshold(threshold?.major?.individual);
  const minorCollective = validateThreshold(threshold?.minor?.collective);
  const minorIndividual = validateThreshold(threshold?.minor?.individual);
  const patchCollective = validateThreshold(threshold?.patch?.collective);
  const patchIndividual = validateThreshold(threshold?.patch?.individual);

  // run libyear
  try {
    const report = await libyear(
      getParsedPackageManager(
        packageManager ?? (await getInferredPackageManager()),
      ),
      { all },
    );

    const threshold = {
      driftCollective,
      driftIndividual,
      pulseCollective,
      pulseIndividual,
      releasesCollective,
      releasesIndividual,
      majorCollective,
      majorIndividual,
      minorCollective,
      minorIndividual,
      patchCollective,
      patchIndividual,
    };

    if (json) {
      console.log(JSON.stringify(report));
    } else {
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
