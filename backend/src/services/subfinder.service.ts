import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const runSubfinder = async (
  domain: string
) => {

  try {

    const { stdout } =
      await execAsync(
        `subfinder -d ${domain} -silent`,
        {
          timeout: 130000,
          maxBuffer:
            1024 * 1024 * 10,
        }
      );

       console.log(
      "RUNNING SUBFINDER:",
      domain
    );


    return stdout
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

  } catch (error) {

    console.error(
      "SUBFINDER ERROR:",
      error
    );

     console.error(
      "SUBFINDER ERROR:",
      error
    );

    return [];
  }
};