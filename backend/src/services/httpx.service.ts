import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const runHttpx = async (
  target: string
) => {

  let httpxData: any = {};

  try {

    const { stdout } =
      await execAsync(
        `echo ${target} | httpx -title -tech-detect -status-code -json -silent`,
        {
          timeout: 15000,
          maxBuffer:
            1024 * 1024 * 5,
        }
      );

    if (stdout.trim()) {

      const lines =
        stdout
          .trim()
          .split("\n");

      httpxData =
        JSON.parse(
          lines[0]
        );
    }

  } catch (error) {

    console.error(
      "HTTPX ERROR:",
      error
    );
  }

  return httpxData;
};