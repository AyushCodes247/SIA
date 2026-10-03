import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { ToolDefinition } from "../../tool.type.js";
import { z } from "zod";

const execFileAsync = promisify(execFile);

const mergeSchema = z.object({
  branch: z.string().min(1),
});

type MergeInput = z.infer<typeof mergeSchema>;

interface MergeOutput {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
}

const mergeTool: ToolDefinition<MergeInput, MergeOutput> = {
  name: "git_merge",

  description: "Merge a Git branch into the current branch.",

  category: "git",

  inputSchema: mergeSchema,

  async execute(input, context) {
    try {
      if (!context.workingDirectory) {
        return {
          success: false,
          error: "Working directory is not defined.",
        };
      }

      const args = ["merge", input.branch];

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
          "Failed to merge the changes.",
      };
    }
  },
};

export default mergeTool;
