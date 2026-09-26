import { execFile } from "child_process";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { promisify } from "util";
import { randomUUID } from "crypto";
import { z } from "zod";
import type { ToolDefinition } from "../../tool.type.js";

const execFileAsync = promisify(execFile);

const screenShotSchema = z.object({});

type ScreenShotInput = z.infer<typeof screenShotSchema>;

interface ScreenShootOutput {
  path: string;
  capturedAt: string;
}

const screenshotTool: ToolDefinition<ScreenShotInput, ScreenShootOutput> = {
  name: "screenshot",

  description:
    "Captures a screenshot of the current macOS desktop for visual analysis.",

  category: "desktop",

  inputSchema: screenShotSchema,

  async execute() {
    try {
      if (process.platform !== "darwin") {
        return {
          success: false,
          error: "The screenshot tool currently supports macOS only.",
        };
      }

      const screenShotDir = path.join(
        os.tmpdir(),
        "sia",
        "desktop",
        "screenshots",
      );

      await fs.mkdir(screenShotDir, {
        recursive: true,
      });

      const fileName = `${randomUUID()}.png`;

      const screenShotPath = path.join(screenShotDir, fileName);

      await execFileAsync("screencapture", ["-x", screenShotPath]);

      const stats = await fs.stat(screenShotPath);

      if (!stats.isFile() || stats.size === 0) {
        return {
          success: false,
          error: "Screenshot capture produced an invalid file.",
        };
      }

      return {
        success: true,

        data: {
          path: screenShotPath,
          capturedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Failed to capture screenshot.",
      };
    }
  },
};

export default screenshotTool;
