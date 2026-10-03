import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { ToolDefinition } from "../../tool.type.js";
import { z } from "zod";

const execFileAsync = promisify(execFile);

const showSchema = z.object({
  ref: z.string().min(1).optional(),
  path: z.string().min(1).optional(),
});

type ShowInput = z.infer<typeof showSchema>;

interface ShowOutput {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
}

const showTool: ToolDefinition<ShowInput, ShowOutput> = {
  name: "git_show",

  description: "Show information and changes from a Git commit or reference.",

  category: "git",

  inputSchema: showSchema,

  async execute(input, cotext) {
    try {
      if (!cotext.workingDirectory) {
        return {
          success: false,
          error: "Working directory is not defined.",
        };
      }

      const args: string[] = ["show"];

      if (input.ref) {
        args.push(input.ref);
      }

      if (input.path) {
        args.push("--", input.path);
      }

      const { stdout, stderr } = await execFileAsync("git", args, {
        cwd: cotext.workingDirectory,
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
          "Failed to show.",
      };
    }
  },
};

export default showTool;
