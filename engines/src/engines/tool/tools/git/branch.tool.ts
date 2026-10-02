import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { z } from "zod";
import type { ToolDefinition } from "../../tool.type.js";

const execFileAsync = promisify(execFile);

const branchSchema = z.object({
  all: z.boolean().optional(),
  remotes: z.boolean().optional(),
});

type BranchInput = z.infer<typeof branchSchema>;

interface BranchOutput {
  branches: string[];
}

const branchTool: ToolDefinition<BranchInput, BranchOutput> = {
  name: "git_branch",

  description:
    "Lists branches in the Git repository inside the current working directory.",

  category: "git",

  inputSchema: branchSchema,

  async execute(input, context) {
    try {
      if (!context.workingDirectory) {
        return {
          success: false,
          error: "Working directory is not set.",
        };
      }

      const args = ["branch"];

      if (input.all) {
        args.push("-a");
      } else if (input.remotes) {
        args.push("-r");
      }

      const { stdout } = await execFileAsync("git", args, {
        cwd: context.workingDirectory,
        maxBuffer: 10 * 1024 * 1024, // 10 MB
      });

      const branches = stdout
        .split("\n")
        .map((branch) => branch.trim())
        .filter(Boolean);

      return {
        success: true,
        data: {
          branches,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to retrieve Git branches.",
      };
    }
  },
};

export default branchTool;
