import * as execa from "execa";

export const getDependencies = async () => {
  const cmd = "npm ls --depth=0 --json";

  try {
    const { stdout } = await execa.command(cmd);
    return Object.fromEntries(
      Object.entries(
        JSON.parse(stdout).dependencies,
      ).map(([dependency, data]: [string, { version?: string }]) => [
        dependency,
        data.version,
      ]),
    );
  } catch (error) {
    process.stderr.write(`Failed to run "${cmd}".\n`);
    process.stderr.write(error.message);
    process.exit(1);
  }
};
