import { cosmiconfig } from "cosmiconfig";
import { merge } from "lodash";
import type { Argv } from "mri";

import type { Configuration } from "./types";

const getCliConfiguration = (args: Argv) => ({
  threshold: {
    drift: {
      collective: (args["threshold-drift-collective"] ?? args["D"]) as number,
      individual: (args["threshold-drift-individual"] ?? args["d"]) as number,
    },
    pulse: {
      collective: (args["threshold-pulse-collective"] ?? args["P"]) as number,
      individual: (args["threshold-pulse-individual"] ?? args["p"]) as number,
    },
    releases: {
      collective: (args["threshold-releases-collective"] ??
        args["R"]) as number,
      individual: (args["threshold-releases-individual"] ??
        args["r"]) as number,
    },
    major: {
      collective: args["threshold-major-collective"] as number,
      individual: args["threshold-major-individual"] as number,
    },
    minor: {
      collective: args["threshold-minor-collective"] as number,
      individual: args["threshold-minor-individual"] as number,
    },
    patch: {
      collective: args["threshold-patch-collective"] as number,
      individual: args["threshold-patch-individual"] as number,
    },
  },
});

const getCosmiconfig = async (): Promise<Configuration> => {
  const explorer = cosmiconfig("libyear");

  try {
    const result = await explorer.search();
    return result.config as Configuration;
  } catch (error) {
    return {};
  }
};

export const getConfiguration = async (args: Argv): Promise<Configuration> =>
  merge(await getCosmiconfig(), getCliConfiguration(args));
