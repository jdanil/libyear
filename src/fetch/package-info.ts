import type { PackageManager } from "../types.ts";
import { execute } from "./execute.ts";

let registry: string;

const getRegistry = async (packageManager: PackageManager): Promise<string> => {
  if (registry != null) {
    return Promise.resolve(registry);
  }

  const cmd = {
    berry: "yarn config get npmRegistryServer",
    npm: "npm config get registry",
    pnpm: "pnpm config get registry",
    yarn: "yarn config get registry",
  }[packageManager].replace(/\/$/, "");

  registry = await execute(cmd);

  return registry;
};

const getPackageInfoFromRegistry = async (
  packageManager: PackageManager,
  packageName: string,
): Promise<{
  deprecated?: string;
  versions?: Record<string, { deprecated?: string; time: string }>;
}> => {
  const registry = await getRegistry(packageManager);

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

type PackageInfo = {
  deprecated?: string;
  time: Record<string, string>;
  versions: string[];
};

type PackageError = {
  error: {
    code: string;
  };
};

export const getPackageInfoFromPackageManager = async (
  packageManager: PackageManager,
  packageName: string,
): Promise<{
  deprecated?: string;
  versions?: Record<string, { deprecated?: string; time: string }>;
}> => {
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

    const json = JSON.parse(stdout) as
      | { data: PackageInfo }
      | PackageInfo
      | PackageError;

    if ((json as PackageError).error) {
      console.error("error", (json as PackageError).error);
      return {};
    }

    switch (packageManager) {
      case "yarn": {
        const {
          data: { deprecated, time, versions },
        } = json as { data: PackageInfo };
        return {
          deprecated,
          versions: Object.fromEntries(
            versions.map((version) => [
              version,
              { time: time[version] as string },
            ]),
          ),
        };
      }
      default: {
        const { deprecated, time, versions } = json as PackageInfo;
        return {
          deprecated,
          versions: Object.fromEntries(
            versions.map((version) => [
              version,
              { time: time[version] as string },
            ]),
          ),
        };
      }
    }
  });
};

export const getPackageInfo = async (
  packageManager: PackageManager,
  packageName: string,
): Promise<{
  deprecated?: string;
  versions?: Record<string, { deprecated?: string; time: string }>;
}> => {
  try {
    return await getPackageInfoFromRegistry(packageManager, packageName);
  } catch {
    return await getPackageInfoFromPackageManager(packageManager, packageName);
  }
};
