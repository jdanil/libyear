import * as execa from "execa";

import type { PackageManager } from "./types";

export const getReleaseTime = async (
  packageManager: PackageManager,
  packageName: string,
) => {
  const cmd = `${
    {
      berry: "yarn npm info",
      npm: "npm view",
      yarn: "yarn info",
    }[packageManager]
  } ${packageName} time --json`;

  try {
    const { stdout } = await execa.command(cmd);
    const json = JSON.parse(stdout);
    switch (packageManager) {
      case "yarn":
        return json.data;
      default:
        return json;
    }
  } catch (error) {
    process.stderr.write(`Failed to run "${cmd}".`);
    process.stderr.write(error.message);
    process.exit(1);
  }
};
