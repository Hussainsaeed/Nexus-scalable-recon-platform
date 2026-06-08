import { spawn } from "child_process";

export const runNuclei = (
  target: string
): Promise<any[]> => {

  return new Promise(
    (resolve, reject) => {

      const vulnerabilities: any[] = [];

      console.log(
        '[NUCLEI STARTING]',
        target
      );

      console.log(
        '[NUCLEI PROCESS CREATED]'
      );

      console.log(
        "[NUCLEI CMD]",
        [
          "-u",
          `https://${target}`,
          "-jsonl",
          "-tags",
          "misconfig,exposure,cves",
          "-severity",
          "critical,high,medium",
        ]
      );

      const nuclei = spawn(
        "nuclei",
        [
          "-u",
          `https://${target}`,
      
          "-jsonl",
      
          "-tags",
          "misconfig,exposure,cves",
      
          "-severity",
          "critical,high,medium",
      
          "-timeout",
          "5",
      
          "-retries",
          "1",
      
          "-rl",
          "100",
        ]
      );

      const timeout = setTimeout(() => {

        console.log(
          '[NUCLEI TIMEOUT]'
        );
      
        nuclei.kill();
      
      }, 1300000);

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
        'data',
        (data) => {
      
          console.log(
            '[NUCLEI STDERR]',
            data.toString()
          );
      
        }
      );

      nuclei.on(
        "close",
        (code) => {

          clearTimeout(timeout);
      
          console.log(
            "[NUCLEI CLOSED]",
            code
          );
      
          console.log(
            "[NUCLEI FINDINGS]",
            vulnerabilities.length
          );
      
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