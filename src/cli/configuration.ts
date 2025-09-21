import { cosmiconfig } from "cosmiconfig";
import { merge } from "lodash-es";

import type { Args, Configuration } from "../types.ts";
import { safeParseInt } from "./style/number.ts";

const getCliConfiguration = ({
  limitDriftCollective,
  limitDriftIndividual,
  limitPulseCollective,
  limitPulseIndividual,
  limitReleasesCollective,
  limitReleasesIndividual,
  limitMajorCollective,
  limitMajorIndividual,
  limitMinorCollective,
  limitMinorIndividual,
  limitPatchCollective,
  limitPatchIndividual,
}: Args) => ({
  limit: {
    drift: {
      collective: safeParseInt(limitDriftCollective),
      individual: safeParseInt(limitDriftIndividual),
    },
    pulse: {
      collective: safeParseInt(limitPulseCollective),
      individual: safeParseInt(limitPulseIndividual),
    },
    releases: {
      collective: safeParseInt(limitReleasesCollective),
      individual: safeParseInt(limitReleasesIndividual),
    },
    major: {
      collective: safeParseInt(limitMajorCollective),
      individual: safeParseInt(limitMajorIndividual),
    },
    minor: {
      collective: safeParseInt(limitMinorCollective),
      individual: safeParseInt(limitMinorIndividual),
    },
    patch: {
      collective: safeParseInt(limitPatchCollective),
      individual: safeParseInt(limitPatchIndividual),
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
