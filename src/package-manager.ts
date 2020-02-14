import * as execa from "execa";
import * as path from "path";
import { gte } from "semver";

import type { PackageManager } from "./types";

export const getInferredPackageManager = async (): Promise<PackageManager> => {
  if (path.basename(process.env.npm_execpath || "npm").startsWith("yarn")) {
    const { stdout } = await execa.command("yarn --version");
    return gte(stdout, "2.0.0") ? "berry" : "yarn";
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
