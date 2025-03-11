import { pick } from "lodash-es";

import { execute } from "./execute.ts";
import type { PackageManager } from "./types.ts";

export const getReleaseTime = async (
  packageManager: PackageManager,
  packageName: string,
): Promise<Record<string, string>> => {
  const cmd = {
    berry: `yarn npm info ${packageName} --fields time,versions --json`,
    npm: `npm view ${packageName} time versions --json`,
    pnpm: `npm view ${packageName} time versions --json`,
    yarn: `yarn info ${packageName} --json`,
  }[packageManager];

  return execute(cmd).then((stdout) => {
    if (!stdout) {
      return {};
    }

    const json = JSON.parse(stdout) as unknown;
    switch (packageManager) {
      case "yarn": {
        const { time, versions } = (
          json as {
            data: { time: Record<string, string>; versions: string[] };
          }
        ).data;
        return pick(time, versions);
      }
      default: {
        const { time, versions } = json as {
          time: Record<string, string>;
          versions: string[];
        };
        return pick(time, versions);
      }
    }
  });
};
