import * as mri from "mri";

import { libyear } from "./libyear";
import {
  getInferredPackageManager,
  getParsedPackageManager,
} from "./package-manager";
import { getConfiguration } from "./configuration";
import type { PackageManager } from "./types";

const validateThreshold = (threshold: unknown): number =>
  isNaN(Number(threshold)) ? null : Number(threshold);

export const cli = async (): Promise<void> => {
  // parse cli args
  const argv = process.argv.slice(2);
  const args = mri(argv);

  // validate cli options
  const packageManager = args["package-manager"] as PackageManager;
  const { overrides, threshold } = await getConfiguration(args);
  const driftCollective = validateThreshold(threshold?.drift?.collective);
  const driftIndividual = validateThreshold(threshold?.drift?.individual);
  const pulseCollective = validateThreshold(threshold?.pulse?.collective);
  const pulseIndividual = validateThreshold(threshold?.pulse?.individual);
  const releasesCollective = validateThreshold(threshold?.releases?.collective);
  const releasesIndividual = validateThreshold(threshold?.releases?.individual);

  // run libyear
  await libyear(
    getParsedPackageManager(
      packageManager ?? (await getInferredPackageManager()),
    ),
    {
      driftCollective,
      driftIndividual,
      pulseCollective,
      pulseIndividual,
      releasesCollective,
      releasesIndividual,
    },
    overrides,
  );
};
