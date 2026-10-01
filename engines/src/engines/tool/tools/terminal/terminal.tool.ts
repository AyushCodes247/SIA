import { exec } from "node:child_process";
import { promisify } from "node:util";
import { z } from "zod";
import type { ToolDefinition } from "../../tool.type.js";

const execAsync = promisify(exec);

const terminalSchema = z.object({
  command: z.string().min(1),
  timeout: z.number().positive().optional(),
});

type TerminalInput = z.infer<typeof terminalSchema>;

interface TerminalOutput {
  command: string;
  stdout: string;
  stderr: string;
  exitCode: number | null;
}

const terminalTool: ToolDefinition<TerminalInput, TerminalOutput> = {
  name: "terminal",

  description:
    "Executes a terminal command inside the current working directory.",

  category: "terminal",

  inputSchema: terminalSchema,

  async execute(input, context) {
    try {
      if (!context.workingDirectory) {
        return {
          success: false,
          error: "Working directory is not defined.",
        };
      }

      const timeout = input.timeout ?? 20_000;

      const { stdout, stderr } = await execAsync(input.command, {
        cwd: context.workingDirectory,
        timeout: timeout,
        maxBuffer: 10 * 1024 * 1024, // 10 MB
      });

      return {
        success: true,
        data: {
          command: input.command,
          stdout,
          stderr,
          exitCode: 0,
        },
      };
    } catch (error) {
      const execError = error as {
        stdout?: string;
        code?: number;
        stderr?: string;
        message?: string;
      };

      return {
        success: false,
        error:
          execError.message || execError.stderr || "Command execution failed.",
      };
    }
  },
};

export default terminalTool;
