import { execute } from "./execute";

export const getDependencies = async () => {
  const cmd = "npm ls --depth=0 --json --silent";
  return Object.fromEntries(
    Object.entries(
      JSON.parse(await execute(cmd)).dependencies,
    ).map(
      ([dependency, data]: [
        string,
        { version?: string; required?: { version?: string } | string },
      ]) => [
        dependency,
        data.version ??
          (
            (data.required as { version?: string })?.version ||
            (data.required as string)
          ).replace(/[<=>\^~]/u, ""),
      ],
    ),
  );
};
