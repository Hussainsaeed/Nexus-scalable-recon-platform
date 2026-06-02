import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const runWhatWeb = async (
  target: string
) => {

  let whatwebRaw = "";

  let fingerprints: string[] = [];

  try {

    const { stdout } =
      await execAsync(
        `ruby WhatWeb/whatweb --no-errors --aggression 3 --log-brief=- https://${target}`,
        {
          timeout: 60000,
          maxBuffer:
            1024 * 1024 * 10,
        }
      );

    whatwebRaw =
      stdout;

    fingerprints =
      stdout
        .split(",")
        .map((item) =>
          item.trim()
        )
        .filter(Boolean);

  } catch (error) {

    console.error(
      "WHATWEB ERROR:",
      error
    );
  }

  return {
    whatwebRaw,
    fingerprints,
  };
};