import { ExecaReturnValue, execaCommand } from "execa";

export const execute = async (cmd: string): Promise<string> => {
  try {
    return (await execaCommand(cmd)).stdout;
  } catch (error) {
    return (error as ExecaReturnValue).stdout;
  }
};
