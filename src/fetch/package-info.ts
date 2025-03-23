import { pick } from "lodash-es";

import type { PackageManager } from "../types.ts";
import { execute } from "./execute.ts";

export const getPackageInfo = async (
  packageManager: PackageManager,
  packageName: string,
): Promise<{ deprecated?: string; releaseTime?: Record<string, string> }> => {
  const cmd = {
    berry: `yarn npm info ${packageName} --fields deprecated,time,versions --json`,
    npm: `npm view ${packageName} deprecated time versions --json`,
    pnpm: `npm view ${packageName} deprecated time versions --json`,
    yarn: `yarn info ${packageName} --json`,
  }[packageManager];

  return execute(cmd).then((stdout) => {
    if (!stdout) {
      return {};
    }

    const json = JSON.parse(stdout) as unknown;
    switch (packageManager) {
      case "yarn": {
        const {
          data: { deprecated, time, versions },
        } = json as {
          data: {
            deprecated?: string;
            time: Record<string, string>;
            versions: string[];
          };
        };
        return { deprecated, releaseTime: pick(time, versions) };
      }
      default: {
        const { deprecated, time, versions } = json as {
          deprecated?: string;
          time: Record<string, string>;
          versions: string[];
        };
        return { deprecated, releaseTime: pick(time, versions) };
      }
    }
  });
};
