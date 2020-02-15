import * as execa from "execa";

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

  try {
    const { stdout } = await execa.command(cmd);
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
  } catch (error) {
    process.stderr.write(`Failed to run "${cmd}".`);
    process.stderr.write(error.message);
    process.exit(1);
  }
};
