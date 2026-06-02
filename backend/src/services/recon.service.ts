import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export class ReconService {

  async run(target: string) {

    console.log(`Running recon on ${target}`);

    try {

      const { stdout } = await execAsync(`nmap ${target}`);

      return {
        target,
        result: stdout,
      };

    } catch (error) {

      console.error(error);

      return {
        error: "Failed to run nmap scan",
      };
    }
  }
}