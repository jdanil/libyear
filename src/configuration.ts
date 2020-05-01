import { cosmiconfig } from "cosmiconfig";
import { merge } from "lodash";
import type { Argv } from "mri";

const getCliConfiguration = (args: Argv) => ({
  threshold: {
    drift: {
      collective: args["threshold-drift-collective"] ?? args["D"],
      individual: args["threshold-drift-individual"] ?? args["d"],
    },
    pulse: {
      collective: args["threshold-pulse-collective"] ?? args["P"],
      individual: args["threshold-pulse-individual"] ?? args["p"],
    },
    releases: {
      collective: args["threshold-releases-collective"] ?? args["R"],
      individual: args["threshold-releases-individual"] ?? args["r"],
    },
  },
});

const getCosmiconfig = async () => {
  const explorer = cosmiconfig("libyear");

  try {
    const result = await explorer.search();
    return result.config;
  } catch (error) {
    return {};
  }
};

export const getConfiguration = async (args: Argv) =>
  merge(await getCosmiconfig(), getCliConfiguration(args));
