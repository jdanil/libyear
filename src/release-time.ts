import { execute } from "./execute.js";
import type { PackageManager } from "./types.js";

export const getReleaseTime = async (
  packageManager: PackageManager,
  packageName: string,
): Promise<Record<string, string>> => {
  const cmd = {
    berry: `yarn npm info ${packageName} --fields time --json`,
    npm: `npm view ${packageName} time --json`,
    pnpm: `npm view ${packageName} time --json`,
    yarn: `yarn info ${packageName} time --json`,
  }[packageManager];

  const stdout = await execute(cmd);

  if (!stdout) {
    return {};
  }

  const json = JSON.parse(stdout) as unknown;
  switch (packageManager) {
    case "berry":
      return (json as Record<"time", Record<string, string>>).time;
    case "yarn":
      return (json as Record<"data", Record<string, string>>).data;
    case "npm":
    default:
      return json as Record<string, string>;
  }
};
