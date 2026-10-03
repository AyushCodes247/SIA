import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { ToolDefinition } from "../../tool.type.js";
import { z } from "zod";

const execFileAsync = promisify(execFile);

const pushSchema = z.object({
  remote: z.string().min(1).optional(),
  branch: z.string().min(1).optional(),
  setUpStream: z.boolean().optional(),
});

type PushInput = z.infer<typeof pushSchema>;

interface PushOutput {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
}

const pushTool: ToolDefinition<PushInput, PushOutput> = {
  name: "git_push",

  description: "Push commits to a remote Git repository.",

  category: "git",

  inputSchema: pushSchema,

  async execute(input, context) {
    try {
      if (!context.workingDirectory) {
        return {
          success: false,
          error: "Working directory is not defined.",
        };
      }

      const args: string[] = [];

      if (input.setUpStream) {
        args.push("-u");
      }

      if (input.remote) {
        args.push(input.remote);
      }

      if (input.branch) {
        args.push(input.branch);
      }

      const { stdout, stderr } = await execFileAsync("git", ["push", ...args], {
        cwd: context.workingDirectory,
        maxBuffer: 20 * 1024 * 1024, // 20 MB
      });

      return {
        success: true,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: 0,
      };
    } catch (error: any) {
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
          "Failed to Git push.",
      };
    }
  },
};

export default pushTool;
