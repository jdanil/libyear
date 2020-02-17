import * as mri from "mri";

import { libyear } from "./libyear";
import {
  getInferredPackageManager,
  getParsedPackageManager,
} from "./package-manager";

const validateThreshold = (threshold: unknown): number =>
  isNaN(Number(threshold)) ? null : Number(threshold);

export const cli = async () => {
  // parse cli args
  const argv = process.argv.slice(2);
  const args = mri(argv);

  // validate cli options
  const packageManager = args["package-manager"];
  const driftCollective = validateThreshold(
    args["threshold-drift-collective"] ?? args["D"]
  );
  const driftIndividual = validateThreshold(
    args["threshold-drift-individual"] ?? args["d"]
  );
  const pulseCollective = validateThreshold(
    args["threshold-pulse-collective"] ?? args["P"]
  );
  const pulseIndividual = validateThreshold(
    args["threshold-pulse-individual"] ?? args["p"]
  );

  // run libyear
  libyear(
    getParsedPackageManager(
      packageManager ?? (await getInferredPackageManager()),
    ),
    {
      driftCollective,
      driftIndividual,
      pulseCollective,
      pulseIndividual,
    },
  );
};
