import { execa, parseCommandString } from "execa";

export const execute = async (cmd: string): Promise<string> =>
  // use worker threads if/when supported (https://github.com/sindresorhus/execa/issues/1030)
  execa`${parseCommandString(cmd)}`
    .then(({ stdout }) => stdout)
    .catch((error: unknown) => (error as Error & { stdout: string }).stdout);
