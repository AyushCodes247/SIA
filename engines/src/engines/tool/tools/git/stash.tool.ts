import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { ToolDefinition } from "../../tool.type.js";
import { z } from "zod";

const execFileAsync = promisify(execFile);

const stashSchema = z.object({
  action: z.enum(["push", "pop", "apply", "list", "drop"]),
  message: z.string().min(1).optional(),
});

type StashInput = z.infer<typeof stashSchema>;

interface StashOutput {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
}

const stashTool: ToolDefinition<StashInput, StashOutput> = {
  name: "git_stash",

  description: "Stash, apply, pop, list, or drop Git changes.",

  category: "git",

  inputSchema: stashSchema,

  async execute(input, context) {
    try {
      if (!context.workingDirectory) {
        return {
          success: false,
          error: "Working directory is not defined.",
        };
      }

      const args: string[] = ["stash"];

      if (input.action === "push") {
        args.push("push");

        if (input.message) {
          args.push("-m", input.message);
        }
      } else {
        args.push(input.action);
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
          "Failed to stash.",
      };
    }
  },
};

export default stashTool;
