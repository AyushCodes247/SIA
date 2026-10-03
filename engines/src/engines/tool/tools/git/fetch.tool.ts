import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { ToolDefinition } from "../../tool.type.js";
import { z } from "zod";

const execFileAsync = promisify(execFile);

const feftchSchema = z.object({
  remote: z.string().min(1).optional(),
  branch: z.string().min(1).optional(),
  prune: z.boolean().optional(),
});

type FetchInput = z.infer<typeof feftchSchema>;

interface FetchOutput {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
}

const fetchTool: ToolDefinition<FetchInput, FetchOutput> = {
  name: "git_fetch",

  description: "Fetch changes from a remote Git repository.",

  category: "git",

  inputSchema: feftchSchema,

  async execute(input, context) {
    try {
      if (!context.workingDirectory) {
        return {
          success: false,
          error: "Working directory is not defined.",
        };
      }

      const args: string[] = ["fetch"];

      if (input.prune) {
        args.push("--prune");
      }

      if (input.remote) {
        args.push(input.remote);
      }

      if (input.branch) {
        args.push(input.branch);
      }

      const { stdout , stderr } = await execFileAsync("git", args,{
        cwd : context.workingDirectory,
        maxBuffer : 20 * 1024 * 1024
      });

      return {
        success : true,
        stdout : stdout.trim(),
        stderr : stderr.trim(),
        exitCode : 0
      }
    } catch (error) {
      const gitError = error as {
        stdout?: string;
        stderr?: string;
        message?: string;
      };

      return {
        success: false,
        stdout:
          gitError.stdout ||
          gitError.stderr ||
          gitError.message ||
          "Failed to fetch the changes.",
      };
    }
  },
};

export default fetchTool;
