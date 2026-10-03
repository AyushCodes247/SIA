import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { z } from "zod";
import type { ToolDefinition } from "../../tool.type.js";

const execFileAsync = promisify(execFile);

const logSchema = z.object({
  limit: z.number().int().positive().optional(),
  oneline: z.boolean().optional(),
  branch: z.string().min(1).optional(),
});

type LogInput = z.infer<typeof logSchema>;

interface LogOutput {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
}

const logTool: ToolDefinition<LogInput, LogOutput> = {
  name: "git_log",
  description: "Show commit history from a Git repository.",
  category: "git",

  inputSchema: logSchema,

  async execute(input, context) {
    try {
      if (!context.workingDirectory) {
        return {
          success: false,
          error: "Working directory is not defined.",
        };
      }

      const args: string[] = ["log"];

      if (input.limit) {
        args.push(`-${input.limit}`);
      }

      if (input.oneline) {
        args.push("--oneline");
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

export default logTool;
