import * as mri from "mri";

import { libyear } from "./libyear";
import {
  getInferredPackageManager,
  getParsedPackageManager,
} from "./package-manager";

export const cli = async () => {
  const argv = process.argv.slice(2);
  const args = mri(argv);

  libyear(
    getParsedPackageManager(
      args["package-manager"] ?? (await getInferredPackageManager()),
    ),
    {
      driftCollective: args["threshold-drift-collective"],
      driftIndividual: args["threshold-drift-individual"],
      pulseCollective: args["threshold-pulse-collective"],
      pulseIndividual: args["threshold-pulse-individual"],
    },
  );
};
