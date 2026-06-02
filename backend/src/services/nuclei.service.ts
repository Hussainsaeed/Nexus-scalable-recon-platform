import { spawn } from "child_process";

export const runNuclei = (
  target: string
): Promise<any[]> => {

  return new Promise(
    (resolve, reject) => {

      const vulnerabilities: any[] = [];

      const nuclei = spawn(
        "nuclei",
        [
          "-u",
          `https://${target}`,
          "-silent",
          "-jsonl",
          "-rl",
          "50",
        ]
      );

      nuclei.stdout.on(
        "data",
        (data) => {

          const lines =
            data
              .toString()
              .split("\n")
              .filter(Boolean);

          for (const line of lines) {

            try {

              const parsed =
                JSON.parse(line);

              vulnerabilities.push({

                name:
                  parsed?.info?.name ||
                  "Unknown",

                severity:
                  parsed?.info?.severity ||
                  "info",

                template:
                  parsed?.["template-id"] ||
                  null,

                matched:
                  parsed?.matched ||
                  parsed?.["matched-at"] ||
                  null,

                description:
                  parsed?.info?.description ||
                  null,

                tags:
                  parsed?.info?.tags ||
                  [],

                reference:
                  parsed?.info?.reference ||
                  [],

              });

            } catch {}
          }
        }
      );

      nuclei.stderr.on(
        "data",
        (data) => {

          console.error(
            "NUCLEI STDERR:",
            data.toString()
          );
        }
      );

      nuclei.on(
        "close",
        () => {

          resolve(
            vulnerabilities
          );
        }
      );

      nuclei.on(
        "error",
        reject
      );
    }
  );
};