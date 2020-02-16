import * as execa from "execa";

export const execute = async (cmd: string) => {
  try {
    const { stdout } = await execa.command(cmd);
    return stdout;
  } catch (error) {
    return error.stdout;
  }
};
