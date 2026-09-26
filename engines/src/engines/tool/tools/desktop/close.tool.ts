import { execFile } from "child_process";
import { z } from "zod";
import { promisify } from "util";
import type { ToolDefinition } from "../../tool.type.js";

const execFileAsync = promisify(execFile);

const closeApplicationSchema = z.object({
  application: z.string().trim().min(1),
  closed: z.boolean(),
});

type CloseApplicationInput = z.infer<typeof closeApplicationSchema>;

interface CloseApplicationOutput {
  application: string;
  closed: boolean;
}

const closeApplicationTool: ToolDefinition<
  CloseApplicationInput,
  CloseApplicationOutput
> = {
  name: "close_application",

  description:
    "Gracefully closes a running macOS application using its application name. It does not force-kill the application.",

  category: "desktop",

  inputSchema: closeApplicationSchema,

  async execute(input) {
    try {
      if (process.platform !== "darwin") {
        return {
          success: false,
          error: "The close_application tool currently supports macOS only.",
        };
      }

      const application = input.application.trim();

      const checkScript = `
        tell application "System Events"
          return exists process "${escapeAppleScript(application)}"
        end tell
      `;

      const { stdout } = await execFileAsync("osascript", ["-e", checkScript]);

      const isRunning = stdout.trim().toLowerCase() === "true";

      if (!isRunning) {
        return {
          success: true,
          data: {
            application,
            closed: false,
          },
        };
      }

      const quitScript = `
        tell application "${escapeAppleScript(application)}"
          quit
        end tell
      `;

      await execFileAsync("osascript", ["-e", quitScript]);

      return {
        success: true,

        data: {
          application,
          closed: true,
        },
      };
    } catch (error) {
      return {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Failed to close application.",
      };
    }
  },
};

const escapeAppleScript = (value: string): string => {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
};

export default closeApplicationTool;
