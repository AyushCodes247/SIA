import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { ToolDefinition } from "../../tool.type.js";
import { z } from "zod";

const execFileAsync = promisify(execFile);

const diffSchema = z.object({
  staged: z.boolean().optional(),
  paths: z.array(z.string().min(1)).optional(),
});

type DiffInput = z.infer<typeof diffSchema>;

interface DiffOutput {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
}

const diffTool: ToolDefinition<DiffInput, DiffOutput> = {
  name: "git_diff",

  description: "Show changes in a Git working tree or staged changes.",

  category: "git",

  inputSchema: diffSchema,

  async execute(input, context) {
    try {
      if (!context.workingDirectory) {
        return {
          success: false,
          error: "Working directory is not defined.",
        };
      }

      const args: string[] = ["diff"];

      if (input.staged) {
        args.push("--staged");
      }

      if (input.paths && input.paths.length > 0) {
        args.push("--", ...input.paths);
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
        stdout:
          gitError.stdout ||
          gitError.stderr ||
          gitError.message ||
          "Failed to fetch the changes.",
      };
    }
  },
};

export default diffTool;
