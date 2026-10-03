import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { ToolDefinition } from "../../tool.type.js";
import { z } from "zod";

const execFileAsync = promisify(execFile);

const pullSchema = z.object({
  remote: z.string().min(1).optional(),
  branch: z.string().min(1).optional(),
  rebase: z.boolean().optional(),
});

type PullInput = z.infer<typeof pullSchema>;

interface PullOutput {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
}

const pullTool: ToolDefinition<PullInput, PullOutput> = {
  name: "git_pull",

  description: "Pull changes from a remote Git repository.",

  category: "git",

  inputSchema: pullSchema,

  async execute(input, context) {
    try {
      if (!context.workingDirectory) {
        return {
          success: false,
          error: "Working directory is not defined.",
        };
      }

      const args: string[] = ["pull"];

      if (input.rebase) {
        args.push("--rebase");
      }

      if (input.remote) {
        args.push(input.remote);
      }

      if (input.branch) {
        args.push(input.branch);
      }

      const { stdout, stderr } = await execFileAsync("git", args, {
        cwd: context.workingDirectory,
        maxBuffer: 20 * 1024 * 1024,
      });

      return {
        success: true,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: 0,
      };
    } catch (error) {
      const gitError = error as {
        stdout?: string;
        stderr?: string;
        message?: string;
      };

      return {
        success: false,
        error:
          gitError.message ||
          gitError.stderr ||
          gitError.stdout ||
          "Failed to log the commit history.",
      };
    }
  },
};

export default pullTool;
