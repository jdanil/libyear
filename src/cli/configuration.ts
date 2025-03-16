import { cosmiconfig } from "cosmiconfig";
import { merge } from "lodash-es";

import type { Args, Configuration } from "../types.ts";
import { safeParseInt } from "./style/number.ts";

const getCliConfiguration = ({
  thresholdDriftCollective,
  thresholdDriftIndividual,
  thresholdPulseCollective,
  thresholdPulseIndividual,
  thresholdReleasesCollective,
  thresholdReleasesIndividual,
  thresholdMajorCollective,
  thresholdMajorIndividual,
  thresholdMinorCollective,
  thresholdMinorIndividual,
  thresholdPatchCollective,
  thresholdPatchIndividual,
}: Args) => ({
  threshold: {
    drift: {
      collective: safeParseInt(thresholdDriftCollective),
      individual: safeParseInt(thresholdDriftIndividual),
    },
    pulse: {
      collective: safeParseInt(thresholdPulseCollective),
      individual: safeParseInt(thresholdPulseIndividual),
    },
    releases: {
      collective: safeParseInt(thresholdReleasesCollective),
      individual: safeParseInt(thresholdReleasesIndividual),
    },
    major: {
      collective: safeParseInt(thresholdMajorCollective),
      individual: safeParseInt(thresholdMajorIndividual),
    },
    minor: {
      collective: safeParseInt(thresholdMinorCollective),
      individual: safeParseInt(thresholdMinorIndividual),
    },
    patch: {
      collective: safeParseInt(thresholdPatchCollective),
      individual: safeParseInt(thresholdPatchIndividual),
    },
  },
});

const getCosmiconfig = async (filePath?: string): Promise<Configuration> => {
  const explorer = cosmiconfig("libyear");

  try {
    const result = filePath
      ? await explorer.load(filePath)
      : await explorer.search();
    return ((result?.config as unknown) ?? {}) as Configuration;
  } catch {
    return {};
  }
};

export const getConfiguration = async (args: Args): Promise<Configuration> =>
  merge(await getCosmiconfig(args.config), getCliConfiguration(args));
