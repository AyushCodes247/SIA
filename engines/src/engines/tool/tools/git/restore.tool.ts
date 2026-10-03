import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { ToolDefinition } from "../../tool.type.js";
import { z } from "zod";

const execFileAsync = promisify(execFile);

const schema = z.object({
  staged: z.boolean().optional(),
  paths: z.array(z.string()).optional(),
});

type Input = z.infer<typeof schema>;

interface Output {
  success: string;
  stdout: string;
  stderr: string;
  exitCode: number;
}

const tool: ToolDefinition<Input, Output> = {
  name: "git_restore",

  description: "Restore working tree or staged files to a previous state.",

  category: "git",

  inputSchema: schema,

  async execute(input, context) {
    try {
      if (!context.workingDirectory) {
        return {
          success: false,
          error: "Working directory is not defined.",
        };
      }

      const args: string[] = ["restore"];

      if (input.staged) {
        args.push("--staged");
      }

      if (input.paths && input.paths.length > 0) {
        args.push("--", ...input.paths);
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
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        stdout: error.stdout?.trim() ?? "",
        stderr: error.stderr?.trim() ?? error.message,
        exitCode: error.code ?? 1,
      };
    }
  },
};

export default tool;
