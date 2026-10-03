import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { z } from "zod";
import type { ToolDefinition } from "../../tool.type.js";

const execFileAsync = promisify(execFile);

const createBranchSchema = z.object({
  branch: z.string().min(3),
});

type CreateInput = z.infer<typeof createBranchSchema>;

interface CreateOutput {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
}

const createBranchTool: ToolDefinition<CreateInput, CreateOutput> = {
  name: "git_create_branch",

  description: "Create a new Git branch.",

  category: "git",

  inputSchema: createBranchSchema,

  async execute(input, context) {
    try {
      if (!context.workingDirectory) {
        return {
          success: false,
          error: "Working directory is not defined.",
        };
      }

      const args = ["switch", "-c", input.branch];

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
          gitError.stderr ||
          gitError.stdout ||
          gitError.message ||
          "Failed to create Git commit.",
      };
    }
  },
};

export default createBranchTool;
