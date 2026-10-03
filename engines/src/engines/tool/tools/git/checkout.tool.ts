import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { z } from "zod";
import type { ToolDefinition } from "../../tool.type.js";

const execFileAsync = promisify(execFile);

const checkoutSchema = z.object({
  target: z.string().min(2),
});

type CheckoutInput = z.infer<typeof checkoutSchema>;

interface CheckoutOutput {
  success: boolean;
  stderr: string;
  stdout: string;
  exitCode: number;
}

const checkoutTool: ToolDefinition<CheckoutInput, CheckoutOutput> = {
  name: "git_checkout",

  description: "Switch to a Git branch or restore a Git working tree.",

  category: "git",

  inputSchema: checkoutSchema,

  async execute(input, context) {
    try {
      if (!context.workingDirectory) {
        return {
          success: false,
          error: "Working directory is not defined.",
        };
      }

      const args = ["checkout", input.target];

      const { stderr, stdout } = await execFileAsync("git", args, {
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
          "Failed to Checkout the git branch.",
      };
    }
  },
};

export default checkoutTool;
