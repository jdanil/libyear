import * as execa from "execa";

export const execute = async (cmd: string) => {
  try {
    return (await execa.command(cmd)).stdout;
  } catch (error) {
    return error.stdout;
  }
};
