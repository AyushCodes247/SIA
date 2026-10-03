import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { ToolDefinition } from "../../tool.type.js";
import { z } from "zod";

const execFileAsync = promisify(execFile);

const remoteSchema = z.object({
  action: z.enum(["list", "add", "remove"]),
  name: z.string().min(1).optional(),
  url: z.string().min(1).optional(),
});

type RemoteInput = z.infer<typeof remoteSchema>;

interface RemoteOutput {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
}

const remoteTool: ToolDefinition<RemoteInput, RemoteOutput> = {
  name: "git_remote",

  description: "List, add, or remove Git remotes.",

  category: "git",

  inputSchema: remoteSchema,

  async execute(input, context) {
    try {
      if (!context.workingDirectory) {
        return {
          success: false,
          error: "Working directory is not defined.",
        };
      }

      const args: string[] = ["remote"];

      if (input.action === "list") {
        args.push("-v");
      }

      if (input.action === "add") {
        if (!input.name || !input.url) {
          return {
            success: false,
            error: "Remote name and URL are required.",
          };
        }

        args.push("add", input.name, input.url);
      }

      if (input.action === "remove") {
        if (!input.name) {
          return {
            success: false,
            error: "Remote name is required.",
          };
        }

        args.push("remove", input.name);
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
        stdout: error.stdout?.trim() ?? "",
        stderr: error.stderr?.trim() ?? error.message,
        exitCode: error.code ?? 1,
      };
    }
  },
};

export default remoteTool;
