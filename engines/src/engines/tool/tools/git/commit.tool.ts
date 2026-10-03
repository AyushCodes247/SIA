import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { z } from "zod";
import type { ToolDefinition } from "../../tool.type.js";

const execFileAsync = promisify(execFile);

const commitSchema = z.object({
  message: z.string().trim().min(1),
});

type CommitInput = z.infer<typeof commitSchema>;

interface CommitOutput {
  message: string;
  output: string;
}

const commitTool: ToolDefinition<CommitInput, CommitOutput> = {
  name: "git_commit",

  description:
    "Creates a Git commit from the currently staged changes inside the current working directory.",

  category: "git",

  inputSchema: commitSchema,

  async execute(input, context) {
    try {
      if (!context.workingDirectory) {
        return {
          success: false,
          error: "Working directory is not defined.",
        };
      }

      const { stdout, stderr } = await execFileAsync(
        "git",
        ["commit", "-m", input.message],
        {
          cwd: context.workingDirectory,
          maxBuffer: 10 * 1024 * 1024, // 10 MB
        },
      );

      return {
        success: true,
        data: {
          message: input.message,
          output: stdout || stderr,
        },
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

export default commitTool;
