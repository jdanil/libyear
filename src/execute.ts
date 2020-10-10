import * as execa from "execa";

export const execute = async (cmd: string): Promise<string> => {
  try {
    return (await execa.command(cmd)).stdout;
  } catch (error: unknown) {
    return (error as execa.ExecaReturnValue).stdout;
  }
};
