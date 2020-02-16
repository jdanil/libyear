import { execute } from "./execute";
import type { PackageManager } from "./types";

export const getReleaseTime = async (
  packageManager: PackageManager,
  packageName: string,
) => {
  const cmd = {
    berry: `yarn npm info ${packageName} --fields time --json`,
    npm: `npm view ${packageName} time --json`,
    yarn: `yarn info ${packageName} time --json`,
  }[packageManager];

  const stdout = await execute(cmd);

  if (!stdout) {
    return {};
  }

  const json = JSON.parse(stdout);
  switch (packageManager) {
    case "berry":
      return json.time;
    case "yarn":
      return json.data;
    case "npm":
    default:
      return json;
  }
};
