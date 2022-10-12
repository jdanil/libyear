import { pick } from "lodash-es";

export function transformStdOut(stdout: string, packageManager: "berry" | "npm" | "pnpm" | "yarn"): {versionsMap: Record<string, string>, latest: string} {
  const json = JSON.parse(stdout) as unknown;
  switch (packageManager) {
    case "yarn": {
      const { time, versions, version } = (
        json as {
          data: { time: Record<string, string>; versions: string[], version: string };
        }
      ).data;
      return { versionsMap: pick(time, versions), latest: version };
    }
    default: {
      const { time, versions, version } = json as {
        time: Record<string, string>;
        versions: string[];
        version: string;
      };
      return { versionsMap: pick(time, versions), latest: version };
    }
  }
}
