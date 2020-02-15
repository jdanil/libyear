import * as execa from "execa";

export const npmList = async () => {
  const cmd = "npm ls --depth=0 --json --silent";

  try {
    const { stdout } = await execa.command(cmd);
    return stdout;
  } catch (error) {
    return error.stdout;
  }
};

export const getDependencies = async () =>
  Object.fromEntries(
    Object.entries(
      JSON.parse(await npmList()).dependencies,
    ).map(([dependency, data]: [string, { version?: string, required?: string }]) => [
      dependency,
      data.version ?? data.required.replace(/[<=>\^~]/u, ""),
    ]),
  );
