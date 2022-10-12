import { execute } from "./execute";
import type { PackageManager } from "./types";
import { transformStdOut } from "./release-time-logic";

export const getReleaseTime = async (
  packageManager: PackageManager,
  packageName: string,
): Promise<{versionsMap: Record<string, string>, latest: string}> => {
  const cmd = {
    berry: `yarn npm info ${packageName} --fields time,versions,version --json`,
    npm: `npm view ${packageName} time versions version --json`,
    pnpm: `npm view ${packageName} time versions version --json`,
    yarn: `yarn info ${packageName} --json`,
  }[packageManager];

  return execute(cmd).then((stdout: string) => {
    if (!stdout) {
      throw new Error('Stdout was empty!')
    }

    return transformStdOut(stdout, packageManager);
  });
};
