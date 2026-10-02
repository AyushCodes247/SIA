import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { z } from "zod";
import type { ToolDefinition } from "../../tool.type.js";

const execFileAsync = promisify(execFile);

const addFileSchema = z.object({
  paths: z.array(z.string().min(1)).min(1),
});

type AddInput = z.infer<typeof addFileSchema>;

interface AddOutput {
  paths: string[];
  output: string;
}

const addTool: ToolDefinition<AddInput, AddOutput> = {
  name: "git_add",

  description:
    "Stages specified files or directories for the next Git commit inside the current working directory.",

  category: "git",

  inputSchema: addFileSchema,

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
        ["add", "--", ...input.paths],
        {
          cwd: context.workingDirectory,
          maxBuffer: 10 * 1024 * 1024,
        },
      );

      console.log("Add stdout:",stdout);

      return {
        success: true,
        data: {
          paths: input.paths,
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
          "Failed to stage Git changes.",
      };
    }
  },
};

export default addTool;
