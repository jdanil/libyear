import * as execa from "execa";
import * as path from "path";
import { satisfies } from "semver";

import type { PackageManager } from "./types";

export const getInferredPackageManager = async (): Promise<PackageManager> => {
  if (path.basename(process.env.npm_execpath || "npm").startsWith("yarn")) {
    const { stdout } = await execa.command("yarn --version");
    return satisfies(stdout, "^0 || ^1") ? "yarn" : "berry";
  } else {
    return Promise.resolve("npm");
  }
};

export const getParsedPackageManager = (
  packageManager?: string,
): PackageManager => {
  switch (packageManager) {
    case "berry":
    case "npm":
    case "yarn":
      return packageManager;
    default:
      return "npm";
  }
};
