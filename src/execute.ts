import { execa, parseCommandString } from "execa";

export const execute = async (cmd: string): Promise<string> =>
  execa`${parseCommandString(cmd)}`
    .then(({ stdout }) => stdout)
    .catch((error: unknown) => (error as Error & { stdout: string }).stdout);
