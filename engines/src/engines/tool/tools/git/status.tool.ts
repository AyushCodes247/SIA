import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { z } from "zod";
import type { ToolDefinition } from "../../tool.type.js";

const execFileAsync = promisify(execFile);

const statusSchema = z.object({
  porcelain: z.boolean().optional(),
});

type StatusInput = z.infer<typeof statusSchema>;

interface StatusOutput {
  output: string;
}

const statusTool: ToolDefinition<StatusInput, StatusOutput> = {
  name: "git_status",

  description:
    "Executes the 'git status' command in the current working directory.",

  category: "git",

  inputSchema: statusSchema,

  async execute(input, context) {
    try {
      if (!context.workingDirectory) {
        return {
          success: false,
          error: "working directory is not defined.",
        };
      }

      const args = ["status"];

      if (input.porcelain) {
        args.push("--short");
      }

      const { stdout } = await execFileAsync("git", args, {
        cwd: context.workingDirectory,
        maxBuffer: 10 * 1024 * 1024, // 10 MB
      });

      return {
        success: true,
        data: {
          output: stdout,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to retrieve Git status.",
      };
    }
  },
};

export default statusTool;
