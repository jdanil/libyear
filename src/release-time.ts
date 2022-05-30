import { pick } from "lodash-es";

import { execute } from "./execute.js";
import type { PackageManager } from "./types.js";

export const getReleaseTime = async (
  packageManager: PackageManager,
  packageName: string,
): Promise<Record<string, string>> => {
  const cmd = {
    berry: `yarn npm info ${packageName} --fields time,versions --json`,
    npm: `npm view ${packageName} time versions --json`,
    pnpm: `npm view ${packageName} time versions --json`,
    yarn: `yarn info ${packageName} time versions --json`,
  }[packageManager];

  const stdout = await execute(cmd);

  if (!stdout) {
    return {};
  }

  const json = JSON.parse(stdout) as unknown;
  switch (packageManager) {
    case "yarn":
      return pick(json.data.time, json.data.versions) as Record<string, string>;
    default:
      return pick(json.time, json.versions) as Record<string, string>;
  }
};
