import { execaCommand } from "execa";

export const execute = async (cmd: string): Promise<string> =>
  execaCommand(cmd)
    .then(({ stdout }) => stdout)
    .catch(({ stdout }) => stdout as string);
