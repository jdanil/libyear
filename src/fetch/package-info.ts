import type { PackageManager } from "../types.ts";
import { execute } from "./execute.ts";

export const getPackageInfo = async (
  packageManager: PackageManager,
  packageName: string,
): Promise<{
  deprecated?: string;
  versions?: Record<string, { deprecated?: string; time: string }>;
}> => {
  const cmd = {
    berry: "yarn config get npmRegistryServer",
    npm: "npm config get registry",
    pnpm: "pnpm config get registry",
    yarn: "yarn config get registry",
  }[packageManager].replace(/\/$/, "");

  const registry = await execute(cmd);

  const { deprecated, time, versions } = (await (
    await fetch(`${registry}/${packageName}`)
  ).json()) as {
    deprecated?: string;
    time: Record<string, string>;
    versions: Record<string, { deprecated?: string }>;
  };

  return {
    deprecated,
    versions: Object.fromEntries(
      Object.entries(versions).map(([version, { deprecated }]) => [
        version,
        {
          deprecated,
          time: time[version] as string,
        },
      ]),
    ),
  };
};
